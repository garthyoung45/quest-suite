# Demo results (built by make_results.py from the run records; do not edit by hand)

## Demo 1: lockout procedure, 10 planted defects in 22 steps

Score = planted errors found, by the pre-registered rule (the first FLAGGED line). "Extras" = flagged items that are not in the key. "Last line" = post-hoc score using the last FLAGGED line instead, shown only where it differs.

### Run rt_20261115034221_24169d (panel mode, state pending_human_approval, $0.1334, 158 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | alone (baseline) | 10 of 10 | none | none |  | $0.0137 |
| 2 | claude | alone (baseline) | 10 of 10 | none | none |  | $0.0136 |
| 3 | grok | alone (baseline) | 10 of 10 | none | none |  | $0.0197 |
| 4 | lechat | alone (baseline) | 9 of 10 | 3 | none |  | $0.0036 |
| 5 | perplexity | alone (baseline) | 10 of 10 | none | none |  | $0.0063 |
| 6 | chatgpt | alone (baseline) | 9 of 10 | 3 | none |  | $0.0028 |
| 7 | gemini | after reading the others | 10 of 10 | none | none |  | $0.0115 |
| 8 | claude | after reading the others | 9 of 10 | 3 | none |  | $0.0132 |
| 9 | grok | after reading the others | 10 of 10 | none | none |  | $0.0108 |
| 10 | lechat | after reading the others | EMPTY REPLY | | | | $0.0102 |
| 11 | perplexity | after reading the others | 10 of 10 | none | none |  | $0.0078 |
| 12 | chatgpt | after reading the others | 9 of 10 | 3 | none |  | $0.0043 |
| 13 | gemini | panel summary (final) | 9 of 10 | 3 | none |  | $0.0161 |

### Run rt_20261115034617_7dd310 (panel mode, state pending_human_approval, $0.1329, 172 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | alone (baseline) | 9 of 10 | 3 | none |  | $0.0134 |
| 2 | claude | alone (baseline) | 10 of 10 | none | none |  | $0.0105 |
| 3 | grok | alone (baseline) | 10 of 10 | none | none |  | $0.0106 |
| 4 | lechat | alone (baseline) | 9 of 10 | 3 | none |  | $0.0077 |
| 5 | perplexity | alone (baseline) | 10 of 10 | none | none |  | $0.0063 |
| 6 | chatgpt | alone (baseline) | 9 of 10 | 3 | none |  | $0.0028 |
| 7 | gemini | after reading the others | 10 of 10 | none | none |  | $0.0137 |
| 8 | claude | after reading the others | 9 of 10 | 3 | none |  | $0.0141 |
| 9 | grok | after reading the others | 10 of 10 | none | none |  | $0.0112 |
| 10 | lechat | after reading the others | EMPTY REPLY | | | | $0.0103 |
| 11 | perplexity | after reading the others | NO FLAGGED LINE | | | | $0.0079 |
| 12 | chatgpt | after reading the others | 9 of 10 | 3 | none |  | $0.0046 |
| 13 | gemini | panel summary (final) | 9 of 10 | 3 | none |  | $0.0198 |

### Run rt_20261115034910_535df5 (chain mode, state stopped_empty_reply, $0.0510, 88 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | chain step | 9 of 10 | 3 | none |  | $0.0130 |
| 2 | claude | chain step | 10 of 10 | none | none |  | $0.0119 |
| 3 | grok | chain step | NO FLAGGED LINE | | | | $0.0167 |
| 4 | lechat | chain step | EMPTY REPLY | | | | $0.0095 |

## Demo 2: reliability summary, 7 planted errors in 18 statements

Score = planted errors found, by the pre-registered rule (the first FLAGGED line). "Extras" = flagged items that are not in the key. "Last line" = post-hoc score using the last FLAGGED line instead, shown only where it differs.

### Run rt_20261115035042_315b01 (panel mode, state pending_human_approval, $0.1163, 115 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | alone (baseline) | 7 of 7 | none | none |  | $0.0106 |
| 2 | claude | alone (baseline) | 3 of 7 | 4, 7, 12, 18 | 9, 16 | 4 of 7 | $0.0128 |
| 3 | grok | alone (baseline) | 7 of 7 | none | none |  | $0.0108 |
| 4 | lechat | alone (baseline) | EMPTY REPLY | | | | $0.0091 |
| 5 | perplexity | alone (baseline) | 5 of 7 | 4, 12 | 11 |  | $0.0064 |
| 6 | chatgpt | alone (baseline) | 7 of 7 | none | none |  | $0.0027 |
| 7 | gemini | after reading the others | 7 of 7 | none | none |  | $0.0115 |
| 8 | claude | after reading the others | 7 of 7 | none | none |  | $0.0128 |
| 9 | grok | after reading the others | 7 of 7 | none | none |  | $0.0127 |
| 10 | perplexity | after reading the others | 7 of 7 | none | none |  | $0.0078 |
| 11 | chatgpt | after reading the others | 7 of 7 | none | none |  | $0.0044 |
| 12 | gemini | panel summary (final) | 7 of 7 | none | none |  | $0.0147 |

### Run rt_20261115035239_a7cfd0 (panel mode, state pending_human_approval, $0.1189, 128 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | alone (baseline) | 7 of 7 | none | none |  | $0.0105 |
| 2 | claude | alone (baseline) | 7 of 7 | none | none |  | $0.0146 |
| 3 | grok | alone (baseline) | 7 of 7 | none | none |  | $0.0120 |
| 4 | lechat | alone (baseline) | EMPTY REPLY | | | | $0.0093 |
| 5 | perplexity | alone (baseline) | 3 of 7 | 4, 7, 12, 13 | 8, 9, 10, 16 |  | $0.0064 |
| 6 | chatgpt | alone (baseline) | 7 of 7 | none | none |  | $0.0014 |
| 7 | gemini | after reading the others | 7 of 7 | none | none |  | $0.0120 |
| 8 | claude | after reading the others | 7 of 7 | none | none |  | $0.0131 |
| 9 | grok | after reading the others | 7 of 7 | none | none |  | $0.0126 |
| 10 | perplexity | after reading the others | 7 of 7 | none | none |  | $0.0076 |
| 11 | chatgpt | after reading the others | 7 of 7 | none | none |  | $0.0041 |
| 12 | gemini | panel summary (final) | 7 of 7 | none | none |  | $0.0152 |

### Run rt_20261115035449_f646c5 (chain mode, state stopped_empty_reply, $0.0528, 71 seconds)

| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |
|---|---|---|---|---|---|---|---|
| 1 | gemini | chain step | 7 of 7 | none | none |  | $0.0160 |
| 2 | claude | chain step | 7 of 7 | none | none |  | $0.0123 |
| 3 | grok | chain step | NO FLAGGED LINE | | | | $0.0151 |
| 4 | lechat | chain step | EMPTY REPLY | | | | $0.0094 |

Total spent on these runs: $0.6053.
