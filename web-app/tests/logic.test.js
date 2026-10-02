"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

test("SLOC lecture example", () => {
  const result = L.sloc(33200, 620, 6, 800);
  assert.ok(Math.abs(result.effort - 53.5483870968) < 1e-9);
  assert.ok(Math.abs(result.duration - 8.9247311828) < 1e-9);
  assert.ok(Math.abs(result.totalCost - 42838.7096774) < 1e-6);
});

test("Function Point SQL lecture example", () => {
  const counts = { inputs: 13, outputs: 10, inquiries: 3, files: 4, interfaces: 2 };
  const complexities = Object.fromEntries(Object.keys(counts).map((key) => [key, "average"]));
  const influences = [2, 5, 4, 5, 2, 3, 4, 2, 3, 4, 5, 2, 3, 4];
  const result = L.functionPoints(counts, complexities, influences, 12);
  assert.equal(result.ufp, 168);
  assert.equal(result.tdi, 48);
  assert.ok(Math.abs(result.fp - 189.84) < 1e-10);
  assert.equal(result.roundedFp, 190);
  assert.equal(result.locPlanning, 2280);
});

test("SafeHome example", () => {
  const counts = { inputs: 3, outputs: 2, inquiries: 2, files: 1, interfaces: 4 };
  const complexities = Object.fromEntries(Object.keys(counts).map((key) => [key, "simple"]));
  const influences = [4, 4, 3, 4, 3, 3, 3, 3, 4, 4, 4, 3, 3, 1];
  const result = L.functionPoints(counts, complexities, influences, 30);
  assert.equal(result.ufp, 50);
  assert.equal(result.tdi, 46);
  assert.ok(Math.abs(result.fp - 55.5) < 1e-10);
  assert.equal(result.roundedFp, 56);
});

test("FP planning examples", () => {
  const hours = L.fpHoursPlan(200, 10, 8, 20, 2, 800);
  assert.equal(hours.personHours, 2000);
  assert.equal(hours.personMonths, 12.5);
  assert.equal(hours.calendarMonths, 6.25);
  const productivity = L.fpProductivityPlan(375, 6.5, 1, 800);
  assert.ok(Math.abs(productivity.effort - 57.6923076923) < 1e-9);
});

test("COCOMO and Delphi examples", () => {
  const cocomo = L.cocomo(3, "organic", [1.2, 1.35, 0.95, 1]);
  assert.ok(Math.abs(cocomo.eaf - 1.539) < 1e-12);
  assert.equal(L.delphi(20, 15, 25).accepted, true);
  assert.equal(L.delphi(50, 30, 25).variance, 40);
  assert.equal(L.delphi(50, 30, 25).accepted, false);
});

test("Invalid inputs are rejected", () => {
  assert.throws(() => L.sloc(100, 0, 1, 800));
  assert.throws(() => L.delphi(10, 11, 25));
});
