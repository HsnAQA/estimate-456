"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const I = require("../js/i18n.js");
const D = require("../js/data.js");
const L = require("../js/logic.js");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const app = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");
const ui = fs.readFileSync(path.join(__dirname, "..", "js", "ui.js"), "utf8");
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("every string has English and Arabic text with the same placeholders", () => {
  Object.entries(I.STRINGS).forEach(([key, pair]) => {
    assert.equal(pair.length, 2, key);
    assert.ok(pair[0].trim() && pair[1].trim(), `${key} has an empty translation`);
    assert.deepEqual(placeholders(pair[1]), placeholders(pair[0]), `${key} placeholders differ`);
  });
});

test("every key used in index.html exists", () => {
  const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  [...html.matchAll(/data-i18n-attr="([^"]+)"/g)].forEach((m) => m[1].split(";").forEach((pair) => keys.push(pair.split(":")[1].trim())));
  [...html.matchAll(/data-title="([^"]+)"/g)].forEach((m) => keys.push(m[1]));
  keys.forEach((key) => assert.ok(I.STRINGS[key], `index.html uses missing key ${key}`));
});

test("every literal key used in app.js and ui.js exists", () => {
  const source = app + ui;
  const keys = [...source.matchAll(/\bt\("([a-zA-Z0-9.]+)"/g)].map((m) => m[1]);
  keys.push(...[...source.matchAll(/\["field\.[a-zA-Z]+"/g)].map((m) => m[0].slice(2, -1)));
  keys.forEach((key) => assert.ok(I.STRINGS[key], `missing key ${key}`));
});

test("Arabic course data matches the English course data", () => {
  const ar = I.COURSE_AR;
  assert.equal(ar.gscQuestions.length, D.GSC_QUESTIONS.length);
  assert.deepEqual(Object.keys(ar.characteristics).sort(), D.CHARACTERISTICS.map(([name]) => name).sort());
  assert.equal(ar.ratingScale.length, D.RATING_SCALE.length);
  assert.deepEqual(Object.keys(ar.fpLabels).sort(), D.FP_PARAMETERS.map(([key]) => key).sort());
  Object.keys(ar.languages).forEach((name) => assert.ok(name in L.LOC_PER_FP, name));
  assert.deepEqual(Object.keys(ar.modeLabels).sort(), Object.keys(L.COCOMO_MODES).sort());
  assert.equal(ar.drivers.length, L.COCOMO_DRIVER_NAMES.length);
  assert.deepEqual(Object.keys(ar.ratings).sort(), [...L.DRIVER_RATINGS].sort());
  assert.equal(ar.driverGroups.length, D.DRIVER_GROUPS.length);
  assert.equal(ar.delphiSteps.length, D.DELPHI_STEPS.length);
  assert.equal(ar.tableTitles.length, 11);
  assert.equal(ar.tableNotes.length, 11);
  D.EXAMPLES.delphi.tasks.forEach((x) => assert.ok(ar.tasks[x.task], x.task));
});

test("English validation messages match logic.js", () => {
  I.setLang("en");
  [["", {}], ["-1", {}], ["0", { positive: true }], ["1.5", { integer: true }], ["101", { max: 100 }]].forEach(([value, rule]) => {
    const issue = L.numberIssue(value, rule);
    assert.equal(I.t(`err.${issue.code}`, { label: "Labor rate", max: issue.max }), L.checkNumber(value, "Labor rate", rule));
  });
});

test("t() switches language and fills placeholders", () => {
  I.setLang("ar");
  const isolated = I.t("common.table", { n: 8 });
  assert.equal(isolated, `الجدول ${String.fromCharCode(0x2068)}8${String.fromCharCode(0x2069)}`, "Arabic values are isolated");
  assert.equal(I.plain(isolated), "الجدول 8", "plain() removes the isolate marks");
  assert.equal(I.course.task("High level design"), "التصميم عالي المستوى");
  I.setLang("en");
  assert.equal(I.t("common.table", { n: 8 }), "Table 8");
  assert.throws(() => I.t("missing.key"));
});

test("no U+2014 character in strings", () => {
  const all = JSON.stringify(I.STRINGS) + JSON.stringify(I.COURSE_AR);
  assert.ok(!all.includes(String.fromCharCode(0x2014)));
});
