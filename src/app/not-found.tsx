import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand">404</p>
      <h1 className="font-display mt-4 text-2xl font-extrabold">This page isn&apos;t in the blueprint.</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:opacity-90">
        Plan a project →
      </Link>
    </main>
  );
}
