// Static scoping catalog. Service names and modules mirror cynbit.in/services;
// effort ranges are indicative placeholders that Cynbit's team would calibrate.

export const SERVICE_IDS = ["ai-automation", "software", "cloud", "marketing"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export interface Feature {
  id: string;
  label: string;
  hint: string;
  /** Indicative build effort in weeks for a "growth" scale project. */
  weeks: [min: number, max: number];
  stack: string[];
}

export interface Service {
  id: ServiceId;
  name: string;
  tagline: string;
  icon: string;
  baseStack: string[];
  features: Feature[];
}

export const SERVICES: Service[] = [
  {
    id: "ai-automation",
    name: "AI Automation",
    tagline: "Autonomous agents, LLM workflows and voice AI",
    icon: "◆",
    baseStack: ["Python", "FastAPI", "OpenAI", "LangChain"],
    features: [
      { id: "support-agent", label: "Customer support agent", hint: "Answers queries on web or WhatsApp", weeks: [3, 5], stack: ["Pinecone"] },
      { id: "lead-agent", label: "Lead qualification agent", hint: "Captures, scores and routes leads", weeks: [3, 5], stack: ["PostgreSQL"] },
      { id: "doc-processing", label: "Document & data-entry automation", hint: "Extracts data from invoices, forms, PDFs", weeks: [4, 6], stack: ["PostgreSQL"] },
      { id: "voice-agent", label: "AI voice agent", hint: "Inbound/outbound calls with natural speech", weeks: [5, 8], stack: ["Redis"] },
      { id: "knowledge-base", label: "Internal knowledge assistant (RAG)", hint: "Chat over your docs and SOPs", weeks: [4, 6], stack: ["Pinecone"] },
      { id: "stack-integration", label: "AI inside your existing tools", hint: "CRM, ERP or SaaS integrations", weeks: [2, 4], stack: [] },
    ],
  },
  {
    id: "software",
    name: "Software Development",
    tagline: "Web & mobile platforms, dashboards, SaaS",
    icon: "▲",
    baseStack: ["TypeScript", "Next.js", "NestJS", "PostgreSQL"],
    features: [
      { id: "web-app", label: "Customer-facing web app", hint: "Responsive web platform or portal", weeks: [6, 10], stack: ["Tailwind"] },
      { id: "mobile-app", label: "Mobile app (iOS & Android)", hint: "Cross-platform React Native app", weeks: [8, 12], stack: ["React Native"] },
      { id: "admin-dashboard", label: "Admin / analytics dashboard", hint: "Internal operations and reporting", weeks: [3, 5], stack: ["React"] },
      { id: "auth-roles", label: "Accounts, roles & permissions", hint: "Login, teams, access control", weeks: [2, 3], stack: ["Prisma"] },
      { id: "payments", label: "Payments & subscriptions", hint: "Razorpay / Stripe billing", weeks: [2, 3], stack: [] },
      { id: "integrations", label: "Third-party APIs & integrations", hint: "Connect existing systems", weeks: [2, 4], stack: ["Redis"] },
    ],
  },
  {
    id: "cloud",
    name: "Cloud Infrastructure",
    tagline: "AWS & Azure, DevOps and legacy migration",
    icon: "●",
    baseStack: ["AWS", "Terraform", "Docker", "CI/CD"],
    features: [
      { id: "cloud-setup", label: "Cloud foundation setup", hint: "Accounts, networking, environments", weeks: [2, 4], stack: [] },
      { id: "cicd", label: "CI/CD pipelines", hint: "Automated test & deploy", weeks: [1, 3], stack: ["GitHub Actions"] },
      { id: "containers", label: "Containers & Kubernetes", hint: "Scalable, self-healing workloads", weeks: [3, 5], stack: ["Kubernetes"] },
      { id: "legacy-migration", label: "Legacy system migration", hint: "Monolith to modern cloud", weeks: [6, 12], stack: ["PostgreSQL"] },
      { id: "security", label: "Zero-trust security hardening", hint: "IAM, secrets, audits", weeks: [2, 4], stack: [] },
      { id: "monitoring", label: "Monitoring & alerting", hint: "Dashboards, logs, on-call alerts", weeks: [1, 2], stack: ["Grafana"] },
    ],
  },
  {
    id: "marketing",
    name: "Digital Marketing & SEO",
    tagline: "Technical SEO, performance ads, CRM automation",
    icon: "■",
    baseStack: ["Google Analytics 4", "Search Console"],
    features: [
      { id: "tech-seo", label: "Technical SEO overhaul", hint: "Speed, indexing, structured data", weeks: [2, 3], stack: ["Next.js"] },
      { id: "ads", label: "Performance ads (Google & Meta)", hint: "Campaign setup and first optimisation cycle", weeks: [3, 4], stack: ["Google Ads", "Meta Ads"] },
      { id: "crm-automation", label: "CRM & lead nurturing automation", hint: "Email/WhatsApp journeys", weeks: [3, 5], stack: ["HubSpot"] },
      { id: "landing-pages", label: "High-conversion landing pages", hint: "Funnel pages with A/B testing", weeks: [2, 4], stack: ["Next.js"] },
      { id: "analytics", label: "Analytics & attribution", hint: "Know which channel drives revenue", weeks: [1, 2], stack: ["Looker Studio"] },
    ],
  },
];

export const STAGES = [
  { id: "new", label: "Building something new", hint: "Idea or early product" },
  { id: "improve", label: "Improving what exists", hint: "Add features, fix pain points" },
  { id: "migrate", label: "Modernising / migrating", hint: "Replace or move a legacy system" },
] as const;

export const SCALES = [
  { id: "mvp", label: "MVP / pilot", hint: "Prove it works with real users", factor: 0.75 },
  { id: "growth", label: "Growing business", hint: "Production-ready for thousands of users", factor: 1 },
  { id: "enterprise", label: "Enterprise", hint: "High scale, compliance, SLAs", factor: 1.4 },
] as const;

export const TIMELINES = [
  { id: "asap", label: "ASAP (under 1 month)", maxWeeks: 4 },
  { id: "1-3m", label: "1–3 months", maxWeeks: 13 },
  { id: "3-6m", label: "3–6 months", maxWeeks: 26 },
  { id: "flexible", label: "Flexible", maxWeeks: Infinity },
] as const;

// Budget bands in INR (Cynbit is Jaipur-based). `tierCeiling` is the largest
// complexity tier the band comfortably covers: 0 starter, 1 growth, 2 enterprise.
export const BUDGETS = [
  { id: "under-2l", label: "Under ₹2 L", tierCeiling: 0 },
  { id: "2-5l", label: "₹2 L – ₹5 L", tierCeiling: 1 },
  { id: "5-15l", label: "₹5 L – ₹15 L", tierCeiling: 2 },
  { id: "15l-plus", label: "₹15 L +", tierCeiling: 2 },
  { id: "unsure", label: "Not sure yet", tierCeiling: -1 },
] as const;

export type StageId = (typeof STAGES)[number]["id"];
export type ScaleId = (typeof SCALES)[number]["id"];
export type TimelineId = (typeof TIMELINES)[number]["id"];
export type BudgetId = (typeof BUDGETS)[number]["id"];

// Cynbit's published "Architectural lifecycle", with the share of total effort each takes.
export const LIFECYCLE = [
  { name: "Discovery & audit", share: 0.1 },
  { name: "Strategy & blueprinting", share: 0.1 },
  { name: "High-fidelity design", share: 0.15 },
  { name: "Technical implementation", share: 0.45 },
  { name: "Quality & integrity check", share: 0.12 },
  { name: "Deployment & evolution", share: 0.08 },
] as const;

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
