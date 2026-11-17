// The attack cases. Each returns {name, expect, got, pass}. Shared by run_kit.mjs (Node) and the page.
import { Gate, newKey, sign, verifyChain } from "./gate_model.mjs";
export async function runAll() {
  const out = [];
  const T = async (name, expect, fn) => {
    let got; try { got = await fn(); } catch (e) { got = { ok: "error", why: e.message }; }
    out.push({ name, expect: expect ? "accept" : "refuse", got: got.ok === true ? "accept" : "refuse", why: got.why, pass: got.ok === expect });
  };
  const fresh = async () => { const owner = await newKey(); const ai = await newKey(); return { g: new Gate(owner), owner, ai }; };
  await T("S1 spoof: words only (\"owner approved\")", false, async () => { const { g } = await fresh(); const f = await g.file("Order filter, $40"); return g.approve({ id: f.id }); });
  await T("S2 spoof: signed with the AI's own key", false, async () => { const { g, ai } = await fresh(); const f = await g.file("Order filter, $40"); return g.approve(await sign(ai, f.id, f.hash)); });
  await T("S3 spoof: owner approval moved to another request", false, async () => { const { g, owner } = await fresh(); const a = await g.file("Check stock"); const b = await g.file("Order 40 filters, $1,600"); const s = await sign(owner, a.id, a.hash); s.id = b.id; return g.approve(s); });
  await T("S4 spoof: wording changed after signing", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Order filter, $40"); const s = await sign(owner, f.id, f.hash); g.reqs.get(f.id).text = "Order filter, $4,000"; return g.approve(s); });
  await T("S5 control: genuine owner approval", true, async () => { const { g, owner } = await fresh(); const f = await g.file("Order filter, $40"); return g.approve(await sign(owner, f.id, f.hash)); });
  await T("R1 replay: same approval used twice", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Restart backup"); const s = await sign(owner, f.id, f.hash); await g.approve(s); return g.approve(s); });
  await T("R2 replay: approval reused on an identical new request", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Restart backup"); const s = await sign(owner, f.id, f.hash); await g.approve(s); const f2 = await g.file("Restart backup"); return g.approve({ ...s, id: f2.id }); });
  await T("R3 expiry: approval used after it ran out", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Restart backup"); return g.approve(await sign(owner, f.id, f.hash, -1000)); });
  await T("K1 STOP: approval lands after STOP", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Send report"); const s = await sign(owner, f.id, f.hash); g.stop(); return g.approve(s); });
  await T("K2 STOP: old approval after STOP is lifted", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Send report"); const s = await sign(owner, f.id, f.hash); g.stop(); g.stopped = false; return g.approve(s); });
  await T("K3 STOP: new request while STOP is on", false, async () => { const { g } = await fresh(); g.stop(); return g.file("Anything"); });
  await T("F1 fail closed: request while store is unreadable", false, async () => { const { g } = await fresh(); g.fault = true; return g.file("Clean up"); });
  await T("F2 fail closed: owner approval while STOP flag unreadable", false, async () => { const { g, owner } = await fresh(); const f = await g.file("Clean up"); g.fault = true; return g.approve(await sign(owner, f.id, f.hash)); });
  const chain = async () => { const { g, owner } = await fresh(); for (const t of ["A", "B", "C"]) { const f = await g.file(t); await g.approve(await sign(owner, f.id, f.hash)); } return g.log; };
  await T("T1 tamper control: untouched record checks out", true, async () => verifyChain(await chain()));
  await T("T2 tamper: an old line edited", false, async () => { const l = await chain(); l[1].ev = "approved R9"; return verifyChain(l); });
  await T("T3 tamper: a line deleted from the middle", false, async () => { const l = await chain(); l.splice(2, 1); return verifyChain(l); });
  await T("T4 tamper: edited line with its own hash recomputed", false, async () => { const { sha256 } = await import("./gate_model.mjs"); const l = await chain(); const e = l[1]; e.ev = "approved R9"; e.hash = await sha256(`${e.seq}|${e.at}|${e.ev}|${e.prev}`); return verifyChain(l); });
  await T("T5 known limit: last line cut off (not detected)", true, async () => { const l = await chain(); l.pop(); return verifyChain(l); });
  return out;
}
