// Air Kit: five pads of light. Strike down through a pad to play it.
// Free play, or three guided levels where rings close on a pad as its beat arrives.
import { App, THREE, makeLabel, setLabel, clamp, best } from './kit';

const app = new App({
  title: 'Air Kit',
  blurb: 'A drum kit made of light. Hit the pads; harder hits are louder. Start a level and a ring closes on each pad as its beat arrives. Hit when the ring meets the pad. Score 70 percent to unlock the next level.',
  mode: 'vr',
  handsHelp: 'swing a fingertip down through a pad. Pinch the green ball to start a level, the blue ball to pick the level.',
  padHelp: 'Cross kick, Square snare, Triangle hi-hat, Circle tom, R1 crash, L1 start or stop a level, L2 pick the level.',
  steps: ['Swing your controllers down through the coloured discs, like drumsticks', 'Trigger on the GREEN ball starts a level: hit a pad when its ring closes', 'Trigger on the BLUE ball picks the level'],
  sky: 0x0b0a1e,
});

const PADS = [
  { name: 'Kick', x: 0, y: 0.72, z: -0.42, r: 0.15, c: 0xff5d5d, btn: 'cross' },
  { name: 'Snare', x: -0.27, y: 0.86, z: -0.4, r: 0.12, c: 0xffd166, btn: 'square' },
  { name: 'Hat', x: -0.47, y: 1.0, z: -0.22, r: 0.1, c: 0x7fe0a0, btn: 'triangle' },
  { name: 'Tom', x: 0.27, y: 0.86, z: -0.4, r: 0.12, c: 0x6bb8ff, btn: 'circle' },
  { name: 'Crash', x: 0.47, y: 1.05, z: -0.22, r: 0.12, c: 0xd9a6ff, btn: 'r1' },
];
const meshes: THREE.Mesh[] = [], rings: THREE.Mesh[] = [];
const flash = [0, 0, 0, 0, 0];
const geo = new THREE.CylinderGeometry(1, 1, 0.02, 28);
const ringGeo = new THREE.TorusGeometry(1, 0.035, 6, 32);
ringGeo.rotateX(Math.PI / 2);
PADS.forEach((p) => {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: p.c, transparent: true, opacity: 0.55 }));
  m.scale.set(p.r, 1, p.r); m.position.set(p.x, p.y, p.z);
  const rim = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: p.c })); rim.scale.setScalar(p.r); rim.position.copy(m.position);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); ring.position.copy(m.position); ring.visible = false;
  const l = makeLabel(p.name, 0.14, 0.05); l.position.set(p.x, p.y - 0.06, p.z + p.r * 0.7);
  app.scene.add(m, rim, ring, l);
  meshes.push(m); rings.push(ring);
});
const ball = (c: number, x: number, t: string) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, 1.12, -0.52); const l = makeLabel(t, 0.16, 0.045); l.position.set(x, 1.19, -0.52); app.scene.add(m, l); return { m, l }; };
const startBall = ball(0x35c46a, -0.1, 'Start');
const levelBall = ball(0x4f9cff, 0.1, 'Level 1');
const board = makeLabel('', 1.0, 0.3);
board.position.set(0, 1.62, -1.1);
app.scene.add(board);
const judge = makeLabel('', 0.4, 0.09, { bg: 'rgba(0,0,0,0)' });
judge.position.set(0, 1.3, -0.7);
app.scene.add(judge);

let noise: AudioBuffer;
function play(i: number, v: number) {
  const ctx = app.audio, t = ctx.currentTime;
  const out = ctx.createGain(); out.gain.value = clamp(v, 0.15, 1); out.connect(app.master);
  const env = (g: GainNode, peak: number, dur: number) => { g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); };
  const nz = (freq: number, type: BiquadFilterType, peak: number, dur: number) => {
    const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); env(g, peak, dur); s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  };
  const osc = (f0: number, f1: number, peak: number, dur: number, type: OscillatorType = 'sine') => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    const g = ctx.createGain(); env(g, peak, dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.02);
  };
  if (i === 0) { osc(150, 42, 1.0, 0.32); nz(900, 'lowpass', 0.3, 0.03); }
  else if (i === 1) { osc(220, 150, 0.5, 0.12, 'triangle'); nz(1800, 'highpass', 0.6, 0.18); }
  else if (i === 2) nz(7000, 'highpass', 0.35, 0.06);
  else if (i === 3) osc(190, 95, 0.8, 0.3);
  else { nz(4200, 'highpass', 0.45, 0.9); nz(9000, 'bandpass', 0.25, 1.2); }
  flash[i] = 1;
}

