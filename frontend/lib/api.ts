// All backend calls. NEXT_PUBLIC_USE_MOCK=true => fixtures, no network.
import advisorsMock from "@/mock/advisors.json";
import roadmapMock from "@/mock/roadmap.json";
import type {
  Advisor,
  ApiErrorBody,
  ChatReplyRequest,
  Message,
  MixtureRequest,
  MixtureResponse,
  Roadmap,
  RoadmapRequest,
  Usage,
} from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public code: string, message: string, public status?: number) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("network", "Could not reach the server");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(body?.error.code ?? "upstream_failed", body?.error.message ?? res.statusText, res.status);
  }
  return (await res.json()) as T;
}

const fakeUsage = (): Usage => {
  const input = 300 + Math.floor(Math.random() * 400);
  const output = 80 + Math.floor(Math.random() * 160);
  return {
    input_tokens: input,
    output_tokens: output,
    total_tokens: input + output,
    cost_usd: Number(((input * 0.15 + output * 0.6) / 1_000_000).toFixed(6)),
  };
};

// Varied per advisor so the mock chat looks real.
const MOCK_LINES: Record<string, { en: string; es: string }> = {
  career: {
    en: "Based on what you shared, here are careers that fit your interests and strengths. **Tell me what you enjoy most** and I'll narrow them down.",
    es: "Según lo que compartiste, estas carreras encajan con tus intereses. **Cuéntame qué disfrutas más** y las reduzco.",
  },
  pathway: {
    en: "At MDC you could start with an **A.S. or certificate** and transfer later. I can map a short, medium and long route.",
    es: "En MDC podrías empezar con un **A.S. o certificado** y transferirte después. Puedo trazar una ruta corta, media y larga.",
  },
  cost: {
    en: "Rough costs: certificates are the cheapest, A.S. mid-range, bachelor's highest. These are **estimates** until we check MDC's tuition page.",
    es: "Costos aproximados: los certificados son los más baratos, el A.S. intermedio y el bachelor's el más alto. Son **estimados** hasta confirmar en MDC.",
  },
  prodev: {
    en: "Useful certifications and exams could boost your resume. Internships also help a lot.",
    es: "Algunas certificaciones y exámenes pueden reforzar tu currículum. Las pasantías también ayudan mucho.",
  },
  alternatives: {
    en: "If this path doesn't fit, related MDC programs could lead to similar jobs with less time or cost.",
    es: "Si esta ruta no encaja, hay programas de MDC relacionados con trabajos similares y menos tiempo o costo.",
  },
  finaid: {
    en: "You may qualify for **Pell Grant** and **Bright Futures**. Complete the FAFSA early to see your options.",
    es: "Podrías calificar para **Pell Grant** y **Bright Futures**. Completa el FAFSA temprano para ver tus opciones.",
  },
};

export async function getAdvisors(): Promise<Advisor[]> {
  if (USE_MOCK) {
    await sleep(100);
    return [...(advisorsMock as Advisor[])].sort((a, b) => a.order - b.order);
  }
  return http<Advisor[]>("/advisors");
}

export async function chatReply(req: ChatReplyRequest): Promise<Message> {
  if (USE_MOCK) {
    await sleep(900 + Math.random() * 700);
    const line = MOCK_LINES[req.advisor_id]?.[req.language] ?? "…";
    return {
      id: uid(),
      role: "advisor",
      advisor_id: req.advisor_id,
      text: line,
      usage: fakeUsage(),
      source: "fallback",
      created_at: now(),
    };
  }
  return http<Message>("/chat/reply", { method: "POST", body: JSON.stringify(req) });
}

export async function mixture(req: MixtureRequest): Promise<MixtureResponse> {
  if (USE_MOCK) {
    await sleep(1800);
    const usage = fakeUsage();
    return {
      message: {
        id: uid(),
        role: "aggregator",
        contributors: req.advisors,
        text:
          req.language === "es"
            ? "**Respuesta combinada:** empieza con un programa de MDC, revisa ayuda financiera (Pell, Bright Futures) y considera una certificación para entrar al trabajo más rápido."
            : "**Merged answer:** start with an MDC program, check financial aid (Pell, Bright Futures), and consider a certification to enter the workforce sooner.",
        usage: { ...usage, total_tokens: usage.total_tokens * req.advisors.length, cost_usd: usage.cost_usd * req.advisors.length },
        source: "fallback",
        created_at: now(),
      },
      per_agent_usage: {},
    };
  }
  return http<MixtureResponse>("/mixture", { method: "POST", body: JSON.stringify(req) });
}

export async function createRoadmap(req: RoadmapRequest): Promise<Roadmap> {
  if (USE_MOCK) {
    await sleep(2500);
    return { ...(roadmapMock as Roadmap), mode: req.mode, language: req.language };
  }
  return http<Roadmap>("/roadmap", { method: "POST", body: JSON.stringify(req) });
}

export async function getRoadmap(id: string): Promise<Roadmap> {
  if (USE_MOCK) return roadmapMock as Roadmap;
  return http<Roadmap>(`/roadmap/${encodeURIComponent(id)}`);
}
