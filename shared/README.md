# Shared calculation fixtures

`fixtures/calculations.json` is the single set of test cases used by both implementations.

| Section | Count | Contents |
|---|---:|---|
| `cases` | 25 | Lecture examples, independent cases, and edge cases for SLOC (both ways), Function Points, hours per FP, FP productivity, defect density, Basic COCOMO and Intermediate COCOMO in all three modes, Advanced COCOMO in all three modes, and Delphi |
| `invalid` | 21 | Invalid inputs and the exact error message both implementations must raise |
| `formatting` | 9 | Display formatting for numbers and money |

Expected values were computed once from the lecture formulas at full double precision, independently of `web-app/logic.js` and `streamlit-app/calculations.py`. The optional `lecture` fields record the rounded values printed in `456-solution-Lect1-2.pdf`. They are display references, not test targets.

Input and output names follow `web-app/logic.js` (camelCase). `streamlit-app/tests/fixture_support.py` maps them to the Python result fields.

## Who reads this file

- `web-app/tests/fixtures.test.js` runs every case through `logic.js`.
- `streamlit-app/tests/test_fixtures.py` runs every case through `calculations.py`.
- The same Python test runs `node web-app/tests/fixture_runner.js` and compares the JavaScript output with the Python output for every case, message, and formatted value. It is skipped only when Node.js is not installed.

## Tolerance

Numbers match when the difference is at most `1e-9` or `1e-9` times the expected value, whichever is larger. This covers the last-digit differences that `x ** k` can produce between JavaScript and Python.

## Adding a case

1. Add the case with its inputs and expected values, computed from the lecture formula rather than from either implementation.
2. Run both test suites. Both must pass without code changes, or both implementations must be fixed together.
