"""GET /programs/{id}/plan: semester plan from data/mdc_course_plans.json (Diego) + courses."""

from app.data_loader import data
from app.models.errors import ApiError
from app.models.plan import PickGroup, PlanCourse, PlanSemester, ProgramPlan


def _codes(key_courses: list[str]) -> set[str]:
    """key_courses look like 'CTS1134 Networking Technologies' -> {'CTS1134'}."""
    return {c.split()[0] for c in key_courses if c}


def _course(raw: dict, program_codes: set[str], courses: dict) -> PlanCourse:
    code = raw.get("code", "")
    info = courses.get(code, {})
    return PlanCourse(
        code=code,
        name=raw.get("title") or info.get("title") or code,
        credits=raw.get("credits", info.get("credits")),
        kind="program" if code in program_codes else "gen_ed",
        prerequisites=list(info.get("prereq_codes") or []),
    )


def get_plan(program_id: str) -> ProgramPlan:
    programs = {p["id"]: p for p in data("mdc_programs") or []}
    plans = (data("mdc_course_plans") or {}).get("plans", {})
    courses = (data("mdc_courses") or {}).get("courses", {})
    program = programs.get(program_id)
    if program is None:
        raise ApiError("not_found", f"program {program_id} not found")
    plan = plans.get(program_id)
    if not plan or not plan.get("terms"):
        raise ApiError("not_found", f"no semester plan for {program_id} yet")

    program_codes = _codes(program.get("key_courses", []))
    semesters: list[PlanSemester] = []
    for i, term in enumerate(plan["terms"], start=1):
        sem = PlanSemester(name=term.get("name") or f"Semester {i}", credits=term.get("credits"))
        for item in term.get("items", []):
            if item.get("type") == "group":
                options = [_course(o, program_codes, courses) for o in item.get("options", [])]
                sem.pick_groups.append(
                    PickGroup(
                        id=f"s{i}-{len(sem.pick_groups)}", title=item.get("title"), options=options
                    )
                )
            else:
                sem.courses.append(_course(item, program_codes, courses))
        semesters.append(sem)

    return ProgramPlan(
        program_id=program_id,
        program_name=program.get("full_name") or program.get("name") or program_id,
        credential=program.get("credential"),
        official_url=program.get("source_url") or "https://www.mdc.edu/",
        total_credits=program.get("credits"),
        estimate=program.get("estimate"),
        semesters=semesters,
    )
