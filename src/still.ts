// Still Room: breathe with the light. Tones circle slowly around you.
import { App, THREE, makeLabel, setLabel } from './kit';

const app = new App({
  title: 'Still Room',
  blurb: 'A quiet room for a few minutes. Breathe in as the light grows, out as it shrinks. Four soft tones circle around your head. Raise or lower your hands to brighten or deepen the sound. Sit down for this one.',
  mode: 'vr',
  handsHelp: 'no need to do anything. Hands high makes the sound brighter, hands low makes it deeper. Pinch to change the breathing pace.',
  padHelp: 'R2 changes the breathing pace. Look up or down to change the sound.',
  sky: 0x05070f,
  eye: 1.2,
});
app.room.visible = false;
const PACES = [{ n: 'Calm', i: 4, o: 6 }, { n: 'Slow', i: 5, o: 7 }, { n: 'Even', i: 4, o: 4 }];
let pace = 0, t = 0, breaths = 0;
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 20), new THREE.MeshBasicMaterial({ color: 0x8fb4ff, transparent: true, opacity: 0.9 }));
const glow = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshBasicMaterial({ color: 0x6f8cff, transparent: true, opacity: 0.18, depthWrite: false }));
orb.position.set(0, 1.15, -1.3); glow.position.copy(orb.position);
app.scene.add(orb, glow);
const word = makeLabel('', 0.4, 0.09, { bg: 'rgba(0,0,0,0)' });
word.position.set(0, 0.72, -1.3);
app.scene.add(word);
// Slow dust for depth: one draw call.
const P = 260, pp = new Float32Array(P * 3);
for (let i = 0; i < P; i++) { const a = Math.random() * 6.283, r = 1.5 + Math.random() * 5; pp[i * 3] = Math.cos(a) * r; pp[i * 3 + 1] = Math.random() * 3.5; pp[i * 3 + 2] = Math.sin(a) * r; }
const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pp, 3)), new THREE.PointsMaterial({ color: 0x9fb0ff, size: 0.02, transparent: true, opacity: 0.7 }));
app.scene.add(dust);

const NOTES = [110, 164.81, 220, 277.18];
const voices: { pan: PannerNode; f: BiquadFilterNode; g: GainNode; m: THREE.Mesh }[] = [];
const v = new THREE.Vector3();
app.onStart = () => {
  NOTES.forEach((hz, i) => {
    const pan = app.panner(v.set(0, 1.2, -1), 1, 0.6);
    const f = app.audio.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = app.audio.createGain(); g.gain.value = 0.11;
    for (const det of [-3, 3]) { const o = app.audio.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz; o.detune.value = det + i; o.connect(f); o.start(); }
    f.connect(g).connect(pan);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xcfd8ff }));
    app.scene.add(m);
    voices.push({ pan, f, g, m });
  });
  app.say('Breathe in as the light grows. Out as it shrinks.');
};
app.run((dt) => {
  const p = PACES[pace];
  const before = t;
  t = (t + dt) % (p.i + p.o);
  if (t < before) breaths++;
  const inh = t < p.i;
  const k = inh ? t / p.i : 1 - (t - p.i) / p.o;
  const e = 0.5 - 0.5 * Math.cos(k * Math.PI);
  orb.scale.setScalar(0.55 + e * 1.1); glow.scale.setScalar(0.55 + e * 1.4);
  setLabel(word, `${inh ? 'Breathe in' : 'Breathe out'}\n${p.n}: ${p.i} in, ${p.o} out   ${breaths} breaths`);
  dust.rotation.y += dt * 0.01;
  // Hand height (or looking up, on a screen) opens the filter.
  const hs = app.hands.filter((h) => h.active);
  let lift = app.inXR && hs.length ? hs.reduce((s, h) => s + (h.pos.y - app.head.y + 0.5), 0) / hs.length : app.headDir.y * 0.8 + 0.3;
  lift = Math.max(0, Math.min(1, lift));
  voices.forEach((vo, i) => {
    const a = app.time * (0.11 + i * 0.03) + i * 1.57;
    v.set(app.head.x + Math.cos(a) * 1.4, app.head.y + Math.sin(a * 0.7) * 0.4, app.head.z + Math.sin(a) * 1.4);
    vo.m.position.copy(v); app.movePanner(vo.pan, v);
    vo.f.frequency.setTargetAtTime(300 + lift * 1800 + e * 500, app.audio.currentTime, 0.2);
    vo.g.gain.setTargetAtTime(0.07 + e * 0.07, app.audio.currentTime, 0.2);
  });
  if (app.hands.some((h) => h.active && h.pinchDown)) { pace = (pace + 1) % PACES.length; t = 0; app.tone(440, 0.4, 'sine', 0.12); }
});
(window as any).__state = () => ({ pace, t: +t.toFixed(2), breaths, scale: +orb.scale.x.toFixed(2), voices: voices.length });
