import zlib from "node:zlib";

/**
 * Server-side Multi-format Document Text Extractor
 * Extracts plain text from DOCX, PDF, and plain text files with zero external runtime dependencies.
 */

export interface ExtractionResult {
  text: string;
  format: "docx" | "pdf" | "txt";
  wordCount: number;
  extractedMetadata?: Record<string, any>;
}

/**
 * Extracts plain text from a DOCX buffer (OpenXML ZIP).
 * Finds 'word/document.xml' in the ZIP central directory / local file headers and strips XML tags.
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    // A DOCX file is a standard PK ZIP file. Search for "word/document.xml"
    const targetName = "word/document.xml";
    let offset = 0;

    while (offset < buffer.length - 30) {
      // Local file header signature: 0x04034b50 (PK\x03\x04)
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);
        const fileNameStart = offset + 30;
        const fileName = buffer.toString("utf8", fileNameStart, fileNameStart + fileNameLength);

        const dataStart = fileNameStart + fileNameLength + extraFieldLength;

        if (fileName === targetName) {
          const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);
          let xmlContent = "";
          if (compressionMethod === 8) {
            // Deflate
            xmlContent = zlib.inflateRawSync(compressedData).toString("utf8");
          } else if (compressionMethod === 0) {
            // Stored (no compression)
            xmlContent = compressedData.toString("utf8");
          }

          // Convert XML paragraph and break tags into whitespace/newlines
          const text = xmlContent
            .replace(/<\/w:p>/gi, "\n")
            .replace(/<w:br[^>]*>/gi, "\n")
            .replace(/<w:t[^>]*>(.*?)<\/w:t>/gi, "$1 ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/\s+/g, " ")
            .trim();

          if (text) return text;
        }

        offset = dataStart + compressedSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn("DOCX extraction fallback triggered:", err);
  }

  // Fallback: search for readable text runs in the buffer
  return extractAsciiStrings(buffer);
}

/**
 * Extracts text from a PDF buffer by decoding PDF text objects and FlateDecode streams.
 */
export function extractTextFromPdf(buffer: Buffer): string {
  try {
    const textChunks: string[] = [];
    const content = buffer.toString("binary");

    // 1. Look for uncompressed text in parentheses inside text blocks (BT ... ET)
    const btRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = btRegex.exec(content)) !== null) {
      const block = match[0];
      // Match (text) Tj or TJ
      const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textChunks.push(tjMatch[1]);
      }
    }

    // 2. Also inspect compressed stream objects with FlateDecode
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch: RegExpExecArray | null;

    while ((streamMatch = streamRegex.exec(content)) !== null) {
      try {
        const streamStart = streamMatch.index + streamMatch[0].indexOf("\n") + 1;
        const streamEnd = streamMatch.index + streamMatch[0].lastIndexOf("endstream") - 1;
        if (streamEnd > streamStart) {
          const rawStream = buffer.subarray(streamStart, streamEnd);
          try {
            const decompressed = zlib.inflateSync(rawStream).toString("utf8");
            let innerMatch: RegExpExecArray | null;
            const innerBt = /BT[\s\S]*?ET/g;
            while ((innerMatch = innerBt.exec(decompressed)) !== null) {
              const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
              let tjMatch: RegExpExecArray | null;
              while ((tjMatch = tjRegex.exec(innerMatch[0])) !== null) {
                textChunks.push(tjMatch[1]);
              }
            }
          } catch {
            // Not a valid deflate stream, continue
          }
        }
      } catch {
        // Continue to next stream
      }
    }

    const combined = textChunks.join(" ").replace(/\s+/g, " ").trim();
    if (combined && combined.length > 10) {
      return combined;
    }
  } catch (err) {
    console.warn("PDF extraction fallback triggered:", err);
  }

  // Fallback: extract legible printable strings
  return extractAsciiStrings(buffer);
}

/**
 * Fallback heuristic: extracts sequences of printable ASCII text >= 4 characters
 */
function extractAsciiStrings(buffer: Buffer): string {
  const str = buffer.toString("latin1");
  const matches = str.match(/[\x20-\x7E\t\r\n]{4,}/g) || [];
  // Filter out binary headers, XML artifacts, and noise
  const filtered = matches.filter(
    (s) =>
      !s.startsWith("PK") &&
      !s.startsWith("%PDF") &&
      !s.includes("xmlns:") &&
      !s.includes("schema") &&
      s.trim().length > 3
  );
  return filtered.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Universal text extractor for uploaded files
 */
export function extractTextFromFile(
  fileName: string,
  buffer: Buffer
): ExtractionResult {
  const lower = fileName.toLowerCase();
  let format: "docx" | "pdf" | "txt" = "txt";
  let text = "";

  if (lower.endsWith(".docx")) {
    format = "docx";
    text = extractTextFromDocx(buffer);
  } else if (lower.endsWith(".pdf")) {
    format = "pdf";
    text = extractTextFromPdf(buffer);
  } else {
    format = "txt";
    text = buffer.toString("utf8");
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return {
    text,
    format,
    wordCount,
    extractedMetadata: {
      fileName,
      fileSize: buffer.length,
      extractedAt: new Date().toISOString(),
    },
  };
}
