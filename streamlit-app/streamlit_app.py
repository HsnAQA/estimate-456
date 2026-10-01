from __future__ import annotations

from pathlib import Path

import streamlit as st

from ui_data import initialize_state, keep_widget_state, reset_all, use_light_as_initial_theme


st.set_page_config(
    page_title="Estimate 456",
    # A local image keeps the browser tab icon offline. Material icon names load from a remote CDN.
    page_icon=str(Path(__file__).parents[1] / "assets" / "brand" / "estimate-456-mark.svg"),
    layout="wide",
)

initialize_state()
keep_widget_state()

page = st.navigation(
    {
        "Part 1 | Chapter 1": [
            st.Page("app_pages/sloc.py", title="SLOC calculator", icon=":material/code:", default=True),
            st.Page("app_pages/language.py", title="LOC/FP table", icon=":material/translate:"),
            st.Page("app_pages/fp_count.py", title="FP count table", icon=":material/calculate:"),
            st.Page("app_pages/cwf.py", title="CWF table", icon=":material/tune:"),
            st.Page("app_pages/characteristics.py", title="Characteristics", icon=":material/table_rows:"),
            st.Page("app_pages/examples.py", title="Lecture examples", icon=":material/school:"),
        ],
        "Part 2 | Chapter 4": [
            st.Page("app_pages/planning.py", title="Planning and quality", icon=":material/query_stats:"),
            st.Page("app_pages/chapter4.py", title="COCOMO and Delphi", icon=":material/account_tree:"),
        ],
    },
    position="sidebar",
)

with st.sidebar:
    st.button("Reset all examples", icon=":material/restart_alt:", on_click=reset_all, width="stretch", key="reset_all")
    st.caption("All calculations run locally. Choose System, Light, or Dark theme in the app menu at the top right.")
    use_light_as_initial_theme()

st.title(page.title, anchor=False)
st.caption("Estimate 456 | CPIT 456 Software Project Estimation")
page.run()
