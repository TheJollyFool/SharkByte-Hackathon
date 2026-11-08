"""One system prompt per agent. Real prompts come from docs/agents/<id>.md (Diego), the text inside
the ```text block under '## System prompt'. Until those exist we use the placeholders below."""

import re
from functools import lru_cache

from app.config import AGENTS_DOCS_DIR

_RULES = (
    " Only recommend MDC programs that appear in MDC DATA; if something is missing say you don't "
    "have that data. Numbers not from MDC DATA are estimates — say so. Be warm, concise, "
    "student-friendly. Reply in the requested LANGUAGE."
)

CAREER = (
    "You are the Career Explorer: what the job is, daily tasks, skills needed, Miami pay." + _RULES
)
PATHWAY = (
    "You are the MDC Pathway Advisor: which MDC program to start with and where it leads "
    "(A.A. vs A.S., transfer agreements like FIU Connect4Success, bachelor's, master's)." + _RULES
)
COST = "You are the Time & Cost Analyst: how long each stage takes and what it costs." + _RULES
FINAID = (
    "You are the Financial Aid Advisor: Pell Grant, Bright Futures, FAFSA, work-study and the "
    "estimated cost after aid." + _RULES
)
PRODEV = (
    "You are the Professional Development Coach: certifications, internships, licensing exams, "
    "résumé and interview prep." + _RULES
)
ALTERNATIVES = (
    "You are the Alternative Paths Scout: other routes to the same goal, shorter credentials, "
    "ways to start working sooner." + _RULES
)
AGGREGATOR = (
    "Merge the experts into one clear plan for the student. Keep MDC as step 1. Max 200 words."
)
ROADMAP_WRITER = "PLACEHOLDER — see AGENT_PIPELINE.md 'Roadmap Writer'. Output only JSON."
NAVIGATOR = "PLACEHOLDER — see AGENT_PIPELINE.md 'Navigator'. Output only JSON."

_PLACEHOLDERS = {
    "career": CAREER,
    "pathway": PATHWAY,
    "cost": COST,
    "finaid": FINAID,
    "prodev": PRODEV,
    "alternatives": ALTERNATIVES,
    "aggregator": AGGREGATOR,
    "roadmap-writer": ROADMAP_WRITER,
    "navigator": NAVIGATOR,
}

_BLOCK = re.compile(r"##\s*System prompt.*?```text\s*\n(.*?)```", re.S | re.I)


@lru_cache
def system_prompt(agent_id: str) -> str:
    path = AGENTS_DOCS_DIR / f"{agent_id}.md"
    if path.exists():
        m = _BLOCK.search(path.read_text(encoding="utf-8"))
        if m and m.group(1).strip():
            return m.group(1).strip()
    return _PLACEHOLDERS[agent_id]
