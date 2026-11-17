// Regenerates FEATURE_MATRIX.md and CLAIMS_REGISTER.md from ../caps.js.  Usage: node site-docs/make_docs.cjs
const fs = require("fs"), path = require("path"), vm = require("vm");
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../caps.js"), "utf8"), ctx);
const C = ctx.window.ONE_CAPS, CL = ctx.window.ONE_CLAIMS;
const L = { live: "Live", offline: "Offline-tested", sim: "Simulated", proposed: "Proposed", blocked: "Blocked", unknown: "Unknown", verified: "Independently verified", demo: "Demonstrated (video)", self: "Self-reported" };
const cnt = {}; [...C.areas.flatMap(a => a.items), ...C.inventions].forEach(i => cnt[i[1]] = (cnt[i[1]] || 0) + 1);
let m = `# Feature matrix\n\nGenerated from caps.js (${C.updated}). Counts: ${Object.entries(cnt).map(([k, v]) => v + " " + L[k]).join(", ")}, 0 Independently verified.\n\n## Original page features (parity)\n\n| Original feature | Where now | Status |\n|---|---|---|\n`;
[["Hero and plain-language explanation", "Top of page", "Kept"], ["Owner vs AI simulator (ask, self-approve, flood, STOP, resume, passkey hold)", "01 Experience Studio", "Kept, tested"], ["Sealed record + tamper button + check", "01 Experience Studio", "Kept, tested"], ["45-second real video + poster + MP4 link", "Video section", "Kept"], ["What changed this week", "03 Evidence Observatory", "Kept"], ["Six-model bake-off chart", "04 Research Institute", "Kept"], ["Three rules, facts, what ONE is not", "06 Governance Center", "Kept"], ["Details: flow, key table, attacks, six-AI experiment, broken/missing, who built it, review links", "Details", "Kept"], ["Links: results, raw runs, claims I cannot defend, capability matrix, technical intro, review protocol, demonstration, FAQ, GitHub issues", "Details", "Kept"]].forEach(r => m += "| " + r.join(" | ") + " |\n");
C.areas.forEach(a => { m += `\n## ${a.name}\n\n| Capability | Status | What exists |\n|---|---|---|\n`; a.items.forEach(i => m += `| ${i[0]} | ${L[i[1]]} | ${i[2]} |\n`); });
m += "\n## Five inventions\n\n| Invention | Status | What exists |\n|---|---|---|\n"; C.inventions.forEach(i => m += `| ${i[0]} | ${L[i[1]]} | ${i[2]} |\n`);
fs.writeFileSync(path.join(__dirname, "FEATURE_MATRIX.md"), m);
let c = `# Claims register\n\nEvery claim on the page. Reviewer: no outside reviewer yet (checked only by me and AI sessions on my account). Last verified: ${C.updated}.\n\n| # | Claim | Evidence status | Source | Confidence | Outstanding gap |\n|---|---|---|---|---|---|\n`;
CL.forEach((x, i) => c += `| ${i + 1} | ${x[0]} | ${L[x[1]]} | ${x[2]} | ${x[1] === "demo" ? "Medium" : x[1] === "offline" ? "Medium (self-graded)" : "Low-medium (self-reported)"} | ${x[3]} |\n`);
fs.writeFileSync(path.join(__dirname, "CLAIMS_REGISTER.md"), c);
console.log("docs regenerated", cnt);