// Levels: 16 steps per bar, pad index per step (-1 rest). Four bars per run.
const LEVELS = [
  { name: 'Level 1: Heartbeat', bpm: 80, pat: [0, -1, -1, -1, 1, -1, -1, -1, 0, -1, -1, -1, 1, -1, -1, -1] },
  { name: 'Level 2: Backbeat', bpm: 92, pat: [0, -1, 2, -1, 1, -1, 2, -1, 0, -1, 2, -1, 1, -1, 2, -1] },
  { name: 'Level 3: Full kit', bpm: 104, pat: [0, -1, 2, -1, 1, -1, 2, 0, 0, -1, 2, -1, 1, -1, 3, 4] },
];
const LEAD = 0.75, WINDOW = 0.15, BARS = 4;
const GRADES: [number, string][] = [[95, 'S'], [85, 'A'], [70, 'B'], [50, 'C'], [0, 'D']];
let level = 0, unlocked = best('airkit.unlocked') | 0, running = false, clockT = 0, lastStep = -1;
let cues: { pad: number; t: number; hit: boolean }[] = [];
let score = 0, combo = 0, maxCombo = 0, judgeT = 0, total = 0;

const bestOf = (l: number) => best('airkit.l' + l);
function showIdle(extra = '') {
  setLabel(board, `${extra ? extra + '\n' : ''}${LEVELS[level].name}   ${LEVELS[level].bpm} bpm   Best ${bestOf(level)}%\nFree play. Green ball starts the level.`);
  setLabel(levelBall.l, 'Level ' + (level + 1));
  setLabel(startBall.l, 'Start');
}
function startRun() {
  const L = LEVELS[level], step = 60 / L.bpm / 4;
  cues = [];
  for (let b = 0; b < BARS; b++) L.pat.forEach((p, s) => { if (p >= 0) cues.push({ pad: p, t: 2 + (b * 16 + s) * step, hit: false }); });
  total = cues.length; running = true; clockT = 0; lastStep = -1; score = 0; combo = 0; maxCombo = 0;
  setLabel(startBall.l, 'Stop');
  app.tone(880, 0.1, 'triangle', 0.2);
}
function endRun(done: boolean) {
  running = false; rings.forEach((r) => (r.visible = false));
  if (!done) { showIdle('Stopped'); return; }
  const pct = Math.round((score / total) * 100);
  const grade = GRADES.find((g) => pct >= g[0])![1];
  best('airkit.l' + level, pct);
  let msg = `Grade ${grade}: ${pct}% on the beat, best streak ${maxCombo}`;
  if (pct >= 70 && level < LEVELS.length - 1 && unlocked <= level) { unlocked = level + 1; best('airkit.unlocked', unlocked); msg += '   Next level unlocked'; }
  if (pct >= 70) { app.good(); if (level < unlocked && level < LEVELS.length - 1) level++; } else app.bad();
  showIdle(msg);
}
function strike(i: number, v: number, hand: number) {
  play(i, v);
  app.buzz(hand, 0.3 + v * 0.7, 35);
  app.burst(meshes[i].position, PADS[i].c, 8 + Math.round(v * 10), 0.8 + v);
  if (!running) return;
  const c = cues.find((q) => !q.hit && q.pad === i && Math.abs(q.t - clockT) < WINDOW);
  if (c) { c.hit = true; const d = Math.abs(c.t - clockT); score += d < 0.07 ? 1 : 0.7; combo++; maxCombo = Math.max(maxCombo, combo); setLabel(judge, d < 0.07 ? 'Perfect' : c.t > clockT ? 'Early' : 'Late'); }
  else { combo = 0; setLabel(judge, 'Off beat'); }
  judgeT = 0.5;
}
function pickLevel() { if (running) return; level = (level + 1) % (unlocked + 1); showIdle(level === unlocked && unlocked < LEVELS.length - 1 ? 'Score 70% here to unlock the next level' : ''); app.tone(600, 0.08, 'triangle', 0.2); }

