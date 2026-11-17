// Assurance Flight Recorder: draft format "one.flightrecorder/0.1" and its validator.
// A PROPOSAL. Nothing on ONE's live system produces this format yet. Works in Node 20+ and browsers.
const enc = new TextEncoder();
const hex = (b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
const sha256 = async (s) => hex(await globalThis.crypto.subtle.digest("SHA-256", enc.encode(s)));
// Canonical JSON: keys sorted, no spaces. Enough for this draft (no floats needed).
export const canon = (v) => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]"
  : v && typeof v === "object" ? "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}"
  : JSON.stringify(v);
export const TYPES = ["request", "policy", "approval", "denial", "expiry", "stop", "resume", "action", "outcome", "note"];
export const eventHash = (e) => { const { hash, ...rest } = e; return sha256(canon(rest)); };
export async function seal(events) {
  let prev = "0".repeat(64);
  for (let i = 0; i < events.length; i++) { events[i].seq = i + 1; events[i].prev = prev; events[i].hash = await eventHash(events[i]); prev = events[i].hash; }
  return events;
}
export async function validate(doc) {
  const errors = [], warnings = [];
  const E = (seq, m) => errors.push(seq ? `#${seq}: ${m}` : m);
  if (!doc || doc.schema !== "one.flightrecorder/0.1") E(0, 'schema must be "one.flightrecorder/0.1"');
  if (!doc || !Array.isArray(doc.events)) { E(0, "events must be a list"); return { ok: false, errors, warnings }; }
  if (doc.synthetic !== true) warnings.push("not marked synthetic: treat as real evidence only if its source is known");
  let prev = "0".repeat(64); const approved = new Set(), seen = new Set(); let stopped = false;
  for (let i = 0; i < doc.events.length; i++) {
    const e = doc.events[i], s = e && e.seq;
    if (!e || typeof e !== "object") { E(i + 1, "not an object"); continue; }
    if (s !== i + 1) E(s, `sequence: expected ${i + 1}`);
    if (!TYPES.includes(e.type)) E(s, `unknown type "${e.type}"`);
    if (!e.at || isNaN(Date.parse(e.at))) E(s, "missing or bad time");
    if (!e.actor || !["ai", "owner", "system"].includes(e.actor.kind)) E(s, "actor.kind must be ai, owner or system");
    if (e.prev !== prev) E(s, "link to previous event broken");
    if (e.hash !== (await eventHash(e))) E(s, "event content does not match its hash");
    prev = e.hash;
    const id = e.request_id;
    if (e.type === "request") { if (stopped) E(s, "request accepted while STOP was on"); seen.add(id); }
    if (["approval", "denial"].includes(e.type)) {
      if (e.actor.kind !== "owner") E(s, `${e.type} by ${e.actor.kind}: only the owner decides`);
      if (!seen.has(id)) E(s, `${e.type} for unknown request ${id}`);
      if (e.type === "approval" && stopped) E(s, "approval while STOP was on");
      if (e.type === "approval" && (!e.evidence || !e.evidence.passkey_assertion_sha256)) E(s, "approval without a passkey assertion reference");
      if (e.type === "approval") approved.add(id);
    }
    if (e.type === "stop") stopped = true;
    if (e.type === "resume") { if (e.actor.kind !== "owner") E(s, "resume by non-owner"); stopped = false; }
    if (e.type === "action" && !approved.has(id)) E(s, `action on ${id} without an earlier approval`);
  }
  if (!doc.events.length) warnings.push("no events");
  warnings.push("A valid chain shows the events were not changed after sealing. It cannot show none are missing at the end, or that the events are true.");
  return { ok: errors.length === 0, errors, warnings, count: doc.events.length };
}
