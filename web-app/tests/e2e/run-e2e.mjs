// End-to-end check of every web app function in headless Edge or Chrome, in English and Arabic.
// Run from web-app:  node tests/e2e/run-e2e.mjs
// The page is opened straight from disk, the same way launch.bat opens it.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch } from "./cdp.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
// E2E_URL tests a served copy, for example the deployed site. The default is the file on disk.
const PAGE = process.env.E2E_URL || pathToFileURL(path.resolve(here, "..", "..", "index.html")).href;
const H = `const $ = (s) => document.querySelector(s); const $$ = (s) => [...document.querySelectorAll(s)];
const setVal = (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
const txt = (s) => ($(s) || {}).innerText || "";
const ptxt = (s) => txt(s).replace(/[\u2066-\u2069]/g, "");
const click = (s) => $(s).click();
const pickRadio = (name, value) => { const r = $('input[name="' + name + '"][value="' + value + '"]'); r.checked = true; r.dispatchEvent(new Event("input", { bubbles: true })); };
const strong = (s) => txt(s + " .result-value strong");`;

const results = [];
function check(name, actual, expected) {
  const ok = expected instanceof RegExp ? expected.test(String(actual)) : typeof expected === "function" ? expected(actual) : actual === expected;
  results.push({ name, ok, actual, expected: String(expected) });
}

const b = await launch(Number(process.env.E2E_PORT || 9451));
const run = (expr) => b.eval(H + expr);
const url = (hash) => `${PAGE}${hash ? `#${hash}` : ""}`;
// openKeep loads the page with whatever the browser saved. open starts from the lecture
// examples by clearing the saved workspace first, so each check sees known inputs.
const openKeep = async (hash = "") => { await b.goto(url(hash)); };
const open = async (hash = "") => {
  await b.goto(url(hash));
  await b.eval(`localStorage.removeItem("cpit456-workspace")`);
  await b.goto(url(hash));
};
const toast = () => run(`$("#toast").hidden ? "" : txt("#toastText")`);

