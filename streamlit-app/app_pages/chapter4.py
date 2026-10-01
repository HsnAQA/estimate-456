from __future__ import annotations

import pandas as pd
import streamlit as st

from calculations import (
    AVERAGE_MULTIPLIER,
    COCOMO_MODE_LABELS,
    COCOMO_MODES,
    DRIVER_RATINGS,
    calculate_cocomo,
    calculate_delphi,
    check_number,
    multiplier_outside_typical_range,
)
from ui_data import (
    DELPHI_STEPS,
    DRIVER_COLUMN,
    EXAMPLES,
    LECTURE_ROUNDED,
    applied_edits,
    edit_table,
    editor_key,
    load_basic_example,
    load_delphi_example,
    load_insurance_example,
    money,
    number,
    replace_table,
    result_table,
    set_all_drivers_average,
    show_errors,
)


def driver_code(name: str) -> str:
    return name[name.find("(") + 1 : name.find(")")] if "(" in name else name


def constants_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Software Project Type": [COCOMO_MODE_LABELS[mode] for mode in COCOMO_MODES],
            "C": [f"{c:.1f}" for c, _ in COCOMO_MODES.values()],
            "K": [f"{k:.2f}" for _, k in COCOMO_MODES.values()],
        }
    )


def on_driver_change() -> None:
    """The lecture assigns the Average rating a static value of 1.0, so choosing Average resets the multiplier."""
    changes = st.session_state[editor_key("driver_input")].get("edited_rows", {})
    reset_rows = [int(row) for row, change in changes.items() if change.get("Rating") == "Average" and "Multiplier" not in change]
    if not reset_rows:
        return
    frame = applied_edits("driver_input")
    for row in reset_rows:
        frame.at[frame.index[row], "Multiplier"] = AVERAGE_MULTIPLIER
    replace_table("driver_input", frame)


st.caption("Sections 4.3 and 4.4. Estimate effort with Basic or Intermediate COCOMO, then review expert estimates with the Delphi technique.")
basic, intermediate, delphi = st.tabs(["Basic COCOMO", "Intermediate COCOMO", "Delphi"])

with basic:
    with st.container(horizontal=True, vertical_alignment="center"):
        st.markdown("**Table 8. COCOMO Constants**")
        st.button("Load lecture example", icon=":material/science:", on_click=load_basic_example, key="basic_load_example")
    st.code("Ei = C x (KLOC)^K", language=None)
    st.dataframe(constants_frame(), hide_index=True, width="stretch")
    mode = st.radio(
        "Software project type",
        list(COCOMO_MODES),
        format_func=lambda item: COCOMO_MODE_LABELS[item],
        horizontal=True,
        key="basic_mode",
    )
    left, right = st.columns(2)
    kloc = left.number_input("Project size (KLOC)", min_value=0.0, step=0.5, key="basic_kloc", help="Thousands of delivered lines of code.")
    rate = right.number_input(
        "Labor rate (USD/person-month)", min_value=0.0, step=50.0, key="basic_rate",
        help="Used for cost = effort x labor rate, as in section 4.1.",
    )
    with st.container(border=True):
        st.markdown("**Basic COCOMO result**")
        if show_errors([check_number(kloc, "KLOC"), check_number(rate, "Labor rate")]):
            result = calculate_cocomo(kloc, mode, [], rate)
            st.metric("Initial effort, Ei (person-months)", number(result.initial_effort_person_months))
            result_table([
                ("Software project type", COCOMO_MODE_LABELS[mode]),
                ("Constants", f"C = {result.c:.1f}, K = {result.k:.2f}"),
                ("Estimated cost", money(result.total_cost)),
            ])
            example = EXAMPLES["basicCocomo"]
            if kloc == example["kloc"] and mode == example["mode"]:
                st.info(LECTURE_ROUNDED["basicCocomo"], icon=":material/info:")
        st.caption(
            "Duration is not calculated. The lecture introduces a Development time (D) equation for each mode "
            "but does not print those equations, so no duration constants are available from the course material."
        )

