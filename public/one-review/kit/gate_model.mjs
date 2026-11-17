// Reference model of ONE's approval rules, for outside rerunning.
// It is NOT the live code (the live source is not published yet). It encodes the rules the page claims:
// one owner signature, over one exact request, used once, before it expires, never while STOP is on,
// and refuse everything if STOP or the record cannot be read (fail closed).
// Works in Node 20+ and modern browsers (Web Crypto). No dependencies.
const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const hex = (b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
export const sha256 = async (s) => hex(await subtle.digest("SHA-256", enc.encode(s)));
const ALG = { name: "ECDSA", namedCurve: "P-256" }, SIG = { name: "ECDSA", hash: "SHA-256" };
export const newKey = () => subtle.generateKey(ALG, false, ["sign", "verify"]);
const payload = (a) => `${a.id}|${a.hash}|${a.nonce}|${a.exp}`;
let nonceN = 0;
export async function sign(key, id, hash, ttlMs = 300000, now = Date.now()) {
  const a = { id, hash, nonce: `n${++nonceN}-${Math.random().toString(36).slice(2, 8)}`, exp: now + ttlMs };
  a.sig = await subtle.sign(SIG, key.privateKey, enc.encode(payload(a)));
  return a;
}
export class Gate {
  constructor(ownerKey) { this.owner = ownerKey; this.reqs = new Map(); this.used = new Set(); this.stopped = false; this.fault = false; this.n = 0; this.log = []; }
  async record(ev) {
    const prev = this.log.length ? this.log[this.log.length - 1].hash : "0".repeat(64);
    const seq = this.log.length + 1, at = new Date().toISOString();
    this.log.push({ seq, at, ev, prev, hash: await sha256(`${seq}|${at}|${ev}|${prev}`) });
  }
  async file(text) {
    if (this.fault) return { ok: false, code: 503, why: "fail closed: store unreadable" };
    if (this.stopped) return { ok: false, code: 423, why: "STOP is on" };
    const id = `R${++this.n}`, hash = await sha256(text);
    this.reqs.set(id, { id, text, hash, st: "WAITING" });
    await this.record(`filed ${id}`);
    return { ok: true, id, hash };
  }
  stop() { this.stopped = true; for (const r of this.reqs.values()) if (r.st === "WAITING") r.st = "VOIDED_BY_STOP"; }
  async approve(a, now = Date.now()) {
    if (this.fault) return { ok: false, why: "fail closed: STOP flag unreadable" };
    if (this.stopped) return { ok: false, why: "STOP is on" };
    if (!a || !a.sig) return { ok: false, why: "no signature" };
    const r = this.reqs.get(a.id);
    if (!r) return { ok: false, why: "no such request" };
    const good = await subtle.verify(SIG, this.owner.publicKey, a.sig, enc.encode(payload(a)));
    if (!good) return { ok: false, why: "bad signature" };
    if (this.used.has(a.nonce)) return { ok: false, why: "already used" };
    if (r.st !== "WAITING") return { ok: false, why: `request is ${r.st}` };
    if (now > a.exp) return { ok: false, why: "expired" };
    if ((await sha256(r.text)) !== a.hash) return { ok: false, why: "wording changed" };
    this.used.add(a.nonce); r.st = "APPROVED";
    await this.record(`approved ${r.id}`);
    return { ok: true, why: "approved (nothing is carried out)" };
  }
}
export async function verifyChain(log) {
  let prev = "0".repeat(64);
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (e.seq !== i + 1) return { ok: false, at: i + 1, why: `sequence gap: expected ${i + 1}, found ${e.seq}` };
    if (e.prev !== prev) return { ok: false, at: e.seq, why: "link to previous line broken" };
    if ((await sha256(`${e.seq}|${e.at}|${e.ev}|${e.prev}`)) !== e.hash) return { ok: false, at: e.seq, why: "line content changed" };
    prev = e.hash;
  }
  return { ok: true };
}
