# Feature matrix

Generated from caps.js (17 November 2026). Counts: 30 Proposed, 4 Offline-tested, 11 Simulated, 10 Live, 0 Independently verified.

## Original page features (parity)

| Original feature | Where now | Status |
|---|---|---|
| Hero and plain-language explanation | Top of page | Kept |
| Owner vs AI simulator (ask, self-approve, flood, STOP, resume, passkey hold) | 01 Experience Studio | Kept, tested |
| Sealed record + tamper button + check | 01 Experience Studio | Kept, tested |
| 45-second real video + poster + MP4 link | Video section | Kept |
| What changed this week | 03 Evidence Observatory | Kept |
| Six-model bake-off chart | 04 Research Institute | Kept |
| Three rules, facts, what ONE is not | 06 Governance Center | Kept |
| Details: flow, key table, attacks, six-AI experiment, broken/missing, who built it, review links | Details | Kept |
| Links: results, raw runs, claims I cannot defend, capability matrix, technical intro, review protocol, demonstration, FAQ, GitHub issues | Details | Kept |

## Intelligence and autonomy

| Capability | Status | What exists |
|---|---|---|
| AI Behavior Observatory | Proposed | Today the owner app lists what each AI asked for. Nothing yet shows what approved actions did; the only action that can run is a test line in a sandbox file. |
| Cross-AI Consensus Engine | Offline-tested | A six-model panel runs on my account as a separate tool. It is not part of ONE. It has never been shown to beat its best single model. |
| Disagreement Laboratory | Proposed | Not built. |
| Decision Consequence Simulator | Proposed | Not built. |
| Autonomy Ladder | Proposed | Today: read status; also file a request; and one allowlisted test action that a runner carries out after the owner approves. No AI can approve. |
| AI Capability Passport | Proposed | Each AI key has a scope in my records (status or ask). No passport format exists, and live scopes have not been read back. |
| Agent Reputation System | Proposed | The 17 Nov bake-off is the only scored data so far: one run per model. |
| Human Override Simulator | Simulated | The owner simulator below: the AI cannot approve its own request, and STOP cancels what is waiting. |
| Autonomy Budgeting | Live | Only request counts: 3 waiting and 5 a day per key, each expiring after 7 days. No time, money or risk budgets. |
| Multi-Agent Incident Replay | Proposed | Not built. |

## Security and adversarial testing

| Capability | Status | What exists |
|---|---|---|
| Prompt Injection Arena | Simulated | Demo below. The gate does not detect injection. It only makes sure nothing counts until the owner approves. |
| Approval Spoofing Laboratory | Simulated | Demo below, using real browser cryptography. The live system's own spoofing tests were offline and self-graded. |
| Privilege Escalation Simulator | Simulated | Demo below and in the owner simulator (the AI tries to approve itself). |
| Compromised Agent Containment | Proposed | Not built. A key could be removed by hand; that has not been drilled. |
| Kill-Switch Reliability Testing | Offline-tested | In offline tests STOP refused 736 writes in a row and failed closed in 7 error cases. The rerun kit adds 5 STOP and fail-closed cases anyone can run (reference model). |
| Evidence Tampering Challenge | Simulated | Edit a sample record below and watch the check catch it. |
| Replay Attack Simulator | Simulated | Demo below, and 3 replay and expiry cases in the rerun kit. Offline tests also tried replaying approvals on the live build's copy (self-graded). |
| Race Condition Laboratory | Simulated | Demo below: STOP against an approval in flight. This demo has no execution step. |
| Supply Chain Threat Model | Proposed | Not written. |
| Red-Team Challenge Portal | Live | Four scoped challenges are published with the rerun kit; findings go to GitHub issues. Zero outside findings so far. |

## Black box and evidence