with intermediate:
    with st.container(horizontal=True, vertical_alignment="center"):
        st.markdown("**Project values**")
        st.button("Load insurance example", icon=":material/science:", on_click=load_insurance_example, key="intermediate_load_example")
        st.button("Set all to Average", icon=":material/restart_alt:", on_click=set_all_drivers_average, key="intermediate_set_average")
    st.code("Ei = C x (KLOC)^K. EAF = product of the multipliers. E = EAF x Ei.", language=None)
    first, second, third = st.columns(3)
    i_kloc = first.number_input("Project size (KLOC)", min_value=0.0, step=0.5, key="intermediate_kloc")
    i_mode = second.selectbox("Software project type", list(COCOMO_MODES), format_func=lambda item: COCOMO_MODE_LABELS[item], key="intermediate_mode")
    i_rate = third.number_input("Labor rate (USD/person-month)", min_value=0.0, step=50.0, key="intermediate_rate")

    st.markdown("**Table 9. Intermediate COCOMO Cost Drivers**")
    st.info(
        "The lecture lists the rating levels but no multiplier for each level. Enter the multiplier your organization uses. "
        "Typical values range from 0.9 through 1.4, and Average is set to 1.0 as the lecture states.",
        icon=":material/info:",
    )
    drivers = edit_table(
        "driver_input",
        on_change=on_driver_change,
        hide_index=True,
        disabled=[DRIVER_COLUMN],
        column_config={
            "Rating": st.column_config.SelectboxColumn(options=DRIVER_RATINGS, required=True),
            "Multiplier": st.column_config.NumberColumn(min_value=0.0, step=0.01, format="%.2f", required=True),
        },
        width="stretch",
    )
    driver_errors = []
    warnings = []
    for _, row in drivers.iterrows():
        code = driver_code(str(row[DRIVER_COLUMN]))
        message = check_number(row["Multiplier"], "Cost-driver multiplier", positive=True)
        if message:
            driver_errors.append(f"{code}: {message}")
        elif multiplier_outside_typical_range(row["Multiplier"]):
            warnings.append(f"{code} is outside the typical 0.9 to 1.4 range. Check the value.")
        elif row["Rating"] == "Average" and float(row["Multiplier"]) != AVERAGE_MULTIPLIER:
            warnings.append(f"{code}: the lecture assigns the Average rating 1.0.")
    for warning in warnings:
        st.warning(warning, icon=":material/warning:")

    with st.expander("Source table view of Table 9"):
        st.dataframe(
            pd.DataFrame(
                [
                    {DRIVER_COLUMN: row[DRIVER_COLUMN], **{rating: "X" if row["Rating"] == rating else "" for rating in DRIVER_RATINGS}}
                    for _, row in drivers.iterrows()
                ]
            ),
            hide_index=True,
            width="stretch",
        )

    with st.container(border=True):
        st.markdown("**Intermediate COCOMO result**")
        if show_errors([check_number(i_kloc, "KLOC"), check_number(i_rate, "Labor rate"), *driver_errors]):
            multipliers = [float(value) for value in drivers["Multiplier"].tolist()]
            result = calculate_cocomo(i_kloc, i_mode, multipliers, i_rate)
            applied = [
                f"{driver_code(str(row[DRIVER_COLUMN]))} {row['Rating']} {number(float(row['Multiplier']))}"
                for _, row in drivers.iterrows()
                if float(row["Multiplier"]) != 1 or row["Rating"] != "Average"
            ]
            st.metric("Adjusted effort, E (person-months)", number(result.adjusted_effort_person_months))
            result_table([
                ("Initial effort (Ei)", f"{number(result.initial_effort_person_months)} person-months"),
                ("Effort adjustment factor (EAF)", number(result.effort_adjustment_factor, 4)),
                ("Software project type", f"{COCOMO_MODE_LABELS[i_mode]} (C = {result.c:.1f}, K = {result.k:.2f})"),
                ("Drivers not at Average 1.0", ", ".join(applied) if applied else "None"),
                ("Estimated cost", money(result.total_cost)),
            ])
            example = EXAMPLES["insurance"]
            expected = [1.0] * len(multipliers)
            for item in example["drivers"]:
                expected[item["index"]] = item["multiplier"]
            if i_kloc == example["kloc"] and i_mode == example["mode"] and multipliers == expected:
                st.info(LECTURE_ROUNDED["intermediateCocomo"], icon=":material/info:")

    st.markdown("**Table 10. Intermediate COCOMO Example**")
    st.caption("Customized insurance project with four modules, 3 KLOC in total, organic type.")
    st.table(
        pd.DataFrame(
            {
                "Rating": [item["rating"] for item in EXAMPLES["insurance"]["drivers"]],
                "Multiplying factors": [f"{item['multiplier']:g}" if item["multiplier"] != 1 else "1.0" for item in EXAMPLES["insurance"]["drivers"]],
            },
            index=pd.Index([item["code"] for item in EXAMPLES["insurance"]["drivers"]], name="Applicable cost driver attributes"),
        )
    )

