"""Maps the shared fixture schema onto calculations.py.

Fixture inputs and outputs use the camelCase names of web-app/logic.js so both
implementations read one file. This module translates Python results into the
same shape.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable

from calculations import (
    calculate_cocomo,
    calculate_defect_density,
    calculate_delphi,
    calculate_fp_hours_plan,
    calculate_fp_productivity_plan,
    calculate_function_points,
    calculate_sloc,
    format_money,
    format_number,
)


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "shared" / "fixtures" / "calculations.json"
JS_RUNNER = ROOT / "web-app" / "tests" / "fixture_runner.js"


def load_fixtures() -> dict[str, Any]:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def _sloc(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_sloc(i["loc"], i["productivity"], i["developers"], i["laborRate"])
    return {
        "effort": r.effort_person_months,
        "duration": r.duration_months,
        "totalCost": r.total_cost,
        "costPerLoc": r.cost_per_loc,
        "roundedEffort": r.rounded_effort,
        "roundedDuration": r.rounded_duration,
        "roundedTotalCost": r.rounded_total_cost,
    }


def _function_points(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_function_points(i["counts"], i["complexities"], i["influences"], i["locPerFp"])
    return {
        "rowTotals": r.row_totals,
        "ufp": r.unadjusted_fp,
        "tdi": r.total_degree_of_influence,
        "vaf": r.value_adjustment_factor,
        "fp": r.adjusted_fp,
        "roundedFp": r.rounded_fp,
        "locExact": r.estimated_loc_exact,
        "locPlanning": r.estimated_loc_planning,
    }


def _hours(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_fp_hours_plan(i["fp"], i["hoursPerFp"], i["hoursPerDay"], i["workDays"], i["developers"], i["laborRate"])
    return {
        "personHours": r.person_hours,
        "personDays": r.person_days,
        "personMonths": r.person_months,
        "calendarMonths": r.calendar_months,
        "totalCost": r.total_cost,
    }


def _productivity(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_fp_productivity_plan(i["fp"], i["productivity"], i["developers"], i["laborRate"])
    return {
        "effort": r.effort_person_months,
        "calendarMonths": r.calendar_months,
        "costPerFp": r.cost_per_fp,
        "totalCost": r.total_cost,
    }


def _cocomo(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_cocomo(i["kloc"], i["mode"], i["multipliers"], i["laborRate"])
    return {
        "c": r.c,
        "k": r.k,
        "initialEffort": r.initial_effort_person_months,
        "eaf": r.effort_adjustment_factor,
        "adjustedEffort": r.adjusted_effort_person_months,
        "totalCost": r.total_cost,
    }


def _delphi(i: dict[str, Any]) -> dict[str, Any]:
    r = calculate_delphi(i["maximum"], i["minimum"], i["threshold"])
    return {"variance": r.variance_percent, "accepted": r.accepted}


CALCULATIONS: dict[str, Callable[[dict[str, Any]], dict[str, Any]]] = {
    "sloc": _sloc,
    "functionPoints": _function_points,
    "fpHoursPlan": _hours,
    "fpProductivityPlan": _productivity,
    "defectDensity": lambda i: {"density": calculate_defect_density(i["defects"], i["fp"])},
    "cocomo": _cocomo,
    "delphi": _delphi,
}


def run_fixtures(fixtures: dict[str, Any]) -> dict[str, Any]:
    cases = {item["id"]: CALCULATIONS[item["calc"]](item["input"]) for item in fixtures["cases"]}
    invalid: dict[str, str | None] = {}
    for item in fixtures["invalid"]:
        try:
            CALCULATIONS[item["calc"]](item["input"])
            invalid[item["id"]] = None
        except ValueError as error:
            invalid[item["id"]] = str(error)
    formatting = [
        format_money(item["value"]) if item["kind"] == "money" else format_number(item["value"], item["digits"])
        for item in fixtures["formatting"]
    ]
    return {"cases": cases, "invalid": invalid, "formatting": formatting}


def assert_close(test: Any, actual: Any, expected: Any, where: str, tolerance: dict[str, float]) -> None:
    if isinstance(expected, bool):
        test.assertIs(bool(actual), expected, where)
    elif isinstance(expected, dict):
        for key, value in expected.items():
            assert_close(test, actual[key], value, f"{where}.{key}", tolerance)
    else:
        limit = max(tolerance["absolute"], tolerance["relative"] * abs(expected))
        test.assertLessEqual(abs(actual - expected), limit, f"{where}: expected {expected}, received {actual}")
