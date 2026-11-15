# The demonstration

Run 2026-11-14, 10:42 PM to 10:58 PM ET (2026-11-15 03:42Z to 03:58Z). Real calls, real costs, nothing made up. Raw records: `demo/runs/` and `demo/runs2/`. Table built by script: `demo/RESULTS.md`. Times are US Eastern with UTC in brackets.

## Why this demo and not the gate
The directive asks for a fresh, bounded, non-sensitive task that a technical stranger can evaluate, with a single-model baseline. The approval gate cannot be shown live to a stranger (it sits behind a sign-in and holds household data), and its live flow has run three times. The multi-model script can be shown in full: every input and output is a file. So the strongest demonstration is the script on a scored task. The gate is demonstrated separately by the browser demo page from the 11-12 challenge and the offline attack suite.

Status: **PARTIAL**. Working and reproducible from the records; the result is negative for the multi-model claim; no outsider has rerun it; there is no video.

## The twelve points the directive asks for

| # | Point | Answer |
|---|---|---|
| 1 | A clearly defined problem | Find the planted errors. Task 1: a 22-step lockout procedure for a fictional case packer with 10 planted safety defects. Task 2: an 18-statement reliability summary for a fictional bottling line with 7 planted arithmetic or logic errors. Both made up. Files: `demo/task_demo1.txt`, `demo/task_demo2.txt` |
| 2 | Which AI systems take part | Six models from five companies, named in every record: google/gemini-4-hydrogen, anthropic/claude-sonnet-5.5, x-ai/grok-4.7, mistralai/mistral-large-4-0, perplexity/sonar, openai/gpt-6.1-terra. Reached through one broker (OpenRouter). These are the paid developer versions, not the phone apps |
| 3 | How tasks are assigned | By a fixed list inside the script. Panel mode: every model gets the same question. Chain mode: each model has a fixed job (structure, attack, check, second opinion, sourced lookup, write-up). No model chooses its task or another model's |
| 4 | How information moves | The script sends the task to a model, takes its answer (at most 1,200 characters plus short lists), and puts it into the next model's input as data. Panel mode: all first answers are shown to every member for one reply round, then all of it to one model for a summary. Each handoff is hashed and chained to the one before |
| 5 | Which transfers need a human | Starting the run (a person, or an assistant session on his instruction, after reading that STOP is off). Reading the result. Deciding anything. Inside a run: none |
| 6 | How competing conclusions are reconciled | They are not reconciled by the system. The summary step is told to report agreement, name who disagrees with whom, and not smooth it over. A human decides. In task 1 the summary did name a three-to-three split correctly |
| 7 | How errors and disagreements are detected | Empty reply: detected by the script, which skips that member (panel) or stops (chain) and records it with its cost. Disagreement: visible by comparing the FLAGGED lines; reported by the summary. Wrong answers: only by the answer key, or a human. The models did not reliably catch each other on task 1 and did on task 2 |
| 8 | What the Coordinator controls | Which task file is run, in which mode, under what spending cap. It wrote the tasks and keys, started six runs, and scored them with a script. It does not control the models' answers and cannot message any model outside a run |
| 9 | What needs owner authorization | Spending (a standing approval of 20 dollars a month exists for this script; these runs used 61 cents). Publishing anything. Acting on any result. Every run ends in the state "pending human approval" and nothing follows from it |
| 10 | The final artifact | One JSON record and one readable report per run, and a results table |
| 11 | How the result is verified | Against keys whose hashes were recorded before the first run (`demo/PREREGISTRATION.sha256`), by a script (`demo/make_results.py`) that anyone can rerun on the raw records. Not verified by anyone outside |
| 12 | Does the workflow beat a single-model baseline | No. See below |

## Design
- Baseline: in panel mode each model first answers alone, seeing only the question. Those first answers are the single-model baselines, taken in the same run, minutes apart from the panel result, with the same instructions.
- Multi-model result: the panel's final summary. Also reported: each member's list after reading the others.
- Scoring rule, fixed in the key file before the runs: take the first line beginning "FLAGGED:" in a model's answer; count planted errors found; list anything else flagged as "extras" for a human to judge.
- Runs: each task twice in panel mode and once in chain mode with all six models. Six runs.
- Order of events: task 1 and its key were written and hashed at 03:41:51Z; first run started 03:42:21Z. After that run showed every model scoring 9 or 10 of 10 alone, task 2 was written as a second, arithmetic-based test, and hashed before any model saw it. That sequence is disclosed in the task 2 key file.

## Result

| | Task 1 run A | Task 1 run B | Task 2 run A | Task 2 run B |
|---|---|---|---|---|
| Models answering alone | 6 | 6 | 5 (one empty) | 5 (one empty) |
| Scored perfect alone | 4 | 3 | 3 | 4 |
| Lowest score alone | 9 of 10 | 9 of 10 | 3 of 7 | 3 of 7 |
| **Best single model** | **10 of 10** | **10 of 10** | **7 of 7** | **7 of 7** |
| **Panel final summary** | **9 of 10** | **9 of 10** | **7 of 7** | **7 of 7** |
| Members improved by reading the others | 0 | 1 (9 to 10) | 2 (3 to 7, 5 to 7) | 1 (3 to 7) |
| Members made worse by reading the others | 1 (10 to 9) | 1 (10 to 9) | 0 | 0 |
| Cost of the whole panel run | $0.1334 | $0.1329 | $0.1163 | $0.1189 |
| Cheapest fully correct single answer | $0.0063 | $0.0063 | $0.0027 | $0.0014 |
| Wall time | 158 s | 172 s | 115 s | 128 s |

