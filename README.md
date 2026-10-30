<div align="center">

# ✦ INKLOOM AI ✦
### Enterprise Brand Content Governance & Grounded Verification Workspace

[![Live Production](https://img.shields.io/badge/Production-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel&logoColor=white)](https://inkloom-ai-ten.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Vitest-34%2F34%20Passing%20(100%25)-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/harsh2hell/inkloom-ai)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(React%2019)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20%2F%20Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/Google%20GenAI-Gemini%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

<br/>

**CodeAxis Hackathon Round 3 Final Submission**  
**Team:** ERROR 404 &nbsp;|&nbsp; **Deadline:** October 30, 2026, 23:59 IST  
**Fictional Packaged Food Ecosystem:** *Verdanta Foods*

<p align="center">
  <a href="https://inkloom-ai-ten.vercel.app"><strong>Explore Live Deployment »</strong></a>
  &nbsp;•&nbsp;
  <a href="#-quick-start--local-setup"><strong>Quick Setup »</strong></a>
  &nbsp;•&nbsp;
  <a href="#-the-three-committed-round-3-innovations"><strong>Round 3 Features »</strong></a>
  &nbsp;•&nbsp;
  <a href="#-10-step-judge-demo-walkthrough"><strong>Judge Guide »</strong></a>
</p>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [The Three Committed Round 3 Innovations](#-the-three-committed-round-3-innovations)
- [System Architecture](#-system-architecture)
- [Core Platform Capabilities](#-core-platform-capabilities)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Verification Finding Taxonomy](#-verification-finding-taxonomy)
- [10-Step Judge Demo Walkthrough](#-10-step-judge-demo-walkthrough)
- [Automated Test Suite & Evidence](#-automated-test-suite--evidence)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Production Architecture & Resilience](#-production-architecture--resilience)
- [Attribution & License](#-attribution--license)

---

## 🌟 Overview

**Inkloom AI** is an enterprise-grade content-governance, cited claim verification, and creator compliance platform built for brands, marketing agencies, and independent creators. 

Marketing teams often suffer from **brand policy drift**, ungrounded marketing hype, expired scientific or regulatory citations, and unauthorized claims. Inkloom AI establishes a single, version-controlled **Brand Knowledge Centre** as the immutable source of truth and enforces strict, application-side verification before any asset can be published.

### Key Differentiators
- **Two-Layer Grounded Engine:** Pure deterministic AST rules engine paired with a server-side Gemini AI provider. Operates seamlessly 100% offline or with AI assistance.
- **Strict Citation Validation:** Every claim citation is verified against stored database records—validating source ID, approval status, expiration date, and excerpt matching. Invented citations are strictly rejected.
- **Closed-Loop Creator Workflow:** Approved master content automatically generates actionable **Creator Briefs**. Creator adaptations are checked against those briefs to prevent adaptation drift, gated by named human clearance.
- **Zero Mock Data Enforced:** 100% of users, knowledge items, verification runs, and audit logs are persisted directly in PostgreSQL with Prisma ORM.

---

## 🏆 The Three Committed Round 3 Innovations

Inkloom AI Round 3 fulfills every commitment word-for-word with comprehensive implementation, production testing, and full UI integration:

### 1. Advanced Cited Claim Verification and Evidence Sufficiency
- **Comprehensive Evidence Matching:** Evaluates claims against the complete Brand Knowledge Centre registry (facts, claims, guidelines, terminology, disclosures, and visual assets).
- **End-to-End Citation Traceability:** Validates source ID, approval status (`APPROVED`), version, and excerpt matching in application code *before* presenting any finding to the user.
- **Explicit Insufficient-Evidence Handling:** Categorizes missing evidence into explicit sub-reasons:
  - `Coverage gap`: No matching evidence exists in current knowledge base.
  - `Partial or conflicting`: Source data is ambiguous or internally conflicting.
  - `Unverified citation`: Quoted excerpt does not match approved registry record.
- **Named Human Reviewer Routing:** Automatically routes unverified citations to designated brand personnel (e.g., `Sarah Chen, Brand Admin`).
- **Honest "No Source Found" Guarantees:** Unsupported claims explicitly disclose the absence of citations rather than hallucinating references.

### 2. Intelligent Creator Briefs and Final Content Checks
- **Automated Brief Generation:** Translates approved marketing content into concise, actionable requirements:
  - *Permitted Claims & Value Propositions*
  - *Prohibited Claims & Legal Pitfalls*
  - *Mandatory Disclosures & Required Disclaimers*
  - *Approved Brand Assets & Color Palettes*
- **Final Creator Content Checks:** Re-audits creator adaptations directly against the generated brief prior to publication.
- **Adaptation Drift Scoring:** Detects claim drift and visual divergence (0–100% alignment score).
- **Named Human Publication Clearance:** High-risk adaptations enforce a strict gate: only authorized Brand Admins or Brand Owners can confirm final clearance (`CLEARED` or `CHANGES_REQUESTED`) with timestamped audit notes.

### 3. Governance Intelligence and Guideline-Clarity Detection
- **Verification History Analytics:** A dedicated analytics engine aggregating verification trends across brand campaigns.
- **Recurring Violations Identification:** Automatically ranks the most frequent claim violations (e.g., unauthorized *"sugar-free"* or *"diabetes-friendly"* claims).
- **Evidence Gap Tracking:** Surges visibility into claims frequently flagged as `INSUFFICIENT_EVIDENCE`, pinpointing where scientific substantiation or regulatory filings are missing.
- **Override & Compliance Patterns:** Monitors reviewer override rates, risk distributions, and approval ratios over time.
- **Guideline-Clarity Detection:** Identifies brand guidelines with disproportionately high violation or override rates, flagging ambiguous or conflicting instructions for brand owner clarification.

---

## 🏗 System Architecture

Inkloom AI utilizes a defense-in-depth architecture ensuring zero hallucinated citations and complete prompt-injection defense.

```mermaid
flowchart TD
    subgraph Intake ["Intake Layer"]
        A1[Paste Copy] --> B[Multi-Format Intake Engine]
        A2[DOCX Document] --> B
        A3[PDF Upload] --> B
        A4[Visual Assets & Logos] --> B
    end

    subgraph CoreEngine ["Two-Layer Verification Pipeline"]
        B --> C[Layer 1: Deterministic Policy Gate]
        C -->|Regex, Tokens, Dates, Alt-Text| D{AI Key Configured?}
        D -->|No / Keyless| E[Deterministic Findings]
        D -->|Yes| F[Layer 2: Server-Side Gemini Provider]
        F -->|<untrusted_marketing_draft> Sandbox| G[Semantic Claim Analysis]
        E --> H[Application-Side Citation Validator]
        G --> H
    end

    subgraph Validator ["Strict Citation & Evidence Grounding"]
        H --> I[Check Source ID Exists]
        H --> J[Verify Status == APPROVED]
        H --> K[Verify Expiry Date > NOW]
        H --> L[Verify Normalized Excerpt Match]
        I & J & K & L --> M{All Valid?}
        M -->|Yes| N[Grounded Finding with Validated Citation]
        M -->|No| O[Insufficient Evidence + Sub-Reason + Named Reviewer]
    end

    subgraph Studio ["Correction Studio & Governance"]
        N & O --> P[Interactive Correction Studio]
        P --> Q[1-Click Apply to Draft]
        P --> R[Version Comparison Diff View]
        P --> S[Pending Override & Justification]
        S --> T[Immutable PostgreSQL Audit Trail]
    end
```

---

## ⚡ Core Platform Capabilities

| Capability | Specification | Production Status |
| :--- | :--- | :--- |
| **Brand Knowledge Centre** | 10+ versioned items (facts, permitted/prohibited claims, guidelines, disclosures, visual assets, expired certs). | ✅ Fully Implemented |
| **Multi-Format Document Intake** | Paste text or upload `.docx`, `.pdf`, `.txt` with server-side text extraction. | ✅ Fully Implemented |
| **Visual Asset Analysis** | Alt-text presence and quality auditing, logo URL verification, brand color palette hex checking. | ✅ Fully Implemented |
| **Two-Layer Check Engine** | Deterministic AST regex rules + Gemini AI layer (`@google/genai`). | ✅ Fully Implemented |
| **Correction Studio** | Side-by-side editor, 1-click apply, diff comparison (v1 vs v2), version history retention. | ✅ Fully Implemented |
| **Human Review Workflow** | Creator self-approval restriction, written override justifications, publication clearance gate. | ✅ Fully Implemented |
| **Creator Briefs** | Direct brief compilation from approved content + final adaptation verification. | ✅ Fully Implemented |
| **Governance Dashboard** | Recurring violations, evidence gap tracker, override patterns, guideline-clarity flags. | ✅ Fully Implemented |
| **Trust & Safety** | Zero client-side API keys, per-brand isolation, external AI notice, deterministic demo fallback. | ✅ Fully Implemented |

---

## 👥 Role-Based Access Control (RBAC)

Inkloom AI enforces server-side role validation across all mutation endpoints. Five realistic personas are pre-seeded in PostgreSQL:

| Persona | Role | Workspace | Permissions & Guardrails |
| :--- | :--- | :--- | :--- |
| **Elena Vance** | `BRAND_OWNER` | Verdanta Foods | Full administrative control, guideline policy creation, final publication clearance, override approval. |
| **Sarah Chen** | `BRAND_ADMIN` | Verdanta Foods | Knowledge review, content approval, creator brief clearance, insufficient-evidence resolution. |
| **Alex Rivera** | `AGENCY_CREATOR` | Apex Creative | Draft creation, revision editing, brief generation. **Cannot approve own content.** |
| **Maya Patel** | `EXTERNAL_CREATOR` | Independent Studio | Adaptation submission against briefs. **Cannot approve content or grant clearance.** |
| **David Thorne** | `AUDITOR` | Global Standards | Read-only compliance inspection, immutable audit log verification, telemetry analysis. |

---

## 🔍 Verification Finding Taxonomy

Every finding returned by the verification pipeline belongs to one of five deterministic categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      INKLOOM FINDING TAXONOMY                          │
├──────────────────────────┬───────────┬─────────────────────────────────┤
│ Finding Type             │ Severity  │ Grounding & Evidence Behavior   │
├──────────────────────────┼───────────┼─────────────────────────────────┤
│ 1. VERIFIED_CONTRADICTION│ HIGH      │ Directly violates approved fact │
│                          │           │ or prohibited claim. Strict ID. │
├──────────────────────────┼───────────┼─────────────────────────────────┤
│ 2. UNSUPPORTED_CLAIM     │ MEDIUM    │ No source found in registry.    │
│                          │           │ Explicit "No Source" label.     │
├──────────────────────────┼───────────┼─────────────────────────────────┤
│ 3. INSUFFICIENT_EVIDENCE │ HIGH/MED  │ Cites expired or missing proof. │
│                          │           │ Sub-reasons: Coverage gap, etc. │
├──────────────────────────┼───────────┼─────────────────────────────────┤
│ 4. POSSIBLE_RISK         │ MEDIUM    │ Missing mandatory disclosures,  │
│                          │           │ ambiguous legal exposure.       │
├──────────────────────────┼───────────┼─────────────────────────────────┤
│ 5. STYLE_SUGGESTION      │ LOW/INFO  │ Tone, capitalization, or brand  │
│                          │           │ vocabulary recommendations.     │
└──────────────────────────┴───────────┴─────────────────────────────────┘
```

---

## 🎯 10-Step Judge Demo Walkthrough

Judges can verify all Round 3 features live in under 5 minutes at [https://inkloom-ai-ten.vercel.app](https://inkloom-ai-ten.vercel.app):

1. **Access Live Platform:** Open [https://inkloom-ai-ten.vercel.app](https://inkloom-ai-ten.vercel.app). Observe the active brand **Verdanta Foods** (clearly labeled demonstration workspace).
2. **Switch RBAC Personas:** In the header, toggle between **Elena Vance** (Owner), **Sarah Chen** (Admin), **Alex Rivera** (Agency), **Maya Patel** (Creator), and **David Thorne** (Auditor).
3. **Inspect Knowledge Centre:** Navigate to **Knowledge Centre**. Review 10 version-controlled entries including approved nutritional facts, prohibited claims, mandatory disclosures, approved brand assets (logo, hex colors `#2D5A27`, `#E05638`), and the expired 2023 organic certificate.
4. **Submit Intentional Violation Draft:** Click **"Submit Content"** and select **"Load Policy Violations Preset"**:
   > *"Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!"*
5. **Inspect Validated Findings:** In the **Correction Studio**, observe the 5 distinct findings with code-validated citations:
   - `VERIFIED_CONTRADICTION`: "100% sugar-free" (violates KB-VER-004 & KB-VER-002)
   - `VERIFIED_CONTRADICTION`: "completely diabetes-friendly" (violates KB-VER-005)
   - `VERIFIED_CONTRADICTION`: "25g protein per bar" (violates KB-VER-001 11g/100g spec)
   - `INSUFFICIENT_EVIDENCE`: "Certified 100% organic" (sub-reason `Coverage gap` / expired evidence Dec 2023, routed to `Sarah Chen (Brand Admin)`)
   - `POSSIBLE_RISK`: Missing mandatory brand disclosure (KB-VER-006)
6. **Apply 1-Click Corrections:** Click **"Apply to Draft"** on the findings. Watch non-compliant claims automatically replaced with verified wording.
7. **Inspect Diff View:** Click **"Diff View"** to inspect the real-time word-by-word diff comparing Version 1 with the corrected text.
8. **Save Version 2 & Enforce Approval RBAC:** Click **"Save as v2 & Re-Verify"**. Switch persona to **Alex Rivera** (Creator)—the "Approve" button is strictly locked: *"Creators cannot approve their own content."* Switch to **Sarah Chen** (Admin) and approve the compliant version.
9. **Generate Creator Brief:** Click **"Creator Briefs"** -> **"Generate Brief from v2"**. The system translates the approved draft into permitted claims, prohibited statements, mandatory disclosures, and approved visual assets.
10. **Test Final Content Check & Human Clearance:** Under the Creator portal, submit an adaptation re-introducing unapproved claims. Observe adaptation drift detection. Switch to **Brand Admin** and click **"Confirm Publication Clearance"** with written sign-off notes. Review the **Governance Intelligence** dashboard for recurring trends and guideline-clarity flags.

---

## 🧪 Automated Test Suite & Evidence

The repository maintains an automated test suite comprising **34 tests across 3 comprehensive suites**, achieving a **100% passing rate** with zero mock data.

```bash
$ npm test

 RUN  v5.0.5 /Users/harsh/inkloom-ai

 ✓ tests/acceptance.test.ts (14 tests) 60ms
   ✓ Inkloom AI — 14 Critical Acceptance Tests
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
     ✓ 14. Uploaded content containing prompt-injection instructions cannot override verification policy

 ✓ tests/zero-mock-data.test.ts (12 tests) 28ms
   ✓ Inkloom AI — Zero-Mock Production Data Invariants
     ✓ [DB-01] Elena Vance (Brand Owner) persisted with BRAND_OWNER role
     ✓ [DB-02] Sarah Chen (Brand Admin) persisted with BRAND_ADMIN role
     ✓ [DB-03] Alex Rivera (Agency Creator) persisted with AGENCY_CREATOR role
     ✓ [DB-04] Maya Patel (External Creator) persisted with EXTERNAL_CREATOR role
     ✓ [DB-05] David Thorne (Auditor) persisted with AUDITOR role
     ✓ [DB-06] Knowledge Base contains at least 10 items covering all categories
     ✓ [DB-07] KB-VER-001 (Protein spec) is APPROVED with valid excerpt
     ✓ [DB-08] KB-VER-007 (Organic cert) is EXPIRED with status EXPIRED
     ✓ [DB-09] KB-VER-010 (Brand Assets) defines approved primary logo and brand colours
     ✓ [DB-10] Brand Owner and Brand Admin have permission to clear creator submissions
     ✓ [DB-11] Agency Creator and External Creator cannot approve content or clear briefs
     ✓ [DB-12] Deterministic engine findings include explicit citation traceability

 ✓ tests/verdanta-evaluation.test.ts (8 tests) 22ms
   ✓ Verdanta Foods Benchmark & Round 3 Verification Evaluation
     ✓ E1: Compliant oat milk draft passes with zero blocking findings
     ✓ E2: Prohibited diabetic cure and unapproved superfood claims are flagged with verified citations
     ✓ E3: Insufficient evidence sub-reasons correctly categorize claims and route to named reviewer
     ✓ E4: Multi-format document intake (.docx, .pdf, .txt) extracts text accurately
     ✓ E5: Visual asset analysis checks alt-text, approved logos, and brand-colour compliance
     ✓ E6: Creator brief generation translates approved facts, claims, disclosures, and assets
     ✓ E7: Final creator content check enforces named human clearance gate
     ✓ E8: Governance intelligence analyzes violations, gaps, overrides, and guideline clarity

 Test Files  3 passed (3)
      Tests  34 passed (34)
   Duration  389ms
```

---

## 💻 Quick Start & Local Setup

### Prerequisites
- **Node.js** >= 20.0.0
- **PostgreSQL** running locally or remote connection URL (Neon / Supabase)

### 1. Clone Repository
```bash
git clone https://github.com/harsh2hell/inkloom-ai.git
cd inkloom-ai
npm install
```

### 2. Configure Environment Variables
Create `.env` from example:
```bash
cp .env.example .env
```
Populate environment settings:
```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://username:password@localhost:5432/inkloom_ai?schema=public"

# Optional: Google Gemini API Key for server-side semantic analysis
# (Deterministic policy gate operates fully even if left blank)
GEMINI_API_KEY="AIzaSy..."
```

### 3. Synchronize Database & Seed Verdanta Foods Ecosystem
```bash
# Push schema to database
npx prisma db push

# Seed 5 user personas, 10 knowledge registry items, and demo campaigns
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Architecture & Resilience

- **Live URL:** [https://inkloom-ai-ten.vercel.app](https://inkloom-ai-ten.vercel.app)
- **Deployment Platform:** Vercel Serverless Edge Runtime with Next.js 16 App Router.
- **Database Engine:** Managed PostgreSQL Cloud Database with pooled connection proxying (`pgbouncer=true`).
- **Cold-Start Resilience:** Built-in connection pooler retry, schema bootstrap caching, and non-blocking retry mechanisms ensure reliable first-load availability.
- **Server-Side Security:** Zero AI keys or secret credentials exposed in client-side bundles; strict CSP and input sanitation against prompt-injection payloads.

---

## 📜 Attribution & License

Developed for the **CodeAxis Hackathon Round 3 Final** by **Team ERROR 404**.  
Distributed under the **MIT License**.

*Disclaimer: Verdanta Foods is an illustrative, fictional consumer packaged goods brand created solely for compliance benchmarking and verification testing.*
