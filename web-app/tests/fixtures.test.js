"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const { loadFixtures, runFixtures } = require("./fixture_runner.js");

const fixtures = loadFixtures();
const results = runFixtures(fixtures);
const { relative, absolute } = fixtures.tolerance;

function assertClose(actual, expected, where) {
  if (typeof expected === "boolean") {
    assert.equal(actual, expected, where);
    return;
  }
  if (expected !== null && typeof expected === "object") {
    Object.entries(expected).forEach(([key, value]) => assertClose(actual[key], value, `${where}.${key}`));
    return;
  }
  const limit = Math.max(absolute, relative * Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= limit, `${where}: expected ${expected}, received ${actual}`);
}

fixtures.cases.forEach((item) => {
  test(`fixture ${item.id}`, () => {
    assertClose(results.cases[item.id], item.expected, item.id);
  });
});

test("fixture invalid inputs raise the shared messages", () => {
  fixtures.invalid.forEach((item) => {
    assert.equal(results.invalid[item.id], item.error, item.id);
  });
});

test("fixture display formatting", () => {
  fixtures.formatting.forEach((item, index) => {
    assert.equal(results.formatting[index], item.expected, `${item.kind} ${item.value}`);
  });
});

test("half-up rounding differs from banker's rounding on halves", () => {
  assert.equal(L.roundHalfUp(2.5), 3);
  assert.equal(L.roundHalfUp(0.5), 1);
  assert.equal(L.roundHalfUp(53.548387), 54);
});

test("field checks return recovery messages without throwing", () => {
  assert.equal(L.checkNumber("620", "Average productivity", { positive: true }), "");
  assert.equal(L.checkNumber("", "KLOC"), "KLOC must be a number.");
  assert.equal(L.checkNumber("abc", "KLOC"), "KLOC must be a number.");
  assert.equal(L.checkNumber(0, "Hours per working day", { positive: true }), "Hours per working day must be greater than 0.");
  assert.equal(L.checkInfluence(3), "");
  assert.equal(L.checkInfluence(2.5), "Each degree of influence must be a whole number from 0 to 5.");
});

test("multiplier typical range comes from the lecture", () => {
  assert.deepEqual([...L.MULTIPLIER_TYPICAL_RANGE], [0.9, 1.4]);
  assert.equal(L.multiplierOutsideTypicalRange(0.95), false);
  assert.equal(L.multiplierOutsideTypicalRange(1.5), true);
  assert.equal(L.multiplierOutsideTypicalRange(0.8), true);
});