async function functional(lang) {
  const tag = `[${lang}]`;
  await b.viewport(1440, 900);
  await open("home");
  await run(`localStorage.clear(); localStorage.setItem("cpit456-lang", "${lang}")`);
  await open("home");
  check(`${tag} lang and dir`, await run(`document.documentElement.lang + " " + document.documentElement.dir`), lang === "ar" ? "ar rtl" : "en ltr");
  check(`${tag} light theme is the default`, await run(`document.documentElement.dataset.theme`), "light");
  check(`${tag} panels are not pure white`, await run(`getComputedStyle($(".panel")).backgroundColor`), (v) => v !== "rgb(255, 255, 255)");
  check(`${tag} page background is snow`, await run(`getComputedStyle(document.body).backgroundColor`), "rgb(245, 246, 248)");
  // Home: logo and name, one question, two parts, and only the chosen part's methods.
  const visibleCards = `$$(".method-card").filter((e) => e.getClientRects().length).length`;
  check(`${tag} logo appears once at the top, not repeated on the home page`, await run(`$$("#page-home img").length + " " + ($(".topbar-brand img").naturalWidth > 0) + " " + txt(".topbar-brand")`), lang === "ar" ? "0 true تقدير 456" : "0 true Estimate 456");
  check(`${tag} home title`, await run(`txt("#home-title")`), lang === "ar" ? "تقدير المشاريع البرمجية" : "Software project estimation");
  check(`${tag} home lead sentence`, await run(`txt(".home-head p")`), (v) => v.length > 20 && v.length < 160);
  check(`${tag} home offers exactly two parts`, await run(`$$(".part-option").length`), 2);
  check(`${tag} Part 1 is chosen first and shows SLOC and FP only`, await run(`$("#part-tab-1").getAttribute("aria-selected") + " " + ${visibleCards} + " " + $$("#part-panel-1 .method-card").map((a) => a.getAttribute("href")).join(",")`), "true 2 #sloc,#fp");
  await run(`click("#part-tab-2")`);
  check(`${tag} choosing Part 2 shows its six methods only`, await run(`$("#part-panel-1").hidden + " " + ${visibleCards} + " " + location.hash`), "true 6 #home/part2");
  check(`${tag} Part 2 lists every COCOMO level`, await run(`$$("#part-panel-2 .method-card").map((a) => a.getAttribute("href")).join(",")`), "#planning/hours,#defects,#cocomo/basic,#cocomo/intermediate,#cocomo/advanced,#delphi");
  check(`${tag} method cards show what they calculate and the main input`, await run(`$$("#part-panel-2 .method-card").every((c) => c.querySelectorAll("p").length === 2 && c.querySelectorAll("p")[0].innerText.trim() && c.querySelector(".method-input").innerText.trim())`), true);
  check(`${tag} home is not crowded: no tables or results`, await run(`$$("#page-home table, #page-home .result, #page-home .trace").length`), 0);
  check(`${tag} tables and comparison are secondary links`, await run(`$$(".home-secondary a").map((a) => a.getAttribute("href") + ":" + a.classList.contains("btn")).join(",")`), "#tables:false,#summary:false");
  await open("home/part2");
  check(`${tag} #home/part2 opens Part 2`, await run(`$("#part-tab-2").getAttribute("aria-selected")`), "true");

  // SLOC
  await open("sloc");
  check(`${tag} SLOC effort`, await run(`strong("#slocResult")`), "53.55");
  check(`${tag} SLOC facts`, await run(`txt("#slocResult")`), /42,838\.71[\s\S]*1\.29|1\.29[\s\S]*42,838\.71/);
  check(`${tag} SLOC trace substitution`, await run(`txt("#slocTrace .trace li:first-child .line")`), /33,200\s*÷\s*620\s*=\s*53\.55/);
  await run(`setVal($("#slocLoc"), "62000")`);
  check(`${tag} SLOC recalculates`, await run(`strong("#slocResult")`), "100");
  await run(`setVal($("#slocProductivity"), "0")`);
  check(`${tag} SLOC invalid message`, await run(`txt("#slocProductivity-error")`), lang === "ar" ? /أكبر من 0/ : "Average productivity must be greater than 0.");
  check(`${tag} SLOC invalid result`, await run(`$("#slocProductivity").getAttribute("aria-invalid") + " " + ($("#slocResult .result-empty") !== null)`), "true true");
  await run(`click("#loadSlocExample")`);
  check(`${tag} SLOC lecture example restores`, await run(`strong("#slocResult")`), "53.55");
  check(`${tag} SLOC shows Way 1 and Way 2`, await run(`$$("#slocTrace .trace > li").length`), 6);
  check(`${tag} SLOC Way 2 cost`, await run(`txt("#slocTrace .trace > li:nth-child(5)")`), /43,160[\s\S]*33,200[\s\S]*\$1\.29[\s\S]*\$42,838\.71/);
  check(`${tag} SLOC Way 2 effort`, await run(`txt("#slocTrace .trace > li:nth-child(6) .line")`), /42,838\.71[\s\S]*800[\s\S]*53\.55/);

  // Function Points
  await open("fp");
  check(`${tag} FP result`, await run(`strong("#fpResult")`), "189.84");
  check(`${tag} FP count total`, await run(`txt("#fpCountTotal")`), "168");
  check(`${tag} FP 13 languages`, await run(`$$("#languageTiles .lang").length`), 13);
  check(`${tag} FP 14 questions`, await run(`$$("#gscRows .rating").length`), 14);
  check(`${tag} FP explains each Fi value`, await run(`txt("#fiEquation")`), /F1\(2\)[\s\S]*F14\(4\)[\s\S]*48/);
  check(`${tag} FP explains count times weight`, await run(`txt("#fp-total-inputs")`), /13\s*×\s*4\s*=\s*52/);
  check(`${tag} FP every row has its own weight`, await run(`["inputs", "outputs", "inquiries", "files", "interfaces"].map((k) => txt("#fp-total-" + k)).join(" | ")`), /13 × 4 = 52 \| 10 × 5 = 50 \| 3 × 4 = 12 \| 4 × 10 = 40 \| 2 × 7 = 14/);
  check(`${tag} FP shows one step at a time`, await run(`[$("#fpCountCard").hidden, $("#fpAdjustCard").hidden, $("#fpConvertCard").hidden].join(" ")`), "false true true");
  await run(`$("#fpCountCard .step-nav .btn-primary").click()`);
  check(`${tag} FP next step opens F1 to F14`, await run(`[$("#fpCountCard").hidden, $("#fpAdjustCard").hidden, location.hash].join(" ")`), "true false #fp/adjust");
  check(`${tag} FP shows F1 to F14 with their meaning`, await run(`$$("#gscRows .rating-q b").map((b) => b.innerText).join(",") + " " + ptxt("#gsc-pick-0")`), new RegExp("^F1,F2,F3,F4,F5,F6,F7,F8,F9,F10,F11,F12,F13,F14 F1 = 2"));
  check(`${tag} FP LOC step names the language and Table 1`, await run(`ptxt("#fpTrace .trace > li:nth-child(4) .formula")`), /SQL\/Oracle = 12/);
  check(`${tag} FP SafeHome note hidden for Example 1`, await run(`$("#fpExampleNote").hidden`), true);
  await run(`pickRadio("fp-inputs", "complex")`);
  check(`${tag} FP complexity changes CT`, await run(`txt("#fpCountTotal")`), "194");
  await run(`pickRadio("gsc-0", "5")`);
  check(`${tag} FP rating changes Sum Fi`, await run(`txt("#gscTotal")`), "51");
  await run(`pickRadio("language", "C")`);
  check(`${tag} FP language changes LOC`, await run(`txt("#fpResult") + " " + txt("#stepConvert")`), /28,800 LOC[\s\S]*128 LOC\/FP/);
  await run(`click("#loadSafeHome")`);
  check(`${tag} FP SafeHome says the F split is not from the lecture`, await run(`$("#fpExampleNote").hidden + " " + strong("#fpResult")`), "false 55.5");
  await run(`click("#loadFpExample")`);
  await run(`pickRadio("fp-inputs", "complex"); pickRadio("gsc-0", "5"); pickRadio("language", "C")`);
  await run(`setVal($("#fp-count-files"), "-1")`);
  check(`${tag} FP invalid count`, await run(`txt("#fp-count-files-error")`), (v) => v.length > 5);
  await run(`click("#loadSafeHome")`);
  check(`${tag} FP SafeHome`, await run(`strong("#fpResult")`), "55.5");
  await run(`click("#loadFpExample")`);
  check(`${tag} FP Example 1`, await run(`strong("#fpResult") + " " + txt("#stepConvert")`), /189\.84 .*12/);
  await run(`click("#useFpInPlanning")`);
  await b.sleep(250);
  check(`${tag} FP result sent to planning`, await run(`location.hash + " " + $("#hoursFp").value`), "#planning/hours 190");
  check(`${tag} FP sent toast`, await toast(), /190/);

  // FP planning
  await open("planning");
  check(`${tag} hours effort`, await run(`strong("#hoursResult")`), "12.5");
  check(`${tag} hours duration`, await run(`txt("#hoursResult")`), /6\.25/);
  await run(`click("#tab-productivity")`);
  check(`${tag} productivity tab shows`, await run(`$("#panel-productivity").hidden + " " + strong("#productivityResult")`), "false $46,153.85");
  await run(`$("#tab-productivity").focus()`);
  await b.key(lang === "ar" ? "ArrowLeft" : "ArrowRight", lang === "ar" ? "ArrowLeft" : "ArrowRight", lang === "ar" ? 37 : 39);
  check(`${tag} tab keyboard follows reading direction`, await run(`document.activeElement.id`), "tab-hours");

  // Defect density
  await open("defects");
  check(`${tag} defects best`, await run(`strong("#defectResult")`), "0.04");
  await run(`click("#addDefectProject")`);
  check(`${tag} defects add row`, await run(`$$("#defectRows tr").length`), 4);
  await run(`setVal($("#defect-count-3"), "1")`);
  check(`${tag} defects new best`, await run(`strong("#defectResult")`), "0.01");
  await run(`setVal($("#defect-fp-3"), "0")`);
  check(`${tag} defects invalid size`, await run(`txt("#defect-fp-3-error")`), (v) => v.length > 5);
  await run(`$$(".remove-defect")[3].click()`);
  check(`${tag} defects remove row`, await run(`$$("#defectRows tr").length + " " + strong("#defectResult")`), "3 0.04");

  // COCOMO
  await open("cocomo/basic");
  check(`${tag} basic COCOMO`, await run(`strong("#basicResult")`), "13.72");
  await run(`pickRadio("cocomoMode", "embedded")`);
  check(`${tag} basic COCOMO embedded`, await run(`strong("#basicResult")`), "14.78");
  await run(`click("#loadBasicExample")`);
  check(`${tag} basic lecture example`, await run(`strong("#basicResult")`), "13.72");
  await open("cocomo/intermediate");
  check(`${tag} intermediate COCOMO`, await run(`strong("#intermediateResult")`), "15.61");
  check(`${tag} intermediate EAF`, await run(`txt("#intermediateResult")`), /1\.539/);
  check(`${tag} 15 cost drivers`, await run(`$$("#driverGroups .driver").length`), 15);
  await run(`const s = $("#driver-rating-2"); s.value = "Average"; s.dispatchEvent(new Event("input", { bubbles: true }))`);
  check(`${tag} Average resets multiplier`, await run(`$("#driver-mult-2").value`), "1.00");
  await run(`setVal($("#driver-mult-3"), "1.6")`);
  check(`${tag} range warning`, await run(`txt("#driver-mult-3-warn")`), (v) => v.length > 5);
  await run(`setVal($("#driver-mult-3"), "0")`);
  check(`${tag} invalid multiplier`, await run(`txt("#driver-mult-3-error") && ($("#intermediateResult .result-empty") !== null)`), true);
  await run(`click("#resetDrivers")`);
  check(`${tag} set all to Average`, await run(`strong("#intermediateResult")`), "10.14");
  await run(`pickRadio("intermediateMode", "semi-detached")`);
  check(`${tag} intermediate mode change`, await run(`strong("#intermediateResult")`), (v) => v !== "10.14");
  await run(`click("#loadCocomoExample")`);
  check(`${tag} insurance example`, await run(`strong("#intermediateResult")`), "15.61");
  check(`${tag} intermediate shows C and K`, await run(`ptxt("#intermediateTrace .trace > li:first-child .line")`), /C = 3\.2[\s\S]*K = 1\.05/);
  check(`${tag} intermediate EAF names every driver used`, await run(`txt("#intermediateTrace .trace > li:nth-child(3) .line")`), /SPC[\s\S]*1\.2[\s\S]*ETC[\s\S]*1\.35[\s\S]*AC[\s\S]*0\.95[\s\S]*=[\s\S]*1\.539/);
  check(`${tag} every COCOMO tab explains the missing duration equations`, await run(`$$("#page-cocomo .note").filter((n) => n.innerText.includes("(D)")).length`), 3);
  await open("cocomo/basic");
  check(`${tag} basic compares all three modes`, await run(`$$("#basicResult .compare tbody tr").map((r) => r.lastElementChild.innerText).join(" ")`), "13.72 14.78 14.17");
  await open("cocomo/advanced");
  check(`${tag} Advanced COCOMO tab opens`, await run(`$("#tab-advanced").getAttribute("aria-selected") + " " + $("#panel-advanced").hidden`), "true false");
  check(`${tag} Advanced placeholders equal Ei`, await run(`strong("#advancedResult")`), "10.14");
  check(`${tag} Advanced trace has one step per phase`, await run(`$$("#advancedTrace .trace > li").length`), 8);
  await run(`setVal($("#phase-eaf-0"), "1.2"); setVal($("#phase-eaf-3"), "0.9")`);
  check(`${tag} Advanced phase EAF changes E`, await run(`strong("#advancedResult")`), "10.4");
  await run(`pickRadio("advancedMode", "embedded")`);
  check(`${tag} Advanced embedded mode`, await run(`ptxt("#advancedTrace .trace > li:first-child .line")`), /C = 2\.8[\s\S]*K = 1\.20/);
  await run(`setVal($("#phase-share-1"), "30")`);
  check(`${tag} Advanced shares must add up to 100`, await run(`$("#phaseTotal").classList.contains("is-error") + " " + ($("#advancedResult .result-empty") !== null)`), "true true");
  await run(`setVal($("#phase-share-1"), "25"); setVal($("#phase-eaf-2"), "0")`);
  check(`${tag} Advanced invalid phase EAF`, await run(`$("#phase-eaf-2").getAttribute("aria-invalid") + " " + (txt("#phase-eaf-2-error").length > 5)`), "true true");
  await run(`setVal($("#phase-eaf-2"), "1")`);
  await run(`click("#addPhase")`);
  check(`${tag} Advanced add phase`, await run(`$$("#phaseRows .phase").length`), 5);
  await run(`$$(".remove-phase")[4].click()`);
  check(`${tag} Advanced remove phase`, await run(`$$("#phaseRows .phase").length + " " + ($("#advancedResult .result-empty") === null)`), "4 true");
  await run(`click("#advUseIntermediate")`);
  check(`${tag} Advanced with the Intermediate EAF equals Intermediate E`, await run(`strong("#advancedResult")`), "15.61");

  // Delphi
  await open("delphi");
  check(`${tag} Delphi statuses`, await run(`$$("#delphiRows .delphi-variance").map((c) => c.innerText).join(" ")`), "25% 40%");
  check(`${tag} Delphi A and NA`, await run(`$$("#delphiRows .badge.ok").length + " " + $$("#delphiRows .badge.no").length`), "1 1");
  check(`${tag} Delphi trace`, await run(`txt("#delphiTrace .line")`), /50[\s\S]*30[\s\S]*40%/);
  await run(`setVal($("#delphiThreshold"), "40")`);
  check(`${tag} Delphi all accepted`, await run(`$$("#delphiRows .badge.ok").length + " " + ($("#delphiBanner .banner.ok") !== null)`), "2 true");
  await run(`setVal($("#delphiThreshold"), "150")`);
  check(`${tag} Delphi threshold limit`, await run(`txt("#delphiThreshold-error")`), (v) => v.length > 5);
  await run(`setVal($("#delphiThreshold"), "25")`);
  await run(`click("#addDelphiTask")`);
  check(`${tag} Delphi add task waits`, await run(`$$("#delphiRows tr").length + " " + $$("#delphiRows .badge.wait").length`), "3 1");
  await run(`setVal($("#delphi-max-2"), "10"); setVal($("#delphi-min-2"), "8")`);
  check(`${tag} Delphi new task`, await run(`$$("#delphiRows .delphi-variance")[2].innerText`), "20%");
  await run(`setVal($("#delphi-min-2"), "12")`);
  check(`${tag} Delphi min above max`, await run(`txt("#delphi-min-2-error")`), (v) => v.length > 5);
  await run(`$$(".remove-delphi")[2].click()`);
  check(`${tag} Delphi remove task`, await run(`$$("#delphiRows tr").length`), 2);
  await run(`$$("#delphiRows tr")[0].querySelector(".delphi-variance").click()`);
  check(`${tag} Delphi select row`, await run(`txt("#delphiTrace .line")`), /20[\s\S]*15[\s\S]*25%/);
  check(`${tag} Delphi eight steps`, await run(`$$("#delphiSteps li").length`), 8);

  // Summary
  await open("summary");
  check(`${tag} summary chart bars`, await run(`$$("#summaryChart .bar").length`), 6);
  check(`${tag} summary rows`, await run(`$$("#summaryRows tr").length`), 7);
  await run(`window.__csv = null; const make = URL.createObjectURL; URL.createObjectURL = (blob) => { window.__csv = blob; return make.call(URL, blob); }`);
  await run(`click("#downloadCsv")`);
  check(`${tag} CSV download toast`, await toast(), (v) => v.length > 3);
  const csv = await run(`window.__csv ? window.__csv.text() : ""`);
  check(`${tag} CSV has 7 data rows and a header`, csv.split(String.fromCharCode(13, 10)).length, 8);
  check(`${tag} CSV has no bidi isolate marks`, [...csv].some((c) => c.charCodeAt(0) >= 0x2066 && c.charCodeAt(0) <= 0x2069), false);
  if (lang === "ar") {
    check(`${tag} Arabic result isolates inserted values`, await run(`[...txt("#summaryRows")].some((c) => c.charCodeAt(0) === 0x2068)`), true);
  }
  await run(`click("#copySummary")`);
  await b.sleep(200);
  check(`${tag} copy summary toast`, await toast(), (v) => v.length > 3);

  // Course tables
  await open("tables");
  check(`${tag} library lists 11`, await run(`$$("#tableCards .table-item").length`), 11);
  await run(`click('[data-filter="cocomo"]')`);
  check(`${tag} library filter`, await run(`$$("#tableCards .table-item").length`), 3);
  await run(`click('[data-filter="all"]'); setVal($("#tableSearch"), "11")`);
  check(`${tag} library search`, await run(`$$("#tableCards .table-item").length`), 1);
  await run(`setVal($("#tableSearch"), ""); $$("#tableCards .table-item")[3].click()`);
  check(`${tag} library opens table 4`, await run(`$$("#tablePanel tbody tr").length`), 14);
  for (let n = 1; n <= 11; n++) {
    await open(`tables/${n}`);
    check(`${tag} table ${n} renders`, await run(`$$("#tablePanel table").length > 0`), true);
  }

  // Search, aliases, project name, reset, theme
  await open("home");
  await run(`const s = $("#searchInput"); s.focus(); setVal(s, "9")`);
  check(`${tag} search finds table 9`, await run(`$$("#searchResults a").some((a) => a.getAttribute("href") === "#tables/9")`), true);
  for (const [alias, page] of [["advanced", "cocomo"], ["cwf", "fp"], ["quality", "planning"], ["reference", "tables"], ["language", "fp"]]) {
    await open(alias);
    check(`${tag} alias #${alias}`, await run(`$(".page:not([hidden])").dataset.page`), page);
  }
  await open("home");
  check(`${tag} top bar has no project field`, await run(`$("#projectName") === null && $(".project-field") === null`), true);

  await open("sloc");
  await run(`setVal($("#slocLoc"), "1000"); click("#resetAll")`);
  check(`${tag} reset to lecture examples`, await run(`strong("#slocResult")`), "53.55");
  check(`${tag} reset offers undo`, await run(`!$("#toastAction").hidden && txt("#toastAction").length > 1`), true);
  await run(`click("#toastAction")`);
  check(`${tag} undo restores the previous values`, await run(`$("#slocLoc").value + " " + strong("#slocResult")`), "1000 1.61");
  check(`${tag} undo confirms`, await toast(), (v) => v.length > 3);
  await run(`click('[data-theme-choice="dark"]')`);
  await open("sloc");
  check(`${tag} dark theme persists`, await run(`document.documentElement.dataset.theme + " " + getComputedStyle(document.body).backgroundColor`), "dark rgb(17, 20, 24)");
  await run(`click('[data-theme-choice="light"]')`);
  await open("sloc");
  check(`${tag} language persists after reload`, await run(`document.documentElement.lang`), lang);
}

