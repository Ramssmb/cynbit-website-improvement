import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";
import { GET, POST } from "./route";

beforeAll(() => {
  process.env.DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "cynbit-test-"));
  process.env.ADMIN_TOKEN = "test-admin-token";
});

const valid = {
  scope: {
    service: "software",
    stage: "new",
    features: ["web-app", "payments"],
    scale: "growth",
    timeline: "3-6m",
    budget: "5-15l",
  },
  contact: { name: "Asha Verma", email: "asha@example.com", company: "Acme" },
};

function post(body: unknown, ip = "10.0.0.1") {
  return POST(
    new NextRequest("http://localhost/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

function get(token?: string) {
  return GET(
    new NextRequest("http://localhost/api/inquiries", {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    }),
  );
}

describe("POST /api/inquiries", () => {
  it("stores a valid inquiry and returns a reference id with the server-built blueprint", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toMatch(/^CYN-[0-9A-F]{8}$/);
    expect(json.blueprint.modules).toEqual(["Customer-facing web app", "Payments & subscriptions"]);
  });

  it("returns field-level issues for invalid input", async () => {
    const res = await post({ ...valid, contact: { name: "A", email: "nope" } }, "10.0.0.2");
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.issues.map((i: { path: string }) => i.path)).toEqual(["contact.name", "contact.email"]);
  });

  it("rejects malformed JSON", async () => {
    expect((await post("{not json", "10.0.0.3")).status).toBe(400);
  });

  it("rate-limits a client after five submissions", async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(valid, "10.0.0.9")).status);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
    expect(statuses[5]).toBe(429);
  });
});

describe("GET /api/inquiries", () => {
  it("requires the admin token", async () => {
    expect((await get()).status).toBe(401);
    expect((await get("wrong")).status).toBe(401);
  });

  it("lists stored leads with scores, highest first", async () => {
    const res = await get("test-admin-token");
    expect(res.status).toBe(200);
    const { leads } = await res.json();
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0].lead.priority).toMatch(/hot|warm|cold/);
    expect(leads[0].contact.email).toBe("asha@example.com");
  });
});
