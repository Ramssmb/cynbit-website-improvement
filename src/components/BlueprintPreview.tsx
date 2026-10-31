import type { Blueprint, Fit } from "@/lib/blueprint";

const FIT_STYLE: Record<Fit, { label: string; className: string }> = {
  aligned: { label: "Aligned", className: "bg-ok/10 text-ok" },
  stretch: { label: "Stretch", className: "bg-warn/10 text-warn" },
  risk: { label: "At risk", className: "bg-risk/10 text-risk" },
  unknown: { label: "To discuss", className: "bg-line text-muted" },
};

function FitBadge({ fit }: { fit: Fit }) {
  const s = FIT_STYLE[fit];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.className}`}>{s.label}</span>;
}

export function BlueprintPreview({ blueprint }: { blueprint: Blueprint | null }) {
  if (!blueprint || blueprint.modules.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface p-6 text-sm text-muted">
        <p className="font-display text-base font-bold text-foreground">Your blueprint</p>
        <p className="mt-2">Pick a service and at least one module — your plan builds itself here as you go.</p>
      </div>
    );
  }

  const maxPhase = Math.max(...blueprint.phases.map((p) => p.weeks));

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand uppercase">Indicative blueprint</p>
          <p className="font-display mt-1 text-xl font-extrabold">{blueprint.serviceName}</p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">{blueprint.tier.label} tier</span>
      </div>

      <div className="mt-5 rounded-2xl bg-background p-4">
        <p className="text-xs font-semibold text-muted">Estimated delivery</p>
        <p className="font-display text-3xl font-extrabold">
          {blueprint.weeks.min}–{blueprint.weeks.max} <span className="text-base font-bold text-muted">weeks</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold">Timeline <FitBadge fit={blueprint.timelineFit} /></span>
          <span className="flex items-center gap-1.5 font-semibold">Budget <FitBadge fit={blueprint.budgetFit} /></span>
        </div>
      </div>

      <section className="mt-5">
        <h3 className="text-xs font-bold tracking-widest text-muted uppercase">Delivery phases</h3>
        <ol className="mt-2 space-y-2">
          {blueprint.phases.map((p, i) => (
            <li key={p.name} className="text-sm">
              <div className="flex justify-between gap-2">
                <span>
                  <span className="mr-1.5 font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                  {p.name}
                </span>
                <span className="shrink-0 tabular-nums text-muted">{p.weeks} wk</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-line">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: `${(p.weeks / maxPhase) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5">
        <h3 className="text-xs font-bold tracking-widest text-muted uppercase">Modules</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {blueprint.modules.map((m) => (
            <li key={m}>✓ {m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="text-xs font-bold tracking-widest text-muted uppercase">Suggested stack</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {blueprint.stack.map((s) => (
            <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl bg-brand-soft p-4">
        <h3 className="text-xs font-bold tracking-widest text-brand uppercase">Our recommendation</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
          {blueprint.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-xs text-muted">
        Indicative only — Cynbit&apos;s architects confirm scope, timeline and cost after the discovery call.
      </p>
    </div>
  );
}
