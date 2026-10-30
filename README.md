# INKLOOM AI — Content Governance & Claims Verification Platform
**CodeAxis Hackathon Round 3 Final** | **Team:** ERROR 404 | **Deadline:** October 30, 2026, 23:59 IST

---

## 1. Product Overview

- **Source Repository:** [https://github.com/harsh2hell/inkloom-ai](https://github.com/harsh2hell/inkloom-ai)
- **Live Public URL:** [https://inkloom-ai-ten.vercel.app](https://inkloom-ai-ten.vercel.app)
- **Local Dev URL:** [http://localhost:3000](http://localhost:3000)

Inkloom AI is a shared content-governance and verification workspace for brands, marketing agencies, and creators. The application features a premium, minimalist B2B SaaS interface with a fixed-width navigation sidebar, interactive Correction Studio with one-click fixes and diff viewer, and an immutable governance audit trail.

A brand maintains one approved source of truth containing product facts, permitted and prohibited claims, guidelines, terminology, mandatory disclosures, and supporting source evidence. Marketing content is strictly audited against this knowledge before publication. Every finding is evidence-backed, citations are strictly validated application-side, and every approval decision remains with a human reviewer.

The platform also closes the loop by generating official creator briefs from approved content versions and checking creator adaptations against those briefs to prevent adaptation drift.

---

## 2. Technology Stack

- **Framework:** Next.js 16 (App Router) with TypeScript & React 19
- **Styling:** Tailwind CSS (v4) with custom tokens for diff views, badges, and glassmorphism
- **Database:** PostgreSQL with Prisma ORM (v6.4.1)
- **AI Engine:** Gemini 3.8 Flash (`@google/genai` v2.30.0) accessed strictly server-side via an isolated provider abstraction
- **Deterministic Rules:** Pure TypeScript rule engine for reproducible policy execution without requiring an AI key
- **Testing:** Vitest automated test suite covering all 14 acceptance criteria
- **Security:** Strict server-side RBAC, prompt injection defense, untrusted content encapsulation

---

## 3. Getting Started & Local Setup

### Prerequisites
- Node.js >= 20 (v26.4.0 verified)
- PostgreSQL running locally on port 5432 (or a remote PostgreSQL connection string)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harsh2hell/inkloom-ai.git
cd inkloom-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/inkloom_ai?schema=public"
# Optional: Gemini API Key for server-side AI-assisted analysis
# If omitted, system runs reliably in Deterministic-Only Mode
GEMINI_API_KEY=""
```

### 3. Sync Database Schema & Seed Demo Data
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed realistic Verdanta Foods demo ecosystem (Users, Truth Items, Sample Drafts)
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Automated Test Suite & Actual Results

All 34 automated tests across three comprehensive suites have been implemented and pass with 100% success rate (zero-mock validation, full acceptance criteria, and Verdanta Foods test set evaluation).

```bash
npm test
```

### Actual Test Results (Verified)
```
✓ tests/acceptance.test.ts (14 tests)
  ✓ Inkloom AI — 14 Critical Acceptance Tests (14)
    ✓ 1. A compliant draft passes relevant deterministic checks
    ✓ 2. A prohibited claim is detected
    ✓ 3. A missing mandatory disclosure is detected
    ✓ 4. An expired source cannot be treated as current approved evidence
    ✓ 5. An unknown or invented source ID is rejected
    ✓ 6. A quotation that does not match its source is rejected
    ✓ 7. An invalid citation becomes insufficient evidence
    ✓ 8. A factual correction without supporting evidence is not presented as verified
    ✓ 9. An insufficient-evidence finding requires authorized human resolution
    ✓ 10. A creator cannot approve their own content
    ✓ 11. Editing content creates a new version and preserves the prior analysis
    ✓ 12. A creator brief derives from the approved version
    ✓ 13. A changed creator caption is checked against its brief
    ✓ 14. Uploaded content containing prompt-injection instructions cannot override the verification policy
✓ tests/verdanta-evaluation.test.ts (8 tests)
  ✓ Verdanta Foods Benchmark & Round 3 Verification Evaluation (8)
    ✓ E1: Compliant oat milk draft passes with zero blocking findings
    ✓ E2: Prohibited diabetic cure and unapproved superfood claims are flagged with verified citations
    ✓ E3: Insufficient evidence sub-reasons correctly categorize claims and route to named reviewer
    ✓ E4: Multi-format document intake (.docx, .pdf, .txt) extracts text accurately
    ✓ E5: Visual asset analysis checks alt-text, approved logos, and brand-colour compliance
    ✓ E6: Creator brief generation translates approved facts, claims, disclosures, and assets
    ✓ E7: Final creator content check enforces named human clearance gate
    ✓ E8: Governance intelligence analyzes violations, gaps, overrides, and guideline clarity
✓ tests/zero-mock-data.test.ts (12 tests)
  ✓ Inkloom AI — Zero-Mock Production Data Invariants (12)
    ✓ [DB-01] Elena Vance (Brand Owner) is persisted with BRAND_OWNER role
    ✓ [DB-02] Sarah Chen (Brand Admin) is persisted with BRAND_ADMIN role
    ✓ [DB-03] Alex Rivera (Agency Creator) is persisted with AGENCY_CREATOR role
    ✓ [DB-04] Maya Patel (External Creator) is persisted with EXTERNAL_CREATOR role
    ✓ [DB-05] David Thorne (Auditor) is persisted with AUDITOR role
    ✓ [DB-06] Knowledge Base contains at least 10 items covering all categories
    ✓ [DB-07] KB-VER-001 (Protein spec) is APPROVED with valid excerpt
    ✓ [DB-08] KB-VER-007 (Organic cert) is EXPIRED with status EXPIRED
    ✓ [DB-09] KB-VER-010 (Brand Assets) defines approved primary logo and brand colours
    ✓ [DB-10] Brand Owner and Brand Admin have permission to clear creator submissions
    ✓ [DB-11] Agency Creator and External Creator cannot approve content or clear briefs
    ✓ [DB-12] Deterministic engine findings include explicit citation traceability

Test Files:  3 passed (3)
Tests:       34 passed (34)
```

---

## 5. Judge Demo Walkthrough (10-Step Definition of Done)

Use the built-in **"Judge Guide"** tab in the top navigation or follow these 10 steps:

1. **Open App:** Launch [https://inkloom-ai-ten.vercel.app](https://inkloom-ai-ten.vercel.app). Notice the active brand is **Verdanta Foods** (clearly labeled fictional demo).
2. **Select Role:** In the top right header, test switching between all 5 RBAC personas:
   - `Elena Vance` (Brand Owner)
   - `Sarah Chen` (Brand Admin / Reviewer)
   - `Alex Rivera` (Agency Creator)
   - `Maya Patel` (External Creator)
   - `David Thorne` (Read-only Auditor)
3. **Inspect Knowledge Centre:** Click the **Knowledge Centre** tab. Inspect 10 versioned items: approved facts (11 g protein per 100 g, 6 g added sugar), permitted claim ("source of protein"), prohibited claims ("sugar-free", "diabetes-friendly"), mandatory disclosure, brand terminology, approved visual assets (primary logo, hex palette `#2D5A27`, `#E05638`, `#F4F5F8`), and the expired 2023 organic certificate.
4. **Submit Multi-Format Content or Violation Draft:** Click **"Submit Content"** in the top navbar. Choose one of two options:
   - Paste or upload a document (`.docx`, `.pdf`, `.txt`) with server-side text extraction.
   - Run visual asset checks on image attachments (verifies alt-text presence, approved logo URL, and brand-colour compliance).
   - Or click the preset **"Policy Violations"** button to load the deliberate claim violation draft:
   > *"Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!"*
5. **Inspect Verified Findings & Traceability:** In the **Correction Studio**, observe the 5 distinct finding types with code-validated citations:
   - **Contradiction:** "100% sugar-free" (violates KB-VER-004 & KB-VER-002)
   - **Contradiction:** "completely diabetes-friendly" (violates KB-VER-005)
   - **Contradiction:** "25g protein per bar" (violates KB-VER-001 11g/100g spec)
   - **Insufficient Evidence:** "Certified 100% organic" (sub-reason `Coverage gap` / expired evidence Dec 2023, routed to `Sarah Chen (Brand Admin)`)
   - **Possible Risk:** Missing mandatory brand disclosure (KB-VER-006)
   - **Honest "No Source Found":** Unsupported claims clearly report no source found rather than hallucinating citations.
6. **Apply Corrections & Diff:** Click **"Apply to Draft"** on the findings to replace non-compliant text with approved wording. Toggle **"Compare v1 Diff"** to view side-by-side highlighted word changes.
7. **Re-Run Verification (Version 2):** Click **"Re-Run Verification"**. Version 2 is generated, while Version 1 and its prior analysis history are preserved intact.
8. **Enforce Authorization:** Switch to `Alex Rivera` (Agency Creator). Notice that the "Approve" button is locked: *"Creators cannot approve their own content."* Switch to `Sarah Chen` (Brand Admin) or `Elena Vance` (Brand Owner) to approve the compliant version.
9. **Generate Creator Brief:** Click **"Generate Creator Brief"**. The brief automatically translates approved brand knowledge into actionable requirements: permitted claims, prohibited claims, mandatory disclosures, and approved visual assets.
10. **Test Creator Final Content Check & Named Human Clearance:** Under the **External Creator Portal**, submit an adaptation re-introducing "sugar-free". Watch the system flag adaptation drift and downgrade the alignment score. Brand Admins and Brand Owners have an explicit clearance gate: click **"Confirm Publication Clearance"** or **"Request Changes"** with written clearance notes. Open the **Governance Intelligence** dashboard to view recurring violations, evidence gaps, override patterns, and guideline-clarity flags.

---

## 6. Architecture & Core Implementation Details

### Two-Layer Verification Engine
1. **Layer 1: Deterministic Engine (`src/lib/verification/deterministic.ts`)**
   - Scans text against active prohibited claims, mandatory brand disclosures, and expired evidence.
   - Operates 100% locally with zero external API calls or token costs.
2. **Layer 2: AI Provider Abstraction (`src/lib/ai/provider.ts`)**
   - Implements `GeminiAIProvider` targeting `gemini-3.8-flash` via `@google/genai`.
   - Strict prompt engineering encloses untrusted content in `<untrusted_marketing_draft>` tags to defend against prompt injection.
   - When no key is present or on API timeout, safely falls back to deterministic results without fabricating findings.

### Strict Application-Side Citation Validator (`src/lib/verification/citation.ts`)
The model is never trusted to validate its own citations.
- Validates that referenced knowledge item exists.
- Validates that status is `APPROVED`.
- Validates that current date does not exceed `expiryDate`.
- Safe text normalization verifies that the quoted excerpt matches the stored source text.
- If any check fails, automatically categorizes finding as `INSUFFICIENT_EVIDENCE` with explicit sub-reasons (`Coverage gap`, `Partial or conflicting`, or `Unverified citation`) and routes to a named human reviewer.

### Human Review & Permissions (`src/lib/auth/roles.ts`)
- Five distinct roles: `Brand Owner`, `Brand Admin`, `Agency Creator`, `External Creator`, `Auditor`.
- Creators cannot approve their own content.
- High-risk and insufficient-evidence findings require human sign-off.
- Brand Reviewer overrides require explicit written rationale.
- Final creator submissions require named human clearance confirmation.
- All actions are committed to an immutable `AuditLog` table.

---

## 7. Resolution of Round 2 Limitations

All Round 2 limitations have been completely resolved in production:

1. **Production Database Authentication & User-Account Loading:**
   - Resolved via persistent Prisma client reuse in serverless environments (`src/lib/prisma.ts`), 8-second client abort timeout protection, and automatic database bootstrap in `/api/auth/current-user` so the application connects instantly on cold start.
2. **Correction & Re-Verification Submitter Resolution:**
   - Submitter ID resolution and immutable version chain creation (`ContentVersion`) now maintain full parent-child traceability without schema inconsistencies or lost revision history.
3. **Multi-Format Intake & Visual Asset Analysis:**
   - Document intake supports `.docx`, `.pdf`, and `.txt` with server-side extraction.
   - Visual asset inspection (`src/lib/intake/visual.ts`) audits alt-text presence and quality, verifies logo URLs against approved knowledge assets, and checks brand-colour hex codes against approved palettes.

---

## 8. Changes from Round 1 Plan

1. **Adoption of Next.js 16 & React 19:** Built directly on Next.js 16.4 with Turbopack and async App Router APIs.
2. **Dual-Layer Deterministic/AI Architecture:** Separated exact regex/token compliance checks from semantic LLM evaluations to guarantee reproducibility when offline or unauthenticated.
3. **Dedicated Creator Adaptation Drift Engine:** Integrated a mathematical drift scoring engine (0-100) specifically for creator adaptations against generated briefs.

---

## 9. Three Substantial Round 3 Improvements

1. **Advanced Cited Claim Verification and Evidence Sufficiency**
   - Comprehensive evidence matching against the full Knowledge Centre registry.
   - Full citation traceability: source ID, approval status, version, and excerpt validated in code before a finding is shown.
   - Explicit insufficient-evidence handling with sub-reasons (`Coverage gap`, `Partial or conflicting`, `Unverified citation`) routed to a named human reviewer.
   - Honest "no source found" messaging for unsupported claims without hallucinating citations.

2. **Intelligent Creator Briefs and Final Content Checks**
   - Briefs generated from approved content, translating approved brand knowledge into actionable requirements (permitted claims, prohibited claims, mandatory disclosures, approved assets).
   - The creator's final content checked once more against that brief before publication.
   - A named human confirming clearance (`CLEARED` / `CHANGES_REQUESTED`) with timestamped clearance notes before release.

3. **Governance Intelligence and Guideline-Clarity Detection**
   - A dedicated dashboard analysing verification history across four core pillars:
     * Recurring Violations: ranking of most frequent claim contradictions and unapproved statements.
     * Evidence Gaps: identification of unverified claims needing new Knowledge Centre submissions.
     * Override & Compliance Patterns: tracking of reviewer overrides, pending risks, and approval ratios.
     * Guideline-Clarity Detection: automatic detection of guidelines with elevated violation rates that appear ambiguous or conflicting, recommending clarification.

---

## 10. License & Attribution
Built for the **CodeAxis Hackathon Round 3 Final** by **Team ERROR 404**.
Fictional packaged food brand: *Verdanta Foods*. All nutritional data, assets, and brand policies are for demonstration and compliance testing purposes only.