async function languageSwitchKeepsValues() {
  await open("sloc");
  await run(`localStorage.clear()`);
  await open("sloc");
  await run(`setVal($("#slocLoc"), "40000")`);
  await run(`click('[data-lang-choice="ar"]')`);
  check("[switch] Arabic applied live", await run(`document.documentElement.dir + " " + txt("#sloc-title")`), /^rtl .+/);
  check("[switch] values kept after switching", await run(`$("#slocLoc").value + " " + strong("#slocResult")`), "40000 64.52");
  await open("fp");
  await run(`pickRadio("fp-inputs", "complex")`);
  await run(`click('[data-lang-choice="en"]')`);
  check("[switch] FP selection kept after switching", await run(`$('input[name="fp-inputs"]:checked').value + " " + txt("#fpCountTotal")`), "complex 194");
}

async function productFeatures() {
  await b.viewport(1440, 900);
  await open("sloc");
  await run(`localStorage.setItem("cpit456-lang", "en"); localStorage.setItem("cpit456-theme", "light")`);
  await open("sloc");

  // Inputs are saved in the browser and come back after a reload.
  await run(`setVal($("#slocLoc"), "40000")`);
  await b.sleep(400);
  await openKeep("fp");
  await run(`pickRadio("fp-inputs", "complex")`);
  await run(`click("#addDelphiTask")`);
  // Saving is debounced by 250 ms; wait for it so the check does not race the reload.
  await b.sleep(400);
  await openKeep("sloc");
  check("[product] SLOC input kept after reload", await run(`$("#slocLoc").value + " " + strong("#slocResult")`), "40000 64.52");
  await openKeep("fp");
  check("[product] FP choice kept after reload", await run(`txt("#fpCountTotal")`), "194");
  await openKeep("delphi");
  check("[product] added Delphi task kept after reload", await run(`$$("#delphiRows tr").length`), 3);
  check("[product] saved data holds inputs, not results", await run(`const w = JSON.parse(localStorage.getItem("cpit456-workspace")); w.v === 2 && !("latest" in w) && w.fields.slocLoc === "40000"`), true);

  // A damaged saved workspace falls back to the lecture examples.
  await run(`localStorage.setItem("cpit456-workspace", "{not json")`);
  await openKeep("sloc");
  check("[product] damaged save falls back to lecture values", await run(`$("#slocLoc").value + " " + strong("#slocResult")`), "33200 53.55");
  await run(`localStorage.setItem("cpit456-workspace", JSON.stringify({ v: 1, fields: { slocLoc: "5" }, fp: {} }))`);
  await openKeep("sloc");
  check("[product] incomplete save is ignored", await run(`$("#slocLoc").value`), "33200");

  // Unknown addresses open the overview with a notice.
  await open("no-such-page");
  check("[product] unknown address goes to overview", await run(`location.hash + " " + $(".page:not([hidden])").dataset.page`), "#home home");
  check("[product] unknown address notice", await toast(), /does not exist/);

  // Toast closes by button and by itself.
  await run(`click("#toastClose")`);
  check("[product] toast closes", await run(`$("#toast").hidden`), true);

  // Browser toolbar color follows the theme.
  check("[product] theme-color light", await run(`$('meta[name="theme-color"]').content`), "#fcfcfd");
  await run(`click('[data-theme-choice="dark"]')`);
  check("[product] theme-color dark", await run(`$('meta[name="theme-color"]').content`), "#171b21");
  await run(`click('[data-theme-choice="light"]')`);

  // Method identity colors: navigation icons, page icons, result edges, and chart bars.
  check("[product] SLOC nav icon uses the SLOC color", await run(`getComputedStyle($('.nav a[data-page="sloc"] .icon')).color`), "rgb(98, 71, 196)");
  check("[product] every calculator page has a heading icon", await run(`$$(".page .page-head .page-icon").length`), 8);
  await open("fp");
  check("[product] result panels have no colored edge", await run(`getComputedStyle($("#fpResult")).borderTopWidth`), "1px");
  check("[product] Alexandria, JetBrains Mono, and Saudi are loaded", await run(`(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")).sort().filter((v, i, a) => a.indexOf(v) === i).join(","); })()`), "Alexandria,JetBrains Mono,Saudi");
  await open("summary");
  check("[product] summary bars use method colors", await run(`new Set($$("#summaryChart .bar-fill").map((e) => getComputedStyle(e).backgroundColor)).size`), 3);

  // Footer and a changed result highlight.
  check("[product] footer shows logo, product, author, repository, and course", await run(`($(".foot-brand img").naturalWidth > 0) + " " + txt(".site-foot")`), /^true Estimate 456[\s\S]*Made by Hassan Asiri[\s\S]*github\.com\/HsnAQA\/estimate-456[\s\S]*CPIT 456/);
  check("[product] footer has a visible GitHub icon", await run(`const r = $("#repoLink .gh-mark").getBoundingClientRect(); r.width >= 16 && r.height >= 16 && $("#repoLink .gh-mark path").getAttribute("d").length > 100`), true);
  check("[product] footer has no link to the site itself", await run(`$("#siteLink") === null && $$(".site-foot a").every((a) => a.getAttribute("href").startsWith("#") || a.getAttribute("href").startsWith("https://github.com/"))`), true);
  check("[product] footer links to the public repository", await run(`$("#repoLink").href + " " + $("#repoLink").target + " " + $("#repoLink").rel`), "https://github.com/HsnAQA/estimate-456 _blank noopener noreferrer");
  await open("sloc");
  await run(`setVal($("#slocLoc"), "34000")`);
  check("[product] no flash or tap highlight on click", await run(`getComputedStyle($("#slocResult .result-value strong")).animationName + " " + getComputedStyle($("#loadSlocExample")).webkitTapHighlightColor`), "none rgba(0, 0, 0, 0)");

  // Touch targets are at least 44 px tall on a phone.
  await b.viewport(375, 812);
  for (const page of ["home", "home/part2", "sloc", "fp", "fp/adjust", "planning", "cocomo", "cocomo/intermediate", "cocomo/advanced", "delphi", "defects", "summary", "tables"]) {
    await open(page);
    const small = await run(`JSON.stringify($$(".topbar button, .topbar input, main button, main select, main input:not([type=radio]):not([type=checkbox]), main .seg label, main a.btn").filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").filter((e) => e.getBoundingClientRect().height < 43.5).map((e) => (e.id || e.className || e.tagName) + ":" + Math.round(e.getBoundingClientRect().height)).slice(0, 5))`);
    check(`[product] 375 ${page} touch targets at least 44 px`, small, "[]");
  }
  await b.viewport(1440, 900);
}

