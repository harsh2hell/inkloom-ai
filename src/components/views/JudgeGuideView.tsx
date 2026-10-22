"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Terminal,
  FileText,
} from "lucide-react";

interface JudgeGuideProps {
  onOpenSubmitModal: () => void;
  onOpenTab: (tab: string) => void;
}

export const JudgeGuideView: React.FC<JudgeGuideProps> = ({
  onOpenSubmitModal,
  onOpenTab,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "Inspect Brand Knowledge Centre",
      desc: "Open the Knowledge Centre tab. Review approved specifications for Verdanta Foods (11 g protein / 100 g, 6 g added sugar, permitted claim 'source of protein', prohibited 'sugar-free' and 'diabetes-friendly', and expired 2023 organic cert).",
      actionLabel: "Go to Knowledge Centre",
      action: () => onOpenTab("knowledge"),
    },
    {
      num: 2,
      title: "Submit a Deliberate Claim Violation",
      desc: "Click 'Submit Content'. Use the 'Policy Violations' preset draft which deliberately contains '100% sugar-free', 'diabetes-friendly', '25g protein', and lacks the mandatory disclosure.",
      snippet:
        "Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!",
      id: "snip1",
      actionLabel: "Open Submission Modal",
      action: onOpenSubmitModal,
    },
    {
      num: 3,
      title: "Inspect Evidence & Citation Verification in Studio",
      desc: "In the Correction Studio, observe the 5 distinct findings: Verified Contradictions (sugar-free & 25g protein), Insufficient Evidence with expired certification downgrade, and Missing Mandatory Disclosure. Note the strict application-side citation verification badge.",
      actionLabel: "Open Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 4,
      title: "Apply One-Click Corrections & Compare Diff",
      desc: "Click 'Apply to Draft' on the findings cards to substitute approved formulations. Toggle 'Compare v1 Diff' to visually inspect the before-and-after side-by-side changes.",
      actionLabel: "Open Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 5,
      title: "Re-run Verification (Creates Version 2)",
      desc: "Click 'Re-Run Verification'. Notice how the system creates Version 2 without erasing Version 1 or its prior analysis history.",
      actionLabel: "Open Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 6,
      title: "Test RBAC: Creator Cannot Self-Approve",
      desc: "Switch role in top navbar to Alex Rivera (Agency Creator). Notice the approval button is blocked because creators cannot approve their own content.",
      actionLabel: "View Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 7,
      title: "Authorize as Brand Admin (Sarah Chen) & Approve",
      desc: "Switch role back to Sarah Chen (Brand Admin). Now click 'Approve for Publication' to officially sign off.",
      actionLabel: "View Studio Actions",
      action: () => onOpenTab("studio"),
    },
    {
      num: 8,
      title: "Generate Creator Brief from Approved Version",
      desc: "Click 'Generate Creator Brief' on the approved version. The brief automatically extracts permitted claims, prohibited claims, disclosures, and verified facts.",
      actionLabel: "Go to Creator Briefs",
      action: () => onOpenTab("briefs"),
    },
    {
      num: 9,
      title: "Submit External Creator Adaptation & Check Drift",
      desc: "In the Creator Briefs tab under the External Creator Portal, try submitting an adaptation that re-introduces 'sugar-free'. Watch the system automatically flag adaptation drift and downgrade the drift score.",
      snippet:
        "Morning workout complete! Loving the Verdanta Plant Crunch bar—it's completely sugar-free and keeps me energized!",
      id: "snip2",
      actionLabel: "Go to Creator Portal",
      action: () => onOpenTab("briefs"),
    },
    {
      num: 10,
      title: "Review Immutable Audit Trail",
      desc: "Open the Audit Log tab to see the entire unbroken ledger of submissions, analysis runs, finding dismissals, version creations, and approval decisions.",
      actionLabel: "Go to Audit Log",
      action: () => onOpenTab("audit"),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-mono">
            HACKATHON JUDGE PLAYBOOK
          </span>
          <h1 className="text-xl font-bold text-slate-900">10-Step End-to-End Evaluation Guide</h1>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Follow this 5-minute walkthrough to test all 10 criteria of the Round 2 Definition of Done: from single source of truth to submission, citation verification, versioning, RBAC, creator brief, adaptation drift check, and audit log.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.num} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              {step.action && (
                <button
                  onClick={step.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0 transition-colors border border-indigo-200"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Test Snippet with Copy Button */}
            {step.snippet && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <code className="font-mono text-[11px] text-slate-800 break-all select-all">
                  {step.snippet}
                </code>
                <button
                  onClick={() => copyToClipboard(step.snippet!, step.id!)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0 font-medium text-[11px] transition-colors"
                >
                  {copiedSnippet === step.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Sample</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
