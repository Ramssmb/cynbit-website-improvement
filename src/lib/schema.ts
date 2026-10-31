import { z } from "zod";
import { BUDGETS, SCALES, SERVICE_IDS, STAGES, TIMELINES, getService } from "./catalog";

const ids = <T extends readonly { id: string }[]>(xs: T) =>
  xs.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];

export const scopeSchema = z
  .object({
    service: z.enum(SERVICE_IDS),
    stage: z.enum(ids(STAGES)),
    features: z.array(z.string()).min(1, "Choose at least one module").max(10),
    scale: z.enum(ids(SCALES)),
    timeline: z.enum(ids(TIMELINES)),
    budget: z.enum(ids(BUDGETS)),
  })
  .superRefine((v, ctx) => {
    const valid = new Set(getService(v.service)?.features.map((f) => f.id));
    v.features.forEach((f, i) => {
      if (!valid.has(f)) {
        ctx.addIssue({ code: "custom", path: ["features", i], message: `Unknown module: ${f}` });
      }
    });
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(120),
  company: z.string().trim().max(100).optional().default(""),
  industry: z.string().trim().max(60).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const inquirySchema = z.object({
  scope: scopeSchema,
  contact: contactSchema,
  // Honeypot: real users never see or fill this field.
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