Chain mode, both tasks: **stopped early**. The fourth model returned an empty reply and the script stopped, as designed. No final answer was produced. Cost $0.0510 and $0.0528.

Total spent on the six runs: $0.6053.

### What the result supports
1. On these four panel runs, over two made-up documents with answer keys written by one of the tested models, the multi-model panel never beat the best single model on either task.
2. It cost 21 to 85 times as much as the cheapest fully correct single answer.
3. Reading each other's answers repaired weaker members on the arithmetic task (three cases, all ending fully correct).
4. If you do not know in advance which model is strong on a task, a panel protects you from picking a weak one. On task 2 the same model scored 3 of 7 in one run and 7 of 7 in the next, and another scored 5 then 3.
5. The script's record-keeping worked: every step, cost and handoff is on file, and the failures are in the record, not hidden.

### What it does not support
- Any claim that several models are smarter than one.
- Anything about hard, long or real-world work. These are two short tasks. Every strong model was already at or near the ceiling.
- Any general claim at all, in either direction. Four panel runs, two made-up documents, answer keys written by one of the tested models. It does not show that multi-model review fails in general, or that it always costs twenty times more. A fair test would need a larger and varied task set, keys written and held by someone independent, equal cost or time budgets for panel and single model, and repeated runs.

### Failures and oddities, kept as they happened
- **Task 1, the one disputed item.** Step 3 has the worker press the emergency stop mid-cycle as the way to shut down. The key counts that as a defect (the normal stop sequence should be used). Three models flagged it and three did not. In both runs one model flagged it alone, then withdrew it after reading the others, saying it was a preference and not a lockout defect. The summary reported the split and left it out of the final list. If a reviewer rules that step 3 is not a defect, then task 1 shows no difference between any model and the panel. Either way the panel does not come out ahead.
- **One model returned nothing in 6 of its 8 calls** (the Mistral model). In panel mode it was skipped. In chain mode it ended the run. The same model returned nothing in earlier runs this week.
- **An output rule hurt one model.** The task told every model to begin with its FLAGGED line. In task 2 run A, one model wrote a list first, then worked through the statements, corrected itself partway, and ran out of its 1,200 characters. Scored by the fixed rule (first line) it got 3 of 7; by its last line, 4 of 7. The rule was mine and it is a flaw in the test design. The pre-registered score stands.
- **Two replies had no FLAGGED line** (one in a panel reply round, one in each chain run at the third step). Counted as no answer.
- **The readiness panel was briefed with run A only.** A six-model second opinion on readiness was told "three of six models found ten of ten"; run A actually had four. It was told about task 1 only. Its advice does not depend on the difference.

### Bias and limits of the test itself
- The tasks and keys were written by a Claude model, and a Claude model is one of the six. A key written by an outside person would be better. This is the first thing to offer a reviewer.
- The hashes prove the keys were not changed after 03:41:51Z and 03:50Z by the clock of the machine that ran the demo. No third party holds those hashes.
- All six models were called with low reasoning effort and a short answer limit, to keep cost down. Stronger settings might change the picture.
- A separate comparison by another thread the same night (eight small jobs, each model alone, majority vote as the group answer) gave the same reading: the vote matched the best models and did not beat them. Same account, so it is a second data point, not an independent one.

## Walkthrough script (for a recording or a live explanation, about three minutes)

No recording exists. This is the script for one. Everything shown is a file in the package, so nothing live appears on screen.

1. (15 s) "This is a test of whether six AI models working together beat one. I'll show the task, the answer key, one real run, and the score."
2. (25 s) Open `task_demo1.txt`. "A made-up lockout procedure, 22 steps. I planted ten safety defects. The models aren't told how many."
3. (20 s) Open `PREREGISTRATION.sha256`, then run `sha256sum` on the task and key. "The key was fixed before any model saw the task. Same hash."
4. (40 s) Open the first run's report. Scroll the six first answers. "Each model answers alone. Four of six found all ten. Total cost of those six answers: six cents."
5. (30 s) Scroll to the reply round. "Now each one reads the others. Watch this one: it had all ten, and it drops step 3 after reading the others."
6. (20 s) The summary. "The summary reports the split honestly and comes out at nine. So the group finished one below the best individuals."
7. (20 s) Run `python3 make_results.py`. "This rebuilds the table from the raw files. You can run it too."
8. (20 s) Task 2 table. "On an arithmetic task the group did help two weaker models. It still didn't beat the best one."
9. (15 s) "What it cost: thirteen cents for the panel, under one cent for the best single answer. And chain mode failed twice because one model returned nothing."
10. (15 s) "No one outside has rerun this. That's what I'm asking for."

## Reproduce
```
cd demo
sha256sum -c <(head -2 PREREGISTRATION.sha256)      # task 1 and its key
python3 make_results.py                             # rebuild RESULTS.md from the raw run records
```
A live rerun needs a broker key in the environment and the script in `roundtable/` (see its README). Run it from inside that folder with relative paths, one run at a time.
