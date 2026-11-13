// Moonwalk: a landing zone on a table you can walk around. Pick a safe site.
import { App, THREE, makeLabel, setLabel, clamp, best } from './kit';

const app = new App({
  title: 'Moonwalk',
  blurb: 'Three missions. Each puts a blue science beacon on the ground: land safely as close to it as you can. You get three landers per mission. A 400 metre patch of lunar ground sits in front of you as a table-top model. Walk around it, pinch a spot to drop a lander, and read whether the site is safe: slope, roughness and sunlight. The terrain is generated, not real mission data.',
  mode: 'vr',
  handsHelp: 'right-hand pinch on the surface drops the lander. Left-hand pinch changes the map colours.',
  padHelp: 'R2 drops the lander where your hand is. L2 or Triangle changes the map colours.',
  steps: ['A blue beacon marks the science target on the table', 'Right trigger on the surface drops a lander. Land SAFE and CLOSE to the beacon', 'Left trigger changes the map: red is unsafe, green is safe'],
  sky: 0x000004,
});

const N = 96;            // grid cells per side
const SIZE = 1.4;        // model width in metres
const REAL = 400;        // metres of Moon the model stands for
const TABLE_Y = 0.85;
const CELL = REAL / N;
const origin = new THREE.Vector3(0, TABLE_Y, -0.95);

// Seeded terrain: rolling ground plus craters.
let seed = 20261114;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const H = new Float32Array((N + 1) * (N + 1));
const at = (i: number, j: number) => H[clamp(j, 0, N) * (N + 1) + clamp(i, 0, N)];
for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
  const x = i * CELL, y = j * CELL;
  H[j * (N + 1) + i] = 6 * Math.sin(x / 90 + 1) * Math.cos(y / 120) + 2.5 * Math.sin(x / 31 + y / 47) + 0.8 * Math.sin(x / 9.5) * Math.sin(y / 11.3);
}
for (let c = 0; c < 34; c++) {
  const cx = rnd() * REAL, cy = rnd() * REAL, r = 6 + Math.pow(rnd(), 2.2) * 55, depth = r * 0.22;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const d = Math.hypot(i * CELL - cx, j * CELL - cy) / r;
    if (d > 1.6) continue;
    H[j * (N + 1) + i] += d < 1 ? -depth * (1 - d * d) + depth * 0.18 * d * d : depth * 0.18 * Math.exp(-(d - 1) * 5);
  }
}
for (let k = 0; k < H.length; k++) H[k] += (rnd() - 0.5) * 0.5;

const SUN = new THREE.Vector3(-0.85, 0.2, 0.35).normalize(); // low sun, as near the lunar south pole
const slope = new Float32Array(H.length), rough = new Float32Array(H.length), lit = new Float32Array(H.length);
for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
  const k = j * (N + 1) + i;
  const dx = (at(i + 1, j) - at(i - 1, j)) / (2 * CELL), dy = (at(i, j + 1) - at(i, j - 1)) / (2 * CELL);
  slope[k] = Math.atan(Math.hypot(dx, dy)) * 180 / Math.PI;
  let mean = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) mean += at(i + a, j + b);
  rough[k] = Math.abs(H[k] - mean / 9);
  // Sunlight: march toward the sun and see if ground blocks it.
  let shadow = false;
  for (let s = 1; s < 60 && !shadow; s++) {
    const px = i + (SUN.x * s * 1.5), py = j + (SUN.z * s * 1.5);
    if (px < 0 || py < 0 || px > N || py > N) break;
    if (at(Math.round(px), Math.round(py)) > H[k] + SUN.y / Math.hypot(SUN.x, SUN.z) * s * 1.5 * CELL + 0.3) shadow = true;
  }
  lit[k] = shadow ? 0 : 1;
}

