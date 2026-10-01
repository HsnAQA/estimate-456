from __future__ import annotations

import pandas as pd
import streamlit as st

from ui_data import EXAMPLE_GSC_NAMES, EXAMPLE_GSC_VALUES, FP_PARAMETERS


table5, table6 = st.tabs(["Table 5", "Table 6"])
with table5:
    st.subheader("Example 1 Measurement Parameters", icon=":material/calculate:")
    st.table(
        pd.DataFrame(
            {
                "Measurement Parameter": [label for _, label in FP_PARAMETERS],
                "Count": [13, 10, 3, 4, 2],
                "Complexity": ["Average"] * 5,
                "Weight": [4, 5, 4, 10, 7],
                "Total": [52, 50, 12, 40, 14],
            }
        )
    )
    st.metric("Count Total", "168", border=True)
with table6:
    st.subheader("Example 1 General System Characteristics", icon=":material/tune:")
    st.table(
        pd.DataFrame(
            {"No.": range(1, 15), "General System Characteristics": EXAMPLE_GSC_NAMES, "Degree of Influence": EXAMPLE_GSC_VALUES}
        )
    )
    st.success("FP = 189.84, rounded to 190 FP. LOC = 2,280 using SQL/Oracle.", icon=":material/check_circle:")

