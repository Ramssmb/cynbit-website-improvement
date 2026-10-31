import Link from "next/link";

export const REPO_URL = "https://github.com/Ramssmb/cynbit-website-improvement";

export function SiteHeader() {
  return (
    <div className="no-print">
      <div className="bg-foreground px-4 py-2 text-center text-xs text-white/80">
        Unofficial prototype built for the Cynbit Technologies internship task — not affiliated with or operated by Cynbit.
      </div>
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
            Cynbit <span className="text-brand">Blueprint</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
            <Link href="/#why" className="hidden rounded-full px-3 py-1.5 text-muted hover:text-foreground sm:inline">
              Why
            </Link>
            <a href={`${REPO_URL}/blob/main/docs/TECHNICAL_REPORT.md`} className="hidden rounded-full px-3 py-1.5 text-muted hover:text-foreground sm:inline">
              Report
            </a>
            <a href={REPO_URL} className="rounded-full px-3 py-1.5 text-muted hover:text-foreground">
              GitHub
            </a>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Prototype</span>
          </nav>
        </div>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Built by <span className="font-semibold text-foreground">Maloth Bhavsingh</span> · Next.js, TypeScript, Tailwind, Zod
        </p>
        <div className="flex gap-4 font-semibold">
          <a href={REPO_URL} className="hover:text-brand">Source</a>
          <a href={`${REPO_URL}/blob/main/docs/TECHNICAL_REPORT.md`} className="hover:text-brand">Technical report</a>
          <Link href="/admin" className="hover:text-brand">Sales inbox</Link>
        </div>
      </div>
    </footer>
  );
}
