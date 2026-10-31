import {
  BUDGETS,
  LIFECYCLE,
  SCALES,
  TIMELINES,
  getService,
  type BudgetId,
  type ScaleId,
  type ServiceId,
  type StageId,
  type TimelineId,
} from "./catalog";

export interface ScopeInput {
  service: ServiceId;
  stage: StageId;
  features: string[];
  scale: ScaleId;
  timeline: TimelineId;
  budget: BudgetId;
}

export type Fit = "aligned" | "stretch" | "risk" | "unknown";

export interface Blueprint {
  serviceName: string;
  modules: string[];
  stack: string[];
  weeks: { min: number; max: number };
  phases: { name: string; weeks: number }[];
  tier: { level: 0 | 1 | 2; label: string };
  timelineFit: Fit;
  budgetFit: Fit;
  recommendations: string[];
}

const TIER_LABELS = ["Starter", "Growth", "Enterprise"] as const;

// Modules built by one team overlap; each extra module adds less calendar time.
const PARALLEL_OVERLAP = 0.7;
const MIGRATION_OVERHEAD = 1.15;

export function buildBlueprint(input: ScopeInput): Blueprint {
  const service = getService(input.service);
  if (!service) throw new Error(`Unknown service: ${input.service}`);

  const chosen = service.features.filter((f) => input.features.includes(f.id));
  const scale = SCALES.find((s) => s.id === input.scale) ?? SCALES[1];
  const stageFactor = input.stage === "migrate" ? MIGRATION_OVERHEAD : 1;

  const weeks = estimateWeeks(chosen.map((f) => f.weeks), scale.factor * stageFactor);
  const level: 0 | 1 | 2 = weeks.max <= 8 ? 0 : weeks.max <= 16 ? 1 : 2;

  const timelineFit = fitTimeline(input.timeline, weeks);
  const budgetFit = fitBudget(input.budget, level);

  return {
    serviceName: service.name,
    modules: chosen.map((f) => f.label),
    stack: unique([...service.baseStack, ...chosen.flatMap((f) => f.stack)]),
    weeks,
    phases: splitPhases(weeks.max),
    tier: { level, label: TIER_LABELS[level] },
    timelineFit,
    budgetFit,
    recommendations: recommend(input, weeks, timelineFit, budgetFit),
  };
}

export function estimateWeeks(ranges: [number, number][], factor: number) {
  if (ranges.length === 0) return { min: 0, max: 0 };
  // Largest module runs in full; the rest overlap with it.
  const sorted = [...ranges].sort((a, b) => b[1] - a[1]);
  const sum = (pick: 0 | 1) =>
    sorted.reduce((acc, r, i) => acc + r[pick] * (i === 0 ? 1 : PARALLEL_OVERLAP), 0);
  // Discovery, QA and launch add a fixed ~2 weeks on top of build.
  const min = Math.max(1, Math.round(sum(0) * factor + 2));
  const max = Math.max(min, Math.round(sum(1) * factor + 2));
  return { min, max };
}

export function splitPhases(totalWeeks: number) {
  return LIFECYCLE.map((p) => ({
    name: p.name,
    weeks: Math.max(0.5, Math.round(totalWeeks * p.share * 2) / 2),
  }));
}

function fitTimeline(id: TimelineId, weeks: { min: number; max: number }): Fit {
  const cap = TIMELINES.find((t) => t.id === id)?.maxWeeks ?? Infinity;
  if (weeks.max <= cap) return "aligned";
  if (weeks.min <= cap) return "stretch";
  return "risk";
}

function fitBudget(id: BudgetId, level: number): Fit {
  const ceiling = BUDGETS.find((b) => b.id === id)?.tierCeiling ?? -1;
  if (ceiling < 0) return "unknown";
  if (level <= ceiling) return "aligned";
  if (level === ceiling + 1) return "stretch";
  return "risk";
}

function recommend(
  input: ScopeInput,
  weeks: { min: number; max: number },
  timelineFit: Fit,
  budgetFit: Fit,
): string[] {
  const out: string[] = [];
  if (input.features.length === 0) {
    out.push("Pick at least one module so we can size the project.");
    return out;
  }
  if (timelineFit === "risk" || budgetFit === "risk") {
    out.push("Start with a focused MVP phase covering your highest-impact module, then expand.");
  } else if (timelineFit === "stretch") {
    out.push("Your timeline is achievable if scope is locked early — we'd prioritise must-haves in discovery.");
  }
  if (budgetFit === "stretch") {
    out.push("Budget is slightly below typical scope for this tier; a phased rollout keeps cost predictable.");
  }
  if (budgetFit === "unknown") {
    out.push("We'll share a costed estimate after the discovery call.");
  }
  if (input.stage === "migrate") {
    out.push("Migration projects begin with a technical-debt audit to de-risk cut-over.");
  }
  if (input.scale === "enterprise") {
    out.push("Plan for security review and SLA definitions during strategy & blueprinting.");
  }
  if (input.features.length >= 4 && weeks.max > 14) {
    out.push("Splitting delivery into two releases gets value to users sooner.");
  }
  if (out.length === 0) {
    out.push("Scope, timeline and budget look well aligned — you're ready for a discovery call.");
  }
  return out;
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
