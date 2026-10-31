import { BlueprintWizard } from "@/components/BlueprintWizard";
import { REPO_URL } from "@/components/SiteChrome";

const COMPARISON = [
  {
    topic: "What the visitor gets",
    before: "A blank form, then a reply within 24 hours",
    after: "An instant plan: phases, weeks, stack and advice",
  },
  {
    topic: "What sales receives",
    before: "Contact details, a service line and a free-text brief",
    after: "Service, modules, scale, timeline and budget",
  },
  {
    topic: "Prioritisation",
    before: "Read every message to judge fit",
    after: "Leads arrive scored hot, warm or cold with reasons",
  },
  {
    topic: "Blank-page problem",
    before: "“Your message” is required and empty",
    after: "Guided choices; the message is optional",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pb-16">
      <section className="no-print max-w-3xl">
        <p className="text-xs font-bold tracking-widest text-brand uppercase">Start discovery</p>
        <h1 className="font-display mt-3 text-4xl leading-tight font-extrabold sm:text-5xl">
          Plan your project in <span className="text-brand">two minutes.</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Answer four quick questions and watch your blueprint take shape — phases, timeline, stack and an honest fit
          check against your budget. Then send it to our architects in one click.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-muted">
          {["No sign-up", "Instant estimate", "Free to download", "Reply within 24 h"].map((t) => (
            <li key={t} className="rounded-full border border-line bg-surface px-3 py-1">
              ✓ {t}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <BlueprintWizard />
      </div>

      <section id="why" className="no-print mt-20 scroll-mt-6">
        <p className="text-xs font-bold tracking-widest text-brand uppercase">Why this prototype</p>
        <h2 className="font-display mt-2 text-3xl font-extrabold">From a contact form to a qualified lead.</h2>
        <p className="mt-3 max-w-3xl text-muted">
          Every &ldquo;Start discovery&rdquo; and &ldquo;Inquire&rdquo; button on cynbit.in ends at a static form that asks
          nothing about the features you need, your timeline or your budget. This builder gives visitors value before they commit and gives the
          sales team structured, ranked leads.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="hidden grid-cols-[1fr_1.3fr_1.3fr] gap-4 border-b border-line bg-background px-6 py-3 text-xs font-bold tracking-widest text-muted uppercase sm:grid">
            <span />
            <span>Today on cynbit.in</span>
            <span className="text-brand">With Blueprint Builder</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.topic}
              className="grid gap-1 border-b border-line px-6 py-4 last:border-0 sm:grid-cols-[1fr_1.3fr_1.3fr] sm:gap-4"
            >
              <span className="font-bold">{row.topic}</span>
              <span className="text-sm text-muted">
                <span className="font-semibold sm:hidden">Today: </span>
                {row.before}
              </span>
              <span className="text-sm font-semibold text-brand">
                <span className="sm:hidden">With builder: </span>
                {row.after}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["23", "automated tests covering the engine, scoring and API"],
            ["113 kB", "first-load JavaScript for the whole wizard"],
            ["0", "new infrastructure — drops into Cynbit's Next.js codebase"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-line bg-surface p-5">
              <p className="font-display text-3xl font-extrabold text-brand">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>

        <a
          href={`${REPO_URL}/blob/main/docs/TECHNICAL_REPORT.md`}
          className="mt-6 inline-block rounded-full border border-brand px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
        >
          Read the technical report →
        </a>
      </section>
    </main>
  );
}
