// Air Kit: five pads of light. Strike down through a pad to play it.
import { App, THREE, makeLabel, setLabel, clamp } from './kit';

const app = new App({
  title: 'Air Kit',
  blurb: 'A drum kit made of light. Hit the pads with your fingertips; harder hits are louder. Pinch the small beat puck to start a guide beat and try to land on the lit pads.',
  mode: 'vr',
  handsHelp: 'swing a fingertip down through a pad. Pinch the white puck for the guide beat.',
  padHelp: 'Cross kick, Square snare, Triangle hi-hat, Circle tom, R1 crash, L1 guide beat.',
  steps: ['Swing your controllers down through the coloured discs', 'They are at waist height, right in front of you', 'Trigger on the white ball starts a guide beat'],
  sky: 0x07060f,
});

const PADS = [
  { name: 'Kick', x: 0, y: 0.72, z: -0.42, r: 0.15, c: 0xff5d5d, btn: 'cross' },
  { name: 'Snare', x: -0.27, y: 0.86, z: -0.4, r: 0.12, c: 0xffd166, btn: 'square' },
  { name: 'Hat', x: -0.47, y: 1.0, z: -0.22, r: 0.1, c: 0x7fe0a0, btn: 'triangle' },
  { name: 'Tom', x: 0.27, y: 0.86, z: -0.4, r: 0.12, c: 0x6bb8ff, btn: 'circle' },
  { name: 'Crash', x: 0.47, y: 1.05, z: -0.22, r: 0.12, c: 0xd9a6ff, btn: 'r1' },
];
const meshes: THREE.Mesh[] = [];
const flash = [0, 0, 0, 0, 0];
const cue = [0, 0, 0, 0, 0];
const geo = new THREE.CylinderGeometry(1, 1, 0.02, 28);
PADS.forEach((p) => {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: p.c, transparent: true, opacity: 0.55 }));
  m.scale.set(p.r, 1, p.r);
  m.position.set(p.x, p.y, p.z);
  app.scene.add(m);
  meshes.push(m);
  const l = makeLabel(p.name, 0.14, 0.05);
  l.position.set(p.x, p.y - 0.06, p.z + p.r * 0.7);
  app.scene.add(l);
});
const puck = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
puck.position.set(0, 1.05, -0.5);
app.scene.add(puck);
const board = makeLabel('Free play', 0.7, 0.16);
board.position.set(0, 1.5, -0.9);
app.scene.add(board);

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
  if (i === 0) osc(150, 42, 1.0, 0.32);
  else if (i === 1) { osc(220, 150, 0.5, 0.12, 'triangle'); nz(1800, 'highpass', 0.6, 0.18); }
  else if (i === 2) nz(7000, 'highpass', 0.35, 0.06);
  else if (i === 3) osc(190, 95, 0.8, 0.3);
  else { nz(4200, 'highpass', 0.45, 0.9); nz(9000, 'bandpass', 0.25, 1.2); }
  flash[i] = 1;
}

// Guide beat: 16 steps, which pad on each step (-1 none).
const PATTERN = [0, -1, 2, -1, 1, -1, 2, -1, 0, 0, 2, -1, 1, -1, 2, 3];
const STEP = 60 / 96 / 2;
let guide = false, step = -1, clockT = 0, hits = 0, onBeat = 0;
const lastCue = [-9, -9, -9, -9, -9];

function strike(i: number, v: number) {
  play(i, v);
  if (guide) { hits++; if (app.time - lastCue[i] < 0.16 || cue[i] > 0.75) onBeat++; setLabel(board, `Guide beat on    ${onBeat} of ${hits} hits on the beat`); }
}
function toggleGuide() {
  guide = !guide; step = -1; clockT = 0; hits = 0; onBeat = 0;
  (puck.material as THREE.MeshBasicMaterial).color.set(guide ? 0x7fe0a0 : 0xffffff);
  setLabel(board, guide ? 'Guide beat on    hit the pad when it lights' : 'Free play');
  app.tone(guide ? 880 : 440, 0.1, 'triangle', 0.2);
}

const prevY = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
const cool = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
app.onStart = () => { noise = app.noiseBuffer(2); app.say('Hit the pads. Pinch the white puck for a guide beat.'); };
app.run((dt) => {
  PADS.forEach((p, i) => { if (app.hit(p.btn)) strike(i, 0.8); });
  if (app.hit('l1')) toggleGuide();
  app.hands.forEach((h, hi) => {
    if (!h.active) return;
    if (h.pinchDown && h.pos.distanceTo(puck.position) < 0.09) toggleGuide();
    if (!app.inXR) return; // on a screen the buttons play the pads
    PADS.forEach((p, i) => {
      cool[hi][i] -= dt;
      const dy = h.tip.y - p.y;
      const inside = Math.hypot(h.tip.x - p.x, h.tip.z - p.z) < p.r + 0.02;
      if (inside && prevY[hi][i] > 0.005 && dy <= 0.005 && dy > -0.12 && h.vel.y < -0.25 && cool[hi][i] <= 0) {
        strike(i, clamp(-h.vel.y / 2.2, 0.2, 1));
        cool[hi][i] = 0.09;
      }
      prevY[hi][i] = dy;
    });
  });
  if (guide) {
    clockT += dt;
    const s = Math.floor(clockT / STEP);
    if (s !== step) {
      step = s;
      const pad = PATTERN[s % 16];
      if (s % 4 === 0) app.tone(s % 16 === 0 ? 1500 : 1100, 0.03, 'square', 0.05);
      if (pad >= 0) { cue[pad] = 1; lastCue[pad] = app.time; }
    }
  }
  meshes.forEach((m, i) => {
    flash[i] = Math.max(0, flash[i] - dt * 6);
    cue[i] = Math.max(0, cue[i] - dt * 5);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.4 + 0.6 * Math.max(flash[i], cue[i] * 0.8);
    m.scale.y = 1 + cue[i] * 2;
    m.position.y = PADS[i].y - flash[i] * 0.015;
  });
});
(window as any).__state = () => ({ guide, hits, onBeat, flash: flash.map((f) => +f.toFixed(2)), pads: PADS.map((p) => [p.x, p.y, p.z]) });
