import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { buildBlueprint } from "@/lib/blueprint";
import { scoreLead } from "@/lib/lead";
import { rateLimit } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/schema";
import { listLeads, saveLead, type Lead } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 422 },
    );
  }

  const { scope, contact } = parsed.data;
  // Recompute server-side: never trust a blueprint or score sent by the client.
  const blueprint = buildBlueprint(scope);
  const lead: Lead = {
    id: `CYN-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    contact,
    scope,
    blueprint,
    lead: scoreLead(scope, blueprint, contact),
  };
  await saveLead(lead);

  return NextResponse.json({ id: lead.id, blueprint }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || !safeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ leads: await listLeads() });
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
