from __future__ import annotations

import tomllib
import unittest
from pathlib import Path

from streamlit.testing.v1 import AppTest


APP_DIR = Path(__file__).resolve().parents[1]
APP = APP_DIR / "streamlit_app.py"
PAGES = [
    "app_pages/sloc.py",
    "app_pages/language.py",
    "app_pages/fp_count.py",
    "app_pages/cwf.py",
    "app_pages/characteristics.py",
    "app_pages/examples.py",
    "app_pages/planning.py",
    "app_pages/chapter4.py",
]


def run_app() -> AppTest:
    return AppTest.from_file(str(APP), default_timeout=20).run()


def metric_values(app: AppTest) -> dict[str, str]:
    return {metric.label: metric.value for metric in app.metric}


class StreamlitSmokeTests(unittest.TestCase):
    def test_default_page_renders(self) -> None:
        app = run_app()
        self.assertFalse(app.exception)
        self.assertTrue(any("SLOC calculator" in title.value for title in app.title))

    def test_each_page_renders(self) -> None:
        app = run_app()
        for page in PAGES:
            app.switch_page(page).run(timeout=20)
            self.assertFalse(app.exception, page)

    def test_every_course_table_is_labeled(self) -> None:
        app = run_app()
        text = []
        for page in PAGES:
            app.switch_page(page).run(timeout=20)
            text.extend(str(node.value) for node in app.markdown)
            text.extend(str(node.value) for node in app.subheader)
            text.extend(str(tab.label) for tab in app.tabs)
        joined = "\n".join(text)
        for number in range(1, 12):
            self.assertIn(f"Table {number}", joined)


class CalculatorBehaviorTests(unittest.TestCase):
    def test_sloc_lecture_values(self) -> None:
        app = run_app()
        self.assertEqual(metric_values(app)["Exact total effort (person-months)"], "53.55")

    def test_sloc_validation_message(self) -> None:
        app = run_app()
        app.number_input(key="sloc_productivity").set_value(0.0).run()
        self.assertIn("Average productivity must be greater than 0.", [error.value for error in app.error])
        self.assertNotIn("Exact total effort (person-months)", metric_values(app))

    def test_inputs_survive_page_changes(self) -> None:
        app = run_app()
        app.number_input(key="sloc_loc").set_value(40000.0).run()
        app.switch_page("app_pages/planning.py").run()
        app.switch_page("app_pages/sloc.py").run()
        self.assertEqual(app.number_input(key="sloc_loc").value, 40000.0)

    def test_language_is_shared_with_cwf(self) -> None:
        app = run_app()
        app.switch_page("app_pages/language.py").run()
        app.selectbox(key="language").set_value("C").run()
        app.switch_page("app_pages/cwf.py").run()
        self.assertTrue(any("C (128 LOC/FP)" in info.value for info in app.info))
        self.assertEqual(app.dataframe[-1].value.iloc[0]["LOC"], "24,320")

    def test_function_point_example(self) -> None:
        app = run_app()
        app.switch_page("app_pages/cwf.py").run()
        row = app.dataframe[-1].value.iloc[0]
        self.assertEqual([row["CT"], row["Sum Fi"], row["VAF"], row["FP"], row["Rounded FP"], row["LOC"]], ["168", "48", "1.13", "189.84", "190", "2,280"])

    def test_safehome_example_loads(self) -> None:
        app = run_app()
        app.switch_page("app_pages/fp_count.py").run()
        app.button(key="fp_load_safehome").click().run()
        self.assertEqual(metric_values(app)["Count Total (CT)"], "50")
        app.switch_page("app_pages/cwf.py").run()
        self.assertEqual(app.dataframe[-1].value.iloc[0]["FP"], "55.5")

    def test_reset_all_restores_defaults(self) -> None:
        app = run_app()
        app.number_input(key="sloc_loc").set_value(1000.0).run()
        app.button(key="reset_all").click().run()
        self.assertEqual(app.number_input(key="sloc_loc").value, 33200.0)


