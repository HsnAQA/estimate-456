# Formula traceability

Source: `456-solution-Lect1-2.pdf` (14 pages). The lecture file itself is course material and is not stored in this repository. Every constant used by the applications is listed here with the page it comes from. When the lecture names a concept but prints no value, the applications ask the user for that value and say so on screen.

Web locations are hash routes in `web-app/index.html`. Streamlit locations are pages in `streamlit-app/app_pages/`. Tests: `web-app/tests/*.test.js` (JS), `streamlit-app/tests/*.py` (PY), and `shared/fixtures/calculations.json` (shared by both).

## Part 1. Chapter 1

| Page | Item | Inputs | Constants | Formula | Exact result | Lecture result | Web | Streamlit | Test |
|---|---|---|---|---|---|---|---|---|---|
| 1 | SLOC example, Way 1 | 33,200 LOC, 620 LOC/PM, 6 developers, $800/PM | none | Effort = LOC / Productivity. Duration = Effort / Developers. Cost = Effort x Rate | 53.55 PM, 8.92 months, $42,838.71 | 53.54 then 54 PM, 9 months, $43,200 | `#sloc` | `sloc.py` | JS fixtures `sloc-lecture`, PY `test_sloc_lecture_example` |
| 1 to 2 | SLOC example, Way 2 | same | none | Cost per LOC = Rate / Productivity. Cost = LOC x Cost per LOC. Effort = Cost / Rate | $1.29 per LOC, $42,838.71, 53.55 PM | $1.29 then $1.3, $43,160 then $43,200, 54 PM | `#sloc` (Way 2 steps) | `sloc.py` (Way 2 table) | JS `cocomo.test.js` SLOC Way 2, PY `test_sloc_way2`, e2e SLOC Way 2 |
| 2 | LOC from FP | FP, AVC | Table 1 | LOC = AVC x FP | depends on input | 190 x 12 = 2,280 | `#fp` step 4 | `fp_count.py` | fixtures `fp-example1` |
| 3 | Table 1. Programming Language LOC/FP | language | 13 values, Assembly 320 to Graphical 4 | lookup | n/a | n/a | `#fp` Convert, `#tables/1` | `language.py` | PY `test_data_parity` |
| 3 | FP formula and Table 2 weights | five counts, one complexity per row | Inputs 3/4/6, Outputs 4/5/7, Inquiries 3/4/6, Files 7/10/15, Interfaces 5/7/10 | Row total = Count x Weight. CT = sum of five totals. FP = CT x (0.65 + 0.01 x Sum Fi) | depends on input | n/a | `#fp` Count | `fp_count.py` | JS `functionPoints`, PY parity |
| 4 | Table 3. CWF questions F1 to F14 | 14 scores 0 to 5 | scale 0 No influence to 5 Critical | Sum Fi = F1 + ... + F14 | depends on input | n/a | `#fp` Adjust (live Sum Fi equation) | `cwf.py` | e2e F1 to F14 checks |
| 5 | Table 4. General System Characteristics | none | 14 names and descriptions | reference | n/a | n/a | `#tables/4` | `characteristics.py` | PY page test |
| 5 | Example 1, Table 5 | counts 13, 10, 3, 4, 2, all Average | Table 2 Average column | 13x4 + 10x5 + 3x4 + 4x10 + 2x7 | CT 168 | 168 | `#fp` Load Example 1, `#tables/5` | `examples.py` | fixtures `fp-example1` |
| 6 | Example 1, Table 6 | 2,5,4,5,2,3,4,2,3,4,5,2,3,4 | none | Sum Fi, VAF, FP, LOC | Sum Fi 48, VAF 1.13, FP 189.84, 2,280 LOC | 48, 189.84 then 190, 2,280 | `#fp`, `#tables/6` | `examples.py` | fixtures `fp-example1` |
| 6 to 7 | SafeHome example | 3, 2, 2, 1, 4, all Simple, Sum Fi 46 | Table 2 Simple column | CT = 3x3 + 2x4 + 2x3 + 1x7 + 4x5. FP = 50 x (0.65 + 0.46) | CT 50, FP 55.5 | 50, 55.50 then 56 | `#fp` Load SafeHome | `examples.py` | fixtures `fp-safehome` |

Notes for Part 1:

- The lecture lists On-line Data Entry as item 6 and Transaction Rate as item 7 on page 5, but swaps them in the Example 1 table on page 6. Both orders are kept exactly where they appear.
- The SafeHome example gives only the total Sum Fi = 46. It does not give F1 to F14 or a language. The applications load one split that adds up to 46 and say on screen that the split and the language are example choices, not lecture values.

## Part 2. Chapter 4