const geo = new THREE.PlaneGeometry(SIZE, SIZE, N, N);
geo.rotateX(-Math.PI / 2);
const posAttr = geo.attributes.position as THREE.BufferAttribute;
const colors = new Float32Array(H.length * 3);
const K = SIZE / REAL;
for (let k = 0; k < H.length; k++) posAttr.setY(k, H[k] * K * 1.5);
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geo.computeVertexNormals();
const terrain = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
terrain.position.copy(origin);
app.scene.add(terrain);
const table = new THREE.Mesh(new THREE.BoxGeometry(SIZE + 0.06, 0.05, SIZE + 0.06), new THREE.MeshLambertMaterial({ color: 0x1b1e27 }));
table.position.set(origin.x, TABLE_Y - 0.14, origin.z);
app.scene.add(table);
const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(Float32Array.from({ length: 900 }, () => (Math.random() - 0.5) * 120), 3)), new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 }));
app.scene.add(stars);
app.room.visible = false;
const sunLight = new THREE.DirectionalLight(0xfff2dd, 2.2);
sunLight.position.copy(SUN).multiplyScalar(5).add(origin);
sunLight.target = terrain;
app.scene.add(sunLight);

const VIEWS = ['Sunlit view', 'Slope map', 'Hazard map'];
let view = 0;
const safe = (k: number) => slope[k] <= 8 && rough[k] <= 0.35 && lit[k] > 0;
function paint() {
  const c = new THREE.Color();
  for (let k = 0; k < H.length; k++) {
    if (view === 0) c.setScalar(0.62);
    else if (view === 1) c.setHSL(clamp(0.33 - slope[k] / 60, 0, 0.33), 0.9, 0.5);
    else c.set(safe(k) ? 0x35c46a : !lit[k] ? 0x2b3a8c : 0xd9534f);
    colors[k * 3] = c.r; colors[k * 3 + 1] = c.g; colors[k * 3 + 2] = c.b;
  }
  (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  sunLight.intensity = view === 0 ? 2.2 : 0.5;
}
paint();

const lander = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.02, 8), new THREE.MeshLambertMaterial({ color: 0xe8c96a }));
body.position.y = 0.022;
lander.add(body);
for (let a = 0; a < 4; a++) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.028, 4), new THREE.MeshLambertMaterial({ color: 0xcccccc })); leg.position.set(Math.cos(a * Math.PI / 2) * 0.016, 0.01, Math.sin(a * Math.PI / 2) * 0.016); leg.rotation.set(Math.sin(a * Math.PI / 2) * 0.5, 0, -Math.cos(a * Math.PI / 2) * 0.5); lander.add(leg); }
const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.034, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.004;
lander.add(ring);
lander.visible = false;
app.scene.add(lander);
const board = makeLabel('', 0.9, 0.36);
board.position.set(origin.x, TABLE_Y + 0.75, origin.z - SIZE / 2 - 0.1);
app.scene.add(board);
const cursor = new THREE.Mesh(new THREE.RingGeometry(0.012, 0.016, 24), new THREE.MeshBasicMaterial({ color: 0x7fd6ff, side: THREE.DoubleSide }));
cursor.rotation.x = -Math.PI / 2;
app.scene.add(cursor);

