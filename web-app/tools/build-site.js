"use strict";

// Packages the web app for static hosting (Vercel) in ../../site.
// The app itself needs no build; this only copies the files a browser loads, so course
// materials, tests, and backups are never uploaded.
// css/styles.css loads fonts from ../../assets/fonts, which resolves to /assets/fonts at the site root.
// Run from web-app:  node tools/build-site.js
const fs = require("node:fs");
const path = require("node:path");

const webApp = path.resolve(__dirname, "..");
const root = path.resolve(webApp, "..");
const out = path.join(root, "site");

const PAGE_FILES = ["index.html"];
const CODE_DIRS = ["css", "js", "vendor"];
const FONT_FILES = ["FiraCode-Variable-latin.woff2", "Alexandria-Variable-arabic.woff2", "JosefinSans-VariableFont_wght.ttf"];
const FONT_LICENSES = ["FiraCode-OFL.txt", "Alexandria-OFL.txt", "JosefinSans-OFL.txt"];
const BRAND_FILES = ["estimate-456-mark.svg", "estimate-456-mark-32.png", "estimate-456-mark-180.png"];

// vercel.json at the repository root holds the headers and the build settings Vercel uses for
// Git deploys. The copy in site/ keeps only what a deploy from that folder needs.
const VERCEL = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
for (const key of ["$schema", "buildCommand", "outputDirectory", "framework"]) delete VERCEL[key];

// Keep the .vercel link folder (project binding) if the site was deployed before.
if (fs.existsSync(out)) {
  for (const entry of fs.readdirSync(out)) {
    if (entry !== ".vercel") fs.rmSync(path.join(out, entry), { recursive: true, force: true });
  }
}
fs.mkdirSync(path.join(out, "assets", "fonts", "licenses"), { recursive: true });
fs.mkdirSync(path.join(out, "assets", "brand"), { recursive: true });

for (const file of PAGE_FILES) fs.copyFileSync(path.join(webApp, file), path.join(out, file));
// css/, js/, and vendor/ (KaTeX and anime.js, both MIT) are copied whole.
for (const dir of CODE_DIRS) fs.cpSync(path.join(webApp, dir), path.join(out, dir), { recursive: true });
for (const file of FONT_FILES) fs.copyFileSync(path.join(root, "assets", "fonts", file), path.join(out, "assets", "fonts", file));
for (const file of BRAND_FILES) fs.copyFileSync(path.join(root, "assets", "brand", file), path.join(out, "assets", "brand", file));
// Vercel's dashboard and some browsers ask only for /favicon.ico.
fs.copyFileSync(path.join(root, "assets", "brand", "favicon.ico"), path.join(out, "favicon.ico"));
for (const file of FONT_LICENSES) fs.copyFileSync(path.join(root, "assets", "fonts", "licenses", file), path.join(out, "assets", "fonts", "licenses", file));
fs.writeFileSync(path.join(out, "vercel.json"), `${JSON.stringify(VERCEL, null, 2)}\n`);
// `vercel link` writes a token to .env.local; it must never be uploaded.
fs.writeFileSync(path.join(out, ".vercelignore"), ".env*\n.gitignore\n");

const count = PAGE_FILES.length + CODE_DIRS.length + FONT_FILES.length + BRAND_FILES.length + FONT_LICENSES.length + 3;
console.log(`Built ${count} files in ${path.relative(root, out) || "."}`);
