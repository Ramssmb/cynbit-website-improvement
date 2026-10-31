"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildBlueprint, type Blueprint, type ScopeInput } from "@/lib/blueprint";
import { BUDGETS, SCALES, SERVICES, SERVICE_IDS, STAGES, TIMELINES, getService, type ServiceId } from "@/lib/catalog";
import { BlueprintPreview } from "./BlueprintPreview";

type Draft = Omit<ScopeInput, "service"> & { service: ServiceId | null };
type Contact = { name: string; email: string; company: string; industry: string; notes: string };

const STEPS = ["Service", "Scope", "Constraints", "Contact"] as const;

const INITIAL: Draft = {
  service: null,
  stage: "new",
  features: [],
  scale: "growth",
  timeline: "1-3m",
  budget: "unsure",
};

export function BlueprintWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(INITIAL);
  const [contact, setContact] = useState<Contact>({ name: "", email: "", company: "", industry: "", notes: "" });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [result, setResult] = useState<{ id: string; blueprint: Blueprint } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Deep links such as /?service=cloud let each "Inquire" button on the
  // services page open the builder with the right service already chosen.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("service");
    if (s && (SERVICE_IDS as readonly string[]).includes(s)) {
      setDraft((d) => ({ ...d, service: s as ServiceId }));
      setStep(1);
    }
  }, []);

  const blueprint = useMemo(
    () => (draft.service ? buildBlueprint({ ...draft, service: draft.service }) : null),
    [draft],
  );
  const service = draft.service ? getService(draft.service) : undefined;

  function go(next: number) {
    setErrors({});
    setStep(next);
    headingRef.current?.focus();
  }

  function stepError(): string | null {
    if (step === 0 && !draft.service) return "Choose the service closest to your project.";
    if (step === 1 && draft.features.length === 0) return "Choose at least one module.";
    return null;
  }

  function next() {
    const err = stepError();
    if (err) return setErrors({ step: err });
    go(step + 1);
  }

  function toggleFeature(id: string) {
    setDraft((d) => ({
      ...d,
      features: d.features.includes(id) ? d.features.filter((f) => f !== id) : [...d.features, id],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.service) return go(0);
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope: { ...draft, service: draft.service }, contact, website: honeypot }),
      });
      const json = await res.json();
      if (res.status === 422) {
        const fieldErrors: Record<string, string> = {};
        for (const i of json.issues as { path: string; message: string }[]) {
          fieldErrors[i.path.replace(/^contact\./, "")] ??= i.message;
        }
        setErrors(fieldErrors);
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setResult(json);
      setStatus("idle");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong" });
      setStatus("error");
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="no-print rounded-3xl border border-line bg-surface p-6 text-center sm:p-8">
          <p className="text-xs font-bold tracking-widest text-ok uppercase">Blueprint received</p>
          <h2 className="font-display mt-2 text-2xl font-extrabold sm:text-3xl">Thanks, {contact.name.split(" ")[0]}.</h2>
          <p className="mt-2 text-muted">
            Your reference is <strong className="text-foreground">{result.id}</strong>. An architect will review your
            blueprint and reply to <strong className="text-foreground">{contact.email}</strong> within 24 hours.
          </p>
          <button
            onClick={() => window.print()}
            className="mt-5 rounded-full border border-brand px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
          >
            Save blueprint as PDF
          </button>
        </div>
        <div className="mt-6">
          <BlueprintPreview blueprint={result.blueprint} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
        <Progress step={step} onJump={(i) => i < step && go(i)} />

        <h2 ref={headingRef} tabIndex={-1} className="font-display mt-6 text-2xl font-extrabold outline-none">
          {["What do you want to build?", "What should it include?", "What are your constraints?", "Where should we send your blueprint?"][step]}
        </h2>

        {step === 0 && (
          <fieldset className="mt-5">
            <legend className="sr-only">Service</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <Choice
                  key={s.id}
                  type="radio"
                  name="service"
                  checked={draft.service === s.id}
                  onChange={() => setDraft((d) => ({ ...d, service: s.id, features: d.service === s.id ? d.features : [] }))}
                  title={`${s.icon}  ${s.name}`}
                  hint={s.tagline}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && service && (
          <>
            <fieldset className="mt-5">
              <legend className="text-sm font-bold">Where are you starting from?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {STAGES.map((s) => (
                  <Choice key={s.id} type="radio" name="stage" checked={draft.stage === s.id} onChange={() => setDraft((d) => ({ ...d, stage: s.id }))} title={s.label} hint={s.hint} />
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-sm font-bold">
                {service.name} modules <span className="font-normal text-muted">— choose all that apply</span>
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {service.features.map((f) => (
                  <Choice key={f.id} type="checkbox" name="features" checked={draft.features.includes(f.id)} onChange={() => toggleFeature(f.id)} title={f.label} hint={f.hint} />
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset className="mt-5">
              <legend className="text-sm font-bold">Scale</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {SCALES.map((s) => (
                  <Choice key={s.id} type="radio" name="scale" checked={draft.scale === s.id} onChange={() => setDraft((d) => ({ ...d, scale: s.id }))} title={s.label} hint={s.hint} />
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Ideal launch window</legend>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TIMELINES.map((t) => (
                  <Choice key={t.id} type="radio" name="timeline" checked={draft.timeline === t.id} onChange={() => setDraft((d) => ({ ...d, timeline: t.id }))} title={t.label} compact />
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Budget range</legend>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BUDGETS.map((b) => (
                  <Choice key={b.id} type="radio" name="budget" checked={draft.budget === b.id} onChange={() => setDraft((d) => ({ ...d, budget: b.id }))} title={b.label} compact />
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 3 && (
          <form id="contact-form" onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" value={contact.name} error={errors.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} autoComplete="name" required />
            <Field label="Work email" name="email" type="email" value={contact.email} error={errors.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} autoComplete="email" required />
            <Field label="Company" name="company" value={contact.company} onChange={(v) => setContact((c) => ({ ...c, company: v }))} autoComplete="organization" />
            <Field label="Industry" name="industry" value={contact.industry} onChange={(v) => setContact((c) => ({ ...c, industry: v }))} />
            <div className="sm:col-span-2">
              <Field label="Anything else we should know?" name="notes" value={contact.notes} onChange={(v) => setContact((c) => ({ ...c, notes: v }))} multiline />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label>
                Website <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>
          </form>
        )}

        {(errors.step || errors.form) && (
          <p role="alert" className="mt-4 rounded-xl bg-risk/10 px-4 py-2 text-sm font-semibold text-risk">
            {errors.step || errors.form}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            className={`rounded-full px-4 py-2.5 text-sm font-bold text-muted hover:text-foreground ${step === 0 ? "invisible" : ""}`}
          >
            ← Back
          </button>
          {/* Distinct keys: reusing one DOM button and flipping it to type="submit"
              mid-click would submit the contact form the moment it appears. */}
          {step < 3 ? (
            <button key="continue" type="button" onClick={next} className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90">
              Continue →
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              form="contact-form"
              disabled={status === "sending"}
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send my blueprint"}
            </button>
          )}
        </div>
      </div>

      <aside id="blueprint" className="scroll-mt-4 lg:sticky lg:top-6">
        <BlueprintPreview blueprint={blueprint} />
      </aside>

      {/* On phones the preview sits below the wizard, so keep the headline estimate in view. */}
      {blueprint && blueprint.modules.length > 0 && (
        <a
          href="#blueprint"
          className="no-print fixed inset-x-3 bottom-3 z-10 flex items-center justify-between rounded-full bg-foreground px-5 py-3 text-sm text-white shadow-lg lg:hidden"
        >
          <span>
            <strong>{blueprint.weeks.min}–{blueprint.weeks.max} weeks</strong> · {blueprint.tier.label} tier
          </span>
          <span className="font-bold">View plan ↓</span>
        </a>
      )}
    </div>
  );
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex gap-2" aria-label="Progress">
      {STEPS.map((label, i) => (
        <li key={label} className="flex-1">
          <button
            type="button"
            onClick={() => onJump(i)}
            disabled={i >= step}
            aria-current={i === step ? "step" : undefined}
            className="w-full text-left disabled:cursor-default"
          >
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`} />
            <span className={`mt-1.5 block text-xs font-bold ${i === step ? "text-brand" : "text-muted"}`}>
              {i + 1}. {label}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function Choice(props: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <label
      className={`relative block cursor-pointer rounded-2xl border-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
        props.checked ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40"
      } ${props.compact ? "px-3 py-2.5" : "p-4"}`}
    >
      <input type={props.type} name={props.name} checked={props.checked} onChange={props.onChange} className="sr-only" />
      <span className={`block pr-6 font-bold ${props.compact ? "text-sm" : ""}`}>{props.title}</span>
      {props.hint && <span className="mt-0.5 block text-sm text-muted">{props.hint}</span>}
      {props.checked && (
        <span aria-hidden className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] text-white">
          ✓
        </span>
      )}
    </label>
  );
}

function Field(props: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const id = `field-${props.name}`;
  const common = {
    id,
    name: props.name,
    value: props.value,
    autoComplete: props.autoComplete,
    "aria-invalid": !!props.error,
    "aria-describedby": props.error ? `${id}-error` : undefined,
    className: `mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${
      props.error ? "border-risk" : "border-line"
    }`,
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {props.label} {props.required ? <span className="text-risk">*</span> : <span className="font-normal text-muted">(optional)</span>}
      </label>
      {props.multiline ? (
        <textarea {...common} rows={4} onChange={(e) => props.onChange(e.target.value)} />
      ) : (
        <input {...common} type={props.type ?? "text"} onChange={(e) => props.onChange(e.target.value)} />
      )}
      {props.error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-risk">
          {props.error}
        </p>
      )}
    </div>
  );
}
