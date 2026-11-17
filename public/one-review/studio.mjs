// ONE review page, phase 2-3 modules: in-browser test suite, flight recorder explorer, reviewer mode, theme.
// Browser only. Reads two files from this same site (kit/*.mjs, kit/sample_export.json). No other network use.
import { runAll } from "./kit/cases.mjs";
import { validate, seal } from "./kit/flight_recorder.mjs";

const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

/* ---------- run every test ---------- */
const runBtn = $("runAll");
if (runBtn) runBtn.addEventListener("click", async () => {
  const out = $("suiteOut"); runBtn.disabled = true; out.textContent = "Running 18 cases in your browser…";
  try {
    const t0 = performance.now(); const res = await runAll(); const ms = Math.round(performance.now() - t0);
    out.textContent = "";
    const pass = res.filter((r) => r.pass).length;
    const head = el("p", "suite-h " + (pass === res.length ? "ok" : "no"), `${pass} of ${res.length} cases behaved as expected (${ms} ms, in your browser).`);
    out.appendChild(head);
    const ul = el("ul", "suite-l");
    for (const r of res) {
      const li = el("li", r.pass ? "ok" : "no");
      li.appendChild(el("span", "sm", r.pass ? "PASS" : "FAIL"));
      li.appendChild(el("span", "", ` ${r.name}: expected ${r.expect}, got ${r.got}${r.why ? " (" + r.why + ")" : ""}`));
      ul.appendChild(li);
    }
    out.appendChild(ul);
    out.appendChild(el("p", "note", "These cases test a reference model of the rules, not ONE's live code. T5 is a known limit and is expected to go undetected."));
  } catch (e) { out.textContent = "Could not run the tests in this browser: " + e.message; }
  runBtn.disabled = false;
});

/* ---------- flight recorder explorer ---------- */
const frx = $("frx");
if (frx) {
  let doc = null;
  const table = $("frxTable"), verdict = $("frxVerdict");
  const draw = (badSeqs = []) => {
    table.textContent = "";
    if (!doc) { table.appendChild(el("p", "empty", "No export loaded.")); return; }
    for (const e of doc.events) {
      const row = el("div", "fr-row" + (badSeqs.includes(e.seq) ? " bad" : ""));
      row.appendChild(el("span", "fr-n", "#" + e.seq));
      row.appendChild(el("span", "fr-t t-" + e.type, e.type));
      const body = el("span", "fr-b");
      body.appendChild(el("b", "", (e.actor && e.actor.kind) + (e.request_id ? " · " + e.request_id : "")));
      body.appendChild(el("span", "", " " + e.summary));
      body.appendChild(el("code", "fr-h", "hash " + String(e.hash).slice(0, 16) + "…  prev " + String(e.prev).slice(0, 8) + "…"));
      row.appendChild(body); table.appendChild(row);
    }
  };
  const load = async () => {
    verdict.className = "verdict"; verdict.textContent = "";
    try { const r = await fetch("kit/sample_export.json", { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); doc = await r.json(); draw(); }
    catch (e) { doc = null; table.textContent = ""; table.appendChild(el("p", "empty", "Could not load the sample (" + e.message + "). It needs the page to be served over http(s).")); }
  };
  const check = async () => {
    if (!doc) return;
    const r = await validate(doc);
    const bad = r.errors.map((m) => +((m.match(/^#(\d+)/) || [])[1] || 0));
    draw(bad);
    verdict.className = "verdict " + (r.ok ? "ok" : "no");
    verdict.textContent = r.ok ? `✓ Valid: ${r.count} events, chain intact. (${r.warnings[r.warnings.length - 1]})` : "✗ " + r.errors.slice(0, 3).join(" · ") + (r.errors.length > 3 ? ` (+${r.errors.length - 3} more)` : "");
  };
  const act = (fn, msg) => async () => { if (!doc) await load(); await fn(); verdict.className = "verdict"; verdict.textContent = ""; draw(); if (msg) { verdict.className = "verdict warn"; verdict.textContent = msg + " Now tap Validate."; } };
  $("frxLoad").addEventListener("click", async () => { await load(); });
  $("frxCheck").addEventListener("click", check);
  $("frxEdit").addEventListener("click", act(async () => { doc.events[0].summary = "Order 40 replacement filters, $1,600"; }, "Event #1 was quietly changed from $40 to $1,600."));
  $("frxAi").addEventListener("click", act(async () => { const e = doc.events.find((x) => x.type === "approval"); if (e) e.actor = { kind: "ai", id: "sample-assistant" }; await seal(doc.events); }, "The approval was rewritten as the AI's, and every seal was recomputed so the chain looks clean."));
  $("frxCut").addEventListener("click", act(async () => { doc.events.pop(); }, "The last event was cut off."));
  load();
}

/* ---------- reviewer mode + theme ---------- */
const root = document.documentElement;
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };
const rv = $("reviewerBtn");
const setReviewer = (on) => {
  document.body.classList.toggle("reviewer", on);
  if (rv) { rv.setAttribute("aria-pressed", on ? "true" : "false"); rv.textContent = on ? "Reviewer mode: on" : "Reviewer mode"; }
  if (on) document.querySelectorAll("#deep details").forEach((d) => (d.open = true));
  const b = $("reviewerBanner"); if (b) b.hidden = !on;
  store.set("one-reviewer", on ? "1" : "0");
};
if (rv) rv.addEventListener("click", () => { setReviewer(!document.body.classList.contains("reviewer")); if (document.body.classList.contains("reviewer")) $("reviewerBanner").scrollIntoView({ behavior: "smooth", block: "start" }); });
if (store.get("one-reviewer") === "1" || location.hash === "#reviewer") setReviewer(true);

const th = $("themeBtn");
const setTheme = (t) => { if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme"); if (th) th.setAttribute("aria-label", "Switch to " + (t === "light" ? "dark" : "light") + " mode"); };
if (th) th.addEventListener("click", () => {
  const cur = root.getAttribute("data-theme") || "dark";
  const next = cur === "light" ? "dark" : "light"; setTheme(next); store.set("one-theme", next);
});
setTheme(store.get("one-theme"));
