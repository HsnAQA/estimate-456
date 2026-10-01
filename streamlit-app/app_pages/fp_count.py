from __future__ import annotations

import pandas as pd
import streamlit as st

from calculations import FP_WEIGHTS, check_number
from ui_data import edit_table, load_fp_example, load_safehome, number, show_errors


st.subheader("Table 2. Measurement Parameters", anchor=False)
st.caption("Enter a whole-number count and select one complexity level for each parameter.")
st.code("CT = Total 1 + Total 2 + Total 3 + Total 4 + Total 5", language=None)

with st.container(horizontal=True):
    st.button("Load Example 1", icon=":material/science:", on_click=load_fp_example, key="fp_load_example1")
    st.button("Load SafeHome", icon=":material/home:", on_click=load_safehome, key="fp_load_safehome")

edited = edit_table(
    "fp_input",
    hide_index=True,
    disabled=["Key", "Measurement Parameter"],
    column_config={
        "Key": None,
        "Count": st.column_config.NumberColumn(min_value=0, step=1, format="%d", required=True),
        "Complexity": st.column_config.SelectboxColumn(options=["Simple", "Average", "Complex"], required=True),
    },
    width="stretch",
)

valid = show_errors([check_number(row["Count"], str(row["Measurement Parameter"]), integer=True) for _, row in edited.iterrows()])

if valid:
    rows: list[dict[str, object]] = []
    count_total = 0.0
    for _, row in edited.iterrows():
        key = str(row["Key"])
        weight = FP_WEIGHTS[key][str(row["Complexity"]).lower()]
        total = float(row["Count"]) * weight
        count_total += total
        rows.append(
            {
                "Measurement Parameter": row["Measurement Parameter"],
                "Count": int(row["Count"]),
                "Simple": FP_WEIGHTS[key]["simple"],
                "Average": FP_WEIGHTS[key]["average"],
                "Complex": FP_WEIGHTS[key]["complex"],
                "Selected weight": f"{row['Complexity']} ({weight})",
                "Total": total,
            }
        )
    with st.container(border=True):
        st.markdown("**Source table view**")
        st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch", column_config={"Total": st.column_config.NumberColumn(format="%d")})
        st.metric("Count Total (CT)", number(count_total, 0))
    st.page_link("app_pages/cwf.py", label="The CT value is carried to the CWF page. Continue to CWF", icon=":material/arrow_forward:")
