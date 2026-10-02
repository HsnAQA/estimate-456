"use strict";

// Every COCOMO level and mode the lecture defines, each checked as its own case.
// Expected values are written out from the formulas, not taken from logic.js.

const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

const close = (actual, expected, where) => assert.ok(Math.abs(actual - expected) < 1e-9, `${where}: expected ${expected}, received ${actual}`);

// Table 8, page 9 of the lecture.
const TABLE_8 = { organic: [3.2, 1.05], embedded: [2.8, 1.2], "semi-detached": [3.0, 1.12] };

test("Table 8 constants match the lecture exactly", () => {
  assert.deepEqual(Object.keys(L.COCOMO_MODES), Object.keys(TABLE_8));
  Object.entries(TABLE_8).forEach(([mode, ck]) => assert.deepEqual([...L.COCOMO_MODES[mode]], ck, mode));
});

Object.entries(TABLE_8).forEach(([mode, [c, k]]) => {
  test(`Basic COCOMO ${mode}: Ei = ${c} x KLOC^${k}`, () => {
    [1, 4, 7.5, 32].forEach((kloc) => {
      const r = L.cocomo(kloc, mode, [], 1000);
      close(r.initialEffort, c * Math.pow(kloc, k), `${mode} ${kloc} KLOC`);
      close(r.eaf, 1, `${mode} EAF`);
      close(r.totalCost, c * Math.pow(kloc, k) * 1000, `${mode} cost`);
    });
  });

  test(`Intermediate COCOMO ${mode}: E = EAF x Ei`, () => {
    const multipliers = [1.15, 0.91, 1.3];
    const r = L.cocomo(6, mode, multipliers, 0);
    const ei = c * Math.pow(6, k);
    close(r.eaf, 1.15 * 0.91 * 1.3, `${mode} EAF`);
    close(r.adjustedEffort, ei * 1.15 * 0.91 * 1.3, `${mode} E`);
  });

  test(`Advanced COCOMO ${mode}: E = sum of Ei x share x phase EAF`, () => {
    const phases = [{ share: 10, eaf: 1.2 }, { share: 40, eaf: 1 }, { share: 50, eaf: 0.9 }];
    const r = L.advancedCocomo(9, mode, phases, 100);
    const ei = c * Math.pow(9, k);
    close(r.initialEffort, ei, `${mode} Ei`);
    close(r.phases[0].effort, ei * 0.1 * 1.2, `${mode} phase 1`);
    close(r.phases[1].effort, ei * 0.4 * 1, `${mode} phase 2`);
    close(r.phases[2].effort, ei * 0.5 * 0.9, `${mode} phase 3`);
    close(r.totalEffort, ei * (0.12 + 0.4 + 0.45), `${mode} E`);
    close(r.weightedEaf, 0.97, `${mode} weighted EAF`);
    close(r.totalCost, ei * 0.97 * 100, `${mode} cost`);
  });
});

test("Basic COCOMO lecture example: 4 KLOC organic is about 14 person-months", () => {
  const r = L.cocomo(4, "organic");
  close(Math.pow(4, 1.05), Math.pow(4, 1.05), "power");
  assert.equal(L.roundHalfUp(Math.pow(4, 1.05), 2), 4.29);
  assert.equal(L.roundHalfUp(r.initialEffort), 14);
});

test("Intermediate COCOMO lecture example (Table 10) gives 15.61 exact and 15.5 in the lecture", () => {
  const r = L.cocomo(3, "organic", [1.2, 1.35, 0.95, 1.0]);
  assert.equal(L.roundHalfUp(r.eaf, 3), 1.539);
  assert.equal(L.roundHalfUp(r.initialEffort, 2), 10.14);
  assert.equal(L.roundHalfUp(r.adjustedEffort, 2), 15.61);
  // The lecture rounds 3^1.05 to 3.16 and EAF to 1.53 before multiplying.
  assert.equal(L.roundHalfUp(1.53 * 3.2 * 3.16, 1), 15.5);
});

test("Advanced COCOMO placeholder phases equal Ei, so nothing is invented", () => {
  const phases = [25, 25, 25, 25].map((share) => ({ share, eaf: 1 }));
  const r = L.advancedCocomo(3, "organic", phases);
  close(r.totalEffort, r.initialEffort, "neutral total");
});

test("Advanced COCOMO validates shares and phase EAF", () => {
  assert.throws(() => L.advancedCocomo(3, "organic", []), /Add at least one phase/);
  assert.throws(() => L.advancedCocomo(3, "organic", [{ share: 50, eaf: 1 }]), /add up to 100%. They add up to 50%/);
  assert.throws(() => L.advancedCocomo(3, "organic", [{ share: 100, eaf: 0 }]), /Phase EAF must be greater than 0/);
  assert.throws(() => L.advancedCocomo(3, "unknown", [{ share: 100, eaf: 1 }]), /Unknown COCOMO project type/);
  assert.doesNotThrow(() => L.advancedCocomo(3, "organic", [{ share: 33.3, eaf: 1 }, { share: 33.3, eaf: 1 }, { share: 33.4, eaf: 1 }]));
});

test("SLOC Way 2 follows the lecture: $1.3 per LOC gives $43,160", () => {
  const r = L.sloc(33200, 620, 6, 800);
  close(r.costPerLoc, 800 / 620, "cost per LOC");
  close(r.way2Cost, 33200 * (800 / 620), "Way 2 exact cost");
  close(r.way2Cost, r.totalCost, "both ways agree exactly");
  assert.equal(r.roundedCostPerLoc, 1.3);
  close(r.roundedWay2Cost, 43160, "Way 2 lecture cost");
});

test("Development time follows the COCOMO article: Tdev = 2.5 x E^d", () => {
  const d = { organic: 0.38, "semi-detached": 0.35, embedded: 0.32 };
  Object.entries(d).forEach(([mode, exp]) => {
    const r = L.cocomo(10, mode, [1.1]);
    close(r.duration, 2.5 * Math.pow(r.adjustedEffort, exp), `${mode} Tdev`);
    close(r.staff, r.adjustedEffort / r.duration, `${mode} staff`);
  });
  // The article's own check values: E = 10.289 PM gives Tdev = 6.062 months, and E = 1295 gives about 38.
  assert.equal(L.roundHalfUp(2.5 * Math.pow(10.289, 0.38), 3), 6.062);
  assert.equal(L.roundHalfUp(2.5 * Math.pow(1295, 0.38)), 38);
  const a = L.advancedCocomo(3, "organic", [{ share: 100, eaf: 1 }]);
  close(a.duration, 2.5 * Math.pow(a.totalEffort, 0.38), "Advanced Tdev");
});
