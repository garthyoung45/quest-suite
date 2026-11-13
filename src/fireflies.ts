// Fireflies: lights drift around your room. Catch as many as you can in a minute.
import { App, THREE, makeLabel, setLabel, rand } from './kit';

const app = new App({
  title: 'Fireflies',
  blurb: 'Fourteen fireflies drift around your own room. Each one hums, so you can hear the ones behind you. Close a pinch on one to catch it. They dart away from fast hands, so move slowly. One minute on the clock.',
  mode: 'ar',
  handsHelp: 'reach out slowly and pinch a firefly. Either hand.',
  padHelp: 'walk to a firefly and press R2 or L2 when your hand is on it.',
  steps: ['Lights drift around your room', 'Reach slowly to one and pull the trigger to catch it', 'You have one minute'],
});

const COUNT = 14;
interface Fly { m: THREE.Mesh; v: THREE.Vector3; home: THREE.Vector3; ph: number; pan?: PannerNode; osc?: OscillatorNode; g?: GainNode }
const flies: Fly[] = [];
const geo = new THREE.SphereGeometry(0.022, 10, 8);
const halo = new THREE.SphereGeometry(0.05, 10, 8);
for (let i = 0; i < COUNT; i++) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe9ff8a }));
  m.add(new THREE.Mesh(halo, new THREE.MeshBasicMaterial({ color: 0xc8ff5a, transparent: true, opacity: 0.25, depthWrite: false })));
  app.scene.add(m);
  flies.push({ m, v: new THREE.Vector3(), home: new THREE.Vector3(), ph: Math.random() * 10 });
}
const board = makeLabel('', 0.6, 0.16);
board.position.set(0, 2.0, -1.4);
app.scene.add(board);
let caught = 0, left = 60, playing = false;
let best = 0;
try { best = +(localStorage.getItem('fireflies.best') || 0); } catch {}

function place(f: Fly) {
  const a = Math.random() * Math.PI * 2, r = rand(0.5, 1.4);
  f.home.set(Math.sin(a) * r, rand(0.7, 1.8), Math.cos(a) * r);
  f.m.position.copy(f.home); f.v.set(0, 0, 0);
}
function start() {
  caught = 0; left = 60; playing = true;
  for (const f of flies) {
    place(f);
    if (!f.osc) {
      f.pan = app.panner(f.m.position, 0.3, 2);
      f.g = app.audio.createGain(); f.g.gain.value = 0.05;
      f.osc = app.audio.createOscillator(); f.osc.type = 'triangle'; f.osc.frequency.value = pick([523, 587, 659, 784, 880, 1047]);
      const trem = app.audio.createOscillator(); trem.frequency.value = rand(4, 9); const tg = app.audio.createGain(); tg.gain.value = 0.04;
      trem.connect(tg).connect(f.g.gain); trem.start();
      f.osc.connect(f.g).connect(f.pan); f.osc.start();
    }
  }
  app.say('Catch the fireflies. Move slowly.');
}
const pick = (a: number[]) => a[Math.floor(Math.random() * a.length)];
const d = new THREE.Vector3();
app.onStart = start;
app.run((dt) => {
  if (playing) {
    left -= dt;
    if (left <= 0) {
      playing = false;
      if (caught > best) { best = caught; try { localStorage.setItem('fireflies.best', String(best)); } catch {} }
      app.say(`Time. You caught ${caught}. Best ${best}. Pinch anywhere to play again.`);
      for (const f of flies) f.g!.gain.setTargetAtTime(0, app.audio.currentTime, 0.2);
    }
  } else if (app.hands.some((h) => h.active && h.pinchDown)) { for (const f of flies) f.g!.gain.setTargetAtTime(0.05, app.audio.currentTime, 0.2); start(); return; }
  setLabel(board, playing ? `Caught ${caught}     ${Math.ceil(left)} s` : `Caught ${caught}     Best ${best}`);
  for (const f of flies) {
    f.ph += dt;
    // Wander around home, flee fast hands.
    f.v.x += (Math.sin(f.ph * 0.9 + f.home.x * 5) * 0.5 + (f.home.x - f.m.position.x) * 0.8) * dt;
    f.v.y += (Math.sin(f.ph * 1.3) * 0.3 + (f.home.y - f.m.position.y) * 0.8) * dt;
    f.v.z += (Math.cos(f.ph * 0.7 + f.home.z * 5) * 0.5 + (f.home.z - f.m.position.z) * 0.8) * dt;
    for (const h of app.hands) {
      if (!h.active) continue;
      d.copy(f.m.position).sub(h.pos);
      const dist = d.length();
      const speed = h.vel.length();
      if (dist < 0.45 && speed > 0.9) f.v.addScaledVector(d.normalize(), (0.45 - dist) * speed * 6 * dt);
      if (playing && h.pinchDown && dist < 0.085) {
        caught++; app.tone(f.osc!.frequency.value * 2, 0.35, 'sine', 0.3); app.tone(f.osc!.frequency.value * 3, 0.5, 'sine', 0.15, undefined, 0.06);
        place(f);
      }
    }
    f.v.multiplyScalar(1 - 1.2 * dt);
    f.m.position.addScaledVector(f.v, dt);
    f.m.position.y = Math.max(0.3, f.m.position.y);
    f.m.scale.setScalar(0.8 + 0.3 * Math.sin(f.ph * 6));
    if (f.pan) app.movePanner(f.pan, f.m.position);
  }
});
(window as any).__state = () => ({ caught, left: +left.toFixed(1), playing, flies: flies.map((f) => f.m.position.toArray()) });
