"use client";

import { useState } from "react";
import type { Lead } from "@/lib/store";

const PRIORITY_STYLE = {
  hot: "bg-risk/10 text-risk",
  warm: "bg-warn/10 text-warn",
  cold: "bg-line text-muted",
} as const;

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/inquiries", { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) {
      setLeads(null);
      return setError(res.status === 401 ? "Invalid admin token." : "Could not load leads.");
    }
    setLeads((await res.json()).leads);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-widest text-brand uppercase">Sales inbox</p>
      <h1 className="font-display mt-2 text-3xl font-extrabold">Incoming blueprints</h1>
      <p className="mt-2 text-muted">Leads arrive pre-scoped and are ranked by priority score.</p>

      <form onSubmit={load} className="mt-6 flex max-w-md gap-2">
        <label htmlFor="token" className="sr-only">Admin token</label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 outline-none focus:border-brand"
        />
        <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white">Load</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-risk">{error}</p>}

      {leads && leads.length === 0 && <p className="mt-8 text-muted">No leads yet.</p>}
      {leads && leads.length > 0 && (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {leads.map((l) => (
            <li key={l.id} className="rounded-3xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{l.contact.name}{l.contact.company && ` · ${l.contact.company}`}</p>
                  <p className="truncate text-sm text-muted">{l.contact.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${PRIORITY_STYLE[l.lead.priority]}`}>
                  {l.lead.priority} · {l.lead.score}
                </span>
              </div>
              <p className="mt-3 text-sm">
                <strong>{l.blueprint.serviceName}</strong> · {l.blueprint.tier.label} tier · {l.blueprint.weeks.min}–{l.blueprint.weeks.max} weeks
              </p>
              <p className="mt-1 text-sm text-muted">{l.blueprint.modules.join(", ")}</p>
              {l.contact.notes && <p className="mt-2 rounded-xl bg-background p-3 text-sm">{l.contact.notes}</p>}
              <p className="mt-3 text-xs text-muted">
                {l.id} · {new Date(l.createdAt).toLocaleString()} · {l.lead.reasons.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
