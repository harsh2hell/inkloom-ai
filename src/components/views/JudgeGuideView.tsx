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
  Compass,
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
      title: "Inspect Brand Knowledge Centre (Source of Truth)",
      desc: "Open the Knowledge Centre tab. Review approved specifications for Verdanta Foods (11 g protein / 100 g, 6 g added sugar, permitted claim 'source of protein', prohibited 'sugar-free' and 'diabetes-friendly', and expired 2023 organic cert KB-VER-007).",
      actionLabel: "Go to Knowledge Centre",
      action: () => onOpenTab("knowledge"),
    },
    {
      num: 2,
      title: "Submit a Deliberate Claim Violation Draft",
      desc: "Click 'Submit Content'. Use the 'Policy Violations' preset draft which contains '100% sugar-free', 'diabetes-friendly', '25g protein', and lacks the mandatory brand disclosure.",
      snippet:
        "Fuel your active day with Verdanta Plant Crunch! Packed with 25g protein per bar, it's 100% sugar-free and completely diabetes-friendly. Certified 100% organic. Grab yours today at 20% off!",
      id: "snip1",
      actionLabel: "Open Submission Modal",
      action: onOpenSubmitModal,
    },
    {
      num: 3,
      title: "Inspect Findings & Citation Validation in Studio",
      desc: "In the Correction Studio, observe the 4 distinct findings: Verified Contradictions (sugar-free & 25g protein), Insufficient Evidence with expired certification downgrade (KB-VER-007 expired Dec 2023), and Missing Mandatory Disclosure. Note strict application-side citation verification.",
      actionLabel: "Open Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 4,
      title: "Apply Corrections & Verify New Revision",
      desc: "Click 'Apply to Draft' on finding cards to substitute approved formulations. Toggle 'Diff View' to inspect before-and-after side-by-side changes. Click 'Save as Revision & Re-Verify' to create Version 2.",
      actionLabel: "Go to Correction Studio",
      action: () => onOpenTab("studio"),
    },
    {
      num: 5,
      title: "Verify Creator Role Gate & Approval Restrictions",
      desc: "Switch persona to 'Maya Patel (Creator)'. Attempt to approve -> Blocked by RBAC. Switch to 'Sarah Chen (Brand Admin)' and approve once findings are resolved. Then generate a Creator Brief and run the Adaptation Drift Checker.",
      actionLabel: "Go to Creator Briefs",
      action: () => onOpenTab("briefs"),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">CodeAxis Round 2 — Judge Demo Guide</h2>
            <span className="text-[10px] font-bold text-[#e05638] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Interactive Script
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step walkthrough to evaluate all 14 hackathon acceptance criteria live on Verdanta Foods.
          </p>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.num} className="clay-card p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>

              <button
                onClick={step.action}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {step.snippet && (
              <div className="pt-2">
                <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2 rounded-t-2xl border-t border-x border-slate-200 text-[11px] font-medium text-slate-600">
                  <span>Pre-built Violation Test Copy</span>
                  <button
                    onClick={() => copyToClipboard(step.snippet!, step.id!)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {copiedSnippet === step.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-b-2xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed">
                  {step.snippet}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
