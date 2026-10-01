(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EstimatorLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Pure calculation engine. Every constant below comes from 456-solution-Lect1-2.pdf.
  // The Python twin is streamlit-app/calculations.py. Keep names, rules, and messages in step.

  const FP_WEIGHTS = Object.freeze({
    inputs: { simple: 3, average: 4, complex: 6 },
    outputs: { simple: 4, average: 5, complex: 7 },
    inquiries: { simple: 3, average: 4, complex: 6 },
    files: { simple: 7, average: 10, complex: 15 },
    interfaces: { simple: 5, average: 7, complex: 10 },
  });

  const FP_LABELS = Object.freeze({
    inputs: "Number of user inputs",
    outputs: "Number of user outputs",
    inquiries: "Number of user inquiries",
    files: "Number of files",
    interfaces: "Number of external interfaces",
  });

  const LOC_PER_FP = Object.freeze({
    "Assembly Language": 320,
    C: 128,
    "COBOL/Fortran": 105,
    Pascal: 90,
    Ada: 70,
    "C++": 64,
    "Visual Basic": 32,
    "Object-Oriented Languages": 30,
    Smalltalk: 22,
    "Code Generators (PowerBuilder)": 15,
    "SQL/Oracle": 12,
    Spreadsheets: 6,
    "Graphical Languages (icons)": 4,
  });

  // Table 8. The lecture lists these three modes in this order.
  const COCOMO_MODES = Object.freeze({
    organic: [3.2, 1.05],
    embedded: [2.8, 1.2],
    "semi-detached": [3.0, 1.12],
  });

  const COCOMO_MODE_LABELS = Object.freeze({
    organic: "Organic",
    embedded: "Embedded",
    "semi-detached": "Semi-detached",
  });

  const GSC_NAMES = Object.freeze([
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
  ]);

  // Table 9. The lecture supplies the drivers and rating names but no multiplier matrix.
  const COCOMO_DRIVER_NAMES = Object.freeze([
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
  ]);

  const DRIVER_RATINGS = Object.freeze(["Negligible", "Low", "Average", "High", "Very High", "Extremely Critical"]);

  // The lecture states that multipliers typically range from 0.9 through 1.4 and that
  // the Average rating is usually assigned 1.0. Values outside the range are allowed
  // but flagged, because the lecture calls the range typical rather than mandatory.
  const MULTIPLIER_TYPICAL_RANGE = Object.freeze([0.9, 1.4]);
  const AVERAGE_MULTIPLIER = 1.0;

  function isMissing(value) {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  }

  // Returns null when the value is valid, otherwise { code, max }. Codes: number,
  // negative, positive, integer, max. The interface turns codes into English or
  // Arabic text. rule: { positive, max, integer }
  function numberIssue(value, rule = {}) {
    const parsed = isMissing(value) || typeof value === "boolean" ? NaN : Number(value);
    if (!Number.isFinite(parsed)) return { code: "number" };
    if (parsed < 0) return { code: "negative" };
    if (rule.positive && parsed === 0) return { code: "positive" };
    if (rule.integer && !Number.isInteger(parsed)) return { code: "integer" };
    if (rule.max !== undefined && parsed > rule.max) return { code: "max", max: rule.max };
    return null;
  }

  const ENGLISH_ISSUES = {
    number: (label) => `${label} must be a number.`,
    negative: (label) => `${label} cannot be negative. Enter 0 or more.`,
    positive: (label) => `${label} must be greater than 0.`,
    integer: (label) => `${label} must be a whole number.`,
    max: (label, issue) => `${label} must be ${issue.max} or less.`,
  };

  // Returns an empty string when the value is valid, otherwise an English message that
  // names the cause and the recovery action.
  function checkNumber(value, label, rule = {}) {
    const issue = numberIssue(value, rule);
    return issue ? ENGLISH_ISSUES[issue.code](label, issue) : "";
  }

  function number(value, label, rule = {}) {
    const message = checkNumber(value, label, rule);
    if (message) throw new Error(message);
    return Number(value);
  }

  // Half-up rounding for the positive values used here. Math.round and Python round()
  // disagree on halves, so both implementations use this rule for lecture-rounded values.
  function roundHalfUp(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.floor(value * factor + 0.5) / factor;
  }

  function formatNumber(value, digits = 2) {
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  }

  function formatMoney(value) {
    return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function sloc(loc, productivity, developers, laborRate) {
    loc = number(loc, "Estimated size");
    productivity = number(productivity, "Average productivity", { positive: true });
    developers = number(developers, "Developers", { positive: true, integer: true });
    laborRate = number(laborRate, "Labor rate");
    const effort = loc / productivity;
    const roundedEffort = roundHalfUp(effort);
    return {
      effort,
      duration: effort / developers,
      totalCost: effort * laborRate,
      costPerLoc: laborRate / productivity,
      roundedEffort,
      roundedDuration: roundedEffort / developers,
      roundedTotalCost: roundedEffort * laborRate,
    };
  }

  function checkInfluence(value) {
    const message = checkNumber(value, "Degree of influence", { integer: true, max: 5 });
    return message ? "Each degree of influence must be a whole number from 0 to 5." : "";
  }

  function functionPoints(counts, complexities, influences, locPerFp) {
    const rowTotals = {};
    Object.entries(FP_WEIGHTS).forEach(([key, options]) => {
      const count = number(counts[key], FP_LABELS[key], { integer: true });
      const complexity = String(complexities[key] || "average").toLowerCase();
      if (!(complexity in options)) {
        throw new Error(`Unknown complexity "${complexity}" for ${FP_LABELS[key]}. Use simple, average, or complex.`);
      }
      rowTotals[key] = count * options[complexity];
    });
    if (!Array.isArray(influences) || influences.length !== 14) {
      throw new Error("Exactly 14 degree of influence values are required.");
    }
    influences.forEach((value) => {
      const message = checkInfluence(value);
      if (message) throw new Error(message);
    });
    locPerFp = number(locPerFp, "LOC/FP", { positive: true });
    const ufp = Object.values(rowTotals).reduce((sum, value) => sum + value, 0);
    const tdi = influences.reduce((sum, value) => sum + Number(value), 0);
    const vaf = 0.65 + 0.01 * tdi;
    const fp = ufp * vaf;
    const roundedFp = roundHalfUp(fp);
    return {
      rowTotals,
      ufp,
      tdi,
      vaf,
      fp,
      roundedFp,
      locExact: fp * locPerFp,
      locPlanning: roundedFp * locPerFp,
    };
  }

  function fpHoursPlan(fp, hoursPerFp, hoursPerDay, workDays, developers, laborRate = 0) {
    fp = number(fp, "Total FP");
    hoursPerFp = number(hoursPerFp, "Hours per FP");
    hoursPerDay = number(hoursPerDay, "Hours per working day", { positive: true });
    workDays = number(workDays, "Working days per month", { positive: true });
    developers = number(developers, "Developers", { positive: true, integer: true });
    laborRate = number(laborRate, "Labor rate");
    const personHours = fp * hoursPerFp;
    const personDays = personHours / hoursPerDay;
    const personMonths = personDays / workDays;
    return {
      personHours,
      personDays,
      personMonths,
      calendarMonths: personMonths / developers,
      totalCost: personMonths * laborRate,
    };
  }

  function fpProductivityPlan(fp, productivity, developers, laborRate) {
    fp = number(fp, "Total FP");
    productivity = number(productivity, "Productivity", { positive: true });
    developers = number(developers, "Developers", { positive: true, integer: true });
    laborRate = number(laborRate, "Labor rate");
    const effort = fp / productivity;
    return {
      effort,
      calendarMonths: effort / developers,
      costPerFp: laborRate / productivity,
      totalCost: effort * laborRate,
    };
  }

  function defectDensity(defects, fp) {
    return number(defects, "Total defects", { integer: true }) / number(fp, "Project size in FP", { positive: true });
  }

  function cocomo(kloc, mode, multipliers = [], laborRate = 0) {
    kloc = number(kloc, "KLOC");
    if (!(mode in COCOMO_MODES)) {
      throw new Error(`Unknown COCOMO project type "${mode}". Use organic, embedded, or semi-detached.`);
    }
    laborRate = number(laborRate, "Labor rate");
    const [c, k] = COCOMO_MODES[mode];
    const values = multipliers.map((value) => number(value, "Cost-driver multiplier", { positive: true }));
    const eaf = values.reduce((product, current) => product * current, 1);
    const initialEffort = c * kloc ** k;
    const adjustedEffort = initialEffort * eaf;
    return { c, k, initialEffort, eaf, adjustedEffort, totalCost: adjustedEffort * laborRate };
  }

  function multiplierOutsideTypicalRange(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && (parsed < MULTIPLIER_TYPICAL_RANGE[0] || parsed > MULTIPLIER_TYPICAL_RANGE[1]);
  }

  function delphi(maximum, minimum, threshold) {
    maximum = number(maximum, "Maximum estimate", { positive: true });
    minimum = number(minimum, "Minimum estimate");
    threshold = number(threshold, "Acceptable variance", { max: 100 });
    if (minimum > maximum) {
      throw new Error("Minimum estimate cannot exceed maximum estimate. Lower the minimum or raise the maximum.");
    }
    const variance = ((maximum - minimum) / maximum) * 100;
    // The lecture example accepts a 25% variance at a 25% threshold, so equality is accepted.
    return { variance, accepted: variance <= threshold };
  }

  return {
    FP_WEIGHTS,
    FP_LABELS,
    LOC_PER_FP,
    COCOMO_MODES,
    COCOMO_MODE_LABELS,
    GSC_NAMES,
    COCOMO_DRIVER_NAMES,
    DRIVER_RATINGS,
    MULTIPLIER_TYPICAL_RANGE,
    AVERAGE_MULTIPLIER,
    numberIssue,
    checkNumber,
    checkInfluence,
    roundHalfUp,
    formatNumber,
    formatMoney,
    sloc,
    functionPoints,
    fpHoursPlan,
    fpProductivityPlan,
    defectDensity,
    cocomo,
    multiplierOutsideTypicalRange,
    delphi,
  };
});
