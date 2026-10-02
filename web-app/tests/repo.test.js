"use strict";

// Repository-wide checks: product naming, forbidden characters, footer links, logo files,
// and that course material and private files stay out of the published repository.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const ACTIVE = ["web-app", "streamlit-app", "assets", "shared", "docs", "README.md", "design.md", ".gitignore"];
const SKIP_DIRS = new Set(["node_modules", "__pycache__", ".pytest_cache", "fonts"]);
const TEXT = /\.(js|mjs|html|css|md|py|json|toml|txt|svg|bat)$|^\.gitignore$/;

function files(entry) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [full];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((d) => {
    if (d.isDirectory()) return SKIP_DIRS.has(d.name) ? [] : files(path.join(entry, d.name));
    return TEXT.test(d.name) ? [path.join(full, d.name)] : [];
  });
}

const active = ACTIVE.flatMap(files);
const html = fs.readFileSync(path.join(ROOT, "web-app", "index.html"), "utf8");

test("active files never use the retired product word", () => {
  const word = new RegExp(["stu", "dio"].join(""), "i");
  const hits = active.filter((f) => word.test(fs.readFileSync(f, "utf8")));
  assert.deepEqual(hits.map((f) => path.relative(ROOT, f)), []);
});

test("active files contain no U+2014 character", () => {
  const dash = String.fromCharCode(0x2014);
  const hits = active.filter((f) => fs.readFileSync(f, "utf8").includes(dash));
  assert.deepEqual(hits.map((f) => path.relative(ROOT, f)), []);
});

test("footer links to the real repository with a GitHub icon", () => {
  const foot = html.slice(html.indexOf('<footer class="site-foot">'), html.indexOf("</footer>"));
  assert.match(foot, /id="repoLink"[^>]*href="https:\/\/github\.com\/HsnAQA\/estimate-456"/);
  assert.match(foot, /<svg class="gh-mark"[^>]*viewBox="0 0 16 16"/);
  assert.match(foot, /Made by Hassan Asiri/);
  assert.doesNotMatch(foot, /href="#"/);
});

test("logo and favicon files exist", () => {
  ["estimate-456-mark.svg", "estimate-456-mark-32.png", "estimate-456-mark-180.png"].forEach((file) => {
    assert.ok(fs.existsSync(path.join(ROOT, "assets", "brand", file)), file);
    assert.ok(html.includes(`../assets/brand/${file}`), `index.html references ${file}`);
  });
});

test(".gitignore keeps lecture files, backups, environments, and secrets out of the repository", () => {
  const ignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8").split(/\r?\n/);
  ["source-materials/", "assets/fonts/private/", "CPIT456-FULL-TRANSFER-*/", "RARs/", "site/", ".venv*/", "tmp/", ".env", ".env.*", ".vercel/", "__pycache__/", "*.zip", "*.rar", "*.pdf", "*.docx"].forEach((rule) => {
    assert.ok(ignore.includes(rule), rule);
  });
});
