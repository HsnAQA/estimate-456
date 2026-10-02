"use strict";

// Packages the web app for static hosting (Vercel) in ../../site.
// The app itself needs no build; this only copies the files a browser loads, so the
// Streamlit app, course materials, tests, and backups are never uploaded.
// styles.css loads fonts from ../assets/fonts, which resolves to /assets/fonts at the site root.
// Run from web-app:  node tools/build-site.js
const fs = require("node:fs");
const path = require("node:path");

const webApp = path.resolve(__dirname, "..");
const root = path.resolve(webApp, "..");
const out = path.join(root, "site");

const PAGE_FILES = ["index.html", "styles.css", "theme.js", "logic.js", "data.js", "i18n.js", "ui.js", "app.js"];
const FONT_FILES = ["FiraCode-Variable-latin.woff2", "Alexandria-Variable-arabic.woff2"];
// Licensed for websites but not for sharing the file, so it is not in git. Copied only when present on this machine.
const PRIVATE_FONTS = ["Saudi-Regular.ttf", "Saudi-Bold.ttf", "TheYearofHandicrafts-Bold.otf", "TheYearofHandicrafts-Black.otf"];
const BRAND_FILES = ["estimate-456-mark.svg", "estimate-456-mark-32.png", "estimate-456-mark-180.png"];

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Chart bar widths are set with style attributes.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const VERCEL = {
  cleanUrls: true,
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: CSP },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    {
      source: "/assets/fonts/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/assets/fonts/private/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
};

// Keep the .vercel link folder (project binding) if the site was deployed before.
if (fs.existsSync(out)) {
  for (const entry of fs.readdirSync(out)) {
    if (entry !== ".vercel") fs.rmSync(path.join(out, entry), { recursive: true, force: true });
  }
}
fs.mkdirSync(path.join(out, "assets", "fonts", "licenses"), { recursive: true });
fs.mkdirSync(path.join(out, "assets", "brand"), { recursive: true });

for (const file of PAGE_FILES) fs.copyFileSync(path.join(webApp, file), path.join(out, file));
for (const file of FONT_FILES) fs.copyFileSync(path.join(root, "assets", "fonts", file), path.join(out, "assets", "fonts", file));
const privateDir = path.join(root, "assets", "fonts", "private");
const privateFonts = PRIVATE_FONTS.filter((file) => fs.existsSync(path.join(privateDir, file)));
if (privateFonts.length) fs.mkdirSync(path.join(out, "assets", "fonts", "private"), { recursive: true });
for (const file of privateFonts) fs.copyFileSync(path.join(privateDir, file), path.join(out, "assets", "fonts", "private", file));
for (const file of BRAND_FILES) fs.copyFileSync(path.join(root, "assets", "brand", file), path.join(out, "assets", "brand", file));
for (const file of ["FiraCode-OFL.txt", "Alexandria-OFL.txt"]) fs.copyFileSync(path.join(root, "assets", "fonts", "licenses", file), path.join(out, "assets", "fonts", "licenses", file));
fs.writeFileSync(path.join(out, "vercel.json"), `${JSON.stringify(VERCEL, null, 2)}\n`);
// `vercel link` writes a token to .env.local; it must never be uploaded.
fs.writeFileSync(path.join(out, ".vercelignore"), ".env*\n.gitignore\n");

const count = PAGE_FILES.length + FONT_FILES.length + BRAND_FILES.length + privateFonts.length + 4;
console.log(`Built ${count} files in ${path.relative(root, out) || "."}`);
