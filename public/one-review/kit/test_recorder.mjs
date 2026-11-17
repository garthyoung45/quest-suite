// Tests for the flight recorder validator.  Usage: node test_recorder.mjs
import { readFileSync } from "node:fs";
import { validate, seal } from "./flight_recorder.mjs";
const base = () => JSON.parse(readFileSync(new URL("./sample_export.json", import.meta.url), "utf8"));
const cases = [
  ["sample is valid", true, async (d) => d],
  ["edited summary", false, async (d) => { d.events[0].summary = "Order 40 filters"; return d; }],
  ["deleted middle event", false, async (d) => { d.events.splice(2, 1); return d; }],
  ["AI approves (resealed so hashes match)", false, async (d) => { d.events[2].actor = { kind: "ai", id: "x" }; await seal(d.events); return d; }],
  ["action with no approval (resealed)", false, async (d) => { d.events.push({ at: d.events[0].at, type: "action", actor: { kind: "system", id: "x" }, request_id: "REQ-2", summary: "ran", policy: null, evidence: null }); await seal(d.events); return d; }],
  ["request during STOP (resealed)", false, async (d) => { d.events.splice(6, 0, { at: d.events[5].at, type: "request", actor: { kind: "ai", id: "x" }, request_id: "REQ-3", summary: "sneak", policy: null, evidence: null }); await seal(d.events); return d; }],
  ["approval without passkey reference (resealed)", false, async (d) => { d.events[2].evidence = null; await seal(d.events); return d; }],
  ["wrong schema name", false, async (d) => { d.schema = "x"; return d; }],
  ["known limit: last event cut off", true, async (d) => { d.events.pop(); return d; }],
];
let f = 0;
for (const [n, want, mk] of cases) { const r = await validate(await mk(base())); const ok = r.ok === want; if (!ok) f++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}  (valid=${r.ok}${r.errors.length ? "; " + r.errors[0] : ""})`); }
console.log(`\n${cases.length - f} of ${cases.length} passed.`); process.exit(f ? 1 : 0);
