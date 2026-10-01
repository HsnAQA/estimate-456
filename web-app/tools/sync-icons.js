"use strict";

// Copies every SVG in assets/icons into the inline sprite in index.html.
// The page is opened directly from disk, where browsers block external SVG sprite
// references, so the icons must live inside the page. Run after changing an icon:
//   node tools/sync-icons.js
// tests/icons.test.js fails when the sprite and the icon files differ.

const fs = require("node:fs");
const path = require("node:path");

const ICON_DIR = path.resolve(__dirname, "..", "..", "assets", "icons");
const PAGE = path.resolve(__dirname, "..", "index.html");
const START = "<!-- icons:start (generated from assets/icons by tools/sync-icons.js) -->";
const END = "<!-- icons:end -->";

function buildSprite() {
  const symbols = fs
    .readdirSync(ICON_DIR)
    .filter((file) => file.endsWith(".svg"))
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(ICON_DIR, file), "utf8");
      const inner = source.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
      return `      <symbol id="i-${path.basename(file, ".svg")}" viewBox="0 0 24 24">${inner}</symbol>`;
    });
  return `${START}\n    <svg class="icon-sprite" aria-hidden="true" focusable="false">\n${symbols.join("\n")}\n    </svg>\n    ${END}`;
}

function currentSprite(html) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start < 0 || end < 0) throw new Error("Icon markers are missing from index.html");
  return html.slice(start, end + END.length);
}

module.exports = { buildSprite, currentSprite, PAGE };

if (require.main === module) {
  const html = fs.readFileSync(PAGE, "utf8");
  fs.writeFileSync(PAGE, html.replace(currentSprite(html), buildSprite()), "utf8");
  console.log("Icon sprite updated.");
}
