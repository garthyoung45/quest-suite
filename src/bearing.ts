// Bad Bearing: six motors hum around you. One is failing. Find it by ear.
import { App, THREE, makeLabel, setLabel, rand, best } from './kit';

const app = new App({
  title: 'Bad Bearing',
  blurb: 'Six motors are running around you. One has a fault you can only hear. Lean in, listen, and tag the bad one. Five rounds, each harder. Wear headphones on a screen.',
  mode: 'vr',
  handsHelp: 'walk to a motor, put your ear near it, then pinch its top to tag it.',
  padHelp: 'walk up to a motor and press R2 with your hand on it.',
  steps: ['Walk up to each motor and listen close', 'One sounds wrong: ticking, rattle, wobble or squeal', 'Reach over the bad motor and pull the trigger'],
  sky: 0x0a0d14,
});

const FAULTS = [
  { name: 'Outer race defect', tip: 'a steady fast ticking under the hum' },
  { name: 'Looseness', tip: 'an uneven rattle' },
  { name: 'Imbalance', tip: 'a slow wobble in the hum, once per turn' },
  { name: 'Dry bearing', tip: 'a thin high squeal' },
];
const N = 6;
const R = 1.25;
interface Motor { g: THREE.Group; top: THREE.Vector3; body: THREE.Mesh; lamp: THREE.Mesh; gain?: GainNode; fault?: GainNode; nodes: AudioNode[]; hz: number }
const motors: Motor[] = [];
const bodyMat = () => new THREE.MeshStandardMaterial({ color: 0x4b6a8f, roughness: 0.5, metalness: 0.6 });

for (let i = 0; i < N; i++) {
  const a = (i / N) * Math.PI * 2 + Math.PI / 6;
  const g = new THREE.Group();
  g.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R);
  g.rotation.y = -a;
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.32), new THREE.MeshStandardMaterial({ color: 0x23272f, roughness: 0.9 }));
  base.position.y = 0.45;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 24), bodyMat());
  body.rotation.z = Math.PI / 2; body.position.y = 1.05;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.3 }));
  shaft.rotation.z = Math.PI / 2; shaft.position.set(0.24, 1.05, 0);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshBasicMaterial({ color: 0x334455 }));
  lamp.position.set(0, 1.23, 0);
  const tag = makeLabel('M' + (i + 1), 0.16, 0.08);
  tag.position.set(0, 0.8, 0.165);
  g.add(base, body, shaft, lamp, tag);
  app.scene.add(g);
  motors.push({ g, top: new THREE.Vector3(g.position.x, 1.1, g.position.z), body, lamp, nodes: [], hz: 0 });
}
const board = makeLabel('', 1.3, 0.42);
board.position.set(0, 2.25, -R - 0.5);
app.scene.add(board);

let round = 0, score = 0, bad = 0, faultType = 0, locked = 0, done = false;
let noise: AudioBuffer;

