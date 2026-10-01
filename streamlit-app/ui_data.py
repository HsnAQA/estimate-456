"""Course reference data, shared session state, and small UI helpers.

The data mirrors web-app/data.js, and tests/test_data_parity.py compares both.
All session state defaults are created in initialize_state().
"""

from __future__ import annotations

from typing import Any, Callable

import pandas as pd
import streamlit as st

from calculations import COCOMO_DRIVER_NAMES, format_money, format_number


FP_PARAMETERS = [
    ("inputs", "Number of user inputs"),
    ("outputs", "Number of user outputs"),
    ("inquiries", "Number of user inquiries"),
    ("files", "Number of files"),
    ("interfaces", "Number of external interfaces"),
]

GSC_QUESTIONS = [
    "Does the system require reliable backup and recovery?",
    "Are data communications required?",
    "Are there distributed processing functions?",
    "Is performance critical?",
    "Will the system run in an existing, heavily utilized operational environment?",
    "Does the system require on-line data entry?",
    "Does the on-line data entry require the input transaction to be built over multiple screens or operations?",
    "Are there master files updated on-line?",
    "Are the inputs, outputs, files, or inquiries complex?",
    "Is the internal processing complex?",
    "Is the code designed to be reusable?",
    "Are conversion and installation included in the design?",
    "Is the system designed for multiple installations in different organizations?",
    "Is the application designed to facilitate change and ease of use by the user?",
]

RATING_SCALE = ["No influence", "Incidental", "Moderate", "Average", "Significant", "Critical"]

CHARACTERISTICS = [
    ("Operational Ease", "The degree to which the application attends to operational aspects, such as backup, start-up, and recovery processes."),
    ("Data Communication", "The degree to which an application communicates with other applications."),
    ("Distributed Functions", "The degree to which an application transfers or shares data among application components."),
    ("Performance", "The degree to which response time and throughput performance influence the application."),
    ("Heavily Used Configuration", "The degree to which the computer resources where the application runs are used."),
    ("On-line Data Entry", "The percentage of data entered by using interactive transactions."),
    ("Transaction Rate", "The frequency of transactions executed on a daily, weekly, or monthly basis."),
    ("On-line Update", "The degree to which internal logical files are updated on-line."),
    ("End-user Efficiency", "The degree to which human factors and user friendliness must be considered."),
    ("Complex Processing", "The degree to which logic complexity influences processing and application development."),
    ("Reusability", "The degree to which the application and its code are designed, developed, and supported for reuse."),
    ("Installation Ease", "The degree to which conversion from a previous environment influences development."),
    ("Multiple Sites", "The degree to which the application is developed for multiple locations and user organizations."),
    ("Facilitates Change", "The degree to which the application is developed for easy modification of processing logic or data structures."),
]

# Table 6 lists the characteristics in this order in the lecture.
EXAMPLE_GSC_NAMES = [
    "Operational Ease", "Data Communication", "Distributed Functions", "Performance",
    "Heavily Used Configuration", "Transaction Rate", "On-line Data Entry", "On-line Update",
    "End-user Efficiency", "Complex Processing", "Reusability", "Installation Ease",
    "Multiple Sites", "Facilitates Change",
]
EXAMPLE_GSC_VALUES = [2, 5, 4, 5, 2, 3, 4, 2, 3, 4, 5, 2, 3, 4]

EXAMPLES: dict[str, Any] = {
    "sloc": {"loc": 33200, "productivity": 620, "developers": 6, "laborRate": 800},
    "example1": {
        "counts": {"inputs": 13, "outputs": 10, "inquiries": 3, "files": 4, "interfaces": 2},
        "complexity": "average",
        "influences": EXAMPLE_GSC_VALUES,
        "language": "SQL/Oracle",
    },
    "safeHome": {
        "counts": {"inputs": 3, "outputs": 2, "inquiries": 2, "files": 1, "interfaces": 4},
        "complexity": "simple",
        "influences": [4, 4, 3, 4, 3, 3, 3, 3, 4, 4, 4, 3, 3, 1],
        "language": "Object-Oriented Languages",
    },
    "hours": {"fp": 200, "hoursPerFp": 10, "hoursPerDay": 8, "workDays": 20, "developers": 2},
    "productivity": {"fp": 375, "productivity": 6.5, "laborRate": 800},
    "defects": [
        {"name": "Project 1", "defects": 10, "fp": 150},
        {"name": "Project 2", "defects": 20, "fp": 200},
        {"name": "Project 3", "defects": 40, "fp": 1000},
    ],
    "basicCocomo": {"kloc": 4, "mode": "organic", "laborRate": 800},
    # Table 10. Driver indexes refer to COCOMO_DRIVER_NAMES in calculations.py.
    "insurance": {
        "kloc": 3,
        "mode": "organic",
        "laborRate": 800,
        "drivers": [
            {"index": 2, "code": "SPC", "rating": "High", "multiplier": 1.2},
            {"index": 3, "code": "ETC", "rating": "Very High", "multiplier": 1.35},
            {"index": 7, "code": "AC", "rating": "Low", "multiplier": 0.95},
            {"index": 12, "code": "MPP", "rating": "Average", "multiplier": 1.0},
        ],
    },
    "delphi": {
        "threshold": 25,
        "tasks": [
            {"task": "Cost and benefit analysis", "maximum": 20, "minimum": 15},
            {"task": "High level design", "maximum": 50, "minimum": 30},
        ],
    },
}

