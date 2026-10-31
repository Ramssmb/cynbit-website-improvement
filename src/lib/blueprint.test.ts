import { describe, expect, it } from "vitest";
import { buildBlueprint, estimateWeeks, splitPhases, type ScopeInput } from "./blueprint";
import { scoreLead } from "./lead";
import { inquirySchema } from "./schema";

const base: ScopeInput = {
  service: "ai-automation",
  stage: "new",
  features: ["support-agent"],
  scale: "growth",
  timeline: "1-3m",
  budget: "2-5l",
};

describe("estimateWeeks", () => {
  it("returns zero for no modules", () => {
    expect(estimateWeeks([], 1)).toEqual({ min: 0, max: 0 });
  });

  it("adds fixed overhead to a single module", () => {
    expect(estimateWeeks([[3, 5]], 1)).toEqual({ min: 5, max: 7 });
  });

  it("overlaps additional modules instead of summing them", () => {
    const two = estimateWeeks([[3, 5], [3, 5]], 1);
    expect(two.max).toBeLessThan(5 + 5 + 2);
    expect(two.max).toBeGreaterThan(7);
  });

  it("never returns max below min", () => {
    const w = estimateWeeks([[1, 1]], 0.5);
    expect(w.max).toBeGreaterThanOrEqual(w.min);
  });
});

describe("splitPhases", () => {
  it("maps onto Cynbit's six lifecycle stages", () => {
    const phases = splitPhases(20);
    expect(phases).toHaveLength(6);
    expect(phases[3]).toEqual({ name: "Technical implementation", weeks: 9 });
  });
});

describe("buildBlueprint", () => {
  it("builds a starter-tier plan for one small module", () => {
    const bp = buildBlueprint(base);
    expect(bp.serviceName).toBe("AI Automation");
    expect(bp.modules).toEqual(["Customer support agent"]);
    expect(bp.stack).toContain("Pinecone");
    expect(bp.tier.label).toBe("Starter");
    expect(bp.timelineFit).toBe("aligned");
    expect(bp.budgetFit).toBe("aligned");
  });

  it("flags timeline and budget risk for a large scope on a small budget", () => {
    const bp = buildBlueprint({
      ...base,
      service: "software",
      features: ["web-app", "mobile-app", "admin-dashboard", "payments"],
      scale: "enterprise",
      timeline: "asap",
      budget: "under-2l",
    });
    expect(bp.tier.label).toBe("Enterprise");
    expect(bp.timelineFit).toBe("risk");
    expect(bp.budgetFit).toBe("risk");
    expect(bp.recommendations[0]).toMatch(/MVP/);
  });

  it("adds migration overhead and an audit recommendation", () => {
    const cloud: ScopeInput = { ...base, service: "cloud", features: ["legacy-migration"] };
    const fresh = buildBlueprint(cloud);
    const migrate = buildBlueprint({ ...cloud, stage: "migrate" });
    expect(migrate.weeks.max).toBeGreaterThan(fresh.weeks.max);
    expect(migrate.recommendations.join(" ")).toMatch(/audit/);
  });

  it("lists each stack item once when modules share it", () => {
    const bp = buildBlueprint({ ...base, features: ["support-agent", "knowledge-base"] });
    expect(bp.stack.filter((s) => s === "Pinecone")).toHaveLength(1);
  });

  it("ignores modules from other services", () => {
    const bp = buildBlueprint({ ...base, features: ["support-agent", "web-app"] });
    expect(bp.modules).toEqual(["Customer support agent"]);
  });

  it("rejects an unknown service", () => {
    expect(() => buildBlueprint({ ...base, service: "nope" as ScopeInput["service"] })).toThrow();
  });
});

describe("scoreLead", () => {
  it("ranks a well-funded, near-term lead as hot", () => {
    const scope: ScopeInput = { ...base, budget: "5-15l", features: ["support-agent", "voice-agent"] };
    const lead = scoreLead(scope, buildBlueprint(scope), { company: "Acme", notes: "x".repeat(50) });
    expect(lead.priority).toBe("hot");
  });

  it("ranks an unfunded, open-ended lead as cold", () => {
    const scope: ScopeInput = {
      ...base,
      service: "software",
      features: ["web-app", "mobile-app"],
      scale: "enterprise",
      timeline: "flexible",
      budget: "under-2l",
    };
    expect(scoreLead(scope, buildBlueprint(scope), {}).priority).toBe("cold");
  });
});

describe("inquirySchema", () => {
  const contact = { name: "Asha Verma", email: "asha@example.com" };

  it("accepts a valid inquiry", () => {
    expect(inquirySchema.safeParse({ scope: base, contact }).success).toBe(true);
  });

  it("rejects modules that do not belong to the chosen service", () => {
    const r = inquirySchema.safeParse({ scope: { ...base, features: ["web-app"] }, contact });
    expect(r.success).toBe(false);
  });

  it("rejects an empty module list and a bad email", () => {
    const r = inquirySchema.safeParse({ scope: { ...base, features: [] }, contact: { ...contact, email: "x" } });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues).toHaveLength(2);
  });

  it("rejects a filled honeypot", () => {
    expect(inquirySchema.safeParse({ scope: base, contact, website: "spam.com" }).success).toBe(false);
  });
});