| Page | Item | Inputs | Constants | Formula | Exact result | Lecture result | Web | Streamlit | Test |
|---|---|---|---|---|---|---|---|---|---|
| 7 | FP for initial estimation | 200 FP, 10 h/FP, 8 h/day, 20 days/month, 2 developers | none | Hours = FP x h/FP. Days = Hours / 8. PM = Days / 20. Duration = PM / developers | 2,000 h, 250 days, 12.5 PM, 6.25 months | same | `#planning/hours` | `planning.py` | fixtures `hours-lecture` |
| 7 to 8 | FP-based estimation | 375 FP, 6.5 FP/PM, $800 | none | Cost per FP = Rate / Productivity. Cost = FP x Cost per FP. Effort = Cost / Rate | $123.08, $46,153.85, 57.69 PM | $123, $46,100, 57.62 then 58 PM | `#planning/productivity` | `planning.py` | fixtures `productivity-lecture` |
| 8 | Table 7. Defect density | defects, FP per project | none | Density = Defects / FP | 0.0667, 0.10, 0.04 | 0.067, 0.10, 0.04 | `#defects` | `planning.py` | fixtures `defect-project1` to `defect-project3` |
| 8 to 9 | COCOMO levels | none | Basic, Intermediate, Advanced | n/a | n/a | n/a | `#cocomo` three tabs | `chapter4.py` three COCOMO tabs | e2e Advanced COCOMO tab, PY tab list |
| 9 | Table 8. COCOMO Constants, Basic COCOMO | KLOC, mode | Organic 3.2 / 1.05, Embedded 2.8 / 1.20, Semi-detached 3.0 / 1.12 | Ei = C x KLOC^K | 4 KLOC organic: 13.72 PM | 3.2 x 4.28, about 14 PM | `#cocomo/basic` | `chapter4.py` Basic | fixtures `cocomo-basic-*`, JS `cocomo.test.js` per mode, PY `test_basic_compares_all_three_modes` |
| 9, article | Development time Tdev and staff | E from any COCOMO level, mode | c = 2.5; d = 0.38 organic, 0.35 semi-detached, 0.32 embedded (COCOMO article read in class, GeeksforGeeks) | Tdev = c x E^d. Staff = E / Tdev | 4 KLOC organic: E 13.72, Tdev 6.76 months, staff 2.03 | lecture names D but does not print it; article checks: E 10.289 gives 6.062, E 1295 gives about 38 | every COCOMO tab | `chapter4.py` every COCOMO tab | JS `cocomo.test.js` Tdev, fixtures `cocomo-*` duration and staff, e2e Tdev |
| 10 to 11 | Intermediate COCOMO, Tables 9 and 10 | KLOC, mode, 15 drivers with rating and multiplier | rating names only. Typical range 0.9 to 1.4. Average = 1.0 | EAF = product of multipliers. E = EAF x Ei | 3 KLOC organic, SPC 1.2, ETC 1.35, AC 0.95, MPP 1.0: Ei 10.14, EAF 1.539, E 15.61 PM | 10.11, 1.53, 15.5 PM | `#cocomo/intermediate` | `chapter4.py` Intermediate | fixtures `cocomo-intermediate-*`, JS `cocomo.test.js` per mode |
| 11 to 12 | Advanced COCOMO | KLOC, mode, phases with share and phase EAF | none printed | Uses the intermediate steps, with cost drivers assigned to each phase. Phase effort = Ei x Share x Phase EAF. E = sum of phase efforts | depends on input | no example | `#cocomo/advanced` | `chapter4.py` Advanced | fixtures `cocomo-advanced-*`, JS `cocomo.test.js` per mode, PY `test_advanced_each_mode`, e2e Advanced checks |
| 12 to 13 | Table 11. Delphi summary | max, min, threshold | 25% example threshold | Variance = (Max - Min) / Max x 100. Accepted when variance <= threshold | 25% A, 40% NA | 25 A, 40 NA | `#delphi` | `chapter4.py` Delphi | fixtures `delphi-cost-benefit`, `delphi-high-level-design` |

Notes for Part 2:

- The lecture uses its own Basic COCOMO constants (organic 3.2, embedded 2.8, semi-detached 3.0). These differ from other published COCOMO tables. The applications use the lecture values only.
- Page 9 says each mode has an Effort (E) and Development time (D) equation, but the equations are not printed. The COCOMO article read in class on 2026-10-01 prints them: Tdev = 2.5 x E^d with d = 0.38, 0.35, 0.32. The apps use these and name the source on every COCOMO tab.
- The article's Basic table uses C = 2.4, 3.0, 3.6. The lecture's Table 8 uses 3.2, 3.0, 2.8, which equal the article's Intermediate table. The apps follow the lecture and the Course notes page explains the difference.
- Table 9 has rating columns but no multiplier values. Multipliers are user inputs. The Table 10 example values are loaded as the default.
- Advanced COCOMO is described in one paragraph with no phase list, phase split, or phase multipliers. The calculator therefore asks for every phase share and phase EAF. Its default phases (Analysis, Design, Coding, Testing at 25% each with EAF 1.00) are neutral placeholders and are labeled as such, so the default total equals Ei.
- The Delphi variance formula is not printed. `(Max - Min) / Max x 100` is the only formula that reproduces both printed rows (25% and 40%).
- Chapter 26 slides mention COCOMO II and the Software Equation without constants. They are outside the solution file and are not implemented.