# Lecture-printed values, shown beside exact results and labeled as rounded.
LECTURE_ROUNDED = {
    "productivity": "Lecture rounded example: $123 per FP, about $46,100 total cost, and about 58 person-months.",
    "basicCocomo": "Lecture rounded example: 3.2 x 4^1.05 = 3.2 x 4.28, about 14 person-months.",
    "intermediateCocomo": (
        "Lecture rounded example: Ei = 3.2 x 3.16 = 10.11, EAF = 1.53, E = 1.53 x 10.11 = 15.5 person-months. "
        "The lecture rounds 3^1.05 to 3.16 and shortens EAF to 1.53, so exact results are slightly higher."
    ),
}

DELPHI_STEPS = [
    "Identify the teams that will estimate.",
    "Present project details to the expert group.",
    "Finalize the acceptable variance value.",
    "Prepare a list of tasks.",
    "Estimates done by the expert group.",
    "Prepare a summary of estimates for each task.",
    "Discuss tasks and assumptions for not acceptable estimates.",
    "Repeat steps until all estimates are finalized.",
]

DRIVER_COLUMN = "Cost Drivers"


# Data frames used by editable tables.

def fp_frame(example: dict[str, Any]) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Key": [key for key, _ in FP_PARAMETERS],
            "Measurement Parameter": [label for _, label in FP_PARAMETERS],
            "Count": [example["counts"][key] for key, _ in FP_PARAMETERS],
            "Complexity": [example["complexity"].capitalize()] * len(FP_PARAMETERS),
        }
    )


def gsc_frame(values: list[int]) -> pd.DataFrame:
    return pd.DataFrame({"Question": GSC_QUESTIONS, "Degree of Influence": values})


def defect_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Project": [item["name"] for item in EXAMPLES["defects"]],
            "Total number of defects reported": [item["defects"] for item in EXAMPLES["defects"]],
            "Total project size in FP": [float(item["fp"]) for item in EXAMPLES["defects"]],
        }
    )


def driver_frame(insurance: bool = False) -> pd.DataFrame:
    ratings = ["Average"] * len(COCOMO_DRIVER_NAMES)
    multipliers = [1.0] * len(COCOMO_DRIVER_NAMES)
    if insurance:
        for item in EXAMPLES["insurance"]["drivers"]:
            ratings[item["index"]] = item["rating"]
            multipliers[item["index"]] = item["multiplier"]
    return pd.DataFrame({DRIVER_COLUMN: COCOMO_DRIVER_NAMES, "Rating": ratings, "Multiplier": multipliers})


def delphi_frame() -> pd.DataFrame:
    tasks = EXAMPLES["delphi"]["tasks"]
    return pd.DataFrame(
        {
            "Task": [item["task"] for item in tasks],
            "Maximum estimation (hours)": [float(item["maximum"]) for item in tasks],
            "Minimum estimation (hours)": [float(item["minimum"]) for item in tasks],
        }
    )


