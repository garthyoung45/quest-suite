# Technical introduction

For engineers and AI researchers. Every statement maps to a row of CAPABILITY_MATRIX.md.

## Abstract (one paragraph)

UNBOUNDED ONE is a one-person project with two working parts and a long list of non-working ones. Part one is a human approval gate for AI assistants: a small serverless program exposes a key-protected endpoint through which assistants from several vendors can read a status object and a fixed rule text and, for some keys, file a request; a request has no effect until the owner approves that exact request with a WebAuthn passkey, single use, time limited. A STOP flag refuses all new requests. Every decision and refusal is appended to a hash-chained log. Part two is a small script that sends one task to six commercial models from five vendors through a model broker, as a chain or as a panel with a cross-reply round, and records each answer, token counts, cost and a hash of each handoff; it has no tool use and always terminates in "pending human approval". The two parts are not connected to each other. There is no executor: an approved request is recorded and nothing carries it out. There is no autonomous model-to-model communication. On two small scored tasks the panel never outperformed the best single model; it did correct two weaker models. Nothing has been verified by anyone outside the builder's own AI tooling.

## Five-minute explanation

**1. What problem this is aimed at.** One person uses several AI assistants. Each will happily propose actions. The question was whether a single place could exist where every assistant can see the same state and the same rule, and where nothing consequential happens without a specific human approval that can be audited afterwards.

**2. The gate.** A serverless program behind a sign-in wall serves the owner's page. One path sits outside the wall for AI clients and requires a key. Through it a client can call four things: read status (is STOP on, how many items wait for the owner), read the rule text, read a frozen inventory summary, and, for some keys, file a request. Requests are stored as text and marked as the AI's words. Limits per key: a few waiting requests and a few per day.

**3. Approval.** The owner approves on his own page with a passkey. The signed approval is bound to one request, one action, the sign-in session and the site, expires in minutes and cannot be replayed. In offline tests against the program file (network removed, made-up data, a software authenticator standing in for the passkey) 70 attack and failure cases gave 63 pass, 0 fail and 7 recorded limits, and 20 of 22 deliberately planted defects were caught by the suite. One known limit, raised by a member of the public: the approval is bound to the request, not to the state of the data the request will touch.

**4. What approval does.** It appends a line to a list and a row to the log. That is all. There is no component that executes an approved request. The live approval path was exercised for the first time on 14 November 2026, three approvals, minutes after a bug that had left the Approve button dead in every earlier version was fixed.

**5. The record.** Each row carries the hash of the row before. A copy is pulled hourly to another machine and has been recomputed end to end. This detects an edit in the middle. It does not detect a full rewrite or a truncated tail unless you hold an older copy. An external witness service was built for that and never connected; it is empty.

**6. The multi-model script.** About 130 lines of JavaScript. Chain mode: four models each get the task plus a size-limited JSON handoff from the previous model, each with a fixed job (structure, attack, check, write up); two more can be inserted. Panel mode: six models answer the question independently, each then sees all first answers and replies, and one writes a summary. Every step is saved with model name, tokens, cost as reported by the broker, and a hash chained to the previous handoff. Guards: a hard monthly spend cap enforced at the broker and in a local ledger, a per-run cap, a pattern filter that refuses tasks containing personal data, a STOP file, no retries. Models have no tools. Task and handoff text are passed as data with an instruction to ignore embedded instructions; model output is fenced in the report so it cannot fake a heading or a state line. 64 offline tests cover the guards.

**7. How information actually moves.** Inside one script run: automatically, model to model, through the script. Everywhere else: by hand. The assistants in the owner's phone apps hold read links to the gate; they do not message each other, and no AI session can message them. The project's day-to-day work is done by sessions of one vendor's assistant, organized in threads, started by the owner's messages. Calling that "coordination of multiple AIs" would overstate it.

**8. Does the panel beat one model?** Two tasks were built with planted errors (a lockout procedure with 10 safety defects among 22 steps; a reliability summary with 7 arithmetic or logic errors among 18 statements). Keys were hashed before any run. Each model's independent first answer serves as the single-model baseline, in the same run and at the same moment as the panel. Result: the panel's final answer never beat the best single model. Lockout task, two panel runs: four and then three of the six models scored 10 of 10 alone; the panel's final summary scored 9 of 10 both times. The whole difference is one disputed item (an emergency stop used as the shutdown step): three models call it a defect, three do not, one model changed sides after reading the others, and the summary reported the split. Reliability task, two panel runs: three and then four of the five models that answered scored 7 of 7 alone; two models that scored 3 and 5 of 7 alone reached 7 of 7 after reading the others, and the final summary scored 7 of 7 both times. So cross-reading repaired weaker members and never exceeded the strongest. A panel run cost 12 to 13 cents and took two to three minutes; the cheapest fully correct single answer cost between 0.14 and 0.63 cents. Both chain-mode runs stopped early because one model returned an empty reply, which it did in 6 of its 8 calls. A second thread ran a separate eight-job comparison the same night with the same reading: a majority vote matched the best single models and did not beat them. Full table, run records and scorer are in the package.

**9. What failed in operation.** An eight-minute outage of the AI endpoint when a setting was written with an invisible leading character; rolled back; reproduced offline afterwards. Monitoring did not notice because it checks the sign-in wall and not the AI endpoint. The gate's own outbound alert sender fails. Every deployment so far was made with a signed-in command-line tool on a home computer, which goes around the gate's own deploy approval; whoever controls that tool can change who the approver is. Plain database exports sit on that computer. These are written up as findings, not fixed.

**10. What is not known.** Whether any of this is new. Whether the offline results hold on the live system beyond the three approvals. Whether it reproduces on a clean machine in someone else's hands. Whether it is useful to anyone else.

**11. What a reviewer can do.** Rerun the scorer on the published run records. Rerun the script in mock mode with no key, or live with your own. Run the gate tests in the browser demo. Read the list of claims the builder says he cannot defend, and try to add to it.

## Diagram (text form; the reviewer page carries a drawn version)

```
 AI apps (several vendors) --read status / file request--> [ AI endpoint, key required ]
                                                                   |
                                                         request stored as text
                                                                   |
 Owner (phone, passkey) --approve exactly one request--> [ Gate ] --> line added to a list
                                                             |              (nothing executes it)
                                                    hash-chained record --hourly copy--> second machine

 Separate, not connected to the gate:
 Owner or an assistant session --one task--> [ script ] --> model 1 --> model 2 --> ... --> model 6
                                                 |               (text handoffs, hashed)
                                             run record: answers, cost, hashes --> "pending human approval"
```
