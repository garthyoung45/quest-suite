// Fireflies: lights drift around your room. Catch as many as you can before time runs out.
import { App, THREE, makeLabel, setLabel, rand, best } from './kit';

const app = new App({
  title: 'Fireflies',
  blurb: 'Fireflies drift around your own room. Each one hums, so you can hear the ones behind you. Catch them with a slow hand: fast hands scare them off. Quick catches in a row build a combo. The golden one is worth five. Beat the target to reach the next night.',
  mode: 'ar',
  handsHelp: 'reach out slowly and pinch a firefly. Either hand.',
  padHelp: 'walk to a firefly and press R2 or L2 when your hand is on it.',
  steps: ['Lights drift around your room. Listen: they hum', 'Reach SLOWLY to one and pull the trigger to catch it', 'Catch quickly in a row for a combo. Gold is worth five'],
});

const COUNT = 14;
interface Fly { m: THREE.Mesh; halo: THREE.Mesh; v: THREE.Vector3; home: THREE.Vector3; ph: number; gold: boolean; pan?: PannerNode; osc?: OscillatorNode; g?: GainNode }
const flies: Fly[] = [];
const geo = new THREE.SphereGeometry(0.022, 10, 8), haloGeo = new THREE.SphereGeometry(0.05, 10, 8);
for (let i = 0; i < COUNT; i++) {
  const gold = i === 0;
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: gold ? 0xffc840 : 0xe9ff8a }));
  const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: gold ? 0xffa000 : 0xc8ff5a, transparent: true, opacity: 0.25, depthWrite: false }));
  m.add(halo); if (gold) m.scale.setScalar(1.3);
  app.scene.add(m);
  flies.push({ m, halo, v: new THREE.Vector3(), home: new THREE.Vector3(), ph: Math.random() * 10, gold });
}
const board = makeLabel('', 0.8, 0.22);
board.position.set(0, 2.0, -1.4);
app.scene.add(board);
const pop = makeLabel('', 0.2, 0.06, { bg: 'rgba(0,0,0,0)' });
app.scene.add(pop);
let score = 0, caught = 0, left = 60, playing = false, night = 1, combo = 0, comboT = 0, popT = 0, endT = 0;
const target = () => 8 + night * 6;
const NOTES = [523, 587, 659, 784, 880, 1047];

function place(f: Fly) {
  const a = Math.random() * Math.PI * 2, r = rand(0.5, 1.4);
  f.home.set(Math.sin(a) * r, rand(0.7, 1.8), Math.cos(a) * r);
  f.m.position.copy(f.home); f.v.set(0, 0, 0);
}
function start() {
  score = 0; caught = 0; left = 60; playing = true; combo = 0;
  for (const f of flies) {
    place(f);
    if (!f.osc) {
      f.pan = app.panner(f.m.position, 0.3, 2);
      f.g = app.audio.createGain(); f.g.gain.value = 0.05;
      f.osc = app.audio.createOscillator(); f.osc.type = 'triangle'; f.osc.frequency.value = f.gold ? 1319 : NOTES[Math.floor(Math.random() * NOTES.length)];
      const trem = app.audio.createOscillator(); trem.frequency.value = rand(4, 9); const tg = app.audio.createGain(); tg.gain.value = 0.04;
      trem.connect(tg).connect(f.g.gain); trem.start();
      f.osc.connect(f.g).connect(f.pan); f.osc.start();
    }
    f.g!.gain.setTargetAtTime(0.05, app.audio.currentTime, 0.2);
  }
  app.say(`Night ${night}. Score ${target()} to reach the next night.`);
}
const d = new THREE.Vector3();
app.onStart = start;
app.run((dt) => {
  const pace = 1 + (night - 1) * 0.3;
  if (playing) {
    left -= dt; comboT -= dt; if (comboT <= 0) combo = 0;
    if (left <= 0) {
      playing = false; endT = 1.5;
      const won = score >= target();
      const b = best('fireflies', score); best('fireflies.night', night);
      app.say(`${won ? 'Night ' + night + ' cleared' : 'Time'}. Score ${score}, best ${b}. Pull the trigger to ${won ? 'start the next night' : 'try again'}.`);
      won ? app.good() : app.bad();
      if (won) night++;
      for (const f of flies) f.g!.gain.setTargetAtTime(0, app.audio.currentTime, 0.2);
    }
  } else { endT -= dt; if (endT <= 0 && app.hands.some((h) => h.active && h.pinchDown)) { start(); return; } }
  setLabel(board, playing ? `Night ${night}    Score ${score} of ${target()}    ${Math.ceil(left)} s${combo > 1 ? '\nCombo x' + Math.min(combo, 4) : '\n '}` : `Score ${score}    Best ${best('fireflies')}\nPull the trigger to play night ${night}`);
  if (popT > 0) { popT -= dt; pop.position.y += dt * 0.25; pop.lookAt(app.head); if (popT <= 0) setLabel(pop, ''); }
  for (const f of flies) {
    f.ph += dt * pace;
    const sp = f.gold ? 1.6 : 1;
    f.v.x += (Math.sin(f.ph * 0.9 + f.home.x * 5) * 0.5 * sp + (f.home.x - f.m.position.x) * 0.8) * dt * pace;
    f.v.y += (Math.sin(f.ph * 1.3) * 0.3 * sp + (f.home.y - f.m.position.y) * 0.8) * dt * pace;
    f.v.z += (Math.cos(f.ph * 0.7 + f.home.z * 5) * 0.5 * sp + (f.home.z - f.m.position.z) * 0.8) * dt * pace;
    app.hands.forEach((h, hi) => {
      if (!h.active) return;
      d.copy(f.m.position).sub(h.pos);
      const dist = d.length(), speed = h.vel.length();
      if (dist < 0.45 && speed > 0.9) f.v.addScaledVector(d.normalize(), (0.45 - dist) * speed * 6 * pace * dt);
      if (playing && ((h.pinchDown && dist < 0.13) || (h.pinch && dist < 0.06))) {
        combo = comboT > 0 ? combo + 1 : 1; comboT = 3;
        const pts = (f.gold ? 5 : 1) * Math.min(combo, 4);
        score += pts; caught++;
        const hz = f.osc!.frequency.value;
        app.tone(hz * 2, 0.35, 'sine', 0.3); app.tone(hz * 3, 0.5, 'sine', 0.15, undefined, 0.06);
        if (combo > 1) app.tone(hz * 4, 0.3, 'sine', 0.1, undefined, 0.12);
        app.burst(f.m.position, f.gold ? 0xffc840 : 0xd8ff6a, f.gold ? 40 : 18, 0.9);
        app.buzz(hi, f.gold ? 1 : 0.6, f.gold ? 120 : 50);
        pop.position.copy(f.m.position); setLabel(pop, '+' + pts); popT = 0.8;
        place(f);
      }
    });
    f.v.multiplyScalar(1 - 1.2 * dt);
    f.m.position.addScaledVector(f.v, dt);
    f.m.position.y = Math.max(0.3, f.m.position.y);
    f.halo.scale.setScalar(0.8 + 0.5 * Math.sin(f.ph * 6));
    if (f.pan) app.movePanner(f.pan, f.m.position);
  }
});
(window as any).__state = () => ({ caught, score, night, combo, left: +left.toFixed(1), playing, flies: flies.map((f) => f.m.position.toArray()) });