# Widget keys whose values must survive page changes. Streamlit removes widget state
# when a widget is not rendered, so streamlit_app.py reassigns these keys every run.
WIDGET_DEFAULTS: dict[str, Any] = {
    "language": "SQL/Oracle",
    "sloc_loc": float(EXAMPLES["sloc"]["loc"]),
    "sloc_productivity": float(EXAMPLES["sloc"]["productivity"]),
    "sloc_developers": EXAMPLES["sloc"]["developers"],
    "sloc_rate": float(EXAMPLES["sloc"]["laborRate"]),
    "hours_fp": float(EXAMPLES["hours"]["fp"]),
    "hours_per_fp": float(EXAMPLES["hours"]["hoursPerFp"]),
    "hours_per_day": float(EXAMPLES["hours"]["hoursPerDay"]),
    "days_per_month": float(EXAMPLES["hours"]["workDays"]),
    "plan_developers": EXAMPLES["hours"]["developers"],
    "productivity_fp": float(EXAMPLES["productivity"]["fp"]),
    "productivity_rate_fp": float(EXAMPLES["productivity"]["productivity"]),
    "productivity_labor_rate": float(EXAMPLES["productivity"]["laborRate"]),
    "basic_mode": EXAMPLES["basicCocomo"]["mode"],
    "basic_kloc": float(EXAMPLES["basicCocomo"]["kloc"]),
    "basic_rate": float(EXAMPLES["basicCocomo"]["laborRate"]),
    "intermediate_mode": EXAMPLES["insurance"]["mode"],
    "intermediate_kloc": float(EXAMPLES["insurance"]["kloc"]),
    "intermediate_rate": float(EXAMPLES["insurance"]["laborRate"]),
    "delphi_threshold": float(EXAMPLES["delphi"]["threshold"]),
}

TABLE_DEFAULTS: dict[str, Callable[[], pd.DataFrame]] = {
    "fp_input": lambda: fp_frame(EXAMPLES["example1"]),
    "gsc_input": lambda: gsc_frame(EXAMPLE_GSC_VALUES),
    "defect_input": defect_frame,
    "driver_input": lambda: driver_frame(insurance=True),
    "delphi_input": delphi_frame,
}


def initialize_state() -> None:
    """Create every shared session value in one place."""
    for key, default in WIDGET_DEFAULTS.items():
        st.session_state.setdefault(key, default)
    for key, factory in TABLE_DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = factory()
            st.session_state[f"{key}_version"] = 0


def keep_widget_state() -> None:
    for key in WIDGET_DEFAULTS:
        if key in st.session_state:
            st.session_state[key] = st.session_state[key]


def replace_table(name: str, frame: pd.DataFrame) -> None:
    """Replace an editable table and remount its editor so old edits are not reapplied."""
    st.session_state[name] = frame
    st.session_state[f"{name}_version"] = st.session_state.get(f"{name}_version", 0) + 1


def reset_all() -> None:
    for key, default in WIDGET_DEFAULTS.items():
        st.session_state[key] = default
    for key, factory in TABLE_DEFAULTS.items():
        replace_table(key, factory())


def editor_key(name: str) -> str:
    return f"{name}_editor_{st.session_state.get(f'{name}_version', 0)}"


def edit_table(name: str, on_change: Callable[[], None] | None = None, **kwargs: Any) -> pd.DataFrame:
    """A data editor whose edits persist across pages.

    The editor stores edits relative to the frame it was mounted with. The mount frame
    stays fixed while the editor lives, and the latest edited frame is committed to
    session state every run. When the editor mounts again, for example after a page
    change, it starts from the committed frame.
    """
    key = editor_key(name)
    base_key = f"{name}_base"
    if key not in st.session_state or base_key not in st.session_state:
        st.session_state[base_key] = st.session_state[name]
    edited = st.data_editor(st.session_state[base_key], key=key, on_change=on_change, **kwargs)
    st.session_state[name] = edited
    return edited


def applied_edits(name: str) -> pd.DataFrame:
    """Return the mount frame with the editor's current cell edits applied (fixed rows only)."""
    frame = st.session_state[f"{name}_base"].copy()
    for row, changes in st.session_state[editor_key(name)].get("edited_rows", {}).items():
        for column, value in changes.items():
            frame.at[frame.index[int(row)], column] = value
    return frame


# Load callbacks for example buttons.

def load_fp_example() -> None:
    replace_table("fp_input", fp_frame(EXAMPLES["example1"]))
    replace_table("gsc_input", gsc_frame(EXAMPLES["example1"]["influences"]))
    st.session_state.language = EXAMPLES["example1"]["language"]


def load_safehome() -> None:
    replace_table("fp_input", fp_frame(EXAMPLES["safeHome"]))
    replace_table("gsc_input", gsc_frame(EXAMPLES["safeHome"]["influences"]))
    st.session_state.language = EXAMPLES["safeHome"]["language"]


