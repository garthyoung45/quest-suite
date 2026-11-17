/* ONE capability map. One entry per capability in the expansion spec.
   Status words (only these five):
   live      = working now on the real system, or published here with real data
   offline   = built and tested by me (AI sessions on my account), not part of the live system
   sim       = a demonstration on this page that runs only in your browser
   proposed  = written down, not built
   verified  = checked by someone outside, with attributable evidence (none yet)
   Each "note" says what actually exists. Updated 17 Nov 2026. */
window.ONE_CAPS = {
  updated: "17 November 2026",
  areas: [
    { id: "ai", name: "Intelligence and autonomy", items: [
      ["AI Behavior Observatory", "proposed", "Today the owner app lists what each AI asked for. Nothing yet shows what approved actions did; the only action that can run is a test line in a sandbox file."],
      ["Cross-AI Consensus Engine", "offline", "A six-model panel runs on my account as a separate tool. It is not part of ONE. It has never been shown to beat its best single model."],
      ["Disagreement Laboratory", "proposed", "Not built."],
      ["Decision Consequence Simulator", "proposed", "Not built."],
      ["Autonomy Ladder", "proposed", "Today: read status; also file a request; and one allowlisted test action that a runner carries out after the owner approves. No AI can approve."],
      ["AI Capability Passport", "proposed", "Each AI key has a scope in my records (status or ask). No passport format exists, and live scopes have not been read back."],
      ["Agent Reputation System", "proposed", "The 17 Nov bake-off is the only scored data so far: one run per model."],
      ["Human Override Simulator", "sim", "The owner simulator below: the AI cannot approve its own request, and STOP cancels what is waiting.", "#try"],
      ["Autonomy Budgeting", "live", "Only request counts: 3 waiting and 5 a day per key, each expiring after 7 days. No time, money or risk budgets."],
      ["Multi-Agent Incident Replay", "proposed", "Not built."]
    ]},
    { id: "sec", name: "Security and adversarial testing", items: [
      ["Prompt Injection Arena", "sim", "Demo below. The gate does not detect injection. It only makes sure nothing counts until the owner approves.", "#lab"],
      ["Approval Spoofing Laboratory", "sim", "Demo below, using real browser cryptography. The live system's own spoofing tests were offline and self-graded.", "#lab"],
      ["Privilege Escalation Simulator", "sim", "Demo below and in the owner simulator (the AI tries to approve itself).", "#lab"],
      ["Compromised Agent Containment", "proposed", "Not built. A key could be removed by hand; that has not been drilled."],
      ["Kill-Switch Reliability Testing", "offline", "In offline tests STOP refused 736 writes in a row and failed closed in 7 error cases. The rerun kit adds 5 STOP and fail-closed cases anyone can run (reference model).", "#lab"],
      ["Evidence Tampering Challenge", "sim", "Edit a sample record below and watch the check catch it.", "#try"],
      ["Replay Attack Simulator", "sim", "Demo below, and 3 replay and expiry cases in the rerun kit. Offline tests also tried replaying approvals on the live build's copy (self-graded).", "#lab"],
      ["Race Condition Laboratory", "sim", "Demo below: STOP against an approval in flight. This demo has no execution step.", "#lab"],
      ["Supply Chain Threat Model", "proposed", "Not written."],
      ["Red-Team Challenge Portal", "live", "Four scoped challenges are published with the rerun kit; findings go to GitHub issues. Zero outside findings so far."]
    ]},
    { id: "ev", name: "Black box and evidence", items: [
      ["Cryptographic Evidence Explorer", "sim", "The sample record in the simulator and the flight recorder explorer show each event's seal and its link to the one before.", "#frx"],
      ["Decision Provenance Graph", "proposed", "Not built."],
      ["Evidence Completeness Scoring", "proposed", "Not built. The draft validator catches gaps in the middle, but a chain cannot show that nothing is missing at the end."],
      ["Timeline Reconstruction", "sim", "The flight recorder explorer replays a made-up request's events in order.", "#frx"],
      ["Independent Verification Packages", "live", "The rerun kit (18 attack cases, broken-gate check, recorder validator) and the six-AI demo's raw runs are public. The live gate's source code is not published yet."],
      ["Version Comparison Engine", "proposed", "Not built."],
      ["Audit Readiness Dashboard", "proposed", "Not built."],
      ["Evidence Retention Simulator", "proposed", "Not built."],
      ["External Witnessing Architecture", "proposed", "A recorder runs on a mini PC at home. It is mine, so it is not a witness. No outside witness has signed anything."],
      ["Claim-to-Proof Registry", "live", "On this page. Most proofs are my own logs; it says so line by line.", "#claims"]
    ]},
    { id: "gov", name: "Human experience and governance", items: [
      ["Owner Decision Simulator", "sim", "The owner simulator at the top of this page.", "#try"],
      ["Emergency STOP Center", "live", "STOP is live in the owner app (see the video). Lifting it needs the owner's passkey. It only covers ONE.", "#live"],
      ["Decision Fatigue Analytics", "proposed", "Not built."],
      ["Risk-Adaptive Approval Interface", "proposed", "Not built. Today every request gets the same approval screen."],
      ["Household Governance Demonstration", "proposed", "Not built. If built, it will use made-up roles only. No family information will ever be shown."],
      ["Accessibility Laboratory", "proposed", "Not built as a lab. This page itself was checked by me for keyboard use, phone width and reduced motion."],
      ["Consent and Privacy Center", "proposed", "Not written."],
      ["Human Accountability Map", "live", "Who requests, approves, carries out and reviews, as the live system works today.", "#gov"],
      ["Emergency Recovery Walkthrough", "proposed", "Not written. Rollback of a bad version passed live twice (my logs). Restoring live data has never been rehearsed."],
      ["Plain-English Decision Explanations", "live", "The owner's rule is served in plain English to every connected AI, and this page has a plain-English glossary.", "#gov"]
    ]},
    { id: "res", name: "Public research and ecosystem", items: [
      ["AI Assurance Research Library", "proposed", "A private survey of 70+ related products and standards exists. Not published."],
      ["Competitive Capability Matrix", "proposed", "Not published. No superiority claims will be made without evidence."],
      ["Developer Integration Sandbox", "sim", "Mock console below. Response shapes are illustrative, not the live contract.", "#dev"],
      ["Reference Architecture Generator", "proposed", "Not built."],
      ["Compliance Mapping Explorer", "proposed", "Not built. ONE holds no certification of any kind."],
      ["Public Roadmap and Release History", "live", "This map and the weekly update on this page.", "#week"],
      ["Researcher Collaboration Portal", "live", "GitHub issues and a published review protocol. Zero outside findings so far."],
      ["Journalist Investigation Mode", "live", "A plain-English glossary and a reviewer mode that opens every detail. No separate press brief yet.", "#deep"],
      ["Enterprise Adoption Simulator", "proposed", "Not built."],
      ["Assurance Benchmark Laboratory", "offline", "Two scored experiments (the six-AI panel test and the 17 Nov bake-off, self-graded) and a rerunnable attack-case kit.", "#bakeoff"]
    ]}
  ],
  inventions: [
    ["Assurance Flight Recorder", "offline", "Draft format one.flightrecorder/0.1 with a validator, a made-up sample and 9 passing tests. Nothing live produces it yet.", "#frx"],
    ["Proof Before Permission", "proposed", "An AI attaches evidence that its action meets the rules before asking. Idea only."],
    ["Counterfactual Approval Testing", "proposed", "Simulate deny, delay, change or approve before deciding. Idea only."],
    ["Trust Decay", "proposed", "Old test results count for less after code, model or dependency changes. Idea only."],
    ["Independent Assurance Witness", "proposed", "A separately run service that can attest evidence but can never approve or act. None exists yet."]
  ]
};

