from __future__ import annotations

import pandas as pd
import streamlit as st

from calculations import LOC_PER_FP, calculate_function_points, check_influence, check_number
from ui_data import FP_PARAMETERS, GSC_QUESTIONS, RATING_SCALE, edit_table, number, show_errors


st.subheader("Table 3. Complexity Weighting Factors", anchor=False)
st.caption(", ".join(f"{index} = {label}" for index, label in enumerate(RATING_SCALE)) + ".")

edited = edit_table(
    "gsc_input",
    hide_index=True,
    disabled=["Question"],
    column_config={"Degree of Influence": st.column_config.NumberColumn(min_value=0, max_value=5, step=1, format="%d", required=True)},
    width="stretch",
)
influence_errors = [check_influence(value) for value in edited["Degree of Influence"].tolist()]
influences_valid = show_errors(sorted(set(influence_errors)))

if influences_valid:
    influences = [int(value) for value in edited["Degree of Influence"].tolist()]
    matrix_rows: list[dict[str, object]] = []
    for index, (question, selected) in enumerate(zip(GSC_QUESTIONS, influences, strict=True), start=1):
        row: dict[str, object] = {"Question": f"{index}. {question}"}
        for rating in range(6):
            row[str(rating)] = "X" if rating == selected else ""
        matrix_rows.append(row)
    with st.container(border=True):
        st.markdown("**Source table view**")
        st.dataframe(pd.DataFrame(matrix_rows), hide_index=True, width="stretch")
        st.metric("Total Weighting Factor (Sum Fi)", sum(influences))

st.subheader("Function Point calculation", anchor=False)
st.code("VAF = 0.65 + 0.01 x Sum Fi. FP = CT x VAF. LOC = Rounded FP x LOC/FP.", language=None)
language = st.session_state.language
st.info(f"Language: {language} ({LOC_PER_FP[language]} LOC/FP). Change it on the LOC/FP table page.", icon=":material/info:")

fp_input = st.session_state.fp_input
labels = dict(FP_PARAMETERS)
counts_valid = all(not check_number(row["Count"], labels[str(row["Key"])], integer=True) for _, row in fp_input.iterrows())
if not counts_valid:
    st.warning("Fix the highlighted counts on the FP count table page.", icon=":material/warning:")
elif influences_valid:
    counts = {str(row["Key"]): row["Count"] for _, row in fp_input.iterrows()}
    complexities = {str(row["Key"]): str(row["Complexity"]).lower() for _, row in fp_input.iterrows()}
    result = calculate_function_points(counts, complexities, influences, LOC_PER_FP[language])
    st.metric("Function Points (FP)", number(result.adjusted_fp))
    st.dataframe(
        pd.DataFrame(
            {
                "CT": [number(result.unadjusted_fp)],
                "Sum Fi": [str(result.total_degree_of_influence)],
                "VAF": [number(result.value_adjustment_factor)],
                "FP": [number(result.adjusted_fp)],
                "Rounded FP": [number(result.rounded_fp, 0)],
                "LOC": [number(result.estimated_loc_planning, 0)],
            }
        ),
        hide_index=True,
        width="stretch",
        key="fp_result_table",
    )