def load_sloc_example() -> None:
    example = EXAMPLES["sloc"]
    st.session_state.sloc_loc = float(example["loc"])
    st.session_state.sloc_productivity = float(example["productivity"])
    st.session_state.sloc_developers = example["developers"]
    st.session_state.sloc_rate = float(example["laborRate"])


def load_basic_example() -> None:
    example = EXAMPLES["basicCocomo"]
    st.session_state.basic_mode = example["mode"]
    st.session_state.basic_kloc = float(example["kloc"])
    st.session_state.basic_rate = float(example["laborRate"])


def load_insurance_example() -> None:
    example = EXAMPLES["insurance"]
    st.session_state.intermediate_mode = example["mode"]
    st.session_state.intermediate_kloc = float(example["kloc"])
    st.session_state.intermediate_rate = float(example["laborRate"])
    replace_table("driver_input", driver_frame(insurance=True))


def set_all_drivers_average() -> None:
    replace_table("driver_input", driver_frame(insurance=False))


def load_delphi_example() -> None:
    st.session_state.delphi_threshold = float(EXAMPLES["delphi"]["threshold"])
    replace_table("delphi_input", delphi_frame())


# Streamlit 1.64 follows the viewer's operating system when both [theme.light] and
# [theme.dark] are configured, and it saves "System" as the viewer's theme on the first
# load. It also stores the theme choice separately for each entry address, such as "/"
# or "/cwf", so a choice made on one page is lost when another page is reloaded.
#
# This script keeps the native theme menu as the only control and adjusts only the
# value Streamlit itself saves:
# 1. On the first visit to an address, the automatic "System" value becomes the
#    viewer's last menu choice, or "Light" when the viewer has never chosen one.
# 2. When the viewer picks System, Light, or Dark in the app menu, the choice is copied
#    to every page address, so reloading any page keeps it.
# If a future Streamlit version renames the key, the app falls back to following the
# operating system.
LIGHT_DEFAULT_SCRIPT = """
<script>
(function () {
  if (window.cpit456ThemeSync) return;
  window.cpit456ThemeSync = true;
  try {
    var storage = window.localStorage;
    var PREFIX = "stActiveTheme-";
    var SUFFIX = "-v2";
    var SHARED = "cpit456-streamlit-theme";
    var SYSTEM = JSON.stringify("System");
    var entryKey = PREFIX + window.location.pathname + SUFFIX;
    var marker = "cpit456-initial-theme-" + window.location.pathname;

    if (storage.getItem(marker) === null) {
      storage.setItem(marker, "set");
      var saved = storage.getItem(entryKey);
      if (saved === null || saved === SYSTEM) {
        var value = storage.getItem(SHARED) || JSON.stringify("Light");
        if (value !== saved) {
          storage.setItem(entryKey, value);
          var osDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
          var wantDark = value === JSON.stringify("Dark") || (value === SYSTEM && osDark);
          if (wantDark !== osDark) {
            window.location.reload();
            return;
          }
        }
      }
    }

    var last = storage.getItem(entryKey);
    if (last !== null) storage.setItem(SHARED, last);
    window.setInterval(function () {
      var current = storage.getItem(entryKey);
      if (current === null || current === last) return;
      last = current;
      storage.setItem(SHARED, current);
      for (var i = 0; i < storage.length; i += 1) {
        var key = storage.key(i);
        if (key.indexOf(PREFIX) === 0 && key.slice(-SUFFIX.length) === SUFFIX) storage.setItem(key, current);
      }
    }, 1000);
  } catch (error) {
    // Storage can be blocked. Streamlit then follows the operating system setting.
  }
})();
</script>
"""


def use_light_as_initial_theme() -> None:
    st.html(LIGHT_DEFAULT_SCRIPT, unsafe_allow_javascript=True)


# Display helpers.

def number(value: float, digits: int = 2) -> str:
    return format_number(value, digits)


def money(value: float) -> str:
    return format_money(value)


def show_errors(messages: list[str]) -> bool:
    """Show each validation message under the inputs. Returns True when all inputs are valid."""
    errors = [message for message in messages if message]
    for message in errors:
        st.error(message, icon=":material/error:")
    return not errors


def result_table(rows: list[tuple[str, str]]) -> None:
    st.table(pd.DataFrame({"Result": [label for label, _ in rows], "Value": [value for _, value in rows]}).set_index("Result"))
