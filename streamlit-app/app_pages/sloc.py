from __future__ import annotations

import streamlit as st

from calculations import calculate_sloc, check_number
from ui_data import load_sloc_example, money, number, result_table, show_errors


st.subheader("Section 4.1 Source Lines of Code", anchor=False)
st.caption("Estimate effort and cost from code size with the same values and formulas as the lecture example.")
st.code(
    "Way 1: Effort = LOC / Productivity. Cost = Effort x Labor rate.\n"
    "Way 2: Cost per LOC = Labor rate / Productivity. Cost = LOC x Cost per LOC. Effort = Cost / Labor rate.",
    language=None,
)
st.button("Load lecture example", icon=":material/science:", on_click=load_sloc_example, key="sloc_load_example")

inputs, results = st.columns(2)
with inputs.container(border=True):
    st.markdown("**Project values**")
    loc = st.number_input("Estimated size (LOC)", min_value=0.0, step=100.0, format="%.0f", key="sloc_loc", help="Total delivered lines of code.")
    productivity = st.number_input(
        "Average productivity (LOC/person-month)", min_value=0.0, step=10.0, key="sloc_productivity",
        help="Lines of code per person-month. Must be greater than 0.",
    )
    developers = st.number_input("Developers", min_value=0, step=1, key="sloc_developers", help="Whole number of developers sharing the work.")
    labor_rate = st.number_input("Labor rate (USD/person-month)", min_value=0.0, step=50.0, key="sloc_rate", help="Cost of one person-month.")
    valid = show_errors([
        check_number(loc, "Estimated size"),
        check_number(productivity, "Average productivity", positive=True),
        check_number(developers, "Developers", positive=True, integer=True),
        check_number(labor_rate, "Labor rate"),
    ])

with results.container(border=True):
    st.markdown("**Calculated estimate**")
    if not valid:
        st.warning("Fix the highlighted inputs to see results.", icon=":material/warning:")
    else:
        sloc = calculate_sloc(loc, productivity, developers, labor_rate)
        st.metric("Exact total effort (person-months)", number(sloc.effort_person_months))
        result_table([
            ("Team duration", f"{number(sloc.duration_months)} months"),
            ("Cost per LOC", money(sloc.cost_per_loc)),
            ("Exact total cost", money(sloc.total_cost)),
        ])
        st.caption("Way 1 rounded as in the lecture")
        result_table([
            ("Rounded effort", f"{number(sloc.rounded_effort, 0)} person-months"),
            ("Team duration", f"{number(sloc.rounded_duration)} months"),
            ("Total cost", money(sloc.rounded_total_cost)),
        ])
        st.caption("Way 2: cost per LOC first")
        way2 = [
            ("Cost per LOC", f"{money(sloc.cost_per_loc)} (lecture rounds to {money(sloc.rounded_cost_per_loc)})"),
            ("Total cost = LOC x Cost per LOC", f"{money(sloc.way2_cost)} (lecture: {money(sloc.rounded_way2_cost)})"),
        ]
        if labor_rate > 0:
            way2.append(("Effort = Cost / Labor rate", f"{number(sloc.way2_cost / labor_rate)} person-months"))
        result_table(way2)