function stopAll() {
  for (const m of motors) { for (const n of m.nodes) { try { (n as any).stop?.(); } catch {} n.disconnect(); } m.nodes = []; }
}
function startRound() {
  stopAll();
  bad = Math.floor(Math.random() * N);
  faultType = Math.floor(Math.random() * FAULTS.length);
  const level = [0.5, 0.32, 0.2, 0.12, 0.075][round];
  const ctx = app.audio;
  motors.forEach((m, i) => {
    (m.body.material as THREE.MeshStandardMaterial).color.set(0x4b6a8f);
    (m.lamp.material as THREE.MeshBasicMaterial).color.set(0x334455);
    const p = app.panner(m.top, 0.25, 2.2);
    const g = ctx.createGain(); g.gain.value = 0.5; g.connect(p);
    m.hz = rand(46, 62);
    const mk = (f: number, type: OscillatorType, v: number) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const og = ctx.createGain(); og.gain.value = v; o.connect(og).connect(g); o.start(); m.nodes.push(o, og); return og; };
    const hum = mk(m.hz, 'sawtooth', 0.16); mk(m.hz * 2.01, 'sine', 0.2); mk(m.hz * 4.03, 'sine', 0.06);
    const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rand(700, 1100); bp.Q.value = 0.7;
    const ng = ctx.createGain(); ng.gain.value = 0.1; n.connect(bp).connect(ng).connect(g); n.start();
    m.nodes.push(p, g, n, bp, ng);
    if (i !== bad) return;
    const fg = ctx.createGain(); fg.gain.value = level; fg.connect(g); m.nodes.push(fg);
    if (faultType === 0 || faultType === 1) {
      // Impacts: short noise bursts gated by a pulse.
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 3200; hp.Q.value = 2;
      const gate = ctx.createGain(); gate.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = faultType === 0 ? 11.3 : 3.1;
      const shaper = ctx.createWaveShaper(); const c = new Float32Array(256); for (let k = 0; k < 256; k++) c[k] = k > 236 ? 1 : 0; shaper.curve = c;
      const saw = ctx.createOscillator(); saw.type = 'sawtooth'; saw.frequency.value = lfo.frequency.value;
      saw.connect(shaper).connect(gate.gain);
      if (faultType === 1) { const j = ctx.createOscillator(); j.frequency.value = 0.7; const jg = ctx.createGain(); jg.gain.value = 1.4; j.connect(jg).connect(saw.frequency); j.start(); m.nodes.push(j, jg); }
      src.connect(hp).connect(gate).connect(fg); src.start(); saw.start();
      m.nodes.push(src, hp, gate, shaper, saw, lfo);
    } else if (faultType === 2) {
      const l = ctx.createOscillator(); l.frequency.value = m.hz / 24; const lg = ctx.createGain(); lg.gain.value = level * 0.5;
      l.connect(lg).connect(hum.gain); l.start(); m.nodes.push(l, lg);
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 5200; const v = ctx.createOscillator(); v.frequency.value = 6; const vg = ctx.createGain(); vg.gain.value = 180;
      v.connect(vg).connect(o.frequency); const og = ctx.createGain(); og.gain.value = 0.25; o.connect(og).connect(fg); o.start(); v.start(); m.nodes.push(o, v, vg, og);
    }
  });
  setLabel(board, `Round ${round + 1} of 5     Score ${score}\nOne motor is failing. Listen close, then tag it.`);
  app.say('Put your ear near each motor. Pinch the top of the bad one.');
}

function tag(i: number, hand = 1) {
  const right = i === bad;
  app.burst(motors[i].top, right ? 0x35c46a : 0xff5d4d, 22, 0.8);
  app.buzz(hand, right ? 0.5 : 1, right ? 60 : 180);
  if (right) { score++; app.good(); } else app.bad();
  (motors[bad].body.material as THREE.MeshStandardMaterial).color.set(0xd9534f);
  (motors[bad].lamp.material as THREE.MeshBasicMaterial).color.set(0xff3b30);
  if (!right) (motors[i].body.material as THREE.MeshStandardMaterial).color.set(0x777777);
  const f = FAULTS[faultType];
  setLabel(board, `${right ? 'Correct' : 'Missed'}: M${bad + 1} had ${f.name}\nIt sounds like ${f.tip}.`);
  app.say(right ? 'Correct.' : `It was M${bad + 1}.`);
  locked = 3.2;
  round++;
}

app.onStart = () => { noise = app.noiseBuffer(2); round = 0; score = 0; done = false; startRound(); };
app.run((dt) => {
  if (locked > 0) {
    locked -= dt;
    if (locked <= 0) {
      if (round >= 5) {
        stopAll(); done = true;
        setLabel(board, `Finished: ${score} of 5 found by ear     Best ${best('bearing', score)}\n${['Keep listening', 'Apprentice ear', 'Apprentice ear', 'Technician ear', 'Senior tech ear', 'Master ear'][score]}. Trigger on any motor to play again.`);
        app.say(`You found ${score} of 5. Pinch any motor to play again.`);
      } else startRound();
    }
    return;
  }
  // Motors shake a little; the bad one shakes more as you get close.
  motors.forEach((m, i) => { m.body.position.y = 1.05 + Math.sin(app.time * m.hz) * (i === bad ? 0.0025 : 0.0008); });
  for (const [hi, h] of app.hands.entries()) {
    if (!h.active || !h.pinchDown) continue;
    let best = -1, bd = 0.3;
    motors.forEach((m, i) => { const d = Math.hypot(h.pos.x - m.top.x, h.pos.z - m.top.z); if (d < bd && h.pos.y > 0.7 && h.pos.y < 1.6) { bd = d; best = i; } });
    if (best < 0) continue;
    if (done) { round = 0; score = 0; done = false; startRound(); } else tag(best, hi);
    break;
  }
});
(window as any).__state = () => ({ round, score, bad, faultType, done, locked, tops: motors.map((m) => m.top.toArray()) });
