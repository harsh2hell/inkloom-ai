export type RegulatoryRegion = "US_FDA" | "EU_EFSA" | "IN_FSSAI" | "CA_CFIA";

export interface RegionMetadata {
  id: RegulatoryRegion;
  name: string;
  shortLabel: string;
  flag: string;
  regulatoryBody: string;
  governingLaw: string;
  primaryRules: string[];
}

export const REGULATORY_REGIONS: Record<RegulatoryRegion, RegionMetadata> = {
  US_FDA: {
    id: "US_FDA",
    name: "United States",
    shortLabel: "FDA / FTC",
    flag: "🇺🇸",
    regulatoryBody: "Food and Drug Administration (FDA) & Federal Trade Commission (FTC)",
    governingLaw: "21 CFR Part 101 (Food Labeling) & FTC Endorsement Guides",
    primaryRules: [
      "21 CFR 101.54: 'Good source of protein' requires ≥10g (10% Daily Value); 'High in protein' requires ≥20g.",
      "21 CFR 101.60(c): 'Sugar free' claim strictly prohibited if >0.5g sugar per labeled serving.",
      "FTC 16 CFR § 255: Mandatory sponsorship and dietary disclaimers must be clear and conspicuous.",
      "FD&C Act § 403(r): Prohibits unapproved disease treatment or prevention claims (e.g., diabetes cures).",
    ],
  },
  EU_EFSA: {
    id: "EU_EFSA",
    name: "European Union",
    shortLabel: "EFSA (Strict)",
    flag: "🇪🇺",
    regulatoryBody: "European Food Safety Authority (EFSA)",
    governingLaw: "Regulation (EC) No 1924/2006 on Nutrition and Health Claims",
    primaryRules: [
      "EC 1924/2006 Annex: 'Source of protein' permitted ONLY if at least 12% of total energy value is from protein.",
      "EC 1924/2006 Annex: 'High protein' permitted ONLY if at least 20% of energy value is from protein.",
      "EC 1924/2006 Art. 8: 'Sugar-free' requires ≤0.5g sugars per 100g. 'With no added sugars' requires explicit naturally occurring sugar notice.",
      "EC 1924/2006 Art. 14: Disease risk reduction claims must be backed by authorized EFSA register opinions.",
    ],
  },
  IN_FSSAI: {
    id: "IN_FSSAI",
    name: "India",
    shortLabel: "FSSAI",
    flag: "🇮🇳",
    regulatoryBody: "Food Safety and Standards Authority of India (FSSAI)",
    governingLaw: "FSS (Advertising and Claims) Regulations, 2018",
    primaryRules: [
      "FSSA 2018 Reg. 4: Prohibits misleading superlative claims ('100% natural', 'miracle cure') unless whole single-ingredient.",
      "FSSA 2018 Schedule I: 'Source of protein' requires 10% of Recommended Dietary Allowance (RDA) per 100g.",
      "FSSA 2018 Reg. 7: Mandatory non-communicable disease disclaimer required when sugar content exceeds threshold.",
      "FSSA Act 2006: Mandatory display of valid FSSAI license citation on consumer packaging and marketing assets.",
    ],
  },
  CA_CFIA: {
    id: "CA_CFIA",
    name: "Canada",
    shortLabel: "Health Canada",
    flag: "🇨🇦",
    regulatoryBody: "Health Canada & Canadian Food Inspection Agency (CFIA)",
    governingLaw: "Food and Drugs Act (R.S.C., 1985, c. F-27) & FDR Regulations",
    primaryRules: [
      "FDR B.01.350: Front-of-Package (FOP) nutrition symbol required if food exceeds 15% DV of sugars, sodium, or sat fat.",
      "FDR B.01.503: Protein rating system (protein efficiency ratio × protein content) required for quantitative protein claims.",
      "FDR B.01.603: Standardized nutrient function claim wording required without hyperbolic marketing modifications.",
      "Official Languages Act: Mandatory bilingual English/French disclosure equivalence for all statutory packaging statements.",
    ],
  },
};

