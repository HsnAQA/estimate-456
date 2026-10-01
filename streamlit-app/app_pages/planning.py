from __future__ import annotations

import streamlit as st

from calculations import calculate_defect_density, calculate_fp_hours_plan, calculate_fp_productivity_plan, check_number
from ui_data import EXAMPLES, LECTURE_ROUNDED, edit_table, money, number, result_table, show_errors


st.caption("Sections 4.2.3 to 4.2.5. Calculate effort from Function Points or compare defect density.")
hours_tab, productivity_tab, defects_tab = st.tabs(["Hours per FP", "FP productivity", "Table 7"])

with hours_tab:
    st.markdown("**Initial estimation with hours per FP**")
    st.code("Person-hours = FP x Hours per FP. Person-months = Person-hours / Hours per day / Days per month.", language=None)
    left, right = st.columns(2)
    with left:
        fp = st.number_input("Total FP", min_value=0.0, key="hours_fp")
        hours_per_fp = st.number_input("Hours per FP", min_value=0.0, key="hours_per_fp")
        hours_per_day = st.number_input("Hours per working day", min_value=0.0, key="hours_per_day")
    with right:
        days_per_month = st.number_input("Working days per month", min_value=0.0, key="days_per_month")
        developers = st.number_input("Developers", min_value=0, step=1, key="plan_developers")
    if show_errors([
        check_number(fp, "Total FP"),
        check_number(hours_per_fp, "Hours per FP"),
        check_number(hours_per_day, "Hours per working day", positive=True),
        check_number(days_per_month, "Working days per month", positive=True),
        check_number(developers, "Developers", positive=True, integer=True),
    ]):
        plan = calculate_fp_hours_plan(fp, hours_per_fp, hours_per_day, days_per_month, developers)
        st.metric("Total effort (person-months)", number(plan.person_months))
        result_table([
            ("Person-hours", f"{number(plan.person_hours)} person-hours"),
            ("Person-days", f"{number(plan.person_days)} person-days"),
            ("Team duration", f"{number(plan.calendar_months)} months"),
        ])

with productivity_tab:
    st.markdown("**FP-based estimation with productivity and cost**")
    st.code("Cost per FP = Labor rate / Productivity. Effort = FP / Productivity.", language=None)
    fp = st.number_input("Total FP", min_value=0.0, key="productivity_fp")
    productivity = st.number_input("Productivity (FP/person-month)", min_value=0.0, step=0.5, key="productivity_rate_fp")
    rate = st.number_input("Labor rate (USD/person-month)", min_value=0.0, step=50.0, key="productivity_labor_rate")
    if show_errors([
        check_number(fp, "Total FP"),
        check_number(productivity, "Productivity", positive=True),
        check_number(rate, "Labor rate"),
    ]):
        plan = calculate_fp_productivity_plan(fp, productivity, 1, rate)
        st.metric("Exact total cost", money(plan.total_cost))
        result_table([
            ("Cost per FP", money(plan.cost_per_fp)),
            ("Total effort", f"{number(plan.effort_person_months)} person-months"),
        ])
        example = EXAMPLES["productivity"]
        if (fp, productivity, rate) == (example["fp"], example["productivity"], example["laborRate"]):
            st.info(LECTURE_ROUNDED["productivity"], icon=":material/info:")

with defects_tab:
    st.markdown("**Table 7. Defect Density**")
    st.code("Defect density = Total number of defects / Total project size in FP", language=None)
    st.caption("Add or remove rows with the table toolbar. Every value must be valid before a project is compared.")
    defects = edit_table(
        "defect_input",
        num_rows="dynamic",
        hide_index=True,
        column_config={
            "Project": st.column_config.TextColumn(required=True),
            "Total number of defects reported": st.column_config.NumberColumn(min_value=0, step=1, format="%d", required=True),
            "Total project size in FP": st.column_config.NumberColumn(min_value=0.0, required=True),
        },
        width="stretch",
    )
    rows = []
    messages = []
    for position, (_, row) in enumerate(defects.iterrows(), start=1):
        errors = [
            check_number(row["Total number of defects reported"], "Total defects", integer=True),
            check_number(row["Total project size in FP"], "Project size in FP", positive=True),
        ]
        errors = [error for error in errors if error]
        messages.extend(f"Row {position}: {error}" for error in errors)
        density = None if errors else calculate_defect_density(row["Total number of defects reported"], row["Total project size in FP"])
        rows.append((str(row["Project"] or "Unnamed project"), density))
    show_errors(messages)
    if rows:
        st.dataframe(
            {
                "Project": [name for name, _ in rows],
                "Defect density": [number(density, 4) if density is not None else "Not available" for _, density in rows],
            },
            hide_index=True,
            width="stretch",
        )
    valid_rows = [(name, density) for name, density in rows if density is not None]
    if not rows:
        st.info("Add a project to compare defect density.", icon=":material/info:")
    elif valid_rows:
        best_name, best_density = min(valid_rows, key=lambda item: item[1])
        excluded = len(rows) - len(valid_rows)
        extra = f" {excluded} row{'s' if excluded > 1 else ''} with invalid values {'are' if excluded > 1 else 'is'} excluded." if excluded else ""
        st.success(
            f"{best_name} has the lowest defect density at {number(best_density, 4)} defects/FP, so it shows the best quality.{extra}",
            icon=":material/check_circle:",
        )
