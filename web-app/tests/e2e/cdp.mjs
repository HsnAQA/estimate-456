// Minimal Chrome DevTools Protocol driver for headless Microsoft Edge or Google Chrome.
// Used only by run-e2e.mjs. It needs no npm packages.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const CANDIDATES = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function findBrowser() {
  return CANDIDATES.find((file) => existsSync(file)) || null;
}

export async function launch(port = 9451) {
  const exe = findBrowser();
  if (!exe) throw new Error("No Edge or Chrome found. Set BROWSER_PATH to the browser executable.");
  const profile = mkdtempSync(path.join(tmpdir(), "cpit456-e2e-"));
  const proc = spawn(exe, [
    "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-extensions", "about:blank",
  ], { stdio: "ignore" });
  let targets = [];
  for (let i = 0; i < 60 && !targets.length; i++) {
    try { targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).filter((x) => x.type === "page"); } catch { /* retry */ }
    if (!targets.length) await sleep(200);
  }
  if (!targets.length) throw new Error("The browser did not open a debugging page.");
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  const logs = [];
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
      return;
    }
    if (msg.method === "Runtime.exceptionThrown") logs.push(`exception: ${msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text}`);
    if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) logs.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(" ")}`);
    if (msg.method === "Log.entryAdded" && ["error", "warning"].includes(msg.params.entry.level)) logs.push(`${msg.params.entry.level}: ${msg.params.entry.text}`);
    listeners.forEach((fn) => fn(msg));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");

  async function load(url) {
    const loaded = new Promise((resolve) => {
      const fn = (m) => { if (m.method === "Page.loadEventFired") { listeners.splice(listeners.indexOf(fn), 1); resolve(); } };
      listeners.push(fn);
      setTimeout(resolve, 8000);
    });
    await send("Page.navigate", { url });
    await loaded;
  }

  return {
    logs,
    sleep,
    async viewport(width, height = 900) { await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 }); },
    // Hash-only navigation fires no load event, so each visit passes through about:blank.
    async goto(url) { await load("about:blank"); await load(url); await sleep(150); },
    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression: `{ ${expression} }`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async key(key, code, keyCode) {
      for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key, code, windowsVirtualKeyCode: keyCode });
    },
    // Saves a PNG of the viewport, or of the whole page when full is true.
    async screenshot(file, full = false) {
      const { writeFileSync } = await import("node:fs");
      const params = { format: "png" };
      if (full) {
        const m = await send("Page.getLayoutMetrics");
        params.captureBeyondViewport = true;
        params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: m.cssContentSize.height, scale: 1 };
      }
      const r = await send("Page.captureScreenshot", params);
      writeFileSync(file, Buffer.from(r.data, "base64"));
    },
    async close() {
      try { await send("Browser.close"); } catch { /* already closed */ }
      proc.kill();
      await sleep(300);
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* profile still locked */ }
    },
  };
}
