from __future__ import annotations

import pandas as pd
import streamlit as st

from calculations import LOC_PER_FP


st.subheader("Table 1. Programming Language LOC/FP", anchor=False)
st.caption("Select the implementation language. The selected value is shared with the CWF page.")

with st.container(border=True):
    language = st.selectbox("Select programming language", list(LOC_PER_FP), key="language")
    st.dataframe(
        pd.DataFrame(
            {
                "Programming Language": list(LOC_PER_FP),
                "LOC/FP (average)": list(LOC_PER_FP.values()),
                "Select": ["Selected" if name == language else "" for name in LOC_PER_FP],
            }
        ),
        hide_index=True,
        width="stretch",
    )
    st.success(f"Selected: {language}, {LOC_PER_FP[language]} LOC per FP. This value is used on the CWF page.", icon=":material/check_circle:")

st.page_link("app_pages/fp_count.py", label="Next step: open the FP count table", icon=":material/arrow_forward:")
