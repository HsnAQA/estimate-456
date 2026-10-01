"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { buildSprite, currentSprite, PAGE } = require("../tools/sync-icons.js");

// Line endings can differ between editors on Windows, so compare text only.
const normalize = (text) => text.replace(/\r\n/g, "\n");

test("inline icon sprite matches assets/icons", () => {
  const html = fs.readFileSync(PAGE, "utf8");
  assert.equal(normalize(currentSprite(html)), normalize(buildSprite()), "Run: node tools/sync-icons.js");
});

test("every icon used in index.html exists in the sprite", () => {
  const html = fs.readFileSync(PAGE, "utf8");
  const defined = new Set([...html.matchAll(/<symbol id="(i-[a-z-]+)"/g)].map((m) => m[1]));
  const used = new Set([...html.matchAll(/href="#(i-[a-z-]+)"/g)].map((m) => m[1]));
  used.forEach((id) => assert.ok(defined.has(id), `${id} is used but not defined`));
});
