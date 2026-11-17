# ONE rerun kit

Rerun my claims yourself. No account, no dependencies, no network. Needs Node 20 or newer.

```
node run_kit.mjs          # 18 attack cases: spoofing, replay, expiry, STOP, fail-closed, record tampering
node run_mutants.mjs      # breaks the gate 7 different ways and checks the cases catch every one
node validate_export.mjs  # checks the sample flight-recorder export
node test_recorder.mjs    # 9 tests of the export validator
```

Results on 17 Nov 2026 (my run): 18 of 18 cases as expected, 7 of 7 broken gates caught, 9 of 9 validator tests passed.
The same 18 cases also run in your browser on the page ("Run every test" in the Security Laboratory).

## What this proves, and what it does not

- It tests a **reference model** of the rules the page claims (`gate_model.mjs`). It is **not** ONE's live code. The live source is not published yet.
- So passing here shows the rules hold together. It does not show the live system follows them.
- Three checks in the model are backups that no case can isolate (stated in `run_mutants.mjs`).
- Known limit, tested on purpose: a hash chain cannot tell that the last lines were cut off (cases T5 and "last event cut off").

## Flight recorder draft (`one.flightrecorder/0.1`)

A proposed, portable format for one AI request's life: request, policy result, owner decision, STOP and resume, action, outcome. Each event has `seq`, `at`, `type`, `actor.kind` (ai, owner or system), `request_id`, `summary`, `policy`, `evidence`, `prev` and `hash` (SHA-256 of the event's canonical JSON without `hash`). The validator also checks rules: only the owner approves, denies or resumes; approvals need a passkey reference; nothing is requested or approved during STOP; no action without an earlier approval.
`sample_export.json` is made up. Nothing on ONE's live system produces this format yet.

## Scoped challenges (open to anyone)

1. Make `run_kit.mjs` report a pass for a request that the owner never signed.
2. Change a line in `sample_export.json` so that `validate_export.mjs` still says VALID (without resealing every later event).
3. Find a rule the page claims that these cases do not test.
4. Find any claim on the page with no proof or no stated limit.

Report findings as a GitHub issue: https://github.com/garthyoung45/quest-suite/issues . Zero outside findings so far.
