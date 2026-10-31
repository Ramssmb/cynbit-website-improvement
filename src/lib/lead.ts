import type { Blueprint, ScopeInput } from "./blueprint";

export type Priority = "hot" | "warm" | "cold";

export interface LeadScore {
  score: number;
  priority: Priority;
  reasons: string[];
}

const BUDGET_POINTS: Record<ScopeInput["budget"], number> = {
  "under-2l": 5,
  "2-5l": 15,
  "5-15l": 25,
  "15l-plus": 30,
  unsure: 8,
};

const TIMELINE_POINTS: Record<ScopeInput["timeline"], number> = {
  asap: 20,
  "1-3m": 20,
  "3-6m": 12,
  flexible: 5,
};

/** Scores a lead 0–100 so the sales team can work the most promising ones first. */
export function scoreLead(
  scope: ScopeInput,
  blueprint: Blueprint,
  contact: { company?: string; notes?: string },
): LeadScore {
  const reasons: string[] = [];
  let score = BUDGET_POINTS[scope.budget] + TIMELINE_POINTS[scope.timeline];
  reasons.push(`Budget band ${scope.budget}`, `Timeline ${scope.timeline}`);

  score += blueprint.tier.level * 10;
  if (blueprint.tier.level > 0) reasons.push(`${blueprint.tier.label}-tier scope`);

  if (blueprint.budgetFit === "aligned") {
    score += 15;
    reasons.push("Budget matches scope");
  } else if (blueprint.budgetFit === "risk") {
    score -= 10;
    reasons.push("Budget well below scope");
  }

  if (contact.company) {
    score += 5;
    reasons.push("Company named");
  }
  if ((contact.notes ?? "").length >= 40) {
    score += 5;
    reasons.push("Detailed brief");
  }

  score = Math.max(0, Math.min(100, score));
  const priority: Priority = score >= 60 ? "hot" : score >= 35 ? "warm" : "cold";
  return { score, priority, reasons };
}
