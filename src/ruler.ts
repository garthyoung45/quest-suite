// Room Ruler: pinch two points in your real room to measure between them.
import { App, THREE, makeLabel, setLabel } from './kit';

const app = new App({
  title: 'Room Ruler',
  blurb: 'Measure your real room. Pinch once to start a line, pinch again to end it. Pinch with both hands at once for a live reading between them. Good to about a centimetre or two, so treat it as a quick check, not a tape measure.',
  mode: 'ar',
  handsHelp: 'right pinch sets a point. Hold both pinches for a live hand-to-hand reading. Left pinch removes the last line.',
  padHelp: 'R2 sets a point where your hand is, L2 removes the last line.',
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

app.onStart = () => app.say('Pinch to start a line, pinch again to end it.');
app.run(() => {
  const [l, r] = app.hands;
  const both = l.active && r.active && l.pinch && r.pinch && app.inXR;
  live.g.visible = both;
  if (both) { live.a.copy(l.pos); live.g.children[0].position.copy(l.pos); setEnd(live, r.pos); }
  if (open) setEnd(open, r.pos);
  if (r.active && r.pinchDown && !(l.pinch && app.inXR)) {
    if (!open) { open = make(r.pos); app.tone(700, 0.06, 'triangle', 0.2); }
    else { setEnd(open, r.pos); lines.push(open); app.say(`Line ${lines.length}: ${fmt(open.a.distanceTo(open.b))}`); open = null; app.good(); if (lines.length > 12) { const old = lines.shift()!; app.scene.remove(old.g); } }
  }
  if (l.active && l.pinchDown && !r.pinch) {
    const gone = open ?? lines.pop();
    if (gone) { app.scene.remove(gone.g); open = null; app.tone(300, 0.08, 'triangle', 0.2); app.say('Removed.'); }
  }
  for (const ln of [...lines, live, ...(open ? [open] : [])]) ln.label.lookAt(app.head);
});
(window as any).__state = () => ({ count: lines.length, open: !!open, lengths: lines.map((l) => +l.a.distanceTo(l.b).toFixed(3)) });
