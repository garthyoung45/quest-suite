# Capability matrix (public edition)

Each capability gets one label. Checked 14 November 2026 by AI assistant sessions on the builder's own account. **No row has been checked by anyone outside.**

Labels: LIVE VERIFIED (seen on the running system that evening by a read-only check), CODE VERIFIED (read in the program), REPRODUCED (a rerunnable offline test gave the result), DOCUMENTED (written down at the time, not re-seen), PROPOSED (designed, does not exist), FAILED (tried and did not work, or tested and false), UNKNOWN.

| # | Capability or claim | Label | What limits it |
|---|---|---|---|
| **The approval gate** | | | |
| 1 | Two small cloud programs with databases, behind a sign-in wall | LIVE VERIFIED that the wall answers; DOCUMENTED for the rest | The hosting account has never been read back to confirm which program version is served |
| 2 | AI assistants can read a status object and a fixed rule text through a key-protected endpoint | LIVE VERIFIED for one key | One key tested |
| 3 | Eight assistant apps each hold a key | DOCUMENTED | From the owner's photos of his apps. The live key list has not been read by a session. Five keys are status-only by design (they read a status line and the rule text; shown in an offline test, not confirmed on the live system). Three older keys can also file requests into the owner's queue, which is a write and the main thing to attack. One status-only key was exposed and its replacement is unfinished |
| 4 | Five of those apps each read the status once | DOCUMENTED | Not confirmed from the system's own record |
| 5 | An assistant can file a request that waits for the owner | REPRODUCED offline; three real requests exist | All three came through one key |
| 6 | Approval by passkey is bound to one request, single use, time limited | REPRODUCED offline; LIVE VERIFIED that three approvals were recorded | The live passkey flow cannot be tested from outside. Used three times, on one evening |
| 7 | An approved request gets carried out | FAILED | No executor exists. Approval adds a line to a list |
| 8 | The gate has taken an action in the outside world | FAILED (never happened) | The outside-call path is coded and not configured |
| 9 | STOP refuses all new requests; only a passkey lifts it | REPRODUCED offline; DOCUMENTED live use | Not drilled live against all eight keys |
| 10 | Fails closed | REPRODUCED offline with seven written limits | The one real outage failed closed and went unnoticed |
| 11 | Hash-chained activity record | REPRODUCED (recomputed from an off-site copy) | Detects an edit in the middle. A full rewrite or cut tail needs an older copy to detect |
| 12 | Independent outside anchor for the record | FAILED | Built, never connected, empty |
| 13 | The gate sends phone alerts by itself | FAILED | Its sender fails. A relay on a home computer is said to work |
| 14 | Changes go through the gate's own deploy approval | FAILED | Every deployment was made by a signed-in tool on a home computer, around the gate |
| 15 | Monitoring would catch an outage of the AI endpoint | FAILED | It checks the sign-in wall only |
| 16 | Request text cannot make the gate act | REPRODUCED offline | Says nothing about the assistant apps themselves |
| 17 | Offline attack suite: 63 of 70 scripted cases passed, 7 documented limits; 20 of 22 planted defects caught | REPRODUCED by an AI session only | Self-graded and offline: the suite was written and run by the same AI tooling that built the gate. It is not a security review and nobody outside has run it. Source and suite are not in this package. The live system has known ways around it (rows 14, 15) |
| **Multiple models** | | | |
| 18 | Several vendors' models contributed text to the project | DOCUMENTED and REPRODUCED | Contribution is not communication |
| 19 | A script sends one task to six models and records every answer, cost and handoff hash | LIVE VERIFIED (six runs in this package) | The script is the only link. Developer versions of the models, no tools, no memory |
| 20 | The AIs communicate with each other automatically | FAILED as stated | True only inside one script run. Otherwise the owner pastes text |
| 21 | A coordinator directs the other AIs | FAILED as stated | The coordinator is a session of one vendor's assistant. It can run the script. It cannot message any other AI |
| 22 | The multi-model workflow beats a single model | FAILED on both scored tasks | On these runs it never beat the best single model and cost at least 20 times more than the cheapest correct single answer. It did repair two weaker models on one task. Four panel runs on two made-up documents whose answer keys were written by one of the tested models. This does not show that multi-model review fails in general |
| 23 | Disagreement is surfaced and recorded | REPRODUCED | Surfacing is not resolving |
| **Verification** | | | |
| 24 | Independent verification | FAILED: none | The project's reviewer roles are sessions of the same assistant |
| 25 | Other AI models reviewed it | DOCUMENTED | They read summaries. Feedback, not verification |
| 26 | Outside human input | DOCUMENTED: one | A public question that exposed a real limit (approval is not bound to the state of the data it acts on). Not fixed |
| **Other** | | | |
| 27 | An open one-page specification of the approval rule | PROPOSED (draft exists, unpublished) | No outside reader |
| 28 | Applications in maintenance and elsewhere | PROPOSED, with prototypes | None validated by an outside user |
| 29 | Money earned | FAILED: none | |

## Operational failures on record
- An eight-minute outage of the AI endpoint when a setting was saved with an invisible leading character. Rolled back. Reproduced offline afterwards.
- The Approve button for AI requests did not work in any version until the evening it was first used.
- Monitoring reported all clear during the outage.
- A different prototype of the builder's (a coordination engine, not in this package and not the gate) was attacked by a separate AI session: 31 of 49 attacks broke its first version. After fixes, 17 of 20 new attacks broke the second. The tester was another session of the same AI family, not an outside person.
- One model in the multi-model script returned an empty reply in six of eight calls and stopped both chain-mode runs.
