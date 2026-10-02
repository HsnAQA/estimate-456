(function () {
  "use strict";

  // Estimate 456 interface. Calculations: logic.js. Course data: data.js.
  // Strings: i18n.js. Shared helpers: ui.js.
  const L = window.EstimatorLogic;
  const D = window.CourseData;
  const I = window.EstimateI18n;
  const U = window.EstimateUI;
  const { byId, fmt, money, esc, icon, val, op, answer } = U;
  const t = I.t;
  const C = I.course;

  const PAGES = ["home", "sloc", "fp", "planning", "cocomo", "delphi", "defects", "summary", "tables"];
  // Addresses used by earlier versions of the app keep working.
  const ALIASES = { language: ["fp", "convert"], "fp-count": ["fp", "count"], cwf: ["fp", "adjust"], reference: ["tables", "4"], quality: ["planning", ""], advanced: ["cocomo", "advanced"] };

  const FIELDS = {
    slocLoc: ["field.slocLoc", {}],
    slocProductivity: ["field.slocProductivity", { positive: true }],
    slocDevelopers: ["field.developers", { positive: true, integer: true }],
    slocRate: ["field.laborRate", {}],
    hoursFp: ["field.totalFp", {}],
    hoursPerFp: ["field.hoursPerFp", {}],
    hoursPerDay: ["field.hoursPerDay", { positive: true }],
    daysPerMonth: ["field.daysPerMonth", { positive: true }],
    planDevelopers: ["field.developers", { positive: true, integer: true }],
    productivityFp: ["field.totalFp", {}],
    fpPerPm: ["field.productivity", { positive: true }],
    productivityRate: ["field.laborRate", {}],
    cocomoKloc: ["field.kloc", {}],
    cocomoRate: ["field.laborRate", {}],
    intermediateKloc: ["field.kloc", {}],
    intermediateRate: ["field.laborRate", {}],
    advancedKloc: ["field.kloc", {}],
    advancedRate: ["field.laborRate", {}],
    delphiThreshold: ["field.threshold", { max: 100 }],
  };

  // Everything that is not held by a static input lives here, so a language change can
  // re-render labels without losing values.
  const state = {};
  const latest = {};

  const modeLabel = (mode) => C.modeLabel(mode, L.COCOMO_MODE_LABELS[mode]);
  const fpLabel = (key) => C.fpLabel(key, D.FP_PARAMETERS.find(([k]) => k === key)[1]);
  const driverCode = (name) => (/\(([^)]+)\)/.exec(name) || [null, name])[1];
  const driverTitle = (i) => C.driver(i, L.COCOMO_DRIVER_NAMES[i].replace(/\s*\([^)]*\)\s*$/, ""));
  const tableTitle = (n) => C.tableTitle(n, D.COURSE_TABLES[n - 1].title);
  const listJoin = (items) => items.join(I.getLang() === "ar" ? "، " : ", ");

  function fpFromExample(example) {
    return {
      counts: { ...example.counts },
      complexities: Object.fromEntries(D.FP_PARAMETERS.map(([k]) => [k, example.complexity])),
      influences: [...example.influences],
      language: example.language,
    };
  }

  // Advanced COCOMO placeholder phases. The lecture names phases "such as analysis and design"
  // but gives no split or multipliers, so the defaults are neutral: their total equals Ei.
  const PHASE_KEYS = ["analysis", "design", "coding", "testing"];
  const defaultPhases = () => PHASE_KEYS.map((key) => ({ name: null, key, share: "25", eaf: "1.00" }));
  const phaseName = (p, i) => (p.name !== null ? p.name : p.key ? t(`adv.phase.${p.key}`) : t("adv.phaseName", { n: i + 1 }));

  const averageDrivers = () => L.COCOMO_DRIVER_NAMES.map(() => ({ rating: "Average", multiplier: "1.00" }));

  function insuranceDrivers() {
    const drivers = averageDrivers();
    D.EXAMPLES.insurance.drivers.forEach((d) => { drivers[d.index] = { rating: d.rating, multiplier: d.multiplier.toFixed(2) }; });
    return drivers;
  }

  function lectureDefaults() {
    state.fp = fpFromExample(D.EXAMPLES.example1);
    state.basicMode = D.EXAMPLES.basicCocomo.mode;
    state.intermediateMode = D.EXAMPLES.insurance.mode;
    state.drivers = insuranceDrivers();
    state.advancedMode = D.EXAMPLES.insurance.mode;
    state.phases = defaultPhases();
    // name null means "use the default name in the current language".
    state.defects = D.EXAMPLES.defects.map((p) => ({ name: null, defects: String(p.defects), fp: String(p.fp) }));
    state.delphi = D.EXAMPLES.delphi.tasks.map((x) => ({ name: null, lectureName: x.task, maximum: String(x.maximum), minimum: String(x.minimum), touched: true }));
    state.delphiSelected = 1;
  }

  const defectName = (p, i) => (p.name !== null ? p.name : t("defects.projectName", { n: i + 1 }));
  const taskName = (x, i) => (x.name !== null ? x.name : x.lectureName ? C.task(x.lectureName) : t("delphi.taskName", { n: i + 1 }));

  /* SLOC, section 4.1 */

  const slocTitles = () => [
    t("sloc.way1", { title: t("sloc.effort") }), t("sloc.way1", { title: t("sloc.duration") }), t("sloc.way1", { title: t("sloc.cost") }),
    t("sloc.way2", { title: t("sloc.costPerLoc") }), t("sloc.way2", { title: t("sloc.cost") }), t("sloc.way2", { title: t("sloc.effort") }),
  ];

  function updateSloc() {
    const f = U.readFields(FIELDS, ["slocLoc", "slocProductivity", "slocDevelopers", "slocRate"]);
    if (!f.valid) {
      U.renderResultInvalid(byId("slocResult"), t("sloc.effort"));
      U.renderTraceWaiting(byId("slocTrace"), slocTitles(), f.invalidLabels);
      latest.sloc = null;
      return;
    }
    const v = f.values;
    const r = L.sloc(v.slocLoc, v.slocProductivity, v.slocDevelopers, v.slocRate);
    U.renderResult(byId("slocResult"), {
      label: t("sloc.effort"), value: fmt(r.effort), unit: t("unit.pm"), note: t("common.lectureRounding", { v: fmt(r.roundedEffort, 0) }),
      facts: [
        { label: t("sloc.duration"), value: `${fmt(r.duration)} ${t("unit.months")}`, note: t("common.lectureRounding", { v: fmt(r.roundedDuration) }) },
        { label: t("sloc.cost"), value: money(r.totalCost), note: t("common.lectureRounding", { v: money(r.roundedTotalCost) }) },
        { label: t("sloc.costPerLoc"), value: money(r.costPerLoc) },
      ],
    });
    const e = D.EXAMPLES.sloc;
    const isLecture = Number(v.slocLoc) === e.loc && Number(v.slocProductivity) === e.productivity && Number(v.slocDevelopers) === e.developers && Number(v.slocRate) === e.laborRate;
    const lecture = (x) => (isLecture ? t("common.lecture", { v: x }) : "");
    const titles = slocTitles();
    const rate = Number(v.slocRate);
    U.renderTrace(byId("slocTrace"), [
      { title: titles[0], formula: t("sloc.f.effort"), line: `${val(fmt(v.slocLoc), "slocLoc")}${op("÷")}${val(fmt(v.slocProductivity), "slocProductivity")}${op("=")}${answer(fmt(r.effort), t("unit.pm"))}`, lecture: lecture("53.54, 54") },
      { title: titles[1], formula: t("sloc.f.duration"), line: `${val(fmt(r.effort))}${op("÷")}${val(fmt(v.slocDevelopers, 0), "slocDevelopers")}${op("=")}${answer(fmt(r.duration), t("unit.months"))}`, lecture: lecture("54 ÷ 6 = 9") },
      { title: titles[2], formula: t("sloc.f.cost"), line: `${val(fmt(r.effort))}${op("×")}${val(money(v.slocRate), "slocRate")}${op("=")}${answer(money(r.totalCost))}`, lecture: lecture("$43,200") },
      { title: titles[3], formula: t("sloc.f.costPerLoc"), line: `${val(money(v.slocRate), "slocRate")}${op("÷")}${val(fmt(v.slocProductivity), "slocProductivity")}${op("=")}${answer(money(r.costPerLoc))}`, lecture: lecture("$1.29, $1.3") },
      { title: titles[4], formula: t("sloc.f.way2Cost"), line: `${val(fmt(v.slocLoc), "slocLoc")}${op("×")}${val(money(r.costPerLoc))}${op("=")}${answer(money(r.way2Cost))}`, lecture: isLecture ? t("common.lecture", { v: t("sloc.way2Lecture") }) : "" },
      rate > 0
        ? { title: titles[5], formula: t("sloc.f.way2Effort"), line: `${val(money(r.way2Cost))}${op("÷")}${val(money(v.slocRate), "slocRate")}${op("=")}${answer(fmt(r.way2Cost / rate), t("unit.pm"))}`, lecture: lecture("43,200 ÷ 800 = 54") }
        : { title: titles[5], formula: t("sloc.f.way2Effort"), line: esc(t("sloc.way2NoRate")) },
    ]);
    latest.sloc = { effort: r.effort, cost: r.totalCost, duration: r.duration, inputs: t("sloc.inputs", { loc: fmt(v.slocLoc), p: fmt(v.slocProductivity), d: fmt(v.slocDevelopers, 0) }) };
  }

  /* Function Points, section 4.2, Tables 1 to 3 */

  function renderFpInputs() {
    const fp = state.fp;
    byId("fpRows").innerHTML = D.FP_PARAMETERS.map(([key]) => {
      const w = L.FP_WEIGHTS[key];
      const label = fpLabel(key);
      const seg = ["simple", "average", "complex"].map((level) => `<label><input type="radio" name="fp-${key}" value="${level}" ${level === fp.complexities[key] ? "checked" : ""} />${t(`complexity.${level}`)}<small>× ${w[level]}</small></label>`).join("");
      return `<div class="param" data-key="${key}">
        <span class="param-name" id="fp-name-${key}">${label}</span>
        <div class="control plain"><input id="fp-count-${key}" type="number" inputmode="numeric" min="0" step="1" value="${esc(fp.counts[key])}" aria-labelledby="fp-name-${key}" aria-describedby="fp-count-${key}-error" /></div>
        <div class="seg" role="radiogroup" aria-label="${esc(t("fp.complexity", { label }))}">${seg}</div>
        <span class="param-total" id="fp-total-${key}"></span>
        <p id="fp-count-${key}-error" class="error" aria-live="polite"></p>
      </div>`;
    }).join("");
    byId("ratingLegend").innerHTML = D.RATING_SCALE.map((name, n) => `<li><b>${n}</b>${C.rating(n, name)}</li>`).join("");
    byId("gscRows").innerHTML = D.GSC_QUESTIONS.map((question, i) => {
      const seg = [0, 1, 2, 3, 4, 5].map((n) => `<label title="${esc(C.rating(n, D.RATING_SCALE[n]))}"><input type="radio" name="gsc-${i}" value="${n}" ${n === fp.influences[i] ? "checked" : ""} aria-label="${n}, ${esc(C.rating(n, D.RATING_SCALE[n]))}" />${n}</label>`).join("");
      return `<div class="rating"><span class="rating-q" id="gsc-q-${i}"><b>F${i + 1}</b>${C.gscQuestion(i, question)}</span><div class="seg" role="radiogroup" aria-labelledby="gsc-q-${i}">${seg}</div><span class="rating-pick" id="gsc-pick-${i}"></span></div>`;
    }).join("");
    byId("languageTiles").innerHTML = Object.entries(L.LOC_PER_FP).map(([language, loc]) => `<label class="lang"><input type="radio" name="language" value="${esc(language)}" ${language === fp.language ? "checked" : ""} /><span>${esc(C.language(language))}</span><strong>${loc}</strong></label>`).join("");
  }

  function readFpInputs() {
    D.FP_PARAMETERS.forEach(([key]) => {
      state.fp.counts[key] = byId(`fp-count-${key}`).value;
      state.fp.complexities[key] = document.querySelector(`input[name="fp-${key}"]:checked`).value;
    });
    state.fp.influences = D.GSC_QUESTIONS.map((_, i) => Number(document.querySelector(`input[name="gsc-${i}"]:checked`).value));
    state.fp.language = document.querySelector('input[name="language"]:checked').value;
  }

  function updateFp() {
    const fp = state.fp;
    const invalid = [];
    D.FP_PARAMETERS.forEach(([key]) => {
      const input = byId(`fp-count-${key}`);
      const message = U.issueMessage(L.numberIssue(fp.counts[key], { integer: true }), fpLabel(key));
      U.setError(input, message, byId(`fp-count-${key}-error`));
      if (message) invalid.push(fpLabel(key));
    });
    const locPerFp = L.LOC_PER_FP[fp.language];
    const sumFi = fp.influences.reduce((a, b) => a + b, 0);
    byId("gscTotal").textContent = sumFi;
    byId("fiEquation").textContent = `ΣFi = ${fp.influences.map((value, i) => `F${i + 1}(${value})`).join(" + ")} = ${sumFi}`;
    fp.influences.forEach((value, i) => { byId(`gsc-pick-${i}`).textContent = t("fp.pick", { f: `F${i + 1}`, v: value, meaning: C.rating(value, D.RATING_SCALE[value]) }); });
    const s = D.EXAMPLES.safeHome;
    byId("fpExampleNote").hidden = !(D.FP_PARAMETERS.every(([k]) => Number(fp.counts[k]) === s.counts[k] && fp.complexities[k] === s.complexity) && sumFi === 46);
    byId("stepAdjust").textContent = `Sum Fi ${sumFi}, VAF ${fmt(0.65 + 0.01 * sumFi)}`;
    byId("stepConvert").textContent = `${C.language(fp.language)}, ${locPerFp} LOC/FP`;
    const titles = [t("fp.ct"), t("fp.vaf"), t("fp.fp"), t("fp.loc")];
    if (invalid.length) {
      D.FP_PARAMETERS.forEach(([key]) => { byId(`fp-total-${key}`).textContent = ""; });
      byId("fpCountTotal").textContent = t("fp.checkCounts");
      byId("stepCount").textContent = t("fp.checkCounts");
      U.renderResultInvalid(byId("fpResult"), t("fp.result"));
      U.renderTraceWaiting(byId("fpTrace"), titles, invalid);
      latest.fp = null;
      return;
    }
    const r = L.functionPoints(fp.counts, fp.complexities, fp.influences, locPerFp);
    D.FP_PARAMETERS.forEach(([key]) => {
      const count = Number(fp.counts[key]);
      const weight = L.FP_WEIGHTS[key][fp.complexities[key]];
      byId(`fp-total-${key}`).textContent = `${fmt(count, 0)} × ${weight} = ${fmt(r.rowTotals[key])}`;
    });
    byId("fpCountTotal").textContent = fmt(r.ufp);
    byId("stepCount").textContent = `CT ${fmt(r.ufp)}`;
    const rounded = fmt(r.roundedFp, 0);
    U.renderResult(byId("fpResult"), {
      label: t("fp.result"), value: fmt(r.fp), unit: "FP", note: t("fp.rounded", { n: rounded }),
      facts: [
        { label: t("fp.ct"), value: fmt(r.ufp) },
        { label: t("fp.sumFiShort"), value: String(r.tdi) },
        { label: t("fp.vafShort"), value: fmt(r.vaf) },
        { label: t("fp.locShort"), value: `${fmt(r.locPlanning, 0)} LOC` },
      ],
      extra: `<button id="useFpInPlanning" class="btn btn-primary" type="button">${esc(t("fp.useInPlanning", { n: rounded }))}${icon("arrow-right", "flip")}</button>`,
    });
    const totals = D.FP_PARAMETERS.map(([key]) => val(fmt(r.rowTotals[key]), `fp-count-${key}`)).join(op("+"));
    U.renderTrace(byId("fpTrace"), [
      { title: t("fp.ct"), formula: t("fp.f.ct"), line: `${totals}${op("=")}${answer(fmt(r.ufp))}` },
      { title: t("fp.vaf"), formula: t("fp.f.vaf"), line: `${val("0.65")}${op("+")}${val("0.01")}${op("×")}${val(String(r.tdi))}${op("=")}${answer(fmt(r.vaf))}` },
      { title: t("fp.fp"), formula: t("fp.f.fp"), line: `${val(fmt(r.ufp))}${op("×")}${val(fmt(r.vaf))}${op("=")}${answer(fmt(r.fp), t("fp.roundedTo", { n: rounded }))}` },
      { title: t("fp.loc"), formula: t("fp.f.locLang", { lang: C.language(fp.language), v: locPerFp }), line: `${val(rounded)}${op("×")}${val(String(locPerFp))}${op("=")}${answer(fmt(r.locPlanning, 0), "LOC")}` },
    ]);
    latest.fp = { fp: r.fp, roundedFp: r.roundedFp, loc: r.locPlanning };
  }

  function loadFpExample(example) {
    state.fp = fpFromExample(example);
    renderFpInputs();
    updateFp();
  }

  /* FP planning, sections 4.2.3 and 4.2.4 */

  function updateHours() {
    const f = U.readFields(FIELDS, ["hoursFp", "hoursPerFp", "hoursPerDay", "daysPerMonth", "planDevelopers"]);
    const titles = [t("planning.personHours"), t("planning.personDays"), t("planning.personMonths"), t("planning.duration")];
    if (!f.valid) {
      U.renderResultInvalid(byId("hoursResult"), t("planning.effort"));
      U.renderTraceWaiting(byId("hoursTrace"), titles, f.invalidLabels);
      latest.hours = null;
      return;
    }
    const v = f.values;
    const r = L.fpHoursPlan(v.hoursFp, v.hoursPerFp, v.hoursPerDay, v.daysPerMonth, v.planDevelopers);
    U.renderResult(byId("hoursResult"), {
      label: t("planning.effort"), value: fmt(r.personMonths), unit: t("unit.pm"),
      facts: [
        { label: t("planning.personHours"), value: `${fmt(r.personHours)} ${t("unit.hours")}` },
        { label: t("planning.personDays"), value: `${fmt(r.personDays)} ${t("unit.days")}` },
        { label: t("planning.duration"), value: `${fmt(r.calendarMonths)} ${t("unit.months")}` },
      ],
    });
    U.renderTrace(byId("hoursTrace"), [
      { title: titles[0], formula: t("planning.f.hours"), line: `${val(fmt(v.hoursFp), "hoursFp")}${op("×")}${val(fmt(v.hoursPerFp), "hoursPerFp")}${op("=")}${answer(fmt(r.personHours), t("unit.hours"))}` },
      { title: titles[1], formula: t("planning.f.days"), line: `${val(fmt(r.personHours))}${op("÷")}${val(fmt(v.hoursPerDay), "hoursPerDay")}${op("=")}${answer(fmt(r.personDays), t("unit.days"))}` },
      { title: titles[2], formula: t("planning.f.months"), line: `${val(fmt(r.personDays))}${op("÷")}${val(fmt(v.daysPerMonth), "daysPerMonth")}${op("=")}${answer(fmt(r.personMonths), t("unit.pm"))}` },
      { title: titles[3], formula: t("planning.f.duration"), line: `${val(fmt(r.personMonths))}${op("÷")}${val(fmt(v.planDevelopers, 0), "planDevelopers")}${op("=")}${answer(fmt(r.calendarMonths), t("unit.months"))}` },
    ]);
    latest.hours = { effort: r.personMonths, duration: r.calendarMonths, inputs: t("planning.hoursInputs", { fp: fmt(v.hoursFp), h: fmt(v.hoursPerFp), d: fmt(v.planDevelopers, 0) }) };
  }

  function updateProductivity() {
    const f = U.readFields(FIELDS, ["productivityFp", "fpPerPm", "productivityRate"]);
    const titles = [t("planning.costPerFp"), t("planning.effort"), t("planning.totalCost")];
    if (!f.valid) {
      U.renderResultInvalid(byId("productivityResult"), t("planning.totalCost"));
      U.renderTraceWaiting(byId("productivityTrace"), titles, f.invalidLabels);
      latest.productivity = null;
      return;
    }
    const v = f.values;
    const r = L.fpProductivityPlan(v.productivityFp, v.fpPerPm, 1, v.productivityRate);
    const e = D.EXAMPLES.productivity;
    const isLecture = Number(v.productivityFp) === e.fp && Number(v.fpPerPm) === e.productivity && Number(v.productivityRate) === e.laborRate;
    const lecture = (x) => (isLecture ? t("common.lecture", { v: t(x) }) : "");
    U.renderResult(byId("productivityResult"), {
      label: t("planning.totalCost"), value: money(r.totalCost), note: lecture("planning.lectureCost"),
      facts: [
        { label: t("planning.costPerFp"), value: money(r.costPerFp), note: lecture("planning.lectureCostPerFp") },
        { label: t("planning.effort"), value: `${fmt(r.effort)} ${t("unit.pm")}`, note: lecture("planning.lectureEffort") },
      ],
    });
    U.renderTrace(byId("productivityTrace"), [
      { title: titles[0], formula: t("planning.f.costPerFp"), line: `${val(money(v.productivityRate), "productivityRate")}${op("÷")}${val(fmt(v.fpPerPm), "fpPerPm")}${op("=")}${answer(money(r.costPerFp))}` },
      { title: titles[1], formula: t("planning.f.effort"), line: `${val(fmt(v.productivityFp), "productivityFp")}${op("÷")}${val(fmt(v.fpPerPm), "fpPerPm")}${op("=")}${answer(fmt(r.effort), t("unit.pm"))}` },
      { title: titles[2], formula: t("planning.f.cost"), line: `${val(fmt(v.productivityFp), "productivityFp")}${op("×")}${val(money(r.costPerFp))}${op("=")}${answer(money(r.totalCost))}` },
    ]);
    latest.productivity = { effort: r.effort, cost: r.totalCost, inputs: t("planning.productivityInputs", { fp: fmt(v.productivityFp), p: fmt(v.fpPerPm), rate: money(v.productivityRate) }) };
  }

  /* Defect density, Table 7 */

  function renderDefects() {
    byId("defectRows").innerHTML = state.defects.map((p, i) => `<tr data-index="${i}">
      <td><input class="cell-input text defect-name" type="text" value="${esc(defectName(p, i))}" aria-label="${esc(t("defects.rowName", { n: i + 1 }))}" /></td>
      <td class="num"><input id="defect-count-${i}" class="cell-input defect-count" type="number" inputmode="numeric" min="0" step="1" value="${esc(p.defects)}" aria-label="${esc(t("defects.rowDefects", { n: i + 1 }))}" aria-describedby="defect-count-${i}-error" /><p id="defect-count-${i}-error" class="error"></p></td>
      <td class="num"><input id="defect-fp-${i}" class="cell-input defect-fp" type="number" inputmode="decimal" min="0" step="any" value="${esc(p.fp)}" aria-label="${esc(t("defects.rowSize", { n: i + 1 }))}" aria-describedby="defect-fp-${i}-error" /><p id="defect-fp-${i}-error" class="error"></p></td>
      <td class="num strong defect-density"></td>
      <td><button class="remove-btn remove-defect" type="button" aria-label="${esc(t("common.removeRow", { n: i + 1 }))}">${icon("trash")}</button></td>
    </tr>`).join("");
    updateDefects();
  }

  function updateDefects() {
    const valid = [];
    byId("defectRows").querySelectorAll("tr").forEach((row) => {
      const i = Number(row.dataset.index);
      const p = state.defects[i];
      const dm = U.check(p.defects, "field.defects", { integer: true });
      const fm = U.check(p.fp, "field.sizeFp", { positive: true });
      U.setError(row.querySelector(".defect-count"), dm, byId(`defect-count-${i}-error`));
      U.setError(row.querySelector(".defect-fp"), fm, byId(`defect-fp-${i}-error`));
      const density = dm || fm ? null : L.defectDensity(p.defects, p.fp);
      row.querySelector(".defect-density").textContent = density === null ? t("common.notAvailable") : fmt(density, 4);
      if (density !== null) valid.push({ i, name: defectName(p, i), defects: p.defects, fp: p.fp, density });
    });
    const best = valid.length ? valid.reduce((a, b) => (b.density < a.density ? b : a)) : null;
    const max = Math.max(...valid.map((p) => p.density), 0);
    byId("defectChart").innerHTML = valid.map((p) => `<div class="bar${p === best ? " is-best" : ""}"><div class="bar-head"><span>${esc(p.name)}${p === best ? ` (${t("defects.bestTag")})` : ""}</span><strong>${fmt(p.density, 4)}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${max ? (p.density / max) * 100 : 0}%"></div></div></div>`).join("");
    if (!best) {
      byId("defectResult").innerHTML = `<div class="result-head"><span class="result-label">${t("defects.best")}</span></div><p class="result-empty">${icon("info")}<span>${state.defects.length ? t("defects.fix") : t("defects.empty")}</span></p>`;
      byId("defectTrace").innerHTML = "";
      byId("defectTrace").hidden = true;
      latest.defects = null;
      return;
    }
    byId("defectTrace").hidden = false;
    const excluded = state.defects.length - valid.length;
    U.renderResult(byId("defectResult"), {
      label: t("defects.best"), value: fmt(best.density, 4), unit: t("unit.defectsPerFp"),
      extra: `<p class="banner ok">${icon("check")}<span>${esc(t("defects.bestNote", { name: best.name }))}${excluded ? ` ${esc(t("defects.excluded", { n: excluded }))}` : ""}</span></p>`,
    });
    U.renderTrace(byId("defectTrace"), valid.map((p) => ({
      title: esc(p.name), formula: t("defects.f"),
      line: `${val(fmt(p.defects), `defect-count-${p.i}`)}${op("÷")}${val(fmt(p.fp), `defect-fp-${p.i}`)}${op("=")}${answer(fmt(p.density, 4))}`,
    })));
    latest.defects = { name: best.name, density: best.density };
  }

  /* COCOMO, section 4.3, Tables 8 to 10 */

  function renderCocomoInputs() {
    byId("modeCards").innerHTML = Object.entries(L.COCOMO_MODES).map(([mode, [c, k]]) => `<label class="mode"><input type="radio" name="cocomoMode" value="${mode}" ${mode === state.basicMode ? "checked" : ""} /><strong>${modeLabel(mode)}</strong><code>C = ${c.toFixed(1)}, K = ${k.toFixed(2)}</code><span>${C.modeNote(mode, D.COCOMO_MODE_NOTES[mode])}</span></label>`).join("");
    byId("intermediateMode").innerHTML = Object.keys(L.COCOMO_MODES).map((mode) => `<label><input type="radio" name="intermediateMode" value="${mode}" ${mode === state.intermediateMode ? "checked" : ""} />${modeLabel(mode)}</label>`).join("");
    byId("advancedMode").innerHTML = Object.keys(L.COCOMO_MODES).map((mode) => `<label><input type="radio" name="advancedMode" value="${mode}" ${mode === state.advancedMode ? "checked" : ""} />${modeLabel(mode)}</label>`).join("");
    byId("table10").innerHTML = `<table class="table"><thead><tr><th scope="col">${t("cocomo.t10.attr")}</th><th scope="col">${t("cocomo.t10.rating")}</th><th scope="col" class="num">${t("cocomo.t10.factor")}</th></tr></thead><tbody>${D.EXAMPLES.insurance.drivers.map((d) => `<tr><th scope="row">${d.code}</th><td>${C.driverRating(d.rating)}</td><td class="num">${d.multiplier === 1 ? "1.0" : d.multiplier}</td></tr>`).join("")}</tbody></table>`;
  }

  function renderDrivers() {
    byId("driverGroups").innerHTML = D.DRIVER_GROUPS.map((g, gi) => `<div class="driver-group"><h3>${C.driverGroup(gi, g.title)}</h3>${g.indexes.map((i) => {
      const d = state.drivers[i];
      const name = `${driverTitle(i)} (${driverCode(L.COCOMO_DRIVER_NAMES[i])})`;
      const options = L.DRIVER_RATINGS.map((rating) => `<option value="${rating}" ${rating === d.rating ? "selected" : ""}>${C.driverRating(rating)}</option>`).join("");
      return `<div class="driver" data-index="${i}"><span class="driver-name">${esc(name)}</span><select id="driver-rating-${i}" aria-label="${esc(t("cocomo.rating", { name }))}">${options}</select><input id="driver-mult-${i}" class="cell-input" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(d.multiplier)}" aria-label="${esc(t("cocomo.multiplier", { name }))}" aria-describedby="driver-mult-${i}-error driver-mult-${i}-warn" /><p id="driver-mult-${i}-error" class="error"></p><p id="driver-mult-${i}-warn" class="warn"></p></div>`;
    }).join("")}</div>`).join("");
  }

  const constantsLine = (mode, r) => `${val(t("cocomo.f.constants", { mode: modeLabel(mode), c: r.c.toFixed(1), k: r.k.toFixed(2) }))}`;

  // The same KLOC in all three Table 8 modes, so each mode can be checked at once.
  function compareModes(kloc, selected) {
    const rows = Object.keys(L.COCOMO_MODES).map((mode) => {
      const x = L.cocomo(kloc, mode);
      const on = mode === selected;
      return `<tr${on ? ' class="is-selected"' : ""}><th scope="row">${modeLabel(mode)}${on ? ` <small>(${t("cocomo.selected")})</small>` : ""}</th><td class="num">${x.c.toFixed(1)}</td><td class="num">${x.k.toFixed(2)}</td><td class="num strong">${fmt(x.initialEffort)}</td></tr>`;
    }).join("");
    return `<div class="compare"><h3>${t("cocomo.compare")}</h3><div class="table-wrap"><table class="table"><thead><tr><th scope="col">${t("cocomo.compareType")}</th><th scope="col" class="num">C</th><th scope="col" class="num">K</th><th scope="col" class="num">${t("cocomo.compareEi")}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function updateBasic() {
    const f = U.readFields(FIELDS, ["cocomoKloc", "cocomoRate"]);
    const mode = state.basicMode;
    const titles = [t("cocomo.constants"), t("cocomo.power"), t("cocomo.initialEffort"), t("cocomo.cost")];
    if (!f.valid) {
      U.renderResultInvalid(byId("basicResult"), t("cocomo.initialEffort"));
      U.renderTraceWaiting(byId("basicTrace"), titles, f.invalidLabels);
      latest.basic = null;
      return;
    }
    const v = f.values;
    const r = L.cocomo(v.cocomoKloc, mode, [], v.cocomoRate);
    const power = Number(v.cocomoKloc) ** r.k;
    const e = D.EXAMPLES.basicCocomo;
    const isLecture = Number(v.cocomoKloc) === e.kloc && mode === e.mode;
    U.renderResult(byId("basicResult"), {
      label: t("cocomo.initialEffort"), value: fmt(r.initialEffort), unit: t("unit.pm"), note: isLecture ? t("common.lecture", { v: t("cocomo.lectureBasic") }) : "",
      facts: [
        { label: t("field.projectType"), value: `${modeLabel(mode)} (C = ${r.c.toFixed(1)}, K = ${r.k.toFixed(2)})` },
        { label: t("cocomo.cost"), value: money(r.totalCost) },
      ],
      extra: compareModes(v.cocomoKloc, mode),
    });
    U.renderTrace(byId("basicTrace"), [
      { title: titles[0], formula: t("cocomo.f.ei"), line: constantsLine(mode, r) },
      { title: titles[1], formula: t("cocomo.f.power"), line: `${val(fmt(v.cocomoKloc), "cocomoKloc")}${op("^")}${val(r.k.toFixed(2))}${op("=")}${answer(fmt(power, 3))}`, lecture: isLecture ? t("common.lecture", { v: "4.28" }) : "" },
      { title: titles[2], formula: t("cocomo.f.eiPower"), line: `${val(r.c.toFixed(1))}${op("×")}${val(fmt(power, 3))}${op("=")}${answer(fmt(r.initialEffort), t("unit.pm"))}` },
      { title: titles[3], formula: t("cocomo.f.cost"), line: `${val(fmt(r.initialEffort))}${op("×")}${val(money(v.cocomoRate), "cocomoRate")}${op("=")}${answer(money(r.totalCost))}` },
    ]);
    latest.basic = { effort: r.initialEffort, cost: r.totalCost, inputs: t("cocomo.basicInputs", { kloc: fmt(v.cocomoKloc), mode: modeLabel(mode) }) };
  }

  function updateIntermediate() {
    let driversValid = true;
    state.drivers.forEach((d, i) => {
      const input = byId(`driver-mult-${i}`);
      const message = U.check(d.multiplier, "field.multiplier", { positive: true });
      U.setError(input, message, byId(`driver-mult-${i}-error`));
      let warning = "";
      if (!message && L.multiplierOutsideTypicalRange(d.multiplier)) warning = t("cocomo.warnRange");
      else if (!message && d.rating === "Average" && Number(d.multiplier) !== L.AVERAGE_MULTIPLIER) warning = t("cocomo.warnAverage");
      byId(`driver-mult-${i}-warn`).textContent = warning;
      input.closest(".driver").classList.toggle("is-changed", d.rating !== "Average" || Number(d.multiplier) !== 1);
      if (message) driversValid = false;
    });
    const f = U.readFields(FIELDS, ["intermediateKloc", "intermediateRate"]);
    const mode = state.intermediateMode;
    const titles = [t("cocomo.constants"), t("cocomo.initialEffort"), t("cocomo.eaf"), t("cocomo.adjustedEffort"), t("cocomo.cost")];
    if (!f.valid || !driversValid) {
      U.renderResultInvalid(byId("intermediateResult"), t("cocomo.adjustedEffort"));
      U.renderTraceWaiting(byId("intermediateTrace"), titles, [...f.invalidLabels, ...(driversValid ? [] : [t("field.multiplier")])]);
      latest.intermediate = null;
      return;
    }
    const v = f.values;
    const r = L.cocomo(v.intermediateKloc, mode, state.drivers.map((d) => d.multiplier), v.intermediateRate);
    const e = D.EXAMPLES.insurance;
    const isLecture = Number(v.intermediateKloc) === e.kloc && mode === e.mode && state.drivers.every((d, i) => {
      const x = e.drivers.find((item) => item.index === i);
      return Number(d.multiplier) === (x ? x.multiplier : 1);
    });
    const applied = state.drivers.map((d, i) => ({ d, i })).filter(({ d }) => Number(d.multiplier) !== 1 || d.rating !== "Average");
    const lecture = (x) => (isLecture ? t("common.lecture", { v: x }) : "");
    U.renderResult(byId("intermediateResult"), {
      label: t("cocomo.adjustedEffort"), value: fmt(r.adjustedEffort), unit: t("unit.pm"), note: lecture("15.5"),
      facts: [
        { label: t("cocomo.initialEffort"), value: `${fmt(r.initialEffort)} ${t("unit.pmShort")}`, note: lecture("10.11") },
        { label: t("cocomo.eafShort"), value: fmt(r.eaf, 4), note: lecture("1.53") },
        { label: t("cocomo.cost"), value: money(r.totalCost) },
      ],
      extra: isLecture ? `<p class="note">${icon("info")}<span>${t("cocomo.lectureNote")}</span></p>` : "",
    });
    U.renderTrace(byId("intermediateTrace"), [
      { title: titles[0], formula: t("cocomo.f.ei"), line: constantsLine(mode, r) },
      { title: titles[1], formula: t("cocomo.f.ei"), line: `${val(r.c.toFixed(1))}${op("×")}${val(fmt(v.intermediateKloc), "intermediateKloc")}${op("^")}${val(r.k.toFixed(2))}${op("=")}${answer(fmt(r.initialEffort), t("unit.pm"))}`, lecture: lecture("3.2 × 3.16 = 10.11") },
      { title: titles[2], formula: applied.length ? t("cocomo.f.eafDrivers", { n: 15 - applied.length }) : t("cocomo.f.eafNone"), line: applied.length ? `${applied.map(({ d, i }) => val(`${driverCode(L.COCOMO_DRIVER_NAMES[i])} ${C.driverRating(d.rating)} ${fmt(d.multiplier)}`, `driver-mult-${i}`)).join(op("×"))}${op("=")}${answer(fmt(r.eaf, 4))}` : answer("1.00"), lecture: lecture("1.53") },
      { title: titles[3], formula: t("cocomo.f.e"), line: `${val(fmt(r.eaf, 4))}${op("×")}${val(fmt(r.initialEffort))}${op("=")}${answer(fmt(r.adjustedEffort), t("unit.pm"))}`, lecture: lecture("1.53 × 10.11 = 15.5") },
      { title: titles[4], formula: t("cocomo.f.costE"), line: `${val(fmt(r.adjustedEffort))}${op("×")}${val(money(v.intermediateRate), "intermediateRate")}${op("=")}${answer(money(r.totalCost))}` },
    ]);
    latest.intermediate = { effort: r.adjustedEffort, cost: r.totalCost, eaf: r.eaf, kloc: v.intermediateKloc, mode, inputs: t("cocomo.intermediateInputs", { kloc: fmt(v.intermediateKloc), mode: modeLabel(mode), eaf: fmt(r.eaf, 4) }) };
  }

  /* Advanced COCOMO, section 4.3.3 */

  function renderPhases() {
    byId("phaseRows").innerHTML = state.phases.map((p, i) => `<div class="phase" data-index="${i}">
      <input class="cell-input text phase-name" type="text" value="${esc(phaseName(p, i))}" aria-label="${esc(t("adv.rowName", { n: i + 1 }))}" />
      <input id="phase-share-${i}" class="cell-input phase-share" type="number" inputmode="decimal" min="0" max="100" step="any" value="${esc(p.share)}" aria-label="${esc(t("adv.rowShare", { n: i + 1 }))}" aria-describedby="phase-share-${i}-error" />
      <input id="phase-eaf-${i}" class="cell-input phase-eaf" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(p.eaf)}" aria-label="${esc(t("adv.rowEaf", { n: i + 1 }))}" aria-describedby="phase-eaf-${i}-error" />
      <button class="remove-btn remove-phase" type="button" aria-label="${esc(t("common.removeRow", { n: i + 1 }))}">${icon("trash")}</button>
      <p id="phase-share-${i}-error" class="error"></p><p id="phase-eaf-${i}-error" class="error"></p>
    </div>`).join("");
    updateAdvanced();
  }

  function updateAdvanced() {
    let rowsValid = true;
    state.phases.forEach((p, i) => {
      const sm = U.check(p.share, "field.phaseShare", { max: 100 });
      const em = U.check(p.eaf, "field.phaseEaf", { positive: true });
      U.setError(byId(`phase-share-${i}`), sm, byId(`phase-share-${i}-error`));
      U.setError(byId(`phase-eaf-${i}`), em, byId(`phase-eaf-${i}-error`));
      if (sm || em) rowsValid = false;
    });
    const shareSum = rowsValid ? state.phases.reduce((sum, p) => sum + Number(p.share), 0) : null;
    const sumOk = state.phases.length > 0 && shareSum !== null && Math.abs(shareSum - 100) <= 1e-9;
    const total = byId("phaseTotal");
    total.textContent = !state.phases.length ? t("adv.empty") : shareSum === null ? "" : t(sumOk ? "adv.shareTotal" : "adv.shareFix", { v: fmt(shareSum) });
    total.classList.toggle("is-error", !sumOk && shareSum !== null);
    const f = U.readFields(FIELDS, ["advancedKloc", "advancedRate"]);
    const mode = state.advancedMode;
    const titles = [t("cocomo.constants"), t("cocomo.initialEffort"), ...state.phases.map((p, i) => esc(phaseName(p, i) || t("adv.phaseName", { n: i + 1 }))), t("adv.total"), t("cocomo.cost")];
    if (!f.valid || !rowsValid || !sumOk) {
      const reasons = [...f.invalidLabels];
      if (!rowsValid) reasons.push(t("adv.phases"));
      else if (!sumOk) reasons.push(t("adv.col.share"));
      U.renderResultInvalid(byId("advancedResult"), t("adv.total"));
      U.renderTraceWaiting(byId("advancedTrace"), titles, reasons);
      latest.advanced = null;
      return;
    }
    const v = f.values;
    const r = L.advancedCocomo(v.advancedKloc, mode, state.phases.map((p) => ({ share: p.share, eaf: p.eaf })), v.advancedRate);
    U.renderResult(byId("advancedResult"), {
      label: t("adv.total"), value: fmt(r.totalEffort), unit: t("unit.pm"),
      facts: [
        { label: t("cocomo.initialEffort"), value: `${fmt(r.initialEffort)} ${t("unit.pmShort")}` },
        { label: t("adv.weightedEaf"), value: fmt(r.weightedEaf, 4) },
        { label: t("cocomo.cost"), value: money(r.totalCost) },
      ],
    });
    const phaseSteps = state.phases.map((p, i) => ({
      title: esc(phaseName(p, i) || t("adv.phaseName", { n: i + 1 })), formula: t("adv.f.phase"),
      line: `${val(fmt(r.initialEffort))}${op("×")}${val(`${fmt(r.phases[i].share)}%`, `phase-share-${i}`)}${op("×")}${val(fmt(r.phases[i].eaf, 4), `phase-eaf-${i}`)}${op("=")}${answer(fmt(r.phases[i].effort), t("unit.pm"))}`,
    }));
    U.renderTrace(byId("advancedTrace"), [
      { title: titles[0], formula: t("cocomo.f.ei"), line: constantsLine(mode, r) },
      { title: titles[1], formula: t("cocomo.f.ei"), line: `${val(r.c.toFixed(1))}${op("×")}${val(fmt(v.advancedKloc), "advancedKloc")}${op("^")}${val(r.k.toFixed(2))}${op("=")}${answer(fmt(r.initialEffort), t("unit.pm"))}` },
      ...phaseSteps,
      { title: t("adv.total"), formula: t("adv.f.total"), line: `${r.phases.map((x) => val(fmt(x.effort))).join(op("+"))}${op("=")}${answer(fmt(r.totalEffort), t("unit.pm"))}` },
      { title: t("cocomo.cost"), formula: t("cocomo.f.costE"), line: `${val(fmt(r.totalEffort))}${op("×")}${val(money(v.advancedRate), "advancedRate")}${op("=")}${answer(money(r.totalCost))}` },
    ]);
    latest.advanced = { effort: r.totalEffort, cost: r.totalCost, inputs: t("adv.inputs", { kloc: fmt(v.advancedKloc), mode: modeLabel(mode), n: state.phases.length }) };
  }

  /* Delphi, section 4.4, Table 11 */

  function renderDelphiSteps() {
    byId("delphiSteps").innerHTML = D.DELPHI_STEPS.map((step, i) => `<li class="${i === 5 ? "is-current" : ""}"><span>${C.delphiStep(i, step)}</span>${i === 5 ? `<small>${t("delphi.here")}</small>` : ""}${i === 7 ? `<small>${t("delphi.returns")}</small>` : ""}</li>`).join("");
  }

  function renderDelphi() {
    byId("delphiRows").innerHTML = state.delphi.map((x, i) => `<tr data-index="${i}">
      <td><input class="cell-input text delphi-task" type="text" value="${esc(taskName(x, i))}" aria-label="${esc(t("delphi.rowTask", { n: i + 1 }))}" /></td>
      <td class="num"><input id="delphi-max-${i}" class="cell-input delphi-max" type="number" inputmode="decimal" min="0" step="any" value="${esc(x.maximum)}" aria-label="${esc(t("delphi.rowMax", { n: i + 1 }))}" aria-describedby="delphi-max-${i}-error" /><p id="delphi-max-${i}-error" class="error"></p></td>
      <td class="num"><input id="delphi-min-${i}" class="cell-input delphi-min" type="number" inputmode="decimal" min="0" step="any" value="${esc(x.minimum)}" aria-label="${esc(t("delphi.rowMin", { n: i + 1 }))}" aria-describedby="delphi-min-${i}-error" /><p id="delphi-min-${i}-error" class="error"></p></td>
      <td class="delphi-range"></td>
      <td class="num strong delphi-variance"></td>
      <td class="delphi-status"></td>
      <td><button class="remove-btn remove-delphi" type="button" aria-label="${esc(t("common.removeRow", { n: i + 1 }))}">${icon("trash")}</button></td>
    </tr>`).join("");
    updateDelphi();
  }

  function updateDelphi() {
    const thresholdOk = U.readFields(FIELDS, ["delphiThreshold"]).valid;
    const threshold = byId("delphiThreshold").value;
    const results = [];
    const maxHours = Math.max(...state.delphi.map((x) => Number(x.maximum) || 0), 1);
    byId("delphiRows").querySelectorAll("tr").forEach((row) => {
      const i = Number(row.dataset.index);
      const x = state.delphi[i];
      const maxMsg = U.check(x.maximum, "field.maxEstimate", { positive: true });
      let minMsg = U.check(x.minimum, "field.minEstimate", {});
      if (!maxMsg && !minMsg && Number(x.minimum) > Number(x.maximum)) minMsg = t("err.minmax");
      U.setError(row.querySelector(".delphi-max"), x.touched ? maxMsg : "", byId(`delphi-max-${i}-error`));
      U.setError(row.querySelector(".delphi-min"), x.touched ? minMsg : "", byId(`delphi-min-${i}-error`));
      row.classList.toggle("is-selected", i === state.delphiSelected);
      const status = row.querySelector(".delphi-status");
      if (maxMsg || minMsg) {
        row.querySelector(".delphi-range").innerHTML = "";
        row.querySelector(".delphi-variance").textContent = t("common.notAvailable");
        status.innerHTML = `<span class="badge wait">${x.touched ? t("delphi.fixEstimates") : t("delphi.enterEstimates")}</span>`;
        results[i] = null;
        return;
      }
      const lo = (Number(x.minimum) / maxHours) * 100;
      const hi = (Number(x.maximum) / maxHours) * 100;
      row.querySelector(".delphi-range").innerHTML = `<div class="range"><div class="range-track"><div class="range-fill" style="left:${lo}%;width:${Math.max(hi - lo, 1)}%"></div></div><small>${t("delphi.range", { min: fmt(x.minimum), max: fmt(x.maximum) })}</small></div>`;
      if (!thresholdOk) {
        row.querySelector(".delphi-variance").textContent = `${fmt(((x.maximum - x.minimum) / x.maximum) * 100)}%`;
        status.innerHTML = `<span class="badge wait">${t("delphi.fixThreshold")}</span>`;
        results[i] = null;
        return;
      }
      const r = L.delphi(x.maximum, x.minimum, threshold);
      results[i] = r;
      row.querySelector(".delphi-variance").textContent = `${fmt(r.variance)}%`;
      status.innerHTML = r.accepted ? `<span class="badge ok">${icon("check")}${t("delphi.accepted")}</span>` : `<span class="badge no">${icon("x-circle")}${t("delphi.rejected")}</span>`;
    });
    const evaluated = results.filter(Boolean);
    const accepted = evaluated.filter((r) => r.accepted).length;
    const banner = byId("delphiBanner");
    if (!state.delphi.length) banner.innerHTML = `<p class="banner info">${icon("info")}<span>${t("delphi.b.empty")}</span></p>`;
    else if (!thresholdOk) banner.innerHTML = `<p class="banner warn">${icon("warning")}<span>${t("delphi.b.threshold")}</span></p>`;
    else if (evaluated.length < state.delphi.length) banner.innerHTML = `<p class="banner info">${icon("info")}<span>${t("delphi.b.partial", { a: accepted, e: evaluated.length })}</span></p>`;
    else if (accepted === evaluated.length) banner.innerHTML = `<p class="banner ok">${icon("check")}<span>${t("delphi.b.all", { n: evaluated.length })}</span></p>`;
    else {
      const names = state.delphi.map((x, i) => [x, i]).filter(([, i]) => results[i] && !results[i].accepted).map(([x, i]) => taskName(x, i) || t("delphi.unnamed"));
      banner.innerHTML = `<p class="banner warn">${icon("warning")}<span>${esc(t("delphi.b.some", { a: accepted, e: evaluated.length, names: listJoin(names) }))}</span></p>`;
    }
    const sel = state.delphiSelected;
    const selected = state.delphi[sel];
    const trace = byId("delphiTrace");
    if (!selected || !results[sel]) {
      trace.innerHTML = `<h2 class="panel-title">${t("common.worked")}</h2><p>${selected ? t("delphi.enterValid") : t("delphi.selectRow")}</p>`;
    } else {
      const r = results[sel];
      U.renderTrace(trace, [
        { title: t("delphi.t.variance"), formula: t("delphi.f.variance"), line: `${op("(")}${val(fmt(selected.maximum), `delphi-max-${sel}`)}${op("−")}${val(fmt(selected.minimum), `delphi-min-${sel}`)}${op(")")}${op("÷")}${val(fmt(selected.maximum), `delphi-max-${sel}`)}${op("×")}${val("100")}${op("=")}${answer(`${fmt(r.variance)}%`)}` },
        { title: t("delphi.t.decision"), formula: t("delphi.f.decision"), line: `${val(`${fmt(r.variance)}%`)}${op(r.accepted ? "≤" : ">")}${val(`${fmt(threshold)}%`, "delphiThreshold")}${op("→")}${answer(r.accepted ? t("delphi.accepted") : t("delphi.rejected"))}` },
      ], esc(t("delphi.selected", { name: taskName(selected, sel) || t("delphi.unnamed") })));
    }
    latest.delphi = state.delphi.length ? { accepted, evaluated: evaluated.length, total: state.delphi.length, threshold } : null;
  }

  /* Overview, summary, and course table library */

  const METHOD_ROWS = [
    { key: "sloc", color: "sloc", name: "method.sloc", page: "sloc", duration: (x) => `${fmt(x.duration)} ${t("unit.months")}` },
    { key: "productivity", color: "planning", name: "method.productivity", page: "planning/productivity", duration: () => t("common.notCalculated") },
    { key: "hours", color: "planning", name: "method.hours", page: "planning/hours", cost: () => t("common.notCalculated"), duration: (x) => `${fmt(x.duration)} ${t("unit.months")}` },
    { key: "basic", color: "cocomo", name: "method.basic", page: "cocomo/basic", duration: () => t("common.notInLecture") },
    { key: "intermediate", color: "cocomo", name: "method.intermediate", page: "cocomo/intermediate", duration: () => t("common.notInLecture") },
    { key: "advanced", color: "cocomo", name: "method.advanced", page: "cocomo/advanced", duration: () => t("common.notInLecture") },
  ];

  function summaryRows() {
    const rows = METHOD_ROWS.map((m) => {
      const x = latest[m.key];
      if (!x) return { m, cells: [t(m.name), t("common.needsInputs"), "", "", ""] };
      return { m, x, cells: [t(m.name), x.inputs, `${fmt(x.effort)} ${t("unit.pmShort")}`, m.cost ? m.cost(x) : money(x.cost), m.duration(x)] };
    });
    const d = latest.delphi;
    rows.push({ m: { page: "delphi", color: "delphi" }, cells: [t("method.delphi"), d ? t("delphi.summary", { n: d.total, t: fmt(d.threshold) }) : "", t("common.notApplicable"), t("common.notApplicable"), d ? t("delphi.acceptedOf", { a: d.accepted, n: d.total }) : ""] });
    return rows;
  }

  function renderSummary() {
    byId("summaryDesc").textContent = t("summary.desc");
    const withEffort = METHOD_ROWS.filter((m) => latest[m.key]).sort((a, b) => latest[b.key].effort - latest[a.key].effort);
    const max = Math.max(...withEffort.map((m) => latest[m.key].effort), 0);
    byId("summaryChart").innerHTML = withEffort.length
      ? withEffort.map((m) => `<div class="bar" data-m="${m.color}"><div class="bar-head"><span>${t(m.name)}</span><strong>${fmt(latest[m.key].effort)}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${max ? (latest[m.key].effort / max) * 100 : 0}%"></div></div></div>`).join("")
      : `<p class="muted">${t("summary.none")}</p>`;
    byId("summaryRows").innerHTML = summaryRows().map(({ m, x, cells }) => {
      if (m.key && !x) return `<tr data-m="${m.color}"><th scope="row"><span class="dot" aria-hidden="true"></span>${esc(cells[0])}</th><td colspan="4" class="muted">${esc(cells[1])}</td><td class="no-print"><a href="#${m.page}">${t("common.open")}</a></td></tr>`;
      return `<tr data-m="${m.color}"><th scope="row"><span class="dot" aria-hidden="true"></span>${esc(cells[0])}</th><td>${esc(cells[1])}</td><td class="num strong">${esc(cells[2])}</td><td class="num">${esc(cells[3])}</td><td class="num">${esc(cells[4])}</td><td class="no-print"><a href="#${m.page}">${t("common.open")}</a></td></tr>`;
    }).join("");
  }

  function summaryText() {
    return I.plain([t("summary.title"), ...summaryRows().map(({ cells }) => cells.filter(Boolean).join(" | "))].join("\n"));
  }

  function summaryCsv() {
    const quote = (value) => `"${I.plain(value).replace(/"/g, '""')}"`;
    const header = ["summary.col.method", "summary.col.inputs", "summary.col.effort", "summary.col.cost", "summary.col.duration"].map((k) => quote(t(k)));
    return [header.join(","), ...summaryRows().map(({ cells }) => cells.map(quote).join(","))].join("\r\n");
  }

  function courseTableHtml(n) {
    const table = (head, body) => `<div class="table-wrap"><table class="table"><thead><tr>${head.map((h) => `<th scope="col"${h.num ? ' class="num"' : ""}>${h.t || h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
    const num = (key) => ({ t: t(key), num: true });
    const cx = (level) => t(`complexity.${level}`);
    switch (n) {
      case 1: return table([t("col.language"), num("col.locFp")], Object.entries(L.LOC_PER_FP).map(([k, v]) => `<tr><th scope="row">${esc(C.language(k))}</th><td class="num">${v}</td></tr>`).join(""));
      case 2: return table([t("col.parameter"), { t: cx("simple"), num: true }, { t: cx("average"), num: true }, { t: cx("complex"), num: true }], D.FP_PARAMETERS.map(([k]) => `<tr><th scope="row">${fpLabel(k)}</th><td class="num">${L.FP_WEIGHTS[k].simple}</td><td class="num">${L.FP_WEIGHTS[k].average}</td><td class="num">${L.FP_WEIGHTS[k].complex}</td></tr>`).join(""));
      case 3: return `<ul class="legend">${D.RATING_SCALE.map((s, i) => `<li><b>${i}</b>${C.rating(i, s)}</li>`).join("")}</ul>${table([num("col.no"), t("col.question")], D.GSC_QUESTIONS.map((q, i) => `<tr><td class="num">${i + 1}</td><td>${C.gscQuestion(i, q)}</td></tr>`).join(""))}`;
      case 4: return table([num("col.no"), t("col.characteristic"), t("col.description")], D.CHARACTERISTICS.map(([name, desc], i) => `<tr><td class="num">${i + 1}</td><th scope="row">${C.characteristic(name)}</th><td>${C.characteristicDesc(name, desc)}</td></tr>`).join(""));
      case 5: return table([t("col.parameter"), num("col.count"), t("col.complexity"), num("col.weight"), num("col.total")], D.FP_PARAMETERS.map(([k]) => { const c = D.EXAMPLES.example1.counts[k]; const w = L.FP_WEIGHTS[k].average; return `<tr><th scope="row">${fpLabel(k)}</th><td class="num">${c}</td><td>${cx("average")}</td><td class="num">${w}</td><td class="num">${c * w}</td></tr>`; }).join("") + `<tr><th scope="row" colspan="4">${t("col.countTotal")}</th><td class="num strong">168</td></tr>`);
      case 6: return table([num("col.no"), t("col.gsc"), num("col.influence")], D.EXAMPLE_GSC_NAMES.map((name, i) => `<tr><td class="num">${i + 1}</td><th scope="row">${C.characteristic(name)}</th><td class="num">${D.EXAMPLE_GSC_VALUES[i]}</td></tr>`).join("") + `<tr><th scope="row" colspan="2">${t("col.totalFactor")}</th><td class="num strong">48</td></tr>`) + `<p class="note">${icon("info")}<span>${t("tables.t6note")}</span></p>`;
      case 7: return table([t("col.project"), num("col.totalDefects"), num("col.sizeFp"), num("col.density")], D.EXAMPLES.defects.map((p, i) => `<tr><th scope="row">${t("defects.projectName", { n: i + 1 })}</th><td class="num">${p.defects}</td><td class="num">${fmt(p.fp)}</td><td class="num">${fmt(p.defects / p.fp, 4)}</td></tr>`).join(""));
      case 8: return table([t("cocomo.t8.type"), { t: "C", num: true }, { t: "K", num: true }], Object.entries(L.COCOMO_MODES).map(([m, [c, k]]) => `<tr><th scope="row">${modeLabel(m)}</th><td class="num">${c.toFixed(1)}</td><td class="num">${k.toFixed(2)}</td></tr>`).join("")) + `<p class="formula-box">Ei = C × (KLOC)^K</p><p class="muted small">${t("tables.t8unit")}</p>`;
      case 9: return `<p class="note">${icon("info")}<span>${t("tables.t9note", { r: listJoin(L.DRIVER_RATINGS.map((r) => C.driverRating(r))) })}</span></p>${D.DRIVER_GROUPS.map((g, gi) => table([C.driverGroup(gi, g.title)], g.indexes.map((i) => `<tr><td>${esc(`${driverTitle(i)} (${driverCode(L.COCOMO_DRIVER_NAMES[i])})`)}</td></tr>`).join(""))).join("")}`;
      case 10: return `<p class="muted">${t("tables.t10caption")}</p>${table([t("cocomo.t10.attr"), t("cocomo.t10.rating"), num("cocomo.t10.factor")], D.EXAMPLES.insurance.drivers.map((d) => `<tr><th scope="row">${d.code}</th><td>${C.driverRating(d.rating)}</td><td class="num">${d.multiplier === 1 ? "1.0" : d.multiplier}</td></tr>`).join(""))}<p class="formula-box">EAF = 1.2 × 1.35 × 0.95 × 1.0 = 1.539</p>`;
      case 11: return table([t("delphi.col.task"), num("delphi.col.max"), num("delphi.col.min"), num("delphi.col.variance"), t("col.aNa")], D.EXAMPLES.delphi.tasks.map((x) => { const r = L.delphi(x.maximum, x.minimum, D.EXAMPLES.delphi.threshold); return `<tr><th scope="row">${C.task(x.task)}</th><td class="num">${x.maximum}</td><td class="num">${x.minimum}</td><td class="num">${fmt(r.variance)}</td><td>${r.accepted ? "A" : "NA"}</td></tr>`; }).join("")) + `<p class="muted small">${t("tables.t11note")}</p>`;
      default: return "";
    }
  }

  const PAGE_NAME = { fp: "method.fp", defects: "method.defects", cocomo: "nav.cocomo", delphi: "method.delphi" };
  let selectedTable = 8;
  let tableFilter = "all";

  function renderLibrary() {
    const query = byId("tableSearch").value.trim().toLowerCase();
    const matches = (x) => `${t("common.table", { n: x.number })} ${x.title} ${tableTitle(x.number)} ${C.tableNote(x.number, x.note)}`.toLowerCase().includes(query);
    const items = D.COURSE_TABLES.filter((x) => (tableFilter === "all" || x.group === tableFilter) && (!query || matches(x)));
    byId("tableCards").innerHTML = items.length
      ? items.map((x) => `<button type="button" role="listitem" class="table-item" data-m="${x.group}" data-table="${x.number}" aria-pressed="${x.number === selectedTable}"><small>${t("common.table", { n: x.number })}</small><strong>${tableTitle(x.number)}</strong><span>${C.tableNote(x.number, x.note)}</span></button>`).join("")
      : `<p class="empty">${t("tables.noMatch")}</p>`;
    const x = D.COURSE_TABLES.find((item) => item.number === selectedTable);
    byId("tablePanel").innerHTML = `<h2 class="panel-title"><span class="ref">${t("common.table", { n: x.number })}</span>${tableTitle(x.number)}</h2>${courseTableHtml(x.number)}<a class="btn btn-primary" href="#${x.page}">${esc(t("tables.openCalc", { name: t(PAGE_NAME[x.page]) }))}${icon("arrow-right", "flip")}</a>`;
  }

  /* Shell: navigation, search, theme, language, project name */

  function parseHash() {
    const raw = decodeURIComponent(window.location.hash.slice(1));
    let [page, arg = ""] = raw.split("/");
    if (ALIASES[page]) [page, arg] = [ALIASES[page][0], arg || ALIASES[page][1]];
    return PAGES.includes(page) ? { page, arg } : { page: "home", arg: "", unknown: raw !== "" };
  }

  function selectTabById(id) {
    const tab = byId(id);
    if (tab && tab.getAttribute("aria-selected") !== "true") tab.click();
  }

  function setTitles() {
    const { page } = parseHash();
    const section = byId(`page-${page}`);
    byId("crumbPage").textContent = t(section.dataset.title);
    document.title = `${t(section.dataset.title)} | ${t("app.name")}`;
  }

  function showPage(moveFocus) {
    const { page, arg, unknown } = parseHash();
    if (unknown) {
      window.history.replaceState(null, "", "#home");
      showToast(t("toast.notFound"));
    }
    document.querySelectorAll(".page").forEach((p) => { p.hidden = p.dataset.page !== page; });
    document.querySelectorAll(".nav a[data-page]").forEach((a) => {
      if (a.dataset.page === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    setTitles();
    if (page === "planning" && arg) selectTabById(arg === "productivity" ? "tab-productivity" : "tab-hours");
    if (page === "cocomo" && arg) selectTabById({ intermediate: "tab-intermediate", advanced: "tab-advanced" }[arg] || "tab-basic");
    if (page === "home") selectTabById(arg === "part2" ? "part-tab-2" : "part-tab-1");
    if (page === "tables" && Number(arg) >= 1 && Number(arg) <= 11) { selectedTable = Number(arg); renderLibrary(); }
    closeNav(false);
    window.scrollTo(0, 0);
    if (page === "fp" && FP_STEPS.includes(arg)) setFpStep(arg);
    if (moveFocus) byId(`page-${page}`).querySelector("h1").focus({ preventScroll: true });
  }

  // Function Points shows one step at a time: Count, then Adjust, then Convert.
  const FP_STEPS = ["count", "adjust", "convert"];
  const FP_CARDS = { count: "fpCountCard", adjust: "fpAdjustCard", convert: "fpConvertCard" };
  let fpStep = "count";

  function setFpStep(step) {
    fpStep = FP_STEPS.includes(step) ? step : "count";
    FP_STEPS.forEach((x) => { byId(FP_CARDS[x]).hidden = x !== fpStep; });
    document.querySelectorAll(".stepper [data-fp-step]").forEach((b) => {
      if (b.dataset.fpStep === fpStep) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
  }

  function openNav() {
    document.body.classList.add("nav-open");
    byId("navBackdrop").hidden = false;
    byId("openNav").setAttribute("aria-expanded", "true");
    document.querySelector(".shell").inert = true;
    (document.querySelector('.nav a[aria-current="page"]') || document.querySelector(".nav a")).focus();
  }

  function closeNav(returnFocus) {
    if (!document.body.classList.contains("nav-open")) return;
    document.body.classList.remove("nav-open");
    byId("navBackdrop").hidden = true;
    byId("openNav").setAttribute("aria-expanded", "false");
    document.querySelector(".shell").inert = false;
    if (returnFocus) byId("openNav").focus();
  }

  function syncPrefs() {
    const theme = window.CpitTheme.get();
    const lang = window.CpitLang.get();
    document.querySelectorAll("[data-theme-choice]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === theme)));
    document.querySelectorAll("[data-lang-choice]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.langChoice === lang)));
    byId("themeQuick").setAttribute("aria-pressed", String(theme === "dark"));
    byId("langQuickText").textContent = lang === "ar" ? "EN" : "ع";
    // The browser toolbar color follows the surface token of the active theme.
    const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
    if (surface) document.querySelector('meta[name="theme-color"]').setAttribute("content", surface);
  }

  // Re-renders every language-dependent part. Values stay in state and in static inputs.
  function applyLanguage() {
    I.setLang(window.CpitLang.get());
    I.applyStatic(document);
    document.querySelectorAll("[data-course-title]").forEach((el) => { el.textContent = tableTitle(Number(el.dataset.courseTitle)); });
    document.querySelectorAll("[data-table-ref]").forEach((el) => { el.textContent = t("common.table", { n: el.dataset.tableRef }); });
    renderFpInputs();
    renderCocomoInputs();
    renderDrivers();
    renderPhases();
    renderDefects();
    renderDelphiSteps();
    renderDelphi();
    renderLibrary();
    updateAll();
    setTitles();
    syncPrefs();
    if (byId("searchInput").value) renderSearch();
  }

  function searchIndexList() {
    return [
      { label: t("nav.overview"), hint: t("home.methods"), hash: "home" },
      { label: t("sloc.title"), hint: t("common.section", { s: "4.1" }), hash: "sloc" },
      { label: t("fp.title"), hint: t("common.section", { s: "4.2" }), hash: "fp" },
      { label: t("planning.hours"), hint: t("common.section", { s: "4.2.3" }), hash: "planning/hours" },
      { label: t("planning.productivity"), hint: t("common.section", { s: "4.2.4" }), hash: "planning/productivity" },
      { label: t("cocomo.basic"), hint: t("common.section", { s: "4.3.1" }), hash: "cocomo/basic" },
      { label: t("cocomo.intermediate"), hint: t("common.section", { s: "4.3.2" }), hash: "cocomo/intermediate" },
      { label: t("cocomo.advanced"), hint: t("common.section", { s: "4.3.3" }), hash: "cocomo/advanced" },
      { label: t("delphi.title"), hint: t("common.section", { s: "4.4" }), hash: "delphi" },
      { label: t("defects.title"), hint: t("common.section", { s: "4.2.5" }), hash: "defects" },
      { label: t("summary.title"), hint: t("summary.table"), hash: "summary" },
      ...D.COURSE_TABLES.map((x) => ({ label: `${t("common.table", { n: x.number })}. ${tableTitle(x.number)}`, hint: C.tableNote(x.number, x.note), hash: `tables/${x.number}`, extra: x.title })),
    ];
  }
  let searchIndex = -1;

  function renderSearch() {
    const input = byId("searchInput");
    const list = byId("searchResults");
    const q = input.value.trim().toLowerCase();
    if (!q) { list.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    const hits = searchIndexList().filter((x) => `${x.label} ${x.hint} ${x.extra || ""}`.toLowerCase().includes(q)).slice(0, 8);
    searchIndex = hits.length ? Math.min(Math.max(searchIndex, 0), hits.length - 1) : -1;
    list.innerHTML = hits.length
      ? hits.map((x, i) => `<li><a role="option" id="search-opt-${i}" href="#${x.hash}" aria-selected="${i === searchIndex}">${esc(x.label)}<small>${esc(x.hint)}</small></a></li>`).join("")
      : `<li class="empty">${esc(t("search.none", { q: input.value.trim() }))}</li>`;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (searchIndex >= 0) input.setAttribute("aria-activedescendant", `search-opt-${searchIndex}`);
    else input.removeAttribute("aria-activedescendant");
  }

  function closeSearch(clear) {
    byId("searchResults").hidden = true;
    byId("searchInput").setAttribute("aria-expanded", "false");
    if (clear) byId("searchInput").value = "";
    searchIndex = -1;
  }

  /* Saved workspace. Only the inputs are stored; results are always recalculated. */

  const WORKSPACE_KEY = "cpit456-workspace";
  let booted = false;
  let saveTimer = null;

  function snapshot() {
    return JSON.parse(JSON.stringify({
      v: 2,
      fields: Object.fromEntries(Object.keys(FIELDS).map((id) => [id, byId(id).value])),
      fp: state.fp, basicMode: state.basicMode, intermediateMode: state.intermediateMode, drivers: state.drivers,
      advancedMode: state.advancedMode, phases: state.phases,
      defects: state.defects, delphi: state.delphi, delphiSelected: state.delphiSelected,
    }));
  }

  // Rejects anything that does not have exactly the expected shape, so a damaged or old
  // saved workspace falls back to the lecture examples instead of breaking the page.
  function validSnapshot(x) {
    const str = (v) => typeof v === "string" && v.length <= 40;
    // Counts are numbers until the user edits them, then strings from the input.
    const count = (v) => str(v) || (typeof v === "number" && Number.isFinite(v));
    const nameOk = (v) => v === null || str(v);
    const list = (v, max) => Array.isArray(v) && v.length <= max;
    const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    try {
      return x.v === 2
        && Object.keys(FIELDS).every((id) => str(x.fields[id]))
        && D.FP_PARAMETERS.every(([k]) => count(x.fp.counts[k]) && ["simple", "average", "complex"].includes(x.fp.complexities[k]))
        && Array.isArray(x.fp.influences) && x.fp.influences.length === D.GSC_QUESTIONS.length
        && x.fp.influences.every((n) => Number.isInteger(n) && n >= 0 && n <= 5)
        && has(L.LOC_PER_FP, x.fp.language)
        && [x.basicMode, x.intermediateMode, x.advancedMode].every((m) => has(L.COCOMO_MODES, m))
        && list(x.phases, 20) && x.phases.every((p) => nameOk(p.name) && (p.key === null || PHASE_KEYS.includes(p.key)) && str(p.share) && str(p.eaf))
        && Array.isArray(x.drivers) && x.drivers.length === L.COCOMO_DRIVER_NAMES.length
        && x.drivers.every((d) => L.DRIVER_RATINGS.includes(d.rating) && str(d.multiplier))
        && list(x.defects, 50) && x.defects.every((d) => nameOk(d.name) && str(d.defects) && str(d.fp))
        && list(x.delphi, 50) && x.delphi.every((d) => nameOk(d.name) && nameOk(d.lectureName) && str(d.maximum) && str(d.minimum) && typeof d.touched === "boolean")
        && Number.isInteger(x.delphiSelected);
    } catch (error) {
      return false;
    }
  }

  function applySnapshot(x) {
    Object.entries(x.fields).forEach(([id, value]) => { byId(id).value = value; });
    Object.assign(state, {
      fp: x.fp, basicMode: x.basicMode, intermediateMode: x.intermediateMode, drivers: x.drivers,
      advancedMode: x.advancedMode, phases: x.phases,
      defects: x.defects, delphi: x.delphi, delphiSelected: Math.max(0, Math.min(x.delphiSelected, x.delphi.length - 1)),
    });
  }

  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try { window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot())); } catch (error) { /* storage unavailable */ }
  }

  function saveSoon() {
    if (!booted) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }

  function loadSaved() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(WORKSPACE_KEY));
      if (saved && validSnapshot(saved)) applySnapshot(saved);
    } catch (error) { /* no saved workspace */ }
  }

  function renderInputs() {
    renderFpInputs();
    renderCocomoInputs();
    renderDrivers();
    renderPhases();
    renderDefects();
    renderDelphi();
    updateAll();
  }

  /* Toast: short confirmations with an optional action. It never takes focus. */

  let toastTimer = null;
  let toastAction = null;

  function hideToast() {
    clearTimeout(toastTimer);
    byId("toast").hidden = true;
    toastAction = null;
  }

  function showToast(message, action) {
    const box = byId("toast");
    const button = byId("toastAction");
    clearTimeout(toastTimer);
    byId("toastText").textContent = message;
    toastAction = action ? action.run : null;
    button.hidden = !action;
    if (action) button.textContent = action.label;
    box.hidden = false;
    box.classList.remove("in");
    void box.offsetWidth;
    box.classList.add("in");
    const wait = () => { toastTimer = setTimeout(hideToast, action ? 7000 : 4000); };
    // Hovering or focusing the toast keeps it open.
    box.onmouseenter = () => clearTimeout(toastTimer);
    box.onfocusin = () => clearTimeout(toastTimer);
    box.onmouseleave = () => { clearTimeout(toastTimer); wait(); };
    box.onfocusout = () => { clearTimeout(toastTimer); wait(); };
    wait();
  }

  /* Reset and bindings */

  function resetAll() {
    const before = snapshot();
    Object.keys(FIELDS).forEach((id) => { byId(id).value = byId(id).defaultValue; });
    lectureDefaults();
    renderInputs();
    showToast(t("toast.reset"), {
      label: t("toast.undo"),
      run: () => { applySnapshot(before); renderInputs(); showToast(t("toast.undone")); },
    });
  }

  function updateAll() {
    updateSloc();
    updateFp();
    updateHours();
    updateProductivity();
    updateDefects();
    updateBasic();
    updateIntermediate();
    updateAdvanced();
    updateDelphi();
    refreshDerived();
  }

  function refreshDerived() {
    renderSummary();
    saveSoon();
  }

  function setStatus(key) {
    showToast(t(key));
  }

  function bind() {
    const groups = [
      [["slocLoc", "slocProductivity", "slocDevelopers", "slocRate"], updateSloc],
      [["hoursFp", "hoursPerFp", "hoursPerDay", "daysPerMonth", "planDevelopers"], updateHours],
      [["productivityFp", "fpPerPm", "productivityRate"], updateProductivity],
      [["cocomoKloc", "cocomoRate"], updateBasic],
      [["intermediateKloc", "intermediateRate"], updateIntermediate],
      [["advancedKloc", "advancedRate"], updateAdvanced],
    ];
    document.addEventListener("input", (e) => {
      const el = e.target;
      const group = groups.find(([ids]) => ids.includes(el.id));
      if (group) group[1]();
      else if (el.closest("#fpRows, #gscRows, #languageTiles")) { readFpInputs(); updateFp(); }
      else if (el.name === "cocomoMode") { state.basicMode = el.value; updateBasic(); }
      else if (el.name === "intermediateMode") { state.intermediateMode = el.value; updateIntermediate(); }
      else if (el.name === "advancedMode") { state.advancedMode = el.value; updateAdvanced(); }
      else if (el.closest("#phaseRows")) {
        const p = state.phases[Number(el.closest(".phase").dataset.index)];
        if (el.classList.contains("phase-name")) p.name = el.value;
        else if (el.classList.contains("phase-share")) p.share = el.value;
        else p.eaf = el.value;
        updateAdvanced();
      }
      else if (el.closest("#driverGroups")) {
        const i = Number(el.closest(".driver").dataset.index);
        if (el.tagName === "SELECT") {
          state.drivers[i].rating = el.value;
          // The lecture assigns the Average rating a static value of 1.0.
          if (el.value === "Average") { state.drivers[i].multiplier = "1.00"; byId(`driver-mult-${i}`).value = "1.00"; }
        } else state.drivers[i].multiplier = el.value;
        updateIntermediate();
      } else if (el.closest("#defectRows")) {
        const i = Number(el.closest("tr").dataset.index);
        const p = state.defects[i];
        if (el.classList.contains("defect-name")) p.name = el.value;
        else if (el.classList.contains("defect-count")) p.defects = el.value;
        else p.fp = el.value;
        updateDefects();
      } else if (el.closest("#delphiRows")) {
        const i = Number(el.closest("tr").dataset.index);
        const x = state.delphi[i];
        if (el.classList.contains("delphi-task")) x.name = el.value;
        else { x.touched = true; if (el.classList.contains("delphi-max")) x.maximum = el.value; else x.minimum = el.value; }
        state.delphiSelected = i;
        updateDelphi();
      } else if (el.id === "delphiThreshold") updateDelphi();
      else if (el.id === "searchInput") { searchIndex = 0; renderSearch(); return; }
      else if (el.id === "tableSearch") { renderLibrary(); return; }
      else return;
      refreshDerived();
    });

    byId("loadSlocExample").addEventListener("click", () => {
      const e = D.EXAMPLES.sloc;
      byId("slocLoc").value = e.loc; byId("slocProductivity").value = e.productivity; byId("slocDevelopers").value = e.developers; byId("slocRate").value = e.laborRate;
      updateSloc(); refreshDerived();
    });
    byId("loadFpExample").addEventListener("click", () => { loadFpExample(D.EXAMPLES.example1); refreshDerived(); });
    byId("loadSafeHome").addEventListener("click", () => { loadFpExample(D.EXAMPLES.safeHome); refreshDerived(); });
    byId("resetAll").addEventListener("click", resetAll);
    byId("resetQuick").addEventListener("click", resetAll);

    document.addEventListener("click", (e) => {
      const step = e.target.closest("[data-fp-step]");
      if (step) {
        setFpStep(step.dataset.fpStep);
        window.history.replaceState(null, "", `#fp/${fpStep}`);
        const card = byId(FP_CARDS[fpStep]);
        if (card.getBoundingClientRect().top < 0) document.querySelector(".stepper").scrollIntoView({ block: "start" });
      }
      const part = e.target.closest(".part-option");
      if (part) window.history.replaceState(null, "", part.id === "part-tab-2" ? "#home/part2" : "#home");
      if (e.target.closest("#useFpInPlanning") && latest.fp) {
        byId("hoursFp").value = latest.fp.roundedFp;
        updateHours(); refreshDerived();
        window.location.hash = "planning/hours";
        showToast(t("toast.sentFp", { fp: fmt(latest.fp.roundedFp, 0) }));
      }
      const item = e.target.closest(".table-item");
      if (item) { selectedTable = Number(item.dataset.table); renderLibrary(); }
      const filter = e.target.closest("[data-filter]");
      if (filter) {
        tableFilter = filter.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === filter)));
        renderLibrary();
      }
      const themeBtn = e.target.closest("[data-theme-choice]");
      if (themeBtn) { window.CpitTheme.set(themeBtn.dataset.themeChoice); syncPrefs(); }
      const langBtn = e.target.closest("[data-lang-choice]");
      if (langBtn && langBtn.dataset.langChoice !== window.CpitLang.get()) { window.CpitLang.set(langBtn.dataset.langChoice); applyLanguage(); }
      if (!e.target.closest(".search")) closeSearch(false);
    });
    byId("themeQuick").addEventListener("click", () => { window.CpitTheme.toggle(); syncPrefs(); });
    byId("langQuick").addEventListener("click", () => { window.CpitLang.set(window.CpitLang.get() === "ar" ? "en" : "ar"); applyLanguage(); });

    byId("addDefectProject").addEventListener("click", () => {
      state.defects.push({ name: null, defects: "0", fp: "100" });
      renderDefects(); refreshDerived();
      byId("defectRows").querySelector("tr:last-child .defect-name").focus();
    });
    byId("defectRows").addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-defect");
      if (!btn) return;
      state.defects.splice(Number(btn.closest("tr").dataset.index), 1);
      renderDefects(); refreshDerived();
      byId("addDefectProject").focus();
    });

    byId("loadBasicExample").addEventListener("click", () => {
      const e = D.EXAMPLES.basicCocomo;
      byId("cocomoKloc").value = e.kloc; byId("cocomoRate").value = e.laborRate;
      state.basicMode = e.mode;
      renderCocomoInputs(); updateBasic(); refreshDerived();
    });
    byId("loadCocomoExample").addEventListener("click", () => {
      const e = D.EXAMPLES.insurance;
      byId("intermediateKloc").value = e.kloc; byId("intermediateRate").value = e.laborRate;
      state.intermediateMode = e.mode;
      state.drivers = insuranceDrivers();
      renderCocomoInputs(); renderDrivers(); updateIntermediate(); refreshDerived();
    });
    byId("resetDrivers").addEventListener("click", () => { state.drivers = averageDrivers(); renderDrivers(); updateIntermediate(); refreshDerived(); });

    byId("addPhase").addEventListener("click", () => {
      state.phases.push({ name: null, key: null, share: "0", eaf: "1.00" });
      renderPhases(); refreshDerived();
      byId("phaseRows").querySelector(".phase:last-child .phase-name").focus();
    });
    byId("phaseRows").addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-phase");
      if (!btn) return;
      state.phases.splice(Number(btn.closest(".phase").dataset.index), 1);
      renderPhases(); refreshDerived();
      byId("addPhase").focus();
    });
    byId("advUseIntermediate").addEventListener("click", () => {
      const x = latest.intermediate;
      if (!x) { showToast(t("toast.noIntermediate")); return; }
      byId("advancedKloc").value = x.kloc;
      state.advancedMode = x.mode;
      const eaf = String(L.roundHalfUp(x.eaf, 4));
      state.phases.forEach((p) => { p.eaf = eaf; });
      renderCocomoInputs(); renderPhases(); refreshDerived();
      showToast(t("toast.usedIntermediate", { eaf }));
    });

    byId("loadDelphiExample").addEventListener("click", () => {
      byId("delphiThreshold").value = D.EXAMPLES.delphi.threshold;
      state.delphi = D.EXAMPLES.delphi.tasks.map((x) => ({ name: null, lectureName: x.task, maximum: String(x.maximum), minimum: String(x.minimum), touched: true }));
      state.delphiSelected = 1;
      renderDelphi(); refreshDerived();
    });
    byId("addDelphiTask").addEventListener("click", () => {
      state.delphi.push({ name: null, lectureName: null, maximum: "", minimum: "", touched: false });
      state.delphiSelected = state.delphi.length - 1;
      renderDelphi(); refreshDerived();
      byId("delphiRows").querySelector("tr:last-child .delphi-task").focus();
    });
    byId("delphiRows").addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;
      if (e.target.closest(".remove-delphi")) {
        state.delphi.splice(Number(row.dataset.index), 1);
        state.delphiSelected = Math.min(state.delphiSelected, state.delphi.length - 1);
        renderDelphi(); refreshDerived();
        byId("addDelphiTask").focus();
        return;
      }
      if (Number(row.dataset.index) !== state.delphiSelected) { state.delphiSelected = Number(row.dataset.index); updateDelphi(); }
    });

    byId("copySummary").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summaryText());
        setStatus("summary.copied");
      } catch (error) {
        setStatus("summary.copyBlocked");
      }
    });
    byId("downloadCsv").addEventListener("click", () => {
      // The byte order mark lets spreadsheet programs read Arabic text correctly.
      const blob = new Blob([String.fromCharCode(0xfeff), summaryCsv()], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "estimation-summary.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setStatus("summary.downloaded");
    });
    byId("printSummary").addEventListener("click", () => window.print());

    const search = byId("searchInput");
    const setSearchOpen = (open) => {
      document.querySelector(".topbar").classList.toggle("search-open", open);
      byId("searchToggle").setAttribute("aria-expanded", String(open));
      if (open) search.focus();
      else closeSearch(true);
    };
    byId("searchToggle").addEventListener("click", () => setSearchOpen(!document.querySelector(".topbar").classList.contains("search-open")));
    search.addEventListener("keydown", (e) => {
      const options = byId("searchResults").querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!options.length) return;
        searchIndex = (searchIndex + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        renderSearch();
      } else if (e.key === "Enter" && options[searchIndex]) {
        e.preventDefault();
        window.location.hash = options[searchIndex].getAttribute("href").slice(1);
        closeSearch(true);
      } else if (e.key === "Escape") { setSearchOpen(false); byId("searchToggle").focus(); }
    });
    byId("searchResults").addEventListener("click", (e) => { if (e.target.closest("a")) setSearchOpen(false); });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav(true);
    });

    byId("openNav").addEventListener("click", openNav);
    byId("closeNav").addEventListener("click", () => closeNav(true));
    byId("navBackdrop").addEventListener("click", () => closeNav(true));
    window.matchMedia("(max-width: 1024px)").addEventListener("change", (e) => { if (!e.matches) closeNav(false); });
    document.querySelector(".skip-link").addEventListener("click", (e) => { e.preventDefault(); byId("main").focus(); });
    window.addEventListener("hashchange", () => showPage(true));
    byId("toastAction").addEventListener("click", () => { const run = toastAction; hideToast(); if (run) run(); });
    byId("toastClose").addEventListener("click", hideToast);
    // A change made just before the page closes is still saved.
    window.addEventListener("pagehide", () => { if (saveTimer) saveNow(); });
  }

  // The project name field was removed; clear the value an earlier version saved.
  try { window.localStorage.removeItem("cpit456-project"); } catch (error) { /* storage unavailable */ }
  document.querySelectorAll(".page").forEach((section) => {
    const use = document.querySelector(`.nav a[data-page="${section.dataset.page}"] use`);
    const head = section.querySelector(".page-head > div:first-child");
    if (use && head) head.insertAdjacentHTML("afterbegin", `<span class="page-icon" aria-hidden="true"><svg class="icon"><use href="${use.getAttribute("href")}" /></svg></span>`);
  });
  lectureDefaults();
  loadSaved();
  setFpStep("count");
  U.initTabs();
  U.initLinking();
  bind();
  applyLanguage();
  showPage(false);
  booted = true;
})();
