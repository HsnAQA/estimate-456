(function () {
  "use strict";

  // Motion for Estimate 456. Two parts:
  // 1. A blueprint particle network behind the home page heading (the particles.js
  //    idea, drawn with our own small canvas code in the page's colors).
  // 2. Entrance motion for sheets, cards, and worked-solution steps, using anime.js
  //    (vendor/anime, MIT). Numbers are never animated, so every result is correct
  //    the moment it appears.
  // Everything is skipped when the viewer asks for reduced motion.

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const A = window.anime;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* 1. Particle network */

  function startNetwork(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement;
    let points = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    const mouse = { x: -9999, y: -9999 };

    function size() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (width * height) / 9000)));
      points = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: i % 7 === 0 ? 2.6 : 1.6,
        hot: i % 7 === 0,
      }));
    }

    function draw(step) {
      const line = css("--border-strong") || "#aaa59a";
      const dot = css("--text-3") || "#5b6578";
      const hot = css("--accent") || "#b83c15";
      ctx.clearRect(0, 0, width, height);
      const reach = Math.min(150, Math.max(90, width / 9));
      for (const p of points) {
        if (step) {
          // Points drift and gently move away from the pointer.
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 1) {
            const push = (1 - Math.sqrt(d2) / 120) * 0.6;
            p.x += (dx / Math.sqrt(d2)) * push;
            p.y += (dy / Math.sqrt(d2)) * push;
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < reach) {
            ctx.globalAlpha = (1 - d / reach) * 0.55;
            ctx.strokeStyle = a.hot && b.hot ? hot : line;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      for (const p of points) {
        ctx.fillStyle = p.hot ? hot : dot;
        ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
      }
    }

    function loop() {
      draw(true);
      frame = requestAnimationFrame(loop);
    }

    function play() {
      cancelAnimationFrame(frame);
      const visible = !document.hidden && !canvas.closest("[hidden]");
      if (reduced.matches || !visible) { draw(false); return; }
      frame = requestAnimationFrame(loop);
    }

    size();
    play();
    window.addEventListener("resize", () => { size(); play(); });
    document.addEventListener("visibilitychange", play);
    window.addEventListener("hashchange", play);
    reduced.addEventListener("change", play);
    host.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
    // Redraw in the new colors when the theme changes.
    new MutationObserver(() => draw(false)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* 2. Entrance motion */

  function enter(targets) {
    if (!A || reduced.matches || !targets.length) return;
    A.animate(targets, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 520,
      delay: A.stagger(55),
      ease: "outCubic",
      onComplete: () => targets.forEach((el) => { el.style.transform = ""; el.style.opacity = ""; }),
    });
  }

  function pageTargets() {
    const page = document.querySelector(".page:not([hidden])");
    if (!page) return [];
    return [...page.querySelectorAll(":scope > .page-head, .home-head, .part-option, .method-card:not([hidden] *), .calc > *, .outputs > .panel, .note-section, .glossary-item, .stepper")]
      .filter((el) => el.getClientRects().length)
      .slice(0, 18);
  }

  // New worked-solution steps slide in when a result changes, once per change.
  function watchTraces() {
    if (!A) return;
    document.querySelectorAll(".trace-panel").forEach((panel) => {
      new MutationObserver(() => {
        if (reduced.matches) return;
        const steps = [...panel.querySelectorAll(".trace > li")];
        if (!steps.length || panel.dataset.seen === String(steps.length) + panel.querySelector(".trace").className) return;
        panel.dataset.seen = String(steps.length) + panel.querySelector(".trace").className;
        A.animate(steps, { opacity: [0, 1], translateX: [document.documentElement.dir === "rtl" ? -10 : 10, 0], duration: 380, delay: A.stagger(40), ease: "outQuad", onComplete: () => steps.forEach((el) => { el.style.transform = ""; el.style.opacity = ""; }) });
      }).observe(panel, { childList: true });
    });
  }

  function init() {
    const canvas = document.getElementById("homeNetwork");
    if (canvas) startNetwork(canvas);
    watchTraces();
    enter(pageTargets());
    window.addEventListener("hashchange", () => requestAnimationFrame(() => enter(pageTargets())));
    document.addEventListener("click", (e) => {
      if (e.target.closest(".part-option, [data-fp-step], .tabs [role='tab']")) requestAnimationFrame(() => enter(pageTargets().filter((el) => el.matches(".method-card, .calc > *, .stepper ~ *"))));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
