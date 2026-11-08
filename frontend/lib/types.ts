// Mirrors docs/CONTRACTS.md "Shared types" + shared/roadmap.schema.json.
// Change a contract => update CONTRACTS.md + schema + fixtures + both sides, and tell the team.

export type Language = "en" | "es";
export type Source = "live" | "cache" | "fallback";
export type AdvisorId = "career" | "pathway" | "cost" | "prodev" | "alternatives" | "finaid";
export type Mode = "group_chat" | "mixture";

export interface Advisor {
  id: AdvisorId;
  name: string;
  role: string;
  mdc_section: string;
  emoji: string;
  color: string;
  order: number;
  model_name: string;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface Message {
  id: string;
  role: "student" | "advisor" | "aggregator";
  advisor_id?: AdvisorId;
  contributors?: AdvisorId[];
  text: string;
  usage?: Usage;
  source?: Source;
  created_at: string;
}

// ---- Requests / responses ----
export interface ChatReplyRequest {
  advisor_id: AdvisorId;
  group: AdvisorId[];
  language: Language;
  history: Message[];
}

export interface MixtureRequest {
  advisors: AdvisorId[];
  language: Language;
  history: Message[];
}

export interface MixtureResponse {
  message: Message;
  per_agent_usage: Partial<Record<AdvisorId, Usage>>;
}

export interface RoadmapRequest {
  mode: Mode;
  language: Language;
  history: Message[];
}

export type ApiErrorCode = "not_found" | "invalid_request" | "upstream_failed" | "timeout";
export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string };
}

// ---- Roadmap (shared/roadmap.schema.json) ----
export type StepKind =
  | "mdc_program"
  | "certification"
  | "exam"
  | "internship"
  | "transfer"
  | "degree"
  | "other";

export type RouteType = "short" | "medium" | "long";

export interface Step {
  id: string; // e.g. "short-0"; used as goal.step_id
  order: number;
  kind: StepKind;
  institution: string; // first step must be Miami Dade College
  program_id?: string | null;
  credential: string;
  program_name?: string;
  duration_months: number;
  cost_usd: number;
  estimate?: boolean;
  transfer_agreement?: string | null;
  key_courses?: string[];
  source_url?: string | null;
}

export interface WorkforceEntryPoint {
  after_step: number; // 0-based index into steps
  job_title: string;
  salary_range_usd?: string;
}

export interface Credential {
  name: string;
  type?: "certification" | "license" | "degree" | "other";
  required?: boolean;
}

export interface Route {
  id: string;
  name: string;
  type: RouteType;
  summary?: string;
  total_months: number;
  total_cost_usd: number;
  steps: Step[];
  workforce_entry_points?: WorkforceEntryPoint[];
  credentials?: Credential[];
  experience?: string[];
  exams?: string[];
  net_cost_after_aid_usd?: number | null;
}

export interface Career {
  title: string;
  overview: string;
  responsibilities?: string[];
  qualifications?: string[];
  median_salary_usd?: number | null;
  outlook?: string | null;
  related_careers?: string[];
}

export interface Resource {
  title: string;
  url?: string;
  kind?: "exam_prep" | "resume" | "interview" | "financial_aid" | "other";
}

export interface Roadmap {
  id?: string;
  source?: Source;
  mode?: Mode;
  language?: Language;
  career: Career;
  routes: Route[]; // 1..4
  alternative_mdc_programs?: { program_id?: string; name: string; why?: string }[];
  resources?: Resource[];
  usage?: { total_tokens?: number; total_cost_usd?: number };
  warnings?: string[];
}

// ---- Extension <-> Panel postMessage (CONTRACTS.md section A) ----
export type GuideKind = StepKind;
export interface GuideGoal {
  label: string;
  kind: GuideKind;
  url: string;
  step_id: string;
}
export type GuideStatus = "done" | "stopped" | "failed";

export type OutgoingSharkMessage =
  | { type: "shark:ready" }
  | { type: "shark:close" }
  | { type: "shark:start_guide"; goal: GuideGoal; language: Language }
  | { type: "shark:open_url"; url: string };

export type IncomingSharkMessage =
  | { type: "shark:guide_finished"; step_id: string; status: GuideStatus }
  | { type: "shark:page_context"; url: string; title: string };
