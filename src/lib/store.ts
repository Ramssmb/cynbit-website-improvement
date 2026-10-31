import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Blueprint, ScopeInput } from "./blueprint";
import type { LeadScore } from "./lead";

export interface Lead {
  id: string;
  createdAt: string;
  contact: { name: string; email: string; company: string; industry: string; notes: string };
  scope: ScopeInput;
  blueprint: Blueprint;
  lead: LeadScore;
}

// Serverless hosts only allow writes under the OS temp dir, so storage there is
// per-instance and ephemeral. Set WEBHOOK_URL to forward every lead to a durable
// destination (CRM, Slack, Zapier); swap this module for a database in production.
function dataFile() {
  const dir = process.env.DATA_DIR ?? (process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), ".data"));
  return path.join(dir, "leads.jsonl");
}

export async function saveLead(lead: Lead): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
  await forward(lead);
}

export async function listLeads(): Promise<Lead[]> {
  let text: string;
  try {
    text = await fs.readFile(dataFile(), "utf8");
  } catch {
    return [];
  }
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Lead)
    .sort((a, b) => b.lead.score - a.lead.score || b.createdAt.localeCompare(a.createdAt));
}

async function forward(lead: Lead) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // The lead is already stored; a webhook outage must not fail the visitor's submission.
    console.error("Lead webhook failed", err);
  }
}