const prevY = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
const cool = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
app.onStart = () => { noise = app.noiseBuffer(2); showIdle(); app.say('Hit the pads. Green ball starts a level.'); };
app.run((dt) => {
  PADS.forEach((p, i) => { if (app.hit(p.btn)) strike(i, 0.8, 1); });
  if (app.hit('l1')) running ? endRun(false) : startRun();
  if (app.hit('l2') && !app.inXR) pickLevel();
  app.hands.forEach((h, hi) => {
    if (!h.active) return;
    if (h.pinchDown && h.pos.distanceTo(startBall.m.position) < 0.1) { running ? endRun(false) : startRun(); return; }
    if (h.pinchDown && h.pos.distanceTo(levelBall.m.position) < 0.1) { pickLevel(); return; }
    if (!app.inXR) return; // on a screen the buttons play the pads
    PADS.forEach((p, i) => {
      cool[hi][i] -= dt;
      const dy = h.tip.y - p.y;
      const inside = Math.hypot(h.tip.x - p.x, h.tip.z - p.z) < p.r + 0.03;
      if (inside && prevY[hi][i] > 0.005 && dy <= 0.005 && dy > -0.15 && h.vel.y < -0.25 && cool[hi][i] <= 0) { strike(i, clamp(-h.vel.y / 2.2, 0.2, 1), hi); cool[hi][i] = 0.09; }
      prevY[hi][i] = dy;
    });
  });
  if (running) {
    clockT += dt;
    const L = LEVELS[level], step = 60 / L.bpm / 4;
    const s = Math.floor((clockT - 2) / step);
    if (clockT < 2) { const n = Math.floor(clockT / 0.5); if (n !== lastStep) { lastStep = n; app.tone(1200, 0.04, 'square', 0.08); setLabel(board, `${L.name}\nGet ready: ${4 - n}`); } }
    else if (s !== lastStep) {
      lastStep = s;
      if (s % 4 === 0) app.tone(s % 16 === 0 ? 1500 : 1100, 0.03, 'square', 0.05);
      if (s % 16 === 0) app.tone([55, 55, 73.4, 65.4][Math.floor(s / 16) % 4], step * 14, 'triangle', 0.16);
      const bar = Math.min(BARS, Math.floor(s / 16) + 1);
      setLabel(board, `${L.name}   Bar ${bar} of ${BARS}\nScore ${Math.round((score / total) * 100)}%   Streak ${combo}`);
    }
    for (const c of cues) if (!c.hit && clockT - c.t > WINDOW && c.pad >= 0) { c.hit = true; combo = 0; }
    // Closing rings: the nearest upcoming cue on each pad.
    rings.forEach((r, i) => {
      const c = cues.find((q) => !q.hit && q.pad === i && q.t - clockT < LEAD && q.t - clockT > -WINDOW);
      r.visible = !!c;
      if (c) { const k = clamp((c.t - clockT) / LEAD, 0, 1); r.scale.setScalar(PADS[i].r * (1 + k * 1.6)); (r.material as THREE.MeshBasicMaterial).opacity = 1 - k * 0.7; }
    });
    if (clockT > 2 + BARS * 16 * step + 0.4) endRun(true);
  }
  if (judgeT > 0) { judgeT -= dt; if (judgeT <= 0) setLabel(judge, ''); }
  meshes.forEach((m, i) => {
    flash[i] = Math.max(0, flash[i] - dt * 6);
    (m.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.55 * flash[i];
    m.position.y = PADS[i].y - flash[i] * 0.015;
  });
});
(window as any).__state = () => ({ running, level, unlocked, clockT: +clockT.toFixed(2), score, total, combo, cues: cues.filter((c) => !c.hit).slice(0, 3), flash: flash.map((f) => +f.toFixed(2)), pads: PADS.map((p) => [p.x, p.y, p.z]), start: startBall.m.position.toArray() });
