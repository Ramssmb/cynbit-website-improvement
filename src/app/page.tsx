import { BlueprintWizard } from "@/components/BlueprintWizard";

export default function Home() {
  return (
    <>
      <div className="no-print bg-foreground px-4 py-2 text-center text-xs text-white/80">
        Unofficial prototype built for the Cynbit Technologies internship task — not affiliated with or operated by Cynbit.
      </div>
      <header className="no-print border-b border-line bg-surface/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-extrabold tracking-tight">
            Cynbit <span className="text-brand">Blueprint</span>
          </span>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Prototype</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pb-16">
        <section className="no-print max-w-3xl">
          <p className="text-xs font-bold tracking-widest text-brand uppercase">Start discovery</p>
          <h1 className="font-display mt-3 text-4xl leading-tight font-extrabold sm:text-5xl">
            Plan your project in two minutes.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Answer four quick questions and watch your blueprint take shape — phases, timeline, stack and an honest fit
            check against your budget. Then send it to our architects in one click.
          </p>
        </section>

        <div className="mt-10">
          <BlueprintWizard />
        </div>
      </main>
    </>
  );
}