| Capability | Status | What exists |
|---|---|---|
| Cryptographic Evidence Explorer | Simulated | The sample record in the simulator and the flight recorder explorer show each event's seal and its link to the one before. |
| Decision Provenance Graph | Proposed | Not built. |
| Evidence Completeness Scoring | Proposed | Not built. The draft validator catches gaps in the middle, but a chain cannot show that nothing is missing at the end. |
| Timeline Reconstruction | Simulated | The flight recorder explorer replays a made-up request's events in order. |
| Independent Verification Packages | Live | The rerun kit (18 attack cases, broken-gate check, recorder validator) and the six-AI demo's raw runs are public. The live gate's source code is not published yet. |
| Version Comparison Engine | Proposed | Not built. |
| Audit Readiness Dashboard | Proposed | Not built. |
| Evidence Retention Simulator | Proposed | Not built. |
| External Witnessing Architecture | Proposed | A recorder runs on a mini PC at home. It is mine, so it is not a witness. No outside witness has signed anything. |
| Claim-to-Proof Registry | Live | On this page. Most proofs are my own logs; it says so line by line. |

## Human experience and governance

| Capability | Status | What exists |
|---|---|---|
| Owner Decision Simulator | Simulated | The owner simulator at the top of this page. |
| Emergency STOP Center | Live | STOP is live in the owner app (see the video). Lifting it needs the owner's passkey. It only covers ONE. |
| Decision Fatigue Analytics | Proposed | Not built. |
| Risk-Adaptive Approval Interface | Proposed | Not built. Today every request gets the same approval screen. |
| Household Governance Demonstration | Proposed | Not built. If built, it will use made-up roles only. No family information will ever be shown. |
| Accessibility Laboratory | Proposed | Not built as a lab. This page itself was checked by me for keyboard use, phone width and reduced motion. |
| Consent and Privacy Center | Proposed | Not written. |
| Human Accountability Map | Live | Who requests, approves, carries out and reviews, as the live system works today. |
| Emergency Recovery Walkthrough | Proposed | Not written. Rollback of a bad version passed live twice (my logs). Restoring live data has never been rehearsed. |
| Plain-English Decision Explanations | Live | The owner's rule is served in plain English to every connected AI, and this page has a plain-English glossary. |

## Public research and ecosystem

| Capability | Status | What exists |
|---|---|---|
| AI Assurance Research Library | Proposed | A private survey of 70+ related products and standards exists. Not published. |
| Competitive Capability Matrix | Proposed | Not published. No superiority claims will be made without evidence. |
| Developer Integration Sandbox | Simulated | Mock console below. Response shapes are illustrative, not the live contract. |
| Reference Architecture Generator | Proposed | Not built. |
| Compliance Mapping Explorer | Proposed | Not built. ONE holds no certification of any kind. |
| Public Roadmap and Release History | Live | This map and the weekly update on this page. |
| Researcher Collaboration Portal | Live | GitHub issues and a published review protocol. Zero outside findings so far. |
| Journalist Investigation Mode | Live | A plain-English glossary and a reviewer mode that opens every detail. No separate press brief yet. |
| Enterprise Adoption Simulator | Proposed | Not built. |
| Assurance Benchmark Laboratory | Offline-tested | Two scored experiments (the six-AI panel test and the 17 Nov bake-off, self-graded) and a rerunnable attack-case kit. |

## Five inventions

| Invention | Status | What exists |
|---|---|---|
| Assurance Flight Recorder | Offline-tested | Draft format one.flightrecorder/0.1 with a validator, a made-up sample and 9 passing tests. Nothing live produces it yet. |
| Proof Before Permission | Proposed | An AI attaches evidence that its action meets the rules before asking. Idea only. |
| Counterfactual Approval Testing | Proposed | Simulate deny, delay, change or approve before deciding. Idea only. |
| Trust Decay | Proposed | Old test results count for less after code, model or dependency changes. Idea only. |
| Independent Assurance Witness | Proposed | A separately run service that can attest evidence but can never approve or act. None exists yet. |
