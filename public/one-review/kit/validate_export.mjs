// Validate a flight recorder export.  Usage: node validate_export.mjs [file.json]   (default: sample_export.json)
import { readFileSync } from "node:fs";
import { validate } from "./flight_recorder.mjs";
const f = process.argv[2] || new URL("./sample_export.json", import.meta.url);
const r = await validate(JSON.parse(readFileSync(f, "utf8")));
console.log(r.ok ? `VALID: ${r.count} events, chain intact` : `INVALID:\n  ${r.errors.join("\n  ")}`);
for (const w of r.warnings) console.log("note: " + w);
process.exit(r.ok ? 0 : 1);
