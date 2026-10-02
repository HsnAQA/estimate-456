# Calculation fixtures

`fixtures/calculations.json` holds the test cases every calculation must pass.

| Section | Count | Contents |
|---|---:|---|
| `cases` | 25 | Lecture examples, independent cases, and edge cases for SLOC (both ways), Function Points, hours per FP, FP productivity, defect density, Basic COCOMO and Intermediate COCOMO in all three modes, Advanced COCOMO in all three modes, and Delphi |
| `invalid` | 21 | Invalid inputs and the exact error message the app must show |
| `formatting` | 9 | Display formatting for numbers and money |

Expected values were computed once from the lecture formulas at full double precision, independently of `web-app/js/logic.js`. The optional `lecture` fields record the rounded values printed in the lecture. They are display references, not test targets.

`web-app/tests/fixtures.test.js` runs every case through `logic.js`. Numbers match when the difference is at most `1e-9` or `1e-9` times the expected value, whichever is larger.

## Adding a case

1. Add the case with its inputs and expected values, computed from the lecture formula rather than from the app.
2. Run `node --test "tests/*.test.js"` in `web-app`.
