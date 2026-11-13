// Clay Wheel: a spinning pot. Press in with open hands, pinch to pull out.
import { App, THREE, makeLabel, clamp } from './kit';

const app = new App({
  title: 'Clay Wheel',
  blurb: 'A lump of clay spins on a wheel in front of you. Push a fingertip into it to press the wall in. Pinch near it to pull the wall out. Your pot is kept in this browser between visits.',
  mode: 'vr',
  handsHelp: 'open hand presses in, pinch pulls out. Pinch the red puck to start a fresh lump, the blue puck to change the glaze.',
  padHelp: 'aim your hand at the pot. Hold nothing to press, hold R2 to pull. Square resets, Triangle changes glaze.',
  steps: ['Push your controller into the spinning clay to press it in', 'Hold the trigger near the clay to pull it outward', 'Red ball: new lump. Blue ball: new colour'],
  sky: 0x15110e,
});

const RINGS = 28, SEG = 40, HEIGHT = 0.34, BASE_Y = 0.92;
const center = new THREE.Vector3(0, BASE_Y, -0.48);
const GLAZES = [0xb5651d, 0x3d7a8c, 0xe8e0d0, 0x4c6b3c, 0x2b2b33];
let glaze = 0;
let radii = new Float32Array(RINGS + 1);
const fresh = () => { for (let i = 0; i <= RINGS; i++) radii[i] = 0.085 - 0.02 * (i / RINGS); };
fresh();
try { const s = JSON.parse(localStorage.getItem('clay.v1') || 'null'); if (s && s.r.length === RINGS + 1) { radii = Float32Array.from(s.r); glaze = s.g | 0; } } catch {}

const geo = new THREE.BufferGeometry();
const pos = new Float32Array((RINGS + 1) * (SEG + 1) * 3);
const idx: number[] = [];
for (let i = 0; i < RINGS; i++) for (let s = 0; s < SEG; s++) { const a = i * (SEG + 1) + s, b = a + SEG + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
geo.setIndex(idx);
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const mat = new THREE.MeshStandardMaterial({ color: GLAZES[glaze], roughness: 0.55, side: THREE.DoubleSide });
const pot = new THREE.Mesh(geo, mat);
pot.position.copy(center);
pot.frustumCulled = false;
app.scene.add(pot);
function rebuild() {
  for (let i = 0; i <= RINGS; i++) for (let s = 0; s <= SEG; s++) {
    const a = (s / SEG) * Math.PI * 2, k = (i * (SEG + 1) + s) * 3;
    pos[k] = Math.cos(a) * radii[i]; pos[k + 1] = (i / RINGS) * HEIGHT; pos[k + 2] = Math.sin(a) * radii[i];
  }
  (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  geo.computeVertexNormals();
}
rebuild();
const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32), new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.8 }));
wheel.position.set(center.x, BASE_Y - 0.016, center.z);
const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, BASE_Y - 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x25252a }));
stand.position.set(center.x, (BASE_Y - 0.03) / 2, center.z);
app.scene.add(wheel, stand);
const mkPuck = (c: number, x: number, t: string) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), new THREE.MeshBasicMaterial({ color: c })); m.position.set(center.x + x, BASE_Y + 0.05, center.z + 0.16); app.scene.add(m); const l = makeLabel(t, 0.12, 0.04); l.position.set(m.position.x, m.position.y - 0.05, m.position.z + 0.02); app.scene.add(l); return m; };
const resetPuck = mkPuck(0xd9534f, -0.3, 'New lump');
const glazePuck = mkPuck(0x4f9cff, 0.3, 'Glaze');
const lamp = new THREE.PointLight(0xffe2b8, 1.2, 3); lamp.position.set(0.4, 1.7, 0); app.scene.add(lamp);

let hum: GainNode | null = null, dirty = false, saveT = 0, touching = 0;
const save = () => { try { localStorage.setItem('clay.v1', JSON.stringify({ r: Array.from(radii), g: glaze })); } catch {} };
function doReset() { fresh(); rebuild(); save(); app.tone(300, 0.15, 'triangle', 0.2); }
function doGlaze() { glaze = (glaze + 1) % GLAZES.length; mat.color.set(GLAZES[glaze]); save(); app.tone(800, 0.1, 'triangle', 0.2); }
app.onStart = () => {
  const src = app.audio.createBufferSource(); src.buffer = app.noiseBuffer(2); src.loop = true;
  const f = app.audio.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 1.5;
  hum = app.audio.createGain(); hum.gain.value = 0;
  src.connect(f).connect(hum).connect(app.panner(center, 0.4, 1)); src.start();
  app.say('Open hand presses the clay in. Pinch pulls it out.');
};
app.run((dt) => {
  pot.rotation.y += dt * 5; wheel.rotation.y += dt * 5;
  touching = 0;
  if (app.hit('square')) doReset();
  if (app.hit('triangle')) doGlaze();
  for (const h of app.hands) {
    if (!h.active) continue;
    if (h.pinchDown && h.pos.distanceTo(resetPuck.position) < 0.07) { doReset(); continue; }
    if (h.pinchDown && h.pos.distanceTo(glazePuck.position) < 0.07) { doGlaze(); continue; }
    const p = h.pinch ? h.pos : h.tip;
    const y = (p.y - center.y) / HEIGHT * RINGS;
    if (y < -1 || y > RINGS + 1) continue;
    const dist = Math.hypot(p.x - center.x, p.z - center.z);
    for (let i = 0; i <= RINGS; i++) {
      const w = Math.exp(-((i - y) * (i - y)) / 6);
      if (w < 0.05) continue;
      if (w > 0.9 && Math.abs(dist - radii[i]) < 0.03) app.buzz(app.hands.indexOf(h), 0.15, 20);
      if (h.pinch && dist < radii[i] + 0.09 && dist > radii[i] - 0.02) { radii[i] += (dist - radii[i]) * w * dt * 5; touching = 1; dirty = true; }
      else if (!h.pinch && dist < radii[i]) { radii[i] += (dist - radii[i]) * w * dt * 9; touching = 1; dirty = true; }
      radii[i] = clamp(radii[i], 0.012, 0.19);
    }
  }
  if (dirty) {
    for (let i = 1; i < RINGS; i++) radii[i] += ((radii[i - 1] + radii[i + 1]) / 2 - radii[i]) * 0.02;
    rebuild(); dirty = false; saveT = 1;
  }
  if (saveT > 0) { saveT -= dt; if (saveT <= 0) save(); }
  hum?.gain.setTargetAtTime(touching ? 0.5 : 0.04, app.audio.currentTime, 0.08);
});
(window as any).__state = () => ({ glaze, min: +Math.min(...radii).toFixed(3), max: +Math.max(...radii).toFixed(3), mid: +radii[14].toFixed(3), center: center.toArray() });
