// Room Ruler: pinch two points in your real room to measure between them.
import { App, THREE, makeLabel, setLabel } from './kit';

const app = new App({
  title: 'Room Ruler',
  blurb: 'Measure your real room. Pinch once to start a line, pinch again to end it. Pinch with both hands at once for a live reading between them. On a Quest 3 with room setup done, walls, floor and tables are outlined with their sizes. Good to about a centimetre or two, so treat it as a quick check, not a tape measure.',
  mode: 'ar',
  fit: false,
  handsHelp: 'right pinch sets a point. Hold both pinches for a live hand-to-hand reading. Left pinch removes the last line.',
  padHelp: 'R2 sets a point where your hand is, L2 removes the last line.',
  steps: ['Right trigger at one spot starts a line', 'Right trigger at another spot ends it and shows the distance', 'Left trigger removes the last line'],
});

const fmt = (m: number) => { const inches = m / 0.0254; const ft = Math.floor(inches / 12); return `${m < 1 ? (m * 100).toFixed(1) + ' cm' : m.toFixed(3) + ' m'}   ${ft ? ft + ' ft ' : ''}${(inches - ft * 12).toFixed(1)} in`; };
interface Line { a: THREE.Vector3; b: THREE.Vector3; g: THREE.Group; label: THREE.Mesh; line: THREE.Line; dotB: THREE.Mesh }
const lines: Line[] = [];
let open: Line | null = null;
const dotGeo = new THREE.SphereGeometry(0.008, 10, 8);
const mat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
const lmat = new THREE.LineBasicMaterial({ color: 0xffd166 });

function make(a: THREE.Vector3): Line {
  const g = new THREE.Group();
  const dotA = new THREE.Mesh(dotGeo, mat); dotA.position.copy(a);
  const dotB = new THREE.Mesh(dotGeo, mat);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, a]), lmat);
  line.frustumCulled = false;
  const label = makeLabel('', 0.24, 0.05);
  g.add(dotA, dotB, line, label);
  app.scene.add(g);
  return { a: a.clone(), b: a.clone(), g, label, line, dotB };
}
function setEnd(l: Line, b: THREE.Vector3) {
  l.b.copy(b); l.dotB.position.copy(b);
  (l.line.geometry as THREE.BufferGeometry).setFromPoints([l.a, l.b]);
  l.label.position.copy(l.a).add(l.b).multiplyScalar(0.5); l.label.position.y += 0.04;
  setLabel(l.label, fmt(l.a.distanceTo(l.b)));
}
const live = make(new THREE.Vector3());
live.g.visible = false;

// Quest 3: outline the surfaces the headset already knows and print their sizes.
const surf = new THREE.Group();
app.scene.add(surf);
let surfKey = '', surfT = 0;
const smat = new THREE.LineBasicMaterial({ color: 0x7fd6ff });
function drawSurfaces() {
  const key = app.planes.map((p) => p.polygon.length + ':' + p.matrix.elements[12].toFixed(2) + p.matrix.elements[13].toFixed(2) + p.matrix.elements[14].toFixed(2)).join('|');
  if (key === surfKey) return;
  surfKey = key;
  for (const c of [...surf.children]) { surf.remove(c); (c as any).geometry?.dispose(); (c as any).material?.map?.dispose(); }
  for (const p of app.planes.slice(0, 16)) {
    if (p.polygon.length < 3) continue;
    const pts = p.polygon.map((q) => new THREE.Vector3(q.x, q.y, q.z));
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const q of pts) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); }
    const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), smat);
    loop.applyMatrix4(p.matrix);
    const tag = makeLabel(`${p.kind}  ${(x1 - x0).toFixed(2)} m x ${(z1 - z0).toFixed(2)} m`, 0.3, 0.05);
    tag.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2).applyMatrix4(p.matrix);
    tag.userData.face = true;
    surf.add(loop, tag);
  }
}

app.onStart = () => app.say('Pinch to start a line, pinch again to end it.');
app.run(() => {
  const [l, r] = app.hands;
  const both = l.active && r.active && l.pinch && r.pinch && app.inXR;
  live.g.visible = both;
  if (both) { live.a.copy(l.pos); live.g.children[0].position.copy(l.pos); setEnd(live, r.pos); }
  if (open) setEnd(open, r.pos);
  if (r.active && r.pinchDown && !(l.pinch && app.inXR)) {
    if (!open) { open = make(r.pos); app.tone(700, 0.06, 'triangle', 0.2); app.buzz(1, 0.4, 30); }
    else { setEnd(open, r.pos); lines.push(open); app.say(`Line ${lines.length}: ${fmt(open.a.distanceTo(open.b))}`); open = null; app.good(); app.buzz(1, 0.8, 60); if (lines.length > 12) { const old = lines.shift()!; app.scene.remove(old.g); } }
  }
  if (l.active && l.pinchDown && !r.pinch) {
    const gone = open ?? lines.pop();
    if (gone) { app.scene.remove(gone.g); open = null; app.tone(300, 0.08, 'triangle', 0.2); app.say('Removed.'); }
  }
  surfT -= 1; if (surfT <= 0) { surfT = 45; drawSurfaces(); }
  for (const c of surf.children) if (c.userData.face) c.lookAt(app.head);
  for (const ln of [...lines, live, ...(open ? [open] : [])]) ln.label.lookAt(app.head);
});
(window as any).__state = () => ({ surfaces: surf.children.length / 2, count: lines.length, open: !!open, lengths: lines.map((l) => +l.a.distanceTo(l.b).toFixed(3)) });
