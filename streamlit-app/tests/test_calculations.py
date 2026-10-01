from __future__ import annotations

import math
import unittest

from calculations import (
    COCOMO_MODES,
    calculate_advanced_cocomo,
    calculate_cocomo,
    calculate_delphi,
    calculate_fp_hours_plan,
    calculate_fp_productivity_plan,
    calculate_function_points,
    calculate_sloc,
)


class CalculationTests(unittest.TestCase):
    def test_sloc_lecture_example(self) -> None:
        result = calculate_sloc(33200, 620, 6, 800)
        self.assertAlmostEqual(result.effort_person_months, 53.5483870968)
        self.assertAlmostEqual(result.duration_months, 8.9247311828)
        self.assertAlmostEqual(result.total_cost, 42838.7096774)
        self.assertAlmostEqual(result.cost_per_loc, 1.2903225806)

    def test_fp_sql_lecture_example(self) -> None:
        counts = {"inputs": 13, "outputs": 10, "inquiries": 3, "files": 4, "interfaces": 2}
        complexities = {key: "average" for key in counts}
        influences = [2, 5, 4, 5, 2, 3, 4, 2, 3, 4, 5, 2, 3, 4]
        result = calculate_function_points(counts, complexities, influences, 12)
        self.assertEqual(result.unadjusted_fp, 168)
        self.assertEqual(result.total_degree_of_influence, 48)
        self.assertAlmostEqual(result.value_adjustment_factor, 1.13)
        self.assertAlmostEqual(result.adjusted_fp, 189.84)
        self.assertEqual(result.rounded_fp, 190)
        self.assertEqual(result.estimated_loc_planning, 2280)

    def test_fp_safehome_example(self) -> None:
        counts = {"inputs": 3, "outputs": 2, "inquiries": 2, "files": 1, "interfaces": 4}
        complexities = {key: "simple" for key in counts}
        influences = [4, 4, 3, 4, 3, 3, 3, 3, 4, 4, 4, 3, 3, 1]
        result = calculate_function_points(counts, complexities, influences, 30)
        self.assertEqual(result.unadjusted_fp, 50)
        self.assertEqual(result.total_degree_of_influence, 46)
        self.assertAlmostEqual(result.adjusted_fp, 55.5)
        self.assertEqual(result.rounded_fp, 56)

    def test_fp_hours_plan(self) -> None:
        result = calculate_fp_hours_plan(200, 10, 8, 20, 2, 800)
        self.assertEqual(result.person_hours, 2000)
        self.assertEqual(result.person_days, 250)
        self.assertEqual(result.person_months, 12.5)
        self.assertEqual(result.calendar_months, 6.25)
        self.assertEqual(result.total_cost, 10000)

    def test_fp_productivity_plan(self) -> None:
        result = calculate_fp_productivity_plan(375, 6.5, 1, 800)
        self.assertAlmostEqual(result.effort_person_months, 57.6923076923)
        self.assertAlmostEqual(result.cost_per_fp, 123.0769230769)
        self.assertAlmostEqual(result.total_cost, 46153.846153846)

    def test_cocomo_examples(self) -> None:
        basic = calculate_cocomo(4, "organic")
        self.assertAlmostEqual(basic.initial_effort_person_months, 3.2 * 4**1.05)
        intermediate = calculate_cocomo(3, "organic", [1.2, 1.35, 0.95, 1.0])
        self.assertAlmostEqual(intermediate.effort_adjustment_factor, 1.539)
        self.assertAlmostEqual(
            intermediate.adjusted_effort_person_months,
            (3.2 * 3**1.05) * 1.539,
        )

    def test_delphi_examples(self) -> None:
        accepted = calculate_delphi(20, 15, 25)
        rejected = calculate_delphi(50, 30, 25)
        self.assertEqual(accepted.variance_percent, 25)
        self.assertTrue(accepted.accepted)
        self.assertEqual(rejected.variance_percent, 40)
        self.assertFalse(rejected.accepted)

    def test_invalid_denominators_raise(self) -> None:
        with self.assertRaises(ValueError):
            calculate_sloc(100, 0, 1, 800)
        with self.assertRaises(ValueError):
            calculate_delphi(10, 11, 25)


class LectureWaysAndLevelsTests(unittest.TestCase):
    def test_sloc_way2(self) -> None:
        result = calculate_sloc(33200, 620, 6, 800)
        self.assertAlmostEqual(result.way2_cost, result.total_cost)
        self.assertEqual(result.rounded_cost_per_loc, 1.3)
        self.assertAlmostEqual(result.rounded_way2_cost, 43160)

    def test_advanced_cocomo_each_mode(self) -> None:
        phases = [{"share": 10, "eaf": 1.2}, {"share": 40, "eaf": 1.0}, {"share": 50, "eaf": 0.9}]
        for mode, (c, k) in COCOMO_MODES.items():
            result = calculate_advanced_cocomo(9, mode, phases, 100)
            ei = c * 9**k
            self.assertAlmostEqual(result.initial_effort_person_months, ei)
            self.assertAlmostEqual(result.total_effort_person_months, ei * 0.97)
            self.assertAlmostEqual(result.weighted_eaf, 0.97)

    def test_advanced_cocomo_validation(self) -> None:
        with self.assertRaisesRegex(ValueError, "add up to 100%"):
            calculate_advanced_cocomo(3, "organic", [{"share": 50, "eaf": 1}])
        with self.assertRaisesRegex(ValueError, "Add at least one phase"):
            calculate_advanced_cocomo(3, "organic", [])


if __name__ == "__main__":
    unittest.main()
