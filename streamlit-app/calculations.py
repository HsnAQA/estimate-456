"""Pure calculation engine for the CPIT 456 Estimation Lab.

The formulas and lookup values in this module are grounded in
456-solution-Lect1-2.pdf. The JavaScript twin is web-app/logic.js; keep names,
validation rules, messages, and rounding in step. UI code lives in app_pages/.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from math import prod
from typing import Iterable, Mapping


FP_WEIGHTS: dict[str, dict[str, int]] = {
    "inputs": {"simple": 3, "average": 4, "complex": 6},
    "outputs": {"simple": 4, "average": 5, "complex": 7},
    "inquiries": {"simple": 3, "average": 4, "complex": 6},
    "files": {"simple": 7, "average": 10, "complex": 15},
    "interfaces": {"simple": 5, "average": 7, "complex": 10},
}

FP_LABELS: dict[str, str] = {
    "inputs": "Number of user inputs",
    "outputs": "Number of user outputs",
    "inquiries": "Number of user inquiries",
    "files": "Number of files",
    "interfaces": "Number of external interfaces",
}

LOC_PER_FP: dict[str, int] = {
    "Assembly Language": 320,
    "C": 128,
    "COBOL/Fortran": 105,
    "Pascal": 90,
    "Ada": 70,
    "C++": 64,
    "Visual Basic": 32,
    "Object-Oriented Languages": 30,
    "Smalltalk": 22,
    "Code Generators (PowerBuilder)": 15,
    "SQL/Oracle": 12,
    "Spreadsheets": 6,
    "Graphical Languages (icons)": 4,
}

# Table 8. The lecture lists these three modes in this order.
COCOMO_MODES: dict[str, tuple[float, float]] = {
    "organic": (3.2, 1.05),
    "embedded": (2.8, 1.20),
    "semi-detached": (3.0, 1.12),
}

COCOMO_MODE_LABELS: dict[str, str] = {
    "organic": "Organic",
    "embedded": "Embedded",
    "semi-detached": "Semi-detached",
}

GSC_NAMES = [
    "Operational Ease",
    "Data Communication",
    "Distributed Functions",
    "Performance",
    "Heavily Used Configuration",
    "On-line Data Entry",
    "Transaction Rate",
    "On-line Update",
    "End-user Efficiency",
    "Complex Processing",
    "Reusability",
    "Installation Ease",
    "Multiple Sites",
    "Facilitates Change",
]

# Table 9. The lecture supplies the drivers and rating names but no multiplier matrix.
COCOMO_DRIVER_NAMES = [
    "Required Software Reliability (RSR)",
    "Database Size (DBS)",
    "Software Product Complexity (SPC)",
    "Execution Time Constraint (ETC)",
    "Main Storage Constraint (MSC)",
    "Virtual Machine Volatility (VMV)",
    "Computer Turnaround Time (CTT)",
    "Analyst Capability (AC)",
    "Applications Experience (AE)",
    "Programmer Capability (PC)",
    "Virtual Machine Experience (VME)",
    "Programming Language Experience (PLE)",
    "Modern Programming Practices (MPP)",
    "Use of Software Tools (TOOL)",
    "Required Development Schedule (RDS)",
]

DRIVER_RATINGS = ["Negligible", "Low", "Average", "High", "Very High", "Extremely Critical"]

# The lecture states that multipliers typically range from 0.9 through 1.4 and that
# the Average rating is usually assigned 1.0. Values outside the range are allowed
# but flagged, because the lecture calls the range typical rather than mandatory.
MULTIPLIER_TYPICAL_RANGE = (0.9, 1.4)
AVERAGE_MULTIPLIER = 1.0


def _is_missing(value: object) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "")


def number_issue(
    value: object,
    *,
    positive: bool = False,
    maximum: float | None = None,
    integer: bool = False,
) -> dict[str, object] | None:
    """Return None when valid, otherwise {"code": ...}. Mirrors numberIssue in logic.js."""
    try:
        parsed = math.nan if _is_missing(value) or isinstance(value, bool) else float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        parsed = math.nan
    if not math.isfinite(parsed):
        return {"code": "number"}
    if parsed < 0:
        return {"code": "negative"}
    if positive and parsed == 0:
        return {"code": "positive"}
    if integer and not parsed.is_integer():
        return {"code": "integer"}
    if maximum is not None and parsed > maximum:
        return {"code": "max", "max": maximum}
    return None


def check_number(
    value: object,
    label: str,
    *,
    positive: bool = False,
    maximum: float | None = None,
    integer: bool = False,
) -> str:
    """Return an empty string when valid, otherwise a cause and recovery message."""
    issue = number_issue(value, positive=positive, maximum=maximum, integer=integer)
    if issue is None:
        return ""
    messages = {
        "number": f"{label} must be a number.",
        "negative": f"{label} cannot be negative. Enter 0 or more.",
        "positive": f"{label} must be greater than 0.",
        "integer": f"{label} must be a whole number.",
        "max": f"{label} must be {format_number(float(issue.get('max', 0)))} or less.",  # type: ignore[arg-type]
    }
    return messages[str(issue["code"])]


def _number(value: object, label: str, **rule: object) -> float:
    message = check_number(value, label, **rule)  # type: ignore[arg-type]
    if message:
        raise ValueError(message)
    return float(value)  # type: ignore[arg-type]


def round_half_up(value: float, digits: int = 0) -> float:
    """Half-up rounding that matches the JavaScript implementation.

    Python's round() uses banker's rounding, so round(2.5) is 2 while the web
    version gives 3. Both implementations use this rule for lecture-rounded values.
    """
    factor = 10**digits
    return math.floor(value * factor + 0.5) / factor


def format_number(value: float, digits: int = 2) -> str:
    text = f"{value:,.{digits}f}"
    if digits > 0:
        text = text.rstrip("0").rstrip(".")
    return text


def format_money(value: float) -> str:
    return f"${value:,.2f}"


@dataclass(frozen=True)
class SlocResult:
    effort_person_months: float
    duration_months: float
    total_cost: float
    cost_per_loc: float
    rounded_effort: float
    rounded_duration: float
    rounded_total_cost: float


def calculate_sloc(
    loc: float, productivity_loc_per_pm: float, developers: float, labor_rate_per_pm: float
) -> SlocResult:
    loc = _number(loc, "Estimated size")
    productivity = _number(productivity_loc_per_pm, "Average productivity", positive=True)
    developers = _number(developers, "Developers", positive=True, integer=True)
    labor_rate = _number(labor_rate_per_pm, "Labor rate")
    effort = loc / productivity
    rounded_effort = round_half_up(effort)
    return SlocResult(
        effort_person_months=effort,
        duration_months=effort / developers,
        total_cost=effort * labor_rate,
        cost_per_loc=labor_rate / productivity,
        rounded_effort=rounded_effort,
        rounded_duration=rounded_effort / developers,
        rounded_total_cost=rounded_effort * labor_rate,
    )


@dataclass(frozen=True)
class FunctionPointResult:
    row_totals: dict[str, float]
    unadjusted_fp: float
    total_degree_of_influence: int
    value_adjustment_factor: float
    adjusted_fp: float
    rounded_fp: int
    estimated_loc_exact: float
    estimated_loc_planning: float


def check_influence(value: object) -> str:
    if check_number(value, "Degree of influence", integer=True, maximum=5):
        return "Each degree of influence must be a whole number from 0 to 5."
    return ""


def calculate_function_points(
    counts: Mapping[str, float],
    complexities: Mapping[str, str],
    influences: Iterable[int],
    loc_per_fp: float,
) -> FunctionPointResult:
    row_totals: dict[str, float] = {}
    for key, weight_options in FP_WEIGHTS.items():
        count = _number(counts.get(key), FP_LABELS[key], integer=True)
        complexity = str(complexities.get(key) or "average").lower()
        if complexity not in weight_options:
            raise ValueError(
                f'Unknown complexity "{complexity}" for {FP_LABELS[key]}. Use simple, average, or complex.'
            )
        row_totals[key] = count * weight_options[complexity]

    influence_list = list(influences)
    if len(influence_list) != 14:
        raise ValueError("Exactly 14 degree of influence values are required.")
    for value in influence_list:
        message = check_influence(value)
        if message:
            raise ValueError(message)
    influence_values = [int(float(value)) for value in influence_list]

    loc_per_fp = _number(loc_per_fp, "LOC/FP", positive=True)
    unadjusted = sum(row_totals.values())
    total_influence = sum(influence_values)
    vaf = 0.65 + 0.01 * total_influence
    adjusted = unadjusted * vaf
    rounded = int(round_half_up(adjusted))
    return FunctionPointResult(
        row_totals=row_totals,
        unadjusted_fp=unadjusted,
        total_degree_of_influence=total_influence,
        value_adjustment_factor=vaf,
        adjusted_fp=adjusted,
        rounded_fp=rounded,
        estimated_loc_exact=adjusted * loc_per_fp,
        estimated_loc_planning=rounded * loc_per_fp,
    )


@dataclass(frozen=True)
class FpHoursPlan:
    person_hours: float
    person_days: float
    person_months: float
    calendar_months: float
    total_cost: float


def calculate_fp_hours_plan(
    fp: float,
    hours_per_fp: float,
    hours_per_day: float,
    working_days_per_month: float,
    developers: float,
    labor_rate_per_pm: float = 0,
) -> FpHoursPlan:
    fp = _number(fp, "Total FP")
    hours_per_fp = _number(hours_per_fp, "Hours per FP")
    hours_per_day = _number(hours_per_day, "Hours per working day", positive=True)
    working_days = _number(working_days_per_month, "Working days per month", positive=True)
    developers = _number(developers, "Developers", positive=True, integer=True)
    labor_rate = _number(labor_rate_per_pm, "Labor rate")
    person_hours = fp * hours_per_fp
    person_days = person_hours / hours_per_day
    person_months = person_days / working_days
    return FpHoursPlan(
        person_hours=person_hours,
        person_days=person_days,
        person_months=person_months,
        calendar_months=person_months / developers,
        total_cost=person_months * labor_rate,
    )


@dataclass(frozen=True)
class FpProductivityPlan:
    effort_person_months: float
    calendar_months: float
    cost_per_fp: float
    total_cost: float


def calculate_fp_productivity_plan(
    fp: float,
    productivity_fp_per_pm: float,
    developers: float,
    labor_rate_per_pm: float,
) -> FpProductivityPlan:
    fp = _number(fp, "Total FP")
    productivity = _number(productivity_fp_per_pm, "Productivity", positive=True)
    developers = _number(developers, "Developers", positive=True, integer=True)
    labor_rate = _number(labor_rate_per_pm, "Labor rate")
    effort = fp / productivity
    return FpProductivityPlan(
        effort_person_months=effort,
        calendar_months=effort / developers,
        cost_per_fp=labor_rate / productivity,
        total_cost=effort * labor_rate,
    )


def calculate_defect_density(defects: float, fp: float) -> float:
    return _number(defects, "Total defects", integer=True) / _number(fp, "Project size in FP", positive=True)


@dataclass(frozen=True)
class CocomoResult:
    c: float
    k: float
    initial_effort_person_months: float
    effort_adjustment_factor: float
    adjusted_effort_person_months: float
    total_cost: float


def calculate_cocomo(
    kloc: float,
    mode: str,
    multipliers: Iterable[float] | None = None,
    labor_rate_per_pm: float = 0,
) -> CocomoResult:
    kloc = _number(kloc, "KLOC")
    if mode not in COCOMO_MODES:
        raise ValueError(f'Unknown COCOMO project type "{mode}". Use organic, embedded, or semi-detached.')
    labor_rate = _number(labor_rate_per_pm, "Labor rate")
    c, k = COCOMO_MODES[mode]
    multiplier_values = [_number(value, "Cost-driver multiplier", positive=True) for value in (multipliers or [])]
    eaf = prod(multiplier_values) if multiplier_values else 1.0
    initial = c * (kloc**k)
    adjusted = initial * eaf
    return CocomoResult(
        c=c,
        k=k,
        initial_effort_person_months=initial,
        effort_adjustment_factor=eaf,
        adjusted_effort_person_months=adjusted,
        total_cost=adjusted * labor_rate,
    )


def multiplier_outside_typical_range(value: object) -> bool:
    try:
        parsed = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return False
    low, high = MULTIPLIER_TYPICAL_RANGE
    return math.isfinite(parsed) and (parsed < low or parsed > high)


@dataclass(frozen=True)
class DelphiResult:
    variance_percent: float
    accepted: bool


def calculate_delphi(maximum_hours: float, minimum_hours: float, threshold_percent: float) -> DelphiResult:
    maximum = _number(maximum_hours, "Maximum estimate", positive=True)
    minimum = _number(minimum_hours, "Minimum estimate")
    threshold = _number(threshold_percent, "Acceptable variance", maximum=100)
    if minimum > maximum:
        raise ValueError("Minimum estimate cannot exceed maximum estimate. Lower the minimum or raise the maximum.")
    variance = ((maximum - minimum) / maximum) * 100
    # The lecture example accepts a 25% variance at a 25% threshold, so equality is accepted.
    return DelphiResult(variance_percent=variance, accepted=variance <= threshold)
