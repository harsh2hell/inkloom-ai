"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, ShieldAlert, Zap, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";

interface RewriteOption {
  tone: "LEGAL_SAFE" | "GROWTH_MARKETING" | "CREATOR_VIRAL";
  title: string;
  badge: string;
  rewrittenText: string;
  rationale: string;
  complianceConfidence: number;
}

interface AiRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApplyRewrite: (newText: string, note: string) => void;
}

export function AiRewriteModal({
  isOpen,
  onClose,
  originalText,
  onApplyRewrite,
}: AiRewriteModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<RewriteOption[]>([]);
  const [modelUsed, setModelUsed] = useState<string>("Gemini 3.5/3.8 Flash");
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // Fetch rewrites whenever modal opens or regenerate is clicked
  const fetchRewrites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: originalText,
          findingExplanation: "Eliminate prohibited claims, align protein specification, and include mandatory disclaimer.",
        }),
      });
      const data = await res.json();
      if (data.options) {
        setOptions(data.options);
        setModelUsed(data.model || "Gemini 3.5/3.8 Flash");
      }
    } catch (err) {
      console.error("Failed to load rewrites:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchRewrites();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "LEGAL_SAFE":
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case "GROWTH_MARKETING":
        return <TrendingUp className="w-4 h-4 text-sky-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#09090b] text-zinc-100 border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#e05638]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>AI Grounded Claim Rewrite Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {modelUsed}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Transforms non-compliant copy into 3 grounded, high-converting brand variations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRewrites}
              disabled={loading}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Regenerate Options"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Original Copy Preview */}
          <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Original Draft Copy (With Violations)
            </span>
            <p className="text-xs text-zinc-300 italic font-mono leading-relaxed line-clamp-2">
              &quot;{originalText}&quot;
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-zinc-200">
                Evaluating Brand Knowledge & Synthesizing Rewrites...
              </div>
              <div className="text-[11px] text-zinc-400">
                Grounded against approved nutrition facts & statutory disclaimer rules
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                Select a Compliant Brand Voice:
              </span>

              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? "bg-zinc-900/90 border-[#e05638] shadow-[0_0_20px_rgba(224,86,56,0.15)] ring-1 ring-[#e05638]/50"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                            {getToneIcon(opt.tone)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-100">{opt.title}</div>
                            <div className="text-[10px] text-zinc-400">{opt.rationale}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {opt.complianceConfidence}% Compliant
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {opt.badge}
                          </span>
                        </div>
                      </div>

                      {/* Rewritten Copy Text */}
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs font-mono leading-relaxed text-zinc-200">
                        {opt.rewrittenText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Applying a rewrite creates an immutable new draft version in the audit trail.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (options[selectedIdx]) {
                  onApplyRewrite(
                    options[selectedIdx].rewrittenText,
                    `Applied ${options[selectedIdx].title} rewrite via AI Grounded Studio.`
                  );
                  onClose();
                }
              }}
              disabled={loading || options.length === 0}
              className="px-5 py-2 rounded-xl btn-coral text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(224,86,56,0.3)] hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Draft & Re-Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
