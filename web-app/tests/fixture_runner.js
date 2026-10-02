"use strict";

// Runs every shared fixture through logic.js and returns plain JSON results.
// Used by fixtures.test.js and by the Python parity test, which executes:
//   node web-app/tests/fixture_runner.js
// and compares this output with calculations.py for the same fixture file.

const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

const FIXTURE_PATH = path.resolve(__dirname, "..", "..", "shared", "fixtures", "calculations.json");

const CALCULATIONS = {
  sloc: (i) => L.sloc(i.loc, i.productivity, i.developers, i.laborRate),
  functionPoints: (i) => L.functionPoints(i.counts, i.complexities, i.influences, i.locPerFp),
  fpHoursPlan: (i) => L.fpHoursPlan(i.fp, i.hoursPerFp, i.hoursPerDay, i.workDays, i.developers, i.laborRate),
  fpProductivityPlan: (i) => L.fpProductivityPlan(i.fp, i.productivity, i.developers, i.laborRate),
  defectDensity: (i) => ({ density: L.defectDensity(i.defects, i.fp) }),
  cocomo: (i) => L.cocomo(i.kloc, i.mode, i.multipliers, i.laborRate),
  advancedCocomo: (i) => L.advancedCocomo(i.kloc, i.mode, i.phases, i.laborRate),
  delphi: (i) => L.delphi(i.maximum, i.minimum, i.threshold),
};

function loadFixtures() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function runFixtures(fixtures = loadFixtures()) {
  const cases = {};
  fixtures.cases.forEach((item) => {
    cases[item.id] = CALCULATIONS[item.calc](item.input);
  });
  const invalid = {};
  fixtures.invalid.forEach((item) => {
    try {
      CALCULATIONS[item.calc](item.input);
      invalid[item.id] = null;
    } catch (error) {
      invalid[item.id] = error.message;
    }
  });
  const formatting = fixtures.formatting.map((item) =>
    item.kind === "money" ? L.formatMoney(item.value) : L.formatNumber(item.value, item.digits),
  );
  return { cases, invalid, formatting };
}

module.exports = { FIXTURE_PATH, CALCULATIONS, loadFixtures, runFixtures };

if (require.main === module) {
  process.stdout.write(JSON.stringify(runFixtures()));
}
