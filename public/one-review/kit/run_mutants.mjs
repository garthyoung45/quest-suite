// Checks the checks: makes deliberately broken copies of gate_model.mjs and confirms the cases catch each one.
// Usage: node run_mutants.mjs   (writes temporary folders next to this file, then deletes them)
import { readFileSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "gate_model.mjs"), "utf8");
const M = [
  ["no signature check", 'if (!good) return { ok: false, why: "bad signature" };', ""],
  ["no expiry check", 'if (now > a.exp) return { ok: false, why: "expired" };', ""],
  ["no wording check", 'if ((await sha256(r.text)) !== a.hash) return { ok: false, why: "wording changed" };', ""],
  ["STOP does not void waiting", 'if (r.st === "WAITING") r.st = "VOIDED_BY_STOP";', "{}"],
  ["fails open on fault", 'if (this.fault) return { ok: false, why: "fail closed: STOP flag unreadable" };', ""],
  ["no chain link check", 'if (e.prev !== prev) return { ok: false, at: e.seq, why: "link to previous line broken" };', ""],
  ["words-only accepted", 'if (!a || !a.sig) return { ok: false, why: "no signature" };', 'if (!a || !a.sig) { const r0 = this.reqs.get(a && a.id); if (r0) { r0.st = "APPROVED"; return { ok: true, why: "trusted words" }; } }'],
];
// Two checks are left out on purpose because no case can tell them apart from the request-status check
// (equivalent mutants): the single-use nonce check and the STOP check inside approve() (once approved or voided, a request's
// status already refuses), and the sequence-number check in verifyChain (the link check catches the same
// deletions). They are backups. Stated, not hidden.
let caught = 0;
for (const [name, from, to] of M) {
  if (!src.includes(from)) { console.log(`SKIP  ${name} (pattern not found)`); continue; }
  const d = join(here, `.mutant_${Math.random().toString(36).slice(2)}`); mkdirSync(d);
  writeFileSync(join(d, "gate_model.mjs"), src.replace(from, to)); copyFileSync(join(here, "cases.mjs"), join(d, "cases.mjs"));
  let fails;
  try { const { runAll } = await import(pathToFileURL(join(d, "cases.mjs")).href); fails = (await runAll()).filter((r) => !r.pass).map((r) => r.name.split(" ")[0]); }
  finally { rmSync(d, { recursive: true, force: true }); }
  if (fails.length) caught++;
  console.log(`${fails.length ? "CAUGHT" : "MISSED"}  ${name}${fails.length ? "  by " + fails.join(", ") : ""}`);
}
console.log(`\n${caught} of ${M.length} broken gates caught.`);
process.exit(caught === M.length ? 0 : 1);