async function layout() {
  const pages = ["home", "home/part2", "sloc", "fp", "fp/adjust", "planning", "cocomo", "cocomo/advanced", "delphi", "defects", "summary", "tables"];
  for (const lang of ["en", "ar"]) {
    for (const theme of ["light", "dark"]) {
      await open("home");
      await run(`localStorage.setItem("cpit456-lang", "${lang}"); localStorage.setItem("cpit456-theme", "${theme}")`);
      for (const width of [1920, 1440, 1024, 768, 375, 320]) {
        await b.viewport(width, width <= 375 ? 740 : 900);
        for (const page of pages) {
          await open(page);
          const overflow = await run(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
          check(`[layout] ${lang} ${theme} ${width} ${page} no horizontal overflow`, overflow, 0);
        }
      }
    }
  }
  await b.viewport(375, 812);
  await open("home");
  await run(`localStorage.setItem("cpit456-lang", "ar"); localStorage.setItem("cpit456-theme", "light")`);
  await open("sloc");
  await run(`click("#openNav")`);
  await b.sleep(300);
  check("[layout] Arabic drawer opens on the right", await run(`Math.round($("#sidebar").getBoundingClientRect().right) === document.documentElement.clientWidth && document.body.classList.contains("nav-open")`), true);
  await b.key("Escape", "Escape", 27);
  await b.sleep(300);
  check("[layout] drawer closes with Escape", await run(`document.body.classList.contains("nav-open") + " " + document.activeElement.id`), "false openNav");
}

try {
  await functional("en");
  await functional("ar");
  await languageSwitchKeepsValues();
  await productFeatures();
  await layout();
  check("[console] no errors or warnings", b.logs.length, 0);
} catch (error) {
  results.push({ name: "run finished without an exception", ok: false, actual: String(error.stack || error), expected: "no exception" });
} finally {
  await b.close();
}

const failed = results.filter((r) => !r.ok);
failed.forEach((r) => console.log(`FAIL ${r.name}\n  expected: ${r.expected}\n  actual:   ${r.actual}`));
if (b.logs.length) console.log(`Console:\n  ${b.logs.join("\n  ")}`);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
