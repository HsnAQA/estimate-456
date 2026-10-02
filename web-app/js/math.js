(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EstimateMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Formulas as TeX, keyed by the i18n key of the plain-text formula they replace.
  // The same TeX serves English and Arabic: math stays left to right and uses
  // symbols that the Glossary page defines. Rendered with KaTeX (vendor/katex).
  const TEX = {
    "sloc.f.effort": "E = \\dfrac{\\text{LOC}}{P}",
    "sloc.f.duration": "D = \\dfrac{E}{N}",
    "sloc.f.cost": "\\text{Cost} = E \\times R",
    "sloc.f.costPerLoc": "c_{\\text{LOC}} = \\dfrac{R}{P}",
    "sloc.f.way2Cost": "\\text{Cost} = \\text{LOC} \\times c_{\\text{LOC}}",
    "sloc.f.way2Effort": "E = \\dfrac{\\text{Cost}}{R}",
    "fp.f.ct": "\\text{CT} = \\sum_{j=1}^{5} \\text{count}_j \\times w_j",
    "fp.f.vaf": "\\text{VAF} = 0.65 + 0.01 \\times \\sum_{i=1}^{14} F_i",
    "fp.f.fp": "\\text{FP} = \\text{CT} \\times \\text{VAF}",
    "fp.f.loc": "\\text{LOC} = \\text{FP} \\times \\text{AVC}",
    "fp.f.locLang": "\\text{LOC} = \\text{FP} \\times \\text{AVC}",
    "planning.f.hours": "H = \\text{FP} \\times h_{\\text{FP}}",
    "planning.f.days": "\\text{Days} = \\dfrac{H}{h_{\\text{day}}}",
    "planning.f.months": "\\text{PM} = \\dfrac{\\text{Days}}{d_{\\text{month}}}",
    "planning.f.duration": "D = \\dfrac{\\text{PM}}{N}",
    "planning.f.costPerFp": "c_{\\text{FP}} = \\dfrac{R}{P_{\\text{FP}}}",
    "planning.f.effort": "E = \\dfrac{\\text{FP}}{P_{\\text{FP}}}",
    "planning.f.cost": "\\text{Cost} = \\text{FP} \\times c_{\\text{FP}}",
    "defects.f": "\\text{Defect density} = \\dfrac{\\text{Defects}}{\\text{FP}}",
    "cocomo.f.ei": "E_i = C \\times \\text{KLOC}^{\\,K}",
    "cocomo.f.power": "\\text{KLOC}^{\\,K}",
    "cocomo.f.eiPower": "E_i = C \\times \\text{KLOC}^{\\,K}",
    "cocomo.f.cost": "\\text{Cost} = E_i \\times R",
    "cocomo.f.e": "E = \\text{EAF} \\times E_i",
    "cocomo.f.costE": "\\text{Cost} = E \\times R",
    "cocomo.f.eafSome": "\\text{EAF} = \\prod_{j=1}^{15} \\text{EM}_j",
    "cocomo.f.eafNone": "\\text{EAF} = \\prod_{j=1}^{15} \\text{EM}_j",
    "cocomo.f.eafDrivers": "\\text{EAF} = \\prod_{j=1}^{15} \\text{EM}_j",
    "cocomo.f.tdev": "T_{\\text{dev}} = c \\times E^{\\,d}",
    "cocomo.f.staff": "\\text{Staff} = \\dfrac{E}{T_{\\text{dev}}}",
    "adv.f.phase": "E_p = E_i \\times s_p \\times \\text{EAF}_p",
    "adv.f.total": "E = \\sum_{p} E_p",
    "adv.f.weighted": "\\text{EAF}_w = \\dfrac{E}{E_i}",
    "delphi.f.variance": "V = \\dfrac{\\max - \\min}{\\max} \\times 100",
    "delphi.f.decision": "V \\le V_{\\text{accept}} \\;\\Rightarrow\\; \\text{A}",
  };

  // Formulas that carry an extra sentence: the TeX is shown, then the sentence.
  const WITH_NOTE = new Set(["cocomo.f.eafSome", "cocomo.f.eafNone", "cocomo.f.eafDrivers", "fp.f.locLang"]);

  // Finds the TeX for a rendered formula string by comparing it with the i18n
  // strings of each formula key, in both languages. Placeholders match anything.
  function keyFor(text, strings) {
    if (!strings || !text) return null;
    const plain = String(text).replace(/[⁦-⁩]/g, "");
    for (const key of Object.keys(TEX)) {
      const pair = strings[key];
      if (!pair) continue;
      for (const variant of pair) {
        const pattern = new RegExp(`^${variant.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[a-z]+\}/gi, ".*")}$`);
        if (pattern.test(plain)) return key;
      }
    }
    return null;
  }

  function render(tex, displayMode = false) {
    const katex = typeof window !== "undefined" ? window.katex : null;
    if (!katex) return null;
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode, output: "html" });
    } catch (error) {
      return null;
    }
  }

  // Replaces $...$ in a string of trusted HTML with rendered math.
  function renderInline(html) {
    return String(html).replace(/\$([^$]+)\$/g, (whole, tex) => render(tex) || whole);
  }

  return { TEX, WITH_NOTE, keyFor, render, renderInline };
});
