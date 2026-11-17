# Test report (phases 1 to 3, 17 Nov 2026)

## Page tests
Run: serve `public/` over http (for example `python3 -m http.server` in `public/`), then
`node site-docs/test_page.cjs http://localhost:8000/one-review/` with Playwright Chromium, headless, at phone 390 and 320 px and desktop 1280 px. 31 checks.

```
PASS no JS errors 
PASS no sideways scroll at 390
PASS 55 capability cards
PASS 15 claims
PASS hero count shows 0 independently verified
PASS filter sim shows 11
PASS spoof: 4 refused, 1 accepted
  replay: 2 accepted, 3 refused
  race: 0 accepted, 3 refused
  inject: 0 accepted, 1 refused
  fail: 0 accepted, 2 refused
PASS replay: second use refused
PASS race: STOP wins, old approval stays dead
PASS fail: closed
PASS dev: 4th request limited
PASS dev: approve forbidden
PASS dev: STOP 423
PASS original simulator: request appears
PASS original STOP works
PASS first Tab = skip link
PASS keyboard focus moves through controls
PASS no network calls except fonts: 
PASS no sideways scroll at 320
PASS in-browser suite: 18 of 18
PASS recorder: 7 sample events
PASS recorder: sample valid
PASS recorder: edit caught
PASS recorder: resealed AI approval caught
PASS recorder: cut-off end NOT caught (stated limit)
PASS reviewer mode opens details and banner
PASS light mode toggles
PASS control room preview carries made-up-data banner
PASS no sideways scroll after phase 2-3
PASS no JS errors after phase 2-3 
PASS still no outside calls: 
FAILS 0
```

## Rerun kit (Node 22)
- `node kit/run_kit.mjs`: 18 of 18 cases behaved as expected.
- `node kit/run_mutants.mjs`: 7 of 7 deliberately broken gates caught. Three backup checks are equivalent mutants (stated in the file).
- `node kit/test_recorder.mjs`: 9 of 9 passed, including the stated limit (a cut-off end is not detected).

## Not tested yet (honest gaps)
Real phones (Chrome Android, Samsung Internet, Safari iOS), Firefox, Edge, a screen reader, a measured colour-contrast audit (light mode especially), the no-JavaScript fallback (the map, claims, labs, recorder and sandbox need JavaScript; the original text sections do not), offline behaviour, and a crawl of every external link. No 404 page, sitemap or robots file was added, because `public/` hosts other pages too.
