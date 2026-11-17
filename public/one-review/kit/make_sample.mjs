// Builds sample_export.json: made-up events only.  Usage: node make_sample.mjs
import { writeFileSync } from "node:fs";
import { seal } from "./flight_recorder.mjs";
const t = (m) => new Date(Date.UTC(2026, 10, 17, 12, m)).toISOString();
const ai = { kind: "ai", id: "sample-assistant" }, owner = { kind: "owner", id: "sample-owner" }, sys = { kind: "system", id: "sample-gate" };
const events = [
  { at: t(0), type: "request", actor: ai, request_id: "REQ-1", summary: "Order a replacement filter, $40", policy: null, evidence: { request_text_sha256: "sample" } },
  { at: t(1), type: "policy", actor: sys, request_id: "REQ-1", summary: "Consequential (spends money): owner approval required", policy: { rule: "Rule 000", result: "needs_owner" }, evidence: null },
  { at: t(3), type: "approval", actor: owner, request_id: "REQ-1", summary: "Approved with passkey", policy: null, evidence: { passkey_assertion_sha256: "sample-not-a-real-assertion" } },
  { at: t(4), type: "note", actor: sys, request_id: "REQ-1", summary: "No executor: nothing is carried out", policy: null, evidence: null },
  { at: t(6), type: "request", actor: ai, request_id: "REQ-2", summary: "Delete old backups", policy: null, evidence: { request_text_sha256: "sample" } },
  { at: t(7), type: "stop", actor: owner, request_id: null, summary: "Owner pressed STOP; REQ-2 voided", policy: null, evidence: null },
  { at: t(9), type: "resume", actor: owner, request_id: null, summary: "Owner lifted STOP with passkey", policy: null, evidence: { passkey_assertion_sha256: "sample-not-a-real-assertion" } },
];
const doc = { schema: "one.flightrecorder/0.1", synthetic: true, note: "Made-up sample. Not from the live system.", recorder: { name: "sample", version: "0.1" }, events: await seal(events) };
writeFileSync(new URL("./sample_export.json", import.meta.url), JSON.stringify(doc, null, 2) + "\n");
console.log("wrote sample_export.json with", events.length, "events");