let last: any = null;
// Missions: a beacon on awkward ground with safe ground somewhere nearby.
const beacon = new THREE.Group();
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 6), new THREE.MeshBasicMaterial({ color: 0x4fd0ff }));
pole.position.y = 0.07;
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshBasicMaterial({ color: 0x9fe8ff }));
orb.position.y = 0.145;
beacon.add(pole, orb);
app.scene.add(beacon);
let mission = 0, tries = 3, total = 0, beaconK = 0, waitT = 0, over = false;
const cellPos = (k: number, out: THREE.Vector3) => { const i = k % (N + 1), j = Math.floor(k / (N + 1)); return out.set(origin.x + (i / N - 0.5) * SIZE, origin.y + H[k] * K * 1.5, origin.z + (j / N - 0.5) * SIZE); };
const metres = (a: number, b: number) => Math.hypot((a % (N + 1)) - (b % (N + 1)), Math.floor(a / (N + 1)) - Math.floor(b / (N + 1))) * CELL;
function newMission() {
  for (let n = 0; n < 400; n++) {
    const i = 10 + Math.floor(Math.random() * (N - 20)), j = 10 + Math.floor(Math.random() * (N - 20)), k = j * (N + 1) + i;
    if (safe(k)) continue;
    let near = false;
    for (let b = -8; b <= 8 && !near; b += 2) for (let a = -8; a <= 8; a += 2) if (safe((j + b) * (N + 1) + i + a)) { near = true; break; }
    if (near) { beaconK = k; break; }
  }
  cellPos(beaconK, beacon.position);
  tries = 3; lander.visible = false;
  setLabel(board, `Mission ${mission + 1} of 3     Total ${total}\nLand safe and close to the blue beacon\n3 landers left     ${VIEWS[view]}`);
}
function restart() { mission = 0; total = 0; over = false; newMission(); }
function cellAt(p: THREE.Vector3) {
  const i = Math.round(((p.x - origin.x) / SIZE + 0.5) * N), j = Math.round(((p.z - origin.z) / SIZE + 0.5) * N);
  if (i < 0 || j < 0 || i > N || j > N) return -1;
  return j * (N + 1) + i;
}
function land(k: number) {
  const i = k % (N + 1), j = Math.floor(k / (N + 1));
  // Judge the whole footprint (about 12 m across), not one point.
  let ms = 0, mr = 0, sun = 1;
  for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const q = clamp(j + b, 0, N) * (N + 1) + clamp(i + a, 0, N); ms = Math.max(ms, slope[q]); mr = Math.max(mr, rough[q]); sun = Math.min(sun, lit[q]); }
  const go = ms <= 8 && mr <= 0.35 && sun > 0;
  lander.position.set(origin.x + (i / N - 0.5) * SIZE, origin.y + H[k] * K * 1.5, origin.z + (j / N - 0.5) * SIZE);
  lander.visible = true;
  (ring.material as THREE.MeshBasicMaterial).color.set(go ? 0x35c46a : 0xff4d4d);
  const why = [ms > 8 ? 'too steep' : '', mr > 0.35 ? 'too rough' : '', !sun ? 'in shadow' : ''].filter(Boolean).join(', ');
  go ? app.good() : app.bad();
  app.burst(lander.position, go ? 0x35c46a : 0xff7a4d, go ? 24 : 12, 0.5);
  app.buzz(1, go ? 0.5 : 1, go ? 60 : 160);
  const dist = metres(k, beaconK);
  tries--;
  let pts = 0;
  if (go) pts = Math.max(5, Math.round(100 - dist * 1.2));
  const doneMission = go || tries === 0;
  if (doneMission) { total += pts; mission++; waitT = 3; }
  setLabel(board, `${go ? 'GO: landed ' + dist.toFixed(0) + ' m from the beacon   +' + pts : 'NO-GO: ' + why + (tries ? '   ' + tries + ' landers left' : '   mission lost')}\nSlope ${ms.toFixed(1)} deg (limit 8)   Roughness ${(mr * 100).toFixed(0)} cm (limit 35)\n${sun ? 'In sunlight' : 'In shadow'}   Total ${total}`);
  last = { k, go, slope: ms, rough: mr, sun, dist, pts };
}
function nextView() { view = (view + 1) % 3; paint(); app.tone(700, 0.08, 'triangle', 0.15); app.say(`${VIEWS[view]}. Pinch the surface to drop the lander.`); }

app.onStart = () => { restart(); app.say('Right pinch on the surface drops the lander. Left pinch changes the map.'); };
app.run((dt) => {
  orb.scale.setScalar(1 + 0.3 * Math.sin(app.time * 5));
  if (waitT > 0) { waitT -= dt; if (waitT <= 0) { if (mission >= 3) { over = true; const b = best('moonwalk', total); setLabel(board, `All three missions flown\nTotal ${total} of 300     Best ${b}\nRight trigger on the surface to fly again`); app.say(`Total ${total} of 300. Best ${b}.`); } else newMission(); } return; }
  const r = app.hands[1], l = app.hands[0];
  const k = r.active ? cellAt(r.pos) : -1;
  const near = k >= 0 && Math.abs(r.pos.y - (origin.y + H[k] * K * 1.5)) < 0.3;
  cursor.visible = near;
  if (near) cursor.position.set(r.pos.x, origin.y + H[k] * K * 1.5 + 0.006, r.pos.z);
  if (r.pinchDown && near) { if (over) restart(); else land(k); }
  if ((l.active && l.pinchDown) || app.hit('triangle')) nextView();
});
(window as any).__state = () => ({ view, last, mission, tries, total, over, beacon: beacon.position.toArray(), beaconK, safeCells: Array.from({ length: H.length }, (_, k) => k).filter((k) => safe(k) && metres(k, beaconK) < 60).slice(0, 5).map((k) => cellPos(k, new THREE.Vector3()).toArray()), origin: origin.toArray(), safeShare: +(Array.from(H).filter((_, k) => safe(k)).length / H.length).toFixed(2) });