class ChapterFourTests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = run_app()
        self.app.switch_page("app_pages/chapter4.py").run()

    def test_chapter4_is_active_not_a_preview(self) -> None:
        self.assertFalse(self.app.exception)
        html_values = [str(node.value) for node in self.app.get("html")]
        self.assertFalse(any("Coming soon" in value for value in html_values))
        self.assertEqual([tab.label for tab in self.app.tabs], ["Basic COCOMO", "Intermediate COCOMO", "Delphi"])

    def test_basic_cocomo_lecture_example(self) -> None:
        metrics = metric_values(self.app)
        self.assertEqual(metrics["Initial effort, Ei (person-months)"], "13.72")
        self.assertTrue(any("about 14 person-months" in info.value for info in self.app.info))

    def test_basic_cocomo_mode_change(self) -> None:
        self.app.radio(key="basic_mode").set_value("embedded").run()
        self.app.number_input(key="basic_kloc").set_value(10.0).run()
        self.assertEqual(metric_values(self.app)["Initial effort, Ei (person-months)"], "44.38")

    def test_intermediate_cocomo_insurance_example(self) -> None:
        metrics = metric_values(self.app)
        self.assertEqual(metrics["Adjusted effort, E (person-months)"], "15.61")
        self.assertTrue(any("15.5 person-months" in info.value for info in self.app.info))

    def test_intermediate_set_all_average(self) -> None:
        self.app.button(key="intermediate_set_average").click().run()
        self.assertEqual(metric_values(self.app)["Adjusted effort, E (person-months)"], "10.14")
        self.app.button(key="intermediate_load_example").click().run()
        self.assertEqual(metric_values(self.app)["Adjusted effort, E (person-months)"], "15.61")

    def test_delphi_lecture_summary(self) -> None:
        summary = self.app.dataframe[-1].value
        self.assertEqual(summary["Percentage of variance"].tolist(), ["25%", "40%"])
        self.assertEqual(summary["Accepted or not accepted (A/NA)"].tolist(), ["A, accepted", "NA, not accepted"])
        self.assertTrue(any("1 of 2 tasks accepted" in warning.value for warning in self.app.warning))

    def test_delphi_threshold_validation(self) -> None:
        self.app.number_input(key="delphi_threshold").set_value(150.0).run()
        self.assertIn("Acceptable variance must be 100 or less.", [error.value for error in self.app.error])
        self.app.number_input(key="delphi_threshold").set_value(40.0).run()
        self.assertTrue(any("All 2 tasks are accepted" in success.value for success in self.app.success))

    def test_duration_blocker_is_explained(self) -> None:
        self.assertTrue(any("Duration is not calculated" in caption.value for caption in self.app.caption))


class ThemeConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = tomllib.loads((APP_DIR / ".streamlit" / "config.toml").read_text(encoding="utf-8"))

    def test_light_is_base_and_both_variants_exist(self) -> None:
        theme = self.config["theme"]
        self.assertEqual(theme["base"], "light")
        for section in ("light", "dark"):
            self.assertIn(section, theme)
            self.assertIn("sidebar", theme[section])
            for option in ("primaryColor", "backgroundColor", "secondaryBackgroundColor", "textColor", "borderColor"):
                self.assertIn(option, theme[section], f"{section}.{option}")

    def test_theme_choice_is_available_to_viewers(self) -> None:
        self.assertEqual(self.config["client"]["toolbarMode"], "viewer")

    def test_bundled_fonts_exist_with_license(self) -> None:
        self.assertTrue(self.config["server"]["enableStaticServing"])
        for face in self.config["theme"]["fontFaces"]:
            self.assertTrue((APP_DIR / face["url"].removeprefix("app/")).is_file(), face["url"])
        self.assertTrue((APP_DIR / "static" / "fonts" / "licenses" / "IBM-Plex-OFL.txt").is_file())


if __name__ == "__main__":
    unittest.main()
