# INKLOOM AI — Content Governance & Claims Verification Platform
**CodeAxis Hackathon Round 2** | **Team:** ERROR 404 | **Deadline:** October 25, 2026, 10:00 AM IST

---

## 1. Product Overview

- **Source Repository:** [https://github.com/harsh2hell/inkloom-ai](https://github.com/harsh2hell/inkloom-ai)
- **Live Public URL:** [https://26f8a9572bfec8.lhr.life](https://26f8a9572bfec8.lhr.life)
- **Local Dev URL:** [http://localhost:3000](http://localhost:3000)

Inkloom AI is a shared content-governance and verification workspace for brands, marketing agencies, and creators.

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

All 14 critical acceptance tests have been implemented and executed.

```bash
npm test
```

### Actual Test Results (Verified)
```
✓ tests/acceptance.test.ts (14 tests) 34ms
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

Test Files:  1 passed (1)
Tests:       14 passed (14)
```

---

## 5. Judge Demo Walkthrough (10-Step Definition of Done)

Use the built-in **"Judge Guide"** tab in the top navigation or follow these 10 steps:

1. **Open App:** Launch [http://localhost:3000](http://localhost:3000). Notice the active brand is **Verdanta Foods** (clearly labeled fictional demo).
2. **Select Role:** In the top right header, test switching between:
   - `Sarah Chen` (Brand Admin / Reviewer)
   - `Alex Rivera` (Agency Creator)
   - `Maya Patel` (External Creator)
   - `David Thorne` (Read-only Auditor)
3. **Inspect Knowledge Centre:** Click the **Knowledge Centre** tab. Inspect approved facts (11 g protein per 100 g, 6 g added sugar), permitted claim ("source of protein"), prohibited claims ("sugar-free", "diabetes-friendly"), mandatory disclosure, and the expired 2023 organic certificate.
4. **Submit Violation Draft:** Click **"Submit Content"** in the top navbar. Click the preset **"Policy Violations"** button to load the deliberate claim violation draft:
   > *"Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!"*
5. **Inspect Verified Findings:** In the **Correction Studio**, observe the 5 distinct findings:
   - **Contradiction:** "100% sugar-free" (violates KB-VER-004 & KB-VER-002)
   - **Contradiction:** "completely diabetes-friendly" (violates KB-VER-005)
   - **Contradiction:** "25g protein per bar" (violates KB-VER-001 11g/100g spec)
   - **Insufficient Evidence:** "Certified 100% organic" (downgraded with citation status "Expired Evidence Dec 2023")
   - **Possible Risk:** Missing mandatory brand disclosure (KB-VER-006)
6. **Apply Corrections & Diff:** Click **"Apply to Draft"** on the findings to replace non-compliant text with approved wording. Toggle **"Compare v1 Diff"** to view side-by-side highlighted word changes.
7. **Re-Run Verification (Version 2):** Click **"Re-Run Verification"**. Version 2 is generated, while Version 1 and its prior analysis history are preserved intact.
8. **Enforce Authorization:** Switch to `Alex Rivera` (Agency Creator). Notice that the "Approve" button is locked: *"Creators cannot approve their own content."* Switch to `Sarah Chen` (Brand Admin) to approve the compliant version.
9. **Generate Creator Brief:** Click **"Generate Creator Brief"**. The brief extracts permitted claims, prohibited claims, disclosures, and verified facts.
10. **Test Creator Adaptation Drift:** Under the **External Creator Portal**, submit an adaptation re-introducing "sugar-free". Watch the system flag adaptation drift and downgrade the alignment score. Open the **Audit Log** to inspect the immutable ledger.

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
- If any check fails, automatically downgrades finding to `INSUFFICIENT_EVIDENCE` with sub-reason `Unverified citation`.

### Human Review & Permissions (`src/lib/auth/roles.ts`)
- Creators cannot approve their own content.
- High-risk and insufficient-evidence findings require human sign-off.
- Brand Reviewer overrides require explicit written rationale.
- All actions are committed to an immutable `AuditLog` table.

---

## 7. Known Limitations

1. **Single Workspace Scope (Round 2):** Seeded to one multi-role brand workspace (Verdanta Foods Ecosystem). Enterprise multi-tenant database isolation is reserved for Round 3.
2. **Document Text Extraction:** PDF and DOCX attachments are currently stored with extracted text excerpts; automated OCR on image attachments is slated for Round 3.
3. **Session Simulation:** User switching is currently provided via an interactive header selector to simplify judge evaluation without requiring multiple browser logins.

---

## 8. Changes from Round 1 Plan

1. **Adoption of Next.js 16 & React 19:** Built directly on Next.js 16.4 with Turbopack and async App Router APIs.
2. **Dual-Layer Deterministic/AI Architecture:** Separated exact regex/token compliance checks from semantic LLM evaluations to guarantee reproducibility when offline or unauthenticated.
3. **Dedicated Creator Adaptation Drift Engine:** Integrated a mathematical drift scoring engine (0-100) specifically for creator adaptations against generated briefs.

---

## 9. Three Substantial Round 3 Improvements

1. **Full Enterprise Multi-Tenancy with Row-Level Security (RLS):**
   - Migrate from single-brand workspace to multi-tenant organization isolation where distinct brands, marketing holding companies, and creator talent agencies have separated database boundaries.
2. **Multimodal Packaging & Video Frame Verification:**
   - Extend the verification engine using Gemini Omni Flash (`gemini-omni-1.1-flash`) to verify video frames, TikTok reels, and packaging label prints directly for mandatory disclosure font sizing and logo placements.
3. **Real-time Regulatory Feed Integration:**
   - Automated ingestion of FDA, EFSA, and ASCI regulatory policy updates that automatically flags existing approved brand facts when national advertising codes are amended.

---

## 10. License & Attribution
Built for the **CodeAxis Hackathon Round 2** by **Team ERROR 404**.
Fictional packaged food brand: *Verdanta Foods*. All nutritional data and brand policies are for demonstration and compliance testing purposes only.
