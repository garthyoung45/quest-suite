# Quest Suite

A set of small WebXR experiences for Meta Quest, with one hub page. Each one plays with
hand tracking in the headset, and also on a flat screen with a PS5 DualSense, a Switch
Pro Controller, or keyboard and mouse.

All sound is generated at runtime with the Web Audio API. No model, texture or audio files.

```sh
npm install
npm run dev      # http://localhost:8081  (add ?emu=1 to a page for the headset emulator)
npm run build    # dist/
```

Pushing to `main` deploys `dist/` to GitHub Pages (Pages source: GitHub Actions).

- `src/kit.ts` shared: XR session, hands, controller mode, HUD, sound helpers
- `src/hub.ts` the list on the front page
- `src/<name>.ts` + `<name>.html` one experience each