with delphi:
    with st.container(horizontal=True, vertical_alignment="center"):
        st.markdown("**Table 11. Summary of Estimates Table**")
        st.button("Load lecture example", icon=":material/science:", on_click=load_delphi_example, key="delphi_load_example")
    st.code("Percentage of variance = (Maximum - Minimum) / Maximum x 100", language=None)
    threshold = st.number_input(
        "Acceptable variance (%)", min_value=0.0, step=5.0, key="delphi_threshold",
        help="Tasks at or below this variance are accepted (A).",
    )
    threshold_valid = show_errors([check_number(threshold, "Acceptable variance", maximum=100)])
    st.caption("Add or remove tasks with the table toolbar.")
    tasks = edit_table(
        "delphi_input",
        num_rows="dynamic",
        hide_index=True,
        column_config={
            "Task": st.column_config.TextColumn(required=True),
            "Maximum estimation (hours)": st.column_config.NumberColumn(min_value=0.0, required=True),
            "Minimum estimation (hours)": st.column_config.NumberColumn(min_value=0.0, required=True),
        },
        width="stretch",
    )
    summary_rows = []
    row_errors = []
    accepted = 0
    evaluated = 0
    for position, (_, row) in enumerate(tasks.iterrows(), start=1):
        maximum = row["Maximum estimation (hours)"]
        minimum = row["Minimum estimation (hours)"]
        errors = [
            check_number(maximum, "Maximum estimate", positive=True),
            check_number(minimum, "Minimum estimate"),
        ]
        errors = [error for error in errors if error]
        if not errors and float(minimum) > float(maximum):
            errors.append("Minimum estimate cannot exceed maximum estimate. Lower the minimum or raise the maximum.")
        row_errors.extend(f"Row {position}: {error}" for error in errors)
        variance = "Not available"
        status = "Fix the estimates"
        if not errors:
            variance_value = (float(maximum) - float(minimum)) / float(maximum) * 100
            variance = f"{number(variance_value)}%"
            status = "Fix the acceptable variance"
            if threshold_valid:
                result = calculate_delphi(maximum, minimum, threshold)
                evaluated += 1
                accepted += int(result.accepted)
                status = "A, accepted" if result.accepted else "NA, not accepted"
        summary_rows.append({"Task": row["Task"], "Percentage of variance": variance, "Accepted or not accepted (A/NA)": status})
    show_errors(row_errors)
    if summary_rows:
        st.dataframe(pd.DataFrame(summary_rows), hide_index=True, width="stretch")
    if not summary_rows:
        st.info("Add a task to start the summary of estimates.", icon=":material/info:")
    elif threshold_valid and evaluated == len(summary_rows):
        if accepted == evaluated:
            st.success(f"All {evaluated} tasks are accepted. The estimates are finalized.", icon=":material/check_circle:")
        else:
            st.warning(
                f"{accepted} of {evaluated} tasks accepted. Discuss the NA tasks (step 7) and repeat the estimates from step 5.",
                icon=":material/warning:",
            )

    with st.container(border=True, key="delphi_steps"):
        st.markdown("**The eight basic steps of the Delphi technique**")
        # The flow uses currentColor so it follows the active light or dark theme without theme detection.
        items = "".join(f'<li class="{"loop" if index in (4, 7) else ""}">{step}</li>' for index, step in enumerate(DELPHI_STEPS))
        st.html(
            """
            <style>
            .cpit-flow { display: grid; gap: 18px; max-width: 560px; margin: 4px auto; padding: 0; list-style: none; counter-reset: step; }
            .cpit-flow li { position: relative; padding: 9px 12px 9px 44px; border: 1px solid color-mix(in srgb, currentColor 35%, transparent); border-radius: 6px; font-size: 14px; font-weight: 500; counter-increment: step; }
            .cpit-flow li::before { content: counter(step); position: absolute; left: 10px; top: 50%; display: grid; width: 24px; height: 24px; place-items: center; transform: translateY(-50%); border: 1px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: 4px; font-size: 12px; font-weight: 600; }
            .cpit-flow li + li::after { content: ""; position: absolute; left: 50%; top: -19px; width: 1px; height: 18px; background: color-mix(in srgb, currentColor 35%, transparent); }
            .cpit-flow li.loop { border-width: 2px; }
            </style>
            """
            + f'<ol class="cpit-flow">{items}</ol>'
        )
        st.caption("Steps 5 and 8 have a heavier border. Step 8 returns to step 5 until every task has an acceptable percentage of variance.")
