# UNBOUNDED ONE: reviewer package

Published 15 November 2026 by the builder, Garth Young. Corrected the same day after outside criticism.

**What this is, in plain words: an unaudited human-approval gate demo with no executor yet, plus a small multi-model test harness.** Neither part is new as an architecture; the closest existing things are named in `FAQ.md`, question 49. The gate's source code is not in this package, so its security cannot be reviewed from here.

One person's project, built over about a month of evenings with AI coding assistants. Nothing here has been verified by anyone outside. You are invited to say what it is, including "ordinary", "incomplete", "wrongly described" or "not useful".

## Read first (five minutes)
1. `CLAIMS_I_CANNOT_DEFEND.md`: what is false, partly true or unknown, in plain words.
2. `demo/RESULTS.md`: two scored tests, six models alone and together.
3. `REVIEW_PROTOCOL_AND_SCORECARD.md`: fourteen checks you can run without trusting me.

## Check something (ten minutes)
```
cd demo
sha256sum task_demo1.txt ANSWER_KEY_demo1.json task_demo2.txt ANSWER_KEY_demo2.json   # compare with PREREGISTRATION.sha256
python3 make_results.py                                                                # rebuilds RESULTS.md from the raw run records
```
Then open any file in `demo/runs/` or `demo/runs2/` and read what each model actually said.

## Rerun it yourself (optional)
`roundtable/` holds the script (about 130 lines of JavaScript, Node 22, no packages) and its offline tests.
```
cd roundtable
mkdir work && node test_roundtable.mjs work     # 64 offline tests, no key, no network
```
A live run needs your own model-broker key with a monthly limit of 20 dollars or less set at the broker; the script refuses to run otherwise. See `roundtable/README.md`. Its `--one-status clear` flag is a manual confirmation that the builder's own STOP control is off; for your own run it has no other meaning.

## What is in the package
| Path | What |
|---|---|
| `CLAIMS_I_CANNOT_DEFEND.md` | Unresolved-claims list |
| `CAPABILITY_MATRIX.md` | Each capability with one evidence label |
| `TECHNICAL_INTRODUCTION.md` | What the two parts are and how text moves |
| `DEMONSTRATION.md` | The demo design, the twelve points, the result, the failures |
| `REVIEW_PROTOCOL_AND_SCORECARD.md` | Tests and a scorecard with PASS, FAIL, PARTIAL, UNVERIFIED |
| `FAQ.md` | Sixty questions |
| `demo/` | Tasks, keys, hashes, run records, scorer |
| `roundtable/` | The multi-model script and tests |
| `SHA256SUMS` | Checksums of every file here |

## What is not in the package, and why
- The approval gate's source code and its 70-case offline attack suite. Release is the owner's pending decision, because the live system runs the same code. A browser demo of the gate with made-up data exists from an earlier public challenge.
- Anything live: addresses, keys, settings, data.
- Anything about the owner's household, family, employer or finances.

## Ground rules
Test only what is in this package. The live system, its hosting, and any account, device or person are out of bounds. Report a security problem privately first.

## Evidence labels used
LIVE VERIFIED (seen on the running system), CODE VERIFIED (read in the program), REPRODUCED (a rerunnable test gave the result), DOCUMENTED (written down at the time), CLAIMED, PROPOSED, FAILED, UNKNOWN. Every check so far was made by AI assistant sessions on the builder's own account.