/* Every public claim on this page, with its proof and its limit.
   Claim states (separate from product states): demo = shown on the real system in the published video;
   self = self-reported from my own logs or records; offline = offline-tested, self-graded. */
window.ONE_CLAIMS = [
  ["Only the owner's passkey can approve an AI's request.", "demo", "The 45-second video (15 Nov). 4 real requests approved with a passkey on 14 and 15 Nov, in the owner record.", "No outsider has checked it. Whoever can deploy ONE's code could change this rule in code."],
  ["An AI cannot approve its own request.", "offline", "Scripted attack cases against a copy of the live build, network blocked.", "Designed, run and graded by AI sessions on my account."],
  ["STOP refuses every AI call and cancels everything waiting.", "demo", "The video shows it on the real system. Offline: 736 writes refused in a row.", "STOP only covers ONE. An AI working outside ONE is not stopped."],
  ["An approval works once, for one exact request.", "offline", "Offline replay and swap cases held.", "Self-graded. Not checked by anyone outside."],
  ["Every step is written to a hash-chained record.", "self", "Chain checks in my own logs; a copy goes hourly to a home computer.", "A chain shows lines were not changed, not that none are missing. I control every copy."],
  ["8 AI keys exist for 7 assistants; 3 can file requests, 5 can only read status.", "self", "My key records.", "The live key settings have not been read back to prove the scopes."],
  ["63 of 70 scripted attacks held; 7 limits written down.", "offline", "Offline test run.", "Self-graded. The suite itself is not published yet."],
  ["A bad version is rolled back automatically; the live drill passed twice.", "self", "My deploy logs. The second drill (17 Nov) used a deliberately broken version.", "Logs are not published. Restoring live data has never been rehearsed."],
  ["Tonight's code deploy needed the owner's passkey.", "self", "My deploy log, 17 Nov.", "The gate is part of my own deploy process. Someone with the hosting account could deploy around it, and nothing alarms on that yet."],
  ["Every connected AI is served the owner's rule in plain English.", "self", "Read from the live rules door, 17 Nov 2026, 2:03 AM ET; unchanged at 6:56 PM ET.", "Reading a rule does not make an AI obey it. The gate is what enforces it."],
  ["Only one approved action can be carried out: adding a line to one sandbox test file.", "self", "First run 17 Nov, 2:27 AM ET after my passkey approval: one line added, done reported back. The file and the runner's log were checked on the machine by my AI session.", "Not shown publicly yet. The allowlist, the 60-second wait and STOP halting the runner have no outside test."],
  ["Six models as a panel never beat the best single model.", "offline", "Raw runs and the table script are public (see Research).", "Two small made-up tasks; answer keys written by one of the tested models."],
  ["Bake-off: GPT 49, Gemini 48, Grok 48, Claude 46, Perplexity 30, Mistral 24 (of 48).", "offline", "8 tasks, answer key fixed before any run, 17 Nov.", "One run each; self-graded; results not yet published as files."],
  ["The rerun kit: 18 of 18 attack cases behave as expected, and 7 of 7 deliberately broken gates are caught.", "offline", "kit/run_kit.mjs and kit/run_mutants.mjs, public; anyone can rerun them.", "They test a reference model of the rules, not ONE's live code. Three backup checks cannot be isolated by any case."],
  ["No outside person has checked any of this.", "self", "Zero outside findings so far.", "That is why this page exists."]
];
