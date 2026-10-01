from __future__ import annotations

import json
import shutil
import subprocess
import unittest

from calculations import (
    MULTIPLIER_TYPICAL_RANGE,
    check_influence,
    check_number,
    multiplier_outside_typical_range,
    round_half_up,
)
from fixture_support import JS_RUNNER, assert_close, load_fixtures, run_fixtures


FIXTURES = load_fixtures()
RESULTS = run_fixtures(FIXTURES)


class SharedFixtureTests(unittest.TestCase):
    def test_every_case_matches_expected_values(self) -> None:
        for item in FIXTURES["cases"]:
            with self.subTest(item["id"]):
                assert_close(self, RESULTS["cases"][item["id"]], item["expected"], item["id"], FIXTURES["tolerance"])

    def test_invalid_inputs_raise_shared_messages(self) -> None:
        for item in FIXTURES["invalid"]:
            with self.subTest(item["id"]):
                self.assertEqual(RESULTS["invalid"][item["id"]], item["error"])

    def test_display_formatting(self) -> None:
        for item, actual in zip(FIXTURES["formatting"], RESULTS["formatting"], strict=True):
            with self.subTest(f"{item['kind']} {item['value']}"):
                self.assertEqual(actual, item["expected"])

    def test_half_up_rounding_differs_from_bankers_rounding(self) -> None:
        self.assertEqual(round(2.5), 2)
        self.assertEqual(round_half_up(2.5), 3)
        self.assertEqual(round_half_up(0.5), 1)

    def test_field_checks_return_recovery_messages(self) -> None:
        self.assertEqual(check_number("620", "Average productivity", positive=True), "")
        self.assertEqual(check_number("", "KLOC"), "KLOC must be a number.")
        self.assertEqual(check_number("abc", "KLOC"), "KLOC must be a number.")
        self.assertEqual(check_number(float("nan"), "KLOC"), "KLOC must be a number.")
        self.assertEqual(check_influence(3), "")
        self.assertEqual(check_influence(2.5), "Each degree of influence must be a whole number from 0 to 5.")

    def test_multiplier_typical_range_comes_from_the_lecture(self) -> None:
        self.assertEqual(MULTIPLIER_TYPICAL_RANGE, (0.9, 1.4))
        self.assertFalse(multiplier_outside_typical_range(0.95))
        self.assertTrue(multiplier_outside_typical_range(1.5))


@unittest.skipIf(shutil.which("node") is None, "Node.js is required for the cross-implementation parity test")
class CrossImplementationParityTests(unittest.TestCase):
    """Runs logic.js on the same fixture file and compares it with calculations.py."""

    @classmethod
    def setUpClass(cls) -> None:
        completed = subprocess.run(
            ["node", str(JS_RUNNER)], capture_output=True, text=True, encoding="utf-8", check=True, timeout=60
        )
        cls.js = json.loads(completed.stdout)

    def test_numeric_results_match_javascript(self) -> None:
        for item in FIXTURES["cases"]:
            with self.subTest(item["id"]):
                assert_close(self, RESULTS["cases"][item["id"]], self.js["cases"][item["id"]], item["id"], FIXTURES["tolerance"])

    def test_error_messages_match_javascript(self) -> None:
        self.assertEqual(RESULTS["invalid"], self.js["invalid"])

    def test_formatting_matches_javascript(self) -> None:
        self.assertEqual(RESULTS["formatting"], self.js["formatting"])


if __name__ == "__main__":
    unittest.main()
