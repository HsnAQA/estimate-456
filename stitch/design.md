# Estimate 456: Google Stitch Design Brief

## Product

Estimate 456 is a bilingual CPIT 456 course companion for software project estimation. It is a working calculator, not a marketing page and not a generic dashboard.

The information architecture must follow the source lecture exactly:

1. Part 1, Chapter 1: SLOC and Function Points.
2. Part 2, Chapter 4: FP planning, defect density, Basic and Intermediate COCOMO, and Delphi.

The web app also provides all eleven course tables and a result comparison page.

## Visual direction

- Main theme: snow white, not pure white. Page `#F4F6F9`, panels `#FCFCFD`, fields `#FDFDFE`.
- Typography: IBM Plex Sans and IBM Plex Sans Arabic, 16 px body text, 18 px controls, 32 px main result.
- Shape: 6 to 8 px radii, one-pixel borders, almost no shadows.
- Interaction color: blue only for links, focus, selected controls, and primary actions.
- Method colors: restrained identifiers for SLOC, FP, planning, defects, COCOMO, and Delphi.
- Do not use gradients, glass effects, glows, oversized marketing text, emoji, or decorative charts.
- Support desktop, tablet, and phone layouts in both LTR and RTL.

## Brand

Name: Estimate 456. Arabic: تقدير 456.

Logo: a simple geometric E with three colored data points inside a rounded snow-white square. The mark must remain legible at favicon size.

Footer: `Made by Hassan Asiri`, with a link to the public project repository.

## App shell

Use a fixed sidebar on desktop and a drawer on mobile. Group navigation as:

- Home
- Part 1, Chapter 1: SLOC, Function Points
- Part 2, Chapter 4: FP planning, Defect density, COCOMO, Delphi
- Reference: Course tables, Compare results

The top bar contains only breadcrumb, search, and compact mobile theme and language controls. Do not include a project-name field.

## Homepage

Create a clean course map, not a dashboard. Show:

- One short heading and one sentence.
- Two large part cards matching the lecture split.
- Part 1 links to SLOC and Function Points.
- Part 2 links to planning, quality, COCOMO, and Delphi.
- A three-step workflow: choose the lecture section, enter values, audit the worked solution.
- Supporting links for all eleven tables and result comparison.

## Calculator pattern

Every calculator must include:

1. A short title and source section.
2. Inputs with units and clear inline validation.
3. A result card with exact values and separately labelled lecture rounding.
4. A worked solution that substitutes the current inputs into each formula.
5. A lecture example loader.

Never show a derived number without explaining where it came from.

## Function Points requirements

The five measurement parameters each choose their own Simple, Average, or Complex weight. Do not use one shared complexity selection.

For each row show `count × selected weight = row total`, then show:

`CT = total 1 + total 2 + total 3 + total 4 + total 5`

For adjustment:

- Label every characteristic F1 through F14.
- Show the full question beside its F label.
- Allow ratings 0 through 5.
- Explain that Sum Fi is the sum of the fourteen selected ratings.
- Show the live equation, for example `ΣFi = F1(2) + F2(5) + ... + F14(4) = 48`.
- Show `VAF = 0.65 + 0.01 × Sum Fi`.
- Show `FP = CT × VAF`.

For conversion, use only the thirteen language values in the source table and show `rounded FP × LOC/FP = LOC`.

## Accuracy boundaries

- Preserve all eleven source tables.
- Basic COCOMO calculates effort only because the source does not provide development-time equations.
- Intermediate COCOMO accepts explicit multipliers because the source names cost-driver ratings but does not provide a numeric multiplier matrix.
- Show exact results and lecture-rounded results separately when the lecture rounds intermediate steps.
- Delphi uses `(maximum - minimum) / maximum × 100` and accepts a task at or below the threshold.

## Accessibility and responsive behavior

- Minimum 44 px touch targets.
- Visible keyboard focus.
- Semantic headings, labels, tables, and buttons.
- No horizontal overflow at 320, 375, 768, 1024, 1440, or 1920 px.
- Arabic uses RTL layout while formulas and numeric expressions stay LTR.
- Keep text contrast at WCAG AA or better.
