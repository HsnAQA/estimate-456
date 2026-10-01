from __future__ import annotations

import pandas as pd
import streamlit as st

from ui_data import CHARACTERISTICS


st.markdown("#### Table 4. General System Characteristics")
st.caption("Reference descriptions for the 14 adjustment characteristics.")
st.dataframe(
    pd.DataFrame(
        [{"No.": index, "Characteristics": name, "Description": description} for index, (name, description) in enumerate(CHARACTERISTICS, start=1)]
    ),
    hide_index=True,
    width="stretch",
)

