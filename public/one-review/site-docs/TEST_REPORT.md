# Test report (phase 1, 17 Nov 2026)

Run: `node site-docs/test_page.cjs $PWD/index.html` with Playwright Chromium (headless), phone 390 and 320 px, desktop 1280 px.

```
PASS no JS errors 
PASS no sideways scroll at 390
PASS 55 capability cards
PASS 14 claims
PASS hero count shows 0 independently verified
PASS filter sim shows 10
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
FAILS 0
```

Not tested yet (honest gaps): real phones (Chrome Android, Samsung Internet, Safari iOS), Firefox, Edge, a screen reader, measured colour contrast, no-JavaScript fallback (the map, claims, lab and sandbox need JavaScript; the original text sections do not), offline behaviour, broken-link crawl of every external link. These are phase 4.
