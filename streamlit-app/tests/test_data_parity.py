from __future__ import annotations

import json
import shutil
import subprocess
import unittest

import calculations
import ui_data
from fixture_support import ROOT


DATA_JS = ROOT / "web-app" / "data.js"
LOGIC_JS = ROOT / "web-app" / "logic.js"
SCRIPT = (
    "const D = require(process.argv[1]); const L = require(process.argv[2]);"
    "process.stdout.write(JSON.stringify({D, L: {FP_WEIGHTS: L.FP_WEIGHTS, FP_LABELS: L.FP_LABELS, LOC_PER_FP: L.LOC_PER_FP,"
    " COCOMO_MODES: L.COCOMO_MODES, COCOMO_MODE_LABELS: L.COCOMO_MODE_LABELS, GSC_NAMES: L.GSC_NAMES,"
    " COCOMO_DRIVER_NAMES: L.COCOMO_DRIVER_NAMES, DRIVER_RATINGS: L.DRIVER_RATINGS,"
    " MULTIPLIER_TYPICAL_RANGE: L.MULTIPLIER_TYPICAL_RANGE, AVERAGE_MULTIPLIER: L.AVERAGE_MULTIPLIER}}));"
)


@unittest.skipIf(shutil.which("node") is None, "Node.js is required for the data parity test")
class CourseDataParityTests(unittest.TestCase):
    """Both implementations must present the same course tables, labels, and examples."""

    @classmethod
    def setUpClass(cls) -> None:
        completed = subprocess.run(
            ["node", "-e", SCRIPT, str(DATA_JS), str(LOGIC_JS)],
            capture_output=True, text=True, encoding="utf-8", check=True, timeout=60,
        )
        data = json.loads(completed.stdout)
        cls.js_data = data["D"]
        cls.js_logic = data["L"]

    def test_reference_tables_match(self) -> None:
        self.assertEqual(self.js_data["FP_PARAMETERS"], [list(item) for item in ui_data.FP_PARAMETERS])
        self.assertEqual(self.js_data["GSC_QUESTIONS"], ui_data.GSC_QUESTIONS)
        self.assertEqual(self.js_data["RATING_SCALE"], ui_data.RATING_SCALE)
        self.assertEqual(self.js_data["CHARACTERISTICS"], [list(item) for item in ui_data.CHARACTERISTICS])
        self.assertEqual(self.js_data["EXAMPLE_GSC_NAMES"], ui_data.EXAMPLE_GSC_NAMES)
        self.assertEqual(self.js_data["EXAMPLE_GSC_VALUES"], ui_data.EXAMPLE_GSC_VALUES)
        self.assertEqual(self.js_data["DELPHI_STEPS"], ui_data.DELPHI_STEPS)

    def test_examples_and_lecture_notes_match(self) -> None:
        self.assertEqual(self.js_data["EXAMPLES"], ui_data.EXAMPLES)
        self.assertEqual(self.js_data["LECTURE_ROUNDED"], ui_data.LECTURE_ROUNDED)

    def test_calculation_constants_match(self) -> None:
        self.assertEqual(self.js_logic["FP_WEIGHTS"], calculations.FP_WEIGHTS)
        self.assertEqual(self.js_logic["FP_LABELS"], calculations.FP_LABELS)
        self.assertEqual(self.js_logic["LOC_PER_FP"], calculations.LOC_PER_FP)
        self.assertEqual(self.js_logic["COCOMO_MODES"], {k: list(v) for k, v in calculations.COCOMO_MODES.items()})
        self.assertEqual(self.js_logic["COCOMO_MODE_LABELS"], calculations.COCOMO_MODE_LABELS)
        self.assertEqual(self.js_logic["GSC_NAMES"], calculations.GSC_NAMES)
        self.assertEqual(self.js_logic["COCOMO_DRIVER_NAMES"], calculations.COCOMO_DRIVER_NAMES)
        self.assertEqual(self.js_logic["DRIVER_RATINGS"], calculations.DRIVER_RATINGS)
        self.assertEqual(self.js_logic["MULTIPLIER_TYPICAL_RANGE"], list(calculations.MULTIPLIER_TYPICAL_RANGE))
        self.assertEqual(self.js_logic["AVERAGE_MULTIPLIER"], calculations.AVERAGE_MULTIPLIER)


if __name__ == "__main__":
    unittest.main()
