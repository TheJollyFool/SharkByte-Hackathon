"""Task strings, following the templates in docs/AGENT_PIPELINE.md."""

import json

from app.data_loader import advisor_by_id, relevant_programs
from app.models.messages import Message


def speaker(m: Message) -> str:
    if m.role == "student":
        return "Student"
    if m.role == "aggregator":
        return "Advisors (merged)"
    a = advisor_by_id(m.advisor_id or "")
    return a["name"] if a else "Advisor"


def conversation(history: list[Message]) -> str:
    return "\n".join(f"{speaker(m)}: {m.text}" for m in history)


def mdc_data_for(history: list[Message]) -> str:
    text = " ".join(m.text for m in history)
    return json.dumps(relevant_programs(text), ensure_ascii=False)


def chat_task(advisor_id: str, group: list[str], language: str, history: list[Message]) -> str:
    me = advisor_by_id(advisor_id)
    names = [a["name"] for g in (group or [advisor_id]) if (a := advisor_by_id(g))]
    return (
        f"LANGUAGE: {language}\n"
        f"YOU ARE IN A GROUP CHAT WITH: {', '.join(names)}\n"
        'MDC DATA (use only these MDC programs; say "I don\'t have that data" otherwise): '
        f"{mdc_data_for(history)}\n"
        f"CONVERSATION:\n{conversation(history)}\n"
        f"Now reply as {me['name'] if me else advisor_id}. One message, max ~120 words. "
        "Don't repeat what others said; add your part."
    )
