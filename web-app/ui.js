(function () {
  "use strict";

  // Shared UI helpers: localized field validation, result panels, and the worked-solution
  // renderer. No calculations live here. They come from logic.js.
  const L = window.EstimatorLogic;
  const I = window.EstimateI18n;
  const t = I.t;

  const byId = (id) => document.getElementById(id);
  const fmt = (value, digits = 2) => L.formatNumber(value, digits);
  const money = (value) => L.formatMoney(value);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function icon(name, extra = "") {
    return `<svg class="icon${extra ? ` ${extra}` : ""}" aria-hidden="true"><use href="#i-${name}" /></svg>`;
  }

  // Localized message for a number issue from logic.numberIssue. English text matches logic.checkNumber.
  function issueMessage(issue, label) {
    return issue ? t(`err.${issue.code}`, { label, max: issue.max }) : "";
  }

  function check(value, labelKey, rule) {
    return issueMessage(L.numberIssue(value, rule), t(labelKey));
  }

  function setError(input, message, errorEl) {
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    if (errorEl) errorEl.textContent = message;
  }

  // fields: { id: [labelKey, rule] }. Returns { valid, values, invalidLabels }.
  function readFields(fields, ids) {
    const values = {};
    const invalidLabels = [];
    ids.forEach((id) => {
      const input = byId(id);
      const [labelKey, rule] = fields[id];
      const message = check(input.value, labelKey, rule);
      setError(input, message, byId(`${id}-error`));
      if (message) invalidLabels.push(t(labelKey));
      values[id] = input.value;
    });
    return { valid: invalidLabels.length === 0, values, invalidLabels };
  }

  // A value inside a worked solution. When linked, it highlights the input it came from.
  function val(value, link) {
    return `<span class="val"${link ? ` data-link="${link}"` : ""}>${esc(value)}</span>`;
  }

  function op(symbol) {
    return `<span class="op">${symbol}</span>`;
  }

  function answer(value, unit) {
    return `<span class="answer">${esc(value)}${unit ? ` <small>${esc(unit)}</small>` : ""}</span>`;
  }

  // steps: [{ title, formula, line (html), lecture }]
  function renderTrace(container, steps, subtitle = t("common.workedSub")) {
    container.innerHTML = `<h2 class="panel-title">${t("common.worked")}</h2><p>${subtitle}</p><ol class="trace">${steps
      .map((s, i) => `<li><span class="num">${i + 1}</span><div class="body"><div class="head"><span class="title">${s.title}</span>${s.lecture ? `<span class="lecture">${esc(s.lecture)}</span>` : ""}</div>${s.formula ? `<div class="formula">${s.formula}</div>` : ""}${s.line ? `<div class="line">${s.line}</div>` : ""}</div></li>`)
      .join("")}</ol>`;
  }

  function renderTraceWaiting(container, stepTitles, invalidLabels) {
    const reason = invalidLabels.length ? t("common.waiting", { fields: invalidLabels.join(I.getLang() === "ar" ? "، " : ", ") }) : t("common.invalid");
    container.innerHTML = `<h2 class="panel-title">${t("common.worked")}</h2><p>${esc(reason)}</p><ol class="trace waiting">${stepTitles
      .map((title, i) => `<li><span class="num">${i + 1}</span><div class="body"><span class="title">${title}</span><span class="waiting-text">${t("common.waitingStep")}</span></div></li>`)
      .join("")}</ol>`;
  }

  // result: { label, value, unit, note, facts: [{ label, value, note }], extra }
  function renderResult(container, result) {
    const facts = (result.facts || [])
      .map((f) => `<div><dt>${f.label}</dt><dd>${esc(f.value)}${f.note ? `<small>${esc(f.note)}</small>` : ""}</dd></div>`)
      .join("");
    // A changed answer gets a brief highlight so the effect of an edit is visible.
    const changed = container.dataset.value !== undefined && container.dataset.value !== String(result.value);
    container.dataset.value = String(result.value);
    container.innerHTML = `<div class="result-head"><span class="result-label">${result.label}</span><div class="result-value"><strong${changed ? ' class="changed"' : ""}>${esc(result.value)}</strong>${result.unit ? `<span>${esc(result.unit)}</span>` : ""}</div>${result.note ? `<span class="result-note">${esc(result.note)}</span>` : ""}</div>${facts ? `<dl class="facts">${facts}</dl>` : ""}${result.extra || ""}`;
  }

  function renderResultInvalid(container, label) {
    delete container.dataset.value;
    container.innerHTML = `<div class="result-head"><span class="result-label">${label}</span></div><p class="result-empty">${icon("warning")}<span>${t("common.invalid")}</span></p>`;
  }

  // Hovering a linked value highlights its input, and focusing an input highlights its values.
  function initLinking() {
    const toggle = (link, on) => {
      if (!link) return;
      document.querySelectorAll(`.val[data-link="${link}"]`).forEach((el) => el.classList.toggle("is-linked", on));
      const input = byId(link);
      if (input) input.classList.toggle("is-linked", on);
    };
    document.addEventListener("mouseover", (e) => { const v = e.target.closest(".val[data-link]"); if (v) toggle(v.dataset.link, true); });
    document.addEventListener("mouseout", (e) => { const v = e.target.closest(".val[data-link]"); if (v) toggle(v.dataset.link, false); });
    document.addEventListener("focusin", (e) => { if (e.target.id) toggle(e.target.id, true); });
    document.addEventListener("focusout", (e) => { if (e.target.id) toggle(e.target.id, false); });
  }

  // Accessible tabs with roving focus. Arrow keys follow the reading direction.
  function initTabs(root = document) {
    root.querySelectorAll('[role="tablist"]').forEach((list) => {
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      const select = (tab, focus) => {
        tabs.forEach((x) => {
          const on = x === tab;
          x.setAttribute("aria-selected", String(on));
          x.tabIndex = on ? 0 : -1;
          byId(x.getAttribute("aria-controls")).hidden = !on;
        });
        if (focus) tab.focus();
      };
      list.addEventListener("click", (e) => { const x = e.target.closest('[role="tab"]'); if (x) select(x, false); });
      list.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        const rtl = document.documentElement.dir === "rtl";
        const forward = rtl ? "ArrowLeft" : "ArrowRight";
        const back = rtl ? "ArrowRight" : "ArrowLeft";
        const next = { [forward]: i + 1, [back]: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
  }

  window.EstimateUI = { byId, fmt, money, esc, icon, check, issueMessage, setError, readFields, val, op, answer, renderTrace, renderTraceWaiting, renderResult, renderResultInvalid, initLinking, initTabs };
})();