export interface RegionEvaluationResult {
  region: RegulatoryRegion;
  passed: boolean;
  score: number;
  statutoryCitations: string[];
  regionalAlerts: {
    ruleCitation: string;
    description: string;
    severity: "HIGH" | "MEDIUM" | "INFO";
  }[];
}

/**
 * Evaluates draft copy against region-specific statutory thresholds.
 */
export function evaluateRegionalCompliance(
  text: string,
  region: RegulatoryRegion = "US_FDA"
): RegionEvaluationResult {
  const meta = REGULATORY_REGIONS[region];
  const lower = text.toLowerCase();
  const alerts: RegionEvaluationResult["regionalAlerts"] = [];

  // 1. Protein claim statutory verification
  const proteinMatch = text.match(/(\d+)\s*g(?:rams?)?\s*(?:of\s*)?protein/i);
  const mentionsProteinClaim = lower.includes("source of protein") || lower.includes("packed with protein") || lower.includes("high protein");

  if (proteinMatch) {
    const declaredGrams = parseInt(proteinMatch[1], 10);
    if (region === "US_FDA" && declaredGrams > 11 && !lower.includes("11g")) {
      alerts.push({
        ruleCitation: "21 CFR 101.54(b)",
        description: `FDA standard: Declared ${declaredGrams}g exceeds approved 11g formulation spec. Falsified nutrient declaration violates 21 U.S.C. 343(r).`,
        severity: "HIGH",
      });
    } else if (region === "EU_EFSA") {
      alerts.push({
        ruleCitation: "Regulation (EC) 1924/2006 Art. 8",
        description: `EFSA standard: 'Source of protein' requires verification that ≥12% energy is from protein. Approved 11g/100g qualifies.`,
        severity: "INFO",
      });
    }
  }

  // 2. Sugar-Free / Diabetes Claims
  if (lower.includes("sugar-free") || lower.includes("sugar free") || lower.includes("zero sugar")) {
    alerts.push({
      ruleCitation: region === "EU_EFSA" ? "Regulation (EC) 1924/2006 Annex" : region === "US_FDA" ? "21 CFR 101.60(c)" : "FSSA 2018 Reg. 4",
      description: `${meta.shortLabel} standard: Sugar-free claim strictly prohibited for products with >0.5g sugar. Verified database formulation contains 6g added sugar.`,
      severity: "HIGH",
    });
  }

  if (lower.includes("diabetes") || lower.includes("diabetic") || lower.includes("cure")) {
    alerts.push({
      ruleCitation: region === "US_FDA" ? "FD&C Act § 403(r)" : region === "EU_EFSA" ? "EC 1924/2006 Art. 14" : "FSSAI Section 24",
      description: `${meta.shortLabel} statutory prohibition: Therapeutic, disease prevention, or diabetic treatment claims require pharmaceutical drug registration.`,
      severity: "HIGH",
    });
  }

  // 3. Mandatory Disclosures
  const hasBalancedDietDisclosure = lower.includes("not a substitute for a balanced diet") || lower.includes("balanced diet");
  if (!hasBalancedDietDisclosure) {
    alerts.push({
      ruleCitation: region === "IN_FSSAI" ? "FSSA 2018 Reg. 7(2)" : region === "US_FDA" ? "FTC 16 CFR § 255" : "EC 1924/2006 Art. 10",
      description: `${meta.shortLabel} disclosure standard: Required statutory disclaimer missing: 'This product is not a substitute for a balanced diet.'`,
      severity: "MEDIUM",
    });
  }

  // Calculate score
  const highAlerts = alerts.filter((a) => a.severity === "HIGH").length;
  const medAlerts = alerts.filter((a) => a.severity === "MEDIUM").length;
  const score = Math.max(0, 100 - highAlerts * 35 - medAlerts * 15);

  return {
    region,
    passed: highAlerts === 0,
    score,
    statutoryCitations: meta.primaryRules,
    regionalAlerts: alerts,
  };
}
