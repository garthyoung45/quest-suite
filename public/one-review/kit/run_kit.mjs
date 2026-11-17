// Rerun the ONE reference attack cases.  Usage: node run_kit.mjs
import { runAll } from "./cases.mjs";
const res = await runAll();
for (const r of res) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  (expected ${r.expect}, got ${r.got}${r.why ? ": " + r.why : ""})`);
const f = res.filter((r) => !r.pass).length;
console.log(`\n${res.length - f} of ${res.length} cases behaved as expected. ${f} failed.`);
console.log("Reminder: this tests a reference model of the rules, not ONE's live code.");
process.exit(f ? 1 : 0);
