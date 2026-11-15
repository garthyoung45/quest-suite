# The multi-model script (public edition)

About 130 lines of JavaScript. Node 22, no packages. It sends one task to several commercial models through a model broker (OpenRouter), as a chain or a panel, and writes one JSON record and one readable report per run. Models have no tools. Every run ends in the state "pending_human_approval".

This public edition differs from the builder's working copy in two places only: the private word list of the task filter is replaced by a placeholder, and one private site name in the filter is replaced by a placeholder. Six test inputs were changed to match. Offline tests on this edition: 64 pass, 0 fail.

## Offline (no key, no network)
```
mkdir work && node test_roundtable.mjs work
```

## Live (your own key, your own money)
The script refuses to run unless all of these hold:
- `OPENROUTER_API_KEY` is set in the environment. It is never passed on a command line or written to a file.
- The broker's own record of that key shows a limit of 20 dollars or less that resets monthly.
- This folder's `ledger.json` plus the run's cap stays within 20 dollars for the month.
- No file named `STOP` exists in this folder.
- You pass `--one-status clear`. For the builder this confirms his own STOP control was read and is off. For you it is only a deliberate extra word.

```
node ai_roundtable.mjs --task-file ../demo/task_demo1.txt --one-status clear --panel --max-usd-run 0.5 --out myruns
node ai_roundtable.mjs --task-file ../demo/task_demo1.txt --one-status clear --extra --max-usd-run 0.5 --out myruns
```
Run from inside this folder, one run at a time. A panel run made 12 or 13 calls and cost 12 to 13 US cents in November 2026.

## Modes
- Chain (default): four models in a fixed order, each with a fixed job, each reading the task and a short handoff from the one before. `--extra` inserts two more.
- Panel (`--panel`): six models answer alone, each then reads all first answers and replies, one writes a summary.

## Known limits
- If a reply costs more than its estimate, a run can pass its own cap by that one reply. The hard ceiling is the limit set on the key at the broker.
- The task filter is a pattern check. It cannot recognise private facts written in ordinary words.
- One model often returns an empty reply. In chain mode that stops the run.
- Answers are limited to about 1,200 characters, which can cut a model off.
- Model names and prices are read from the broker at run time and will go out of date.
