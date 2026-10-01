(function () {
  "use strict";

  // Loaded synchronously in <head> so the saved theme and language apply before the first paint.
  // Theme contract: default light, values light or dark, storage key cpit456-theme.
  // Language contract: default en, values en or ar, storage key cpit456-lang. Arabic sets dir="rtl".
  const root = document.documentElement;

  function read(key, allowed) {
    try {
      const stored = window.localStorage.getItem(key);
      return allowed.includes(stored) ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Storage can be unavailable in private windows. The choice still applies for this visit.
    }
  }

  function applyTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", value);
    root.style.colorScheme = value;
    return value;
  }

  function applyLang(lang) {
    const value = lang === "ar" ? "ar" : "en";
    root.setAttribute("lang", value);
    root.setAttribute("dir", value === "ar" ? "rtl" : "ltr");
    return value;
  }

  applyTheme(read("cpit456-theme", ["light", "dark"]) || "light");
  applyLang(read("cpit456-lang", ["en", "ar"]) || "en");

  window.CpitTheme = {
    STORAGE_KEY: "cpit456-theme",
    get: () => root.getAttribute("data-theme"),
    set: (theme) => { const v = applyTheme(theme); write("cpit456-theme", v); return v; },
    toggle: () => window.CpitTheme.set(root.getAttribute("data-theme") === "dark" ? "light" : "dark"),
  };

  window.CpitLang = {
    STORAGE_KEY: "cpit456-lang",
    get: () => root.getAttribute("lang"),
    set: (lang) => { const v = applyLang(lang); write("cpit456-lang", v); return v; },
  };
})();
