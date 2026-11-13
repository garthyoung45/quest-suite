// Label Check: equipment tags hang around you. Pass the good ones, fail the bad ones.
import { App, THREE, makeLabel, setLabel } from './kit';

const app = new App({
  title: 'Label Check',
  blurb: 'Eight equipment tags hang around you. Read each one and decide: is it fit for use? Look for an overdue calibration, a missing sign-off, a reading outside its range, or an ID that does not match its barcode line. All tags are made up.',
  mode: 'ar',
  handsHelp: 'pinch the green PASS or red FAIL button under each tag.',
  padHelp: 'walk up to a tag, put your hand on PASS or FAIL, press R2.',
});

const TODAY = new Date(2026, 10, 13);
const day = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const KINDS = [
  { n: 'Pressure gauge', unit: 'psi', lo: 0, hi: 150 },
  { n: 'Temperature probe', unit: 'deg C', lo: 2, hi: 8 },
  { n: 'Torque wrench', unit: 'N m', lo: 20, hi: 100 },
  { n: 'Flow meter', unit: 'L/min', lo: 5, hi: 60 },
  { n: 'Balance', unit: 'g', lo: 0, hi: 2000 },
];
const DEFECTS = ['Calibration overdue', 'No sign-off', 'Reading outside range', 'ID does not match barcode line'];
interface Tag { g: THREE.Group; bad: number; pass: THREE.Mesh; fail: THREE.Mesh; done: boolean; card: THREE.Mesh }
let tags: Tag[] = [];
let right = 0, answered = 0, t0 = 0, finished = false;
const misses: string[] = [];
const board = makeLabel('', 0.9, 0.3);
board.position.set(0, 2.05, -1.5);
app.scene.add(board);
const btnGeo = new THREE.BoxGeometry(0.11, 0.05, 0.015);

function build() {
  tags.forEach((t) => app.scene.remove(t.g));
  tags = []; right = 0; answered = 0; finished = false; misses.length = 0; t0 = app.time;
  const badSet = new Set<number>();
  while (badSet.size < 4) badSet.add(Math.floor(Math.random() * 8));
  for (let i = 0; i < 8; i++) {
    const k = pick(KINDS);
    const id = `${pick(['PG', 'TT', 'TW', 'FM', 'BL'])}-${1000 + Math.floor(Math.random() * 9000)}`;
    const bad = badSet.has(i) ? Math.floor(Math.random() * 4) : -1;
    const due = new Date(TODAY.getTime() + (bad === 0 ? -(3 + Math.random() * 60) : 10 + Math.random() * 300) * 864e5);
    const span = k.hi - k.lo;
    const val = bad === 2 ? (Math.random() < 0.5 ? k.hi + span * (0.04 + Math.random() * 0.2) : k.lo - span * (0.04 + Math.random() * 0.2)) : k.lo + span * (0.15 + Math.random() * 0.7);
    const bar = bad === 3 ? id.slice(0, -1) + ((+id.slice(-1) + 1 + Math.floor(Math.random() * 8)) % 10) : id;
    const text = `${k.n}     ID ${id}\nCal due: ${day(due)}     Today: ${day(TODAY)}\nRange ${k.lo} to ${k.hi} ${k.unit}     Reading ${val.toFixed(1)}\nSigned: ${bad === 1 ? '________' : pick(['R. Ortiz', 'J. Mbeki', 'A. Lindqvist', 'S. Tanaka'])}\n||| | || ${bar} || | |||`;
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * 1.15, 1.32 + (i % 2) * 0.12, -Math.cos(a) * 1.15);
    g.lookAt(0, g.position.y, 0);
    const card = makeLabel(text, 0.62, 0.32, { bg: 'rgba(244,240,225,0.97)', fg: '#16181d' });
    const pass = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0x2fae5b }));
    const fail = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0xd9534f }));
    pass.position.set(-0.09, -0.22, 0.01); fail.position.set(0.09, -0.22, 0.01);
    const pl = makeLabel('PASS', 0.1, 0.04, { bg: 'rgba(0,0,0,0)' }); pl.position.set(-0.09, -0.22, 0.02);
    const fl = makeLabel('FAIL', 0.1, 0.04, { bg: 'rgba(0,0,0,0)' }); fl.position.set(0.09, -0.22, 0.02);
    g.add(card, pass, fail, pl, fl);
    app.scene.add(g);
    tags.push({ g, bad, pass, fail, done: false, card });
  }
  setLabel(board, 'Check all 8 tags\nPASS if fit for use, FAIL if not');
  app.say('Read each tag. Pinch PASS or FAIL under it.');
}
const wp = new THREE.Vector3();
function answer(t: Tag, saidPass: boolean, idx: number) {
  t.done = true; answered++;
  const ok = saidPass === (t.bad < 0);
  if (ok) { right++; app.good(); } else { app.bad(); misses.push(`Tag ${idx + 1}: ${t.bad < 0 ? 'was fine' : DEFECTS[t.bad]}`); }
  t.pass.visible = t.fail.visible = false;
  const res = makeLabel(ok ? (t.bad < 0 ? 'Correct: fit for use' : 'Correct: ' + DEFECTS[t.bad]) : (t.bad < 0 ? 'Wrong: this one was fine' : 'Missed: ' + DEFECTS[t.bad]), 0.5, 0.06, { bg: ok ? 'rgba(30,120,60,0.95)' : 'rgba(160,40,40,0.95)' });
  res.position.set(0, -0.22, 0.012); t.g.add(res);
  if (answered === 8) {
    finished = true;
    const secs = Math.round(app.time - t0);
    setLabel(board, `${right} of 8 correct in ${secs} s\n${misses.slice(0, 2).join('   ') || 'No misses'}\nPinch here to go again`);
    app.say(`${right} of 8 correct in ${secs} seconds. Pinch the top board to go again.`);
  } else setLabel(board, `${answered} of 8 checked     ${right} correct`);
}
app.onStart = build;
app.run(() => {
  for (const h of app.hands) {
    if (!h.active || !h.pinchDown) continue;
    if (finished && h.pos.distanceTo(board.position) < 0.5) { build(); return; }
    tags.forEach((t, i) => {
      if (t.done) return;
      if (t.pass.getWorldPosition(wp).distanceTo(h.pos) < 0.07) answer(t, true, i);
      else if (t.fail.getWorldPosition(wp).distanceTo(h.pos) < 0.07) answer(t, false, i);
    });
  }
  if (finished && app.hit('options')) build();
});
(window as any).__state = () => ({ answered, right, finished, tags: tags.map((t) => ({ bad: t.bad, pass: t.pass.getWorldPosition(new THREE.Vector3()).toArray(), fail: t.fail.getWorldPosition(new THREE.Vector3()).toArray() })) });
