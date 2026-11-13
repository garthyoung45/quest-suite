// Shared kit for the Quest Suite: one code path for Quest hands (WebXR) and
// flat-screen play with a PS5 DualSense (Gamepad API) or keyboard and mouse.
import './emu';
import * as THREE from 'three';

export type Mode = 'vr' | 'ar';

export interface Hand {
  active: boolean;
  pos: THREE.Vector3; // pinch point (between thumb and index), world space
  tip: THREE.Vector3; // index fingertip, world space
  vel: THREE.Vector3; // fingertip velocity, m/s
  pinch: boolean;
  pinchDown: boolean;
  pinchUp: boolean;
  dot: THREE.Mesh;
}

export interface AppOptions {
  title: string;
  blurb: string;
  mode: Mode;
  handsHelp: string;
  padHelp: string;
  sky?: number;
  eye?: number; // flat-mode eye height
}

const BTN = ['cross', 'circle', 'square', 'triangle', 'l1', 'r1', 'l2', 'r2', 'share', 'options', 'l3', 'r3', 'up', 'down', 'left', 'right'];
const KEYS: Record<string, string> = {
  KeyJ: 'cross', KeyK: 'circle', KeyU: 'square', KeyI: 'triangle',
  KeyQ: 'l1', KeyE: 'r1', ShiftLeft: 'l2', Space: 'r2',
  KeyT: 'up', KeyG: 'down', KeyF: 'left', KeyH: 'right', Enter: 'options',
};

export class App {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, 1, 0.01, 200);
  rig = new THREE.Group();
  renderer: THREE.WebGLRenderer;
  hands: Hand[] = [];
  head = new THREE.Vector3();
  headDir = new THREE.Vector3();
  audio!: AudioContext;
  master!: GainNode;
  started = false;
  inXR = false;
  passthrough = false;
  time = 0;
  opts: AppOptions;
  room = new THREE.Group();
  private held: Record<string, boolean> = {};
  private prev: Record<string, boolean> = {};
  private keys: Record<string, boolean> = {};
  private yaw = 0;
  private pitch = 0;
  private reach = 0.45;
  private hudEl: HTMLDivElement;
  private hudMesh: THREE.Mesh;
  private hudText = '';
  private xrSelect = [false, false];
  private xrHands: THREE.Group[] = [];
  private xrCtrl: THREE.Group[] = [];
  private handed: (string | null)[] = [null, null];
  private lastTip = [new THREE.Vector3(), new THREE.Vector3()];
  private mouseDown = false;
  private update: (dt: number) => void = () => {};
  onStart: () => void = () => {};

  constructor(opts: AppOptions) {
    this.opts = opts;
    document.title = opts.title + ' · Quest Suite';
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');
    document.body.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(opts.sky ?? 0x06070d);
    this.scene.add(this.rig);
    this.rig.add(this.camera);
    this.camera.position.set(0, opts.eye ?? 1.6, 0);
    this.scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x20222a, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(2, 4, 1.5);
    this.scene.add(sun);

    // Stand-in room for mixed-reality experiences when there is no passthrough.
    const grid = new THREE.GridHelper(8, 16, 0x3a4a6a, 0x1c2536);
    this.room.add(grid);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: 0x10141d, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    this.room.add(floor);
    this.scene.add(this.room);

    for (let i = 0; i < 2; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshBasicMaterial({ color: i ? 0x7fd6ff : 0xffc86b }));
      this.scene.add(dot);
      this.hands.push({ active: false, pos: new THREE.Vector3(), tip: new THREE.Vector3(), vel: new THREE.Vector3(), pinch: false, pinchDown: false, pinchUp: false, dot });
      const h = this.renderer.xr.getHand(i);
      const c = this.renderer.xr.getController(i);
      this.rig.add(h, c);
      this.xrHands.push(h);
      this.xrCtrl.push(c);
      c.addEventListener('connected', (e: any) => { this.handed[i] = e.data?.handedness ?? null; });
      c.addEventListener('disconnected', () => { this.handed[i] = null; this.xrSelect[i] = false; });
      c.addEventListener('selectstart', () => { this.xrSelect[i] = true; });
      c.addEventListener('selectend', () => { this.xrSelect[i] = false; });
    }

    // HUD: DOM on a screen, a floating card in the headset.
    this.hudEl = document.createElement('div');
    this.hudEl.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);max-width:92vw;padding:10px 16px;border-radius:12px;background:rgba(8,10,18,.72);color:#eef2ff;font:600 17px system-ui;text-align:center;white-space:pre-line;pointer-events:none;display:none';
    document.body.appendChild(this.hudEl);
    this.hudMesh = makeLabel('', 0.62, 0.2);
    this.hudMesh.visible = false;
    this.scene.add(this.hudMesh);

    this.buildOverlay();
    addEventListener('resize', () => {
      if (this.renderer.xr.isPresenting) return;
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
    dispatchEvent(new Event('resize'));
    addEventListener('keydown', (e) => { this.keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    const el = this.renderer.domElement;
    el.addEventListener('mousedown', (e) => { if (e.button === 0) this.mouseDown = true; });
    addEventListener('mouseup', () => { this.mouseDown = false; });
    el.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === el || e.buttons === 2) {
        this.yaw -= e.movementX * 0.0025;
        this.pitch = clamp(this.pitch - e.movementY * 0.0025, -1.3, 1.3);
      }
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('wheel', (e) => { this.reach = clamp(this.reach - e.deltaY * 0.0006, 0.2, 1.6); });
    this.renderer.xr.addEventListener('sessionstart', () => { this.inXR = true; this.room.visible = !this.passthrough; this.rig.position.set(0, 0, 0); this.camera.position.set(0, 0, 0); });
    this.renderer.xr.addEventListener('sessionend', () => { this.inXR = false; this.room.visible = true; this.passthrough = false; this.scene.background = new THREE.Color(this.opts.sky ?? 0x06070d); this.camera.position.set(0, this.opts.eye ?? 1.6, 0); });
    (window as any).__app = this;
  }

  private buildOverlay() {
    const o = this.opts;
    const ov = document.createElement('div');
    ov.id = 'overlay';
    ov.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 30%,#1a2140,#05060d 70%);color:#eef2ff;font:16px system-ui;z-index:5;padding:16px;box-sizing:border-box;overflow:auto';
    ov.innerHTML = `<div style="max-width:560px;width:100%">
      <a href="./" style="color:#8fb4ff;text-decoration:none;font-size:14px">&larr; Quest Suite</a>
      <h1 style="font-size:40px;margin:10px 0 6px">${o.title}</h1>
      <p style="color:#b9c3e6;margin:0 0 18px;line-height:1.45">${o.blurb}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
        <button id="go-xr" style="${BTN_CSS};background:#4f7cff;color:#fff">Enter headset</button>
        <button id="go-flat" style="${BTN_CSS};background:#232a44;color:#eef2ff">Play on screen</button>
      </div>
      <p style="margin:0 0 6px"><b>Quest hands:</b> ${o.handsHelp}</p>
      <p style="margin:0 0 6px"><b>PS5 controller:</b> ${o.padHelp}</p>
      <p style="margin:0;color:#8b95b8;font-size:14px">On screen: left stick or WASD walks, right stick or arrow keys looks, R2 or Space is your right-hand pinch, L2 or Shift the left, D-pad up/down (T/G) reaches further or nearer. Click the view to look with the mouse.</p>
      <p id="xr-note" style="color:#ffb86b;font-size:14px"></p></div>`;
    document.body.appendChild(ov);
    const xrBtn = ov.querySelector('#go-xr') as HTMLButtonElement;
    const note = ov.querySelector('#xr-note') as HTMLElement;
    const mode = o.mode === 'ar' ? 'immersive-ar' : 'immersive-vr';
    const xr = (navigator as any).xr;
    if (!xr) { xrBtn.disabled = true; xrBtn.style.opacity = '.4'; note.textContent = 'No headset found in this browser. Open this page in the Quest browser for hands.'; }
    else {
      xr.isSessionSupported(mode).then((ok: boolean) => {
        if (ok) return;
        if (o.mode === 'ar') return xr.isSessionSupported('immersive-vr').then((vr: boolean) => { if (!vr) throw 0; });
        throw 0;
      }).catch(() => { xrBtn.disabled = true; xrBtn.style.opacity = '.4'; note.textContent = 'No headset found in this browser. Open this page in the Quest browser for hands.'; });
    }
    xrBtn.onclick = async () => {
      this.begin(ov);
      const init = { requiredFeatures: ['local-floor'], optionalFeatures: ['hand-tracking'] };
      let session: any = null;
      if (o.mode === 'ar') {
        try { session = await xr.requestSession('immersive-ar', init); this.passthrough = true; this.scene.background = null; } catch { session = null; }
      }
      if (!session) session = await xr.requestSession('immersive-vr', init);
      await this.renderer.xr.setSession(session);
    };
    (ov.querySelector('#go-flat') as HTMLButtonElement).onclick = () => { this.begin(ov); };
    addEventListener('gamepadconnected', () => { note.textContent = 'Controller connected. Press "Play on screen".'; note.style.color = '#7fe0a0'; });
  }

  private begin(ov: HTMLElement) {
    if (this.started) return;
    ov.style.display = 'none';
    this.audio = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.audio.createGain();
    this.master.gain.value = 0.8;
    const comp = this.audio.createDynamicsCompressor();
    this.master.connect(comp).connect(this.audio.destination);
    this.audio.resume();
    this.started = true;
    this.hudEl.style.display = this.hudText ? 'block' : 'none';
    this.renderer.domElement.addEventListener('click', () => { if (!this.inXR) this.renderer.domElement.requestPointerLock?.(); });
    this.onStart();
  }

  run(update: (dt: number) => void) {
    this.update = update;
    const clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      this.time += dt;
      this.poll(dt);
      if (this.started) this.update(dt);
      this.renderer.render(this.scene, this.camera);
      for (const k of BTN) this.prev[k] = this.held[k];
    });
  }

  btn(name: string) { return !!this.held[name]; }
  hit(name: string) { return !!this.held[name] && !this.prev[name]; }

  say(text: string) {
    if (text === this.hudText) return;
    this.hudText = text;
    this.hudEl.textContent = text;
    this.hudEl.style.display = this.started && text && !this.inXR ? 'block' : 'none';
    setLabel(this.hudMesh, text);
  }

  private poll(dt: number) {
    const gp = Array.from(navigator.getGamepads?.() ?? []).find((g) => g && g.connected && g.buttons.length >= 16) as Gamepad | undefined;
    for (let i = 0; i < BTN.length; i++) this.held[BTN[i]] = !!gp && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5);
    for (const code in KEYS) if (this.keys[code]) this.held[KEYS[code]] = true;
    if (this.mouseDown && this.started) this.held.r2 = true;
    const ax = (i: number) => { const v = gp ? gp.axes[i] ?? 0 : 0; return Math.abs(v) < 0.14 ? 0 : v; };

    if (!this.inXR) {
      this.hudEl.style.display = this.started && this.hudText ? 'block' : 'none';
      this.hudMesh.visible = false;
      const k = this.keys;
      const mx = ax(0) + (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
      const mz = ax(1) + (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0);
      this.yaw -= (ax(2) + (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * 2.0 * dt;
      this.pitch = clamp(this.pitch - (ax(3) + (k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0)) * 1.5 * dt, -1.3, 1.3);
      if (this.held.up) this.reach = clamp(this.reach + dt * 0.6, 0.2, 1.6);
      if (this.held.down) this.reach = clamp(this.reach - dt * 0.6, 0.2, 1.6);
      const sp = 1.6 * dt;
      this.rig.position.x += (Math.cos(this.yaw) * mx + Math.sin(this.yaw) * mz) * sp;
      this.rig.position.z += (-Math.sin(this.yaw) * mx + Math.cos(this.yaw) * mz) * sp;
      this.rig.position.x = clamp(this.rig.position.x, -3.5, 3.5);
      this.rig.position.z = clamp(this.rig.position.z, -3.5, 3.5);
      this.rig.rotation.y = this.yaw;
      this.camera.rotation.set(this.pitch, 0, 0);
    } else {
      this.hudEl.style.display = 'none';
    }
    this.rig.updateMatrixWorld(true);
    const cam = this.inXR ? this.renderer.xr.getCamera() : this.camera;
    cam.getWorldPosition(this.head);
    cam.getWorldDirection(this.headDir);

    for (let i = 0; i < 2; i++) {
      const h = this.hands[i];
      const was = h.pinch;
      if (this.inXR) {
        const side = this.handed[i] === 'left' ? 0 : this.handed[i] === 'right' ? 1 : i;
        const hh = this.hands[side];
        if (side !== i && this.handed[1 - i] == null) { h.active = false; }
        const joints = (this.xrHands[i] as any).joints as Record<string, THREE.Object3D> | undefined;
        const it = joints?.['index-finger-tip'];
        const tt = joints?.['thumb-tip'];
        const prevPinch = (hh as any)._was ?? false;
        if (this.handed[i] == null) { continue; }
        if (it && tt && (it as any).visible !== false && this.xrHands[i].visible) {
          it.getWorldPosition(hh.tip);
          const t = _v.set(0, 0, 0); tt.getWorldPosition(t);
          const d = t.distanceTo(hh.tip);
          hh.pos.copy(hh.tip).add(t).multiplyScalar(0.5);
          hh.pinch = this.xrSelect[i] || d < (prevPinch ? 0.035 : 0.018);
        } else {
          this.xrCtrl[i].getWorldPosition(hh.tip);
          hh.pos.copy(hh.tip);
          hh.pinch = this.xrSelect[i];
        }
        hh.active = true;
        (hh as any)._seen = true;
      } else {
        h.active = this.started;
        const off = _v.set(i ? 0.16 : -0.16, -0.16, -this.reach);
        h.tip.copy(off).applyMatrix4(this.camera.matrixWorld);
        h.pos.copy(h.tip);
        h.pinch = i ? this.held.r2 : this.held.l2;
      }
      void was;
    }
    for (let i = 0; i < 2; i++) {
      const h = this.hands[i] as Hand & { _was?: boolean };
      const was = h._was ?? false;
      h.pinchDown = h.pinch && !was;
      h.pinchUp = !h.pinch && was;
      h._was = h.pinch;
      h.vel.copy(h.tip).sub(this.lastTip[i]).divideScalar(Math.max(dt, 0.001));
      this.lastTip[i].copy(h.tip);
      h.dot.visible = h.active;
      h.dot.position.copy(h.pos);
      h.dot.scale.setScalar(h.pinch ? 1.7 : 1);
    }

    if (this.inXR) {
      // Floating HUD: sits low in front, follows lazily.
      this.hudMesh.visible = !!this.hudText;
      const f = _v.copy(this.headDir); f.y = 0; if (f.lengthSq() < 1e-4) f.set(0, 0, -1); f.normalize();
      const target = _v2.copy(this.head).addScaledVector(f, 0.85); target.y = this.head.y - 0.42;
      this.hudMesh.position.lerp(target, 1 - Math.exp(-dt * 2.5));
      this.hudMesh.lookAt(this.head);
    }
    if (this.started) {
      const l = this.audio.listener;
      const up = _v2.set(0, 1, 0);
      if (l.positionX) {
        const t = this.audio.currentTime;
        l.positionX.setValueAtTime(this.head.x, t); l.positionY.setValueAtTime(this.head.y, t); l.positionZ.setValueAtTime(this.head.z, t);
        l.forwardX.setValueAtTime(this.headDir.x, t); l.forwardY.setValueAtTime(this.headDir.y, t); l.forwardZ.setValueAtTime(this.headDir.z, t);
        l.upX.setValueAtTime(up.x, t); l.upY.setValueAtTime(up.y, t); l.upZ.setValueAtTime(up.z, t);
      } else {
        (l as any).setPosition(this.head.x, this.head.y, this.head.z);
        (l as any).setOrientation(this.headDir.x, this.headDir.y, this.headDir.z, 0, 1, 0);
      }
    }
  }

  // ---- sound helpers --------------------------------------------------------
  panner(pos: THREE.Vector3, ref = 0.4, rolloff = 1.6): PannerNode {
    const p = this.audio.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = ref;
    p.rolloffFactor = rolloff;
    p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
    p.connect(this.master);
    return p;
  }
  movePanner(p: PannerNode, pos: THREE.Vector3) {
    const t = this.audio.currentTime;
    p.positionX.setTargetAtTime(pos.x, t, 0.03); p.positionY.setTargetAtTime(pos.y, t, 0.03); p.positionZ.setTargetAtTime(pos.z, t, 0.03);
  }
  tone(freq: number, dur = 0.25, type: OscillatorType = 'sine', gain = 0.25, dest?: AudioNode, when = 0) {
    if (!this.started) return;
    const t = this.audio.currentTime + when;
    const o = this.audio.createOscillator();
    const g = this.audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest ?? this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  noiseBuffer(seconds = 1): AudioBuffer {
    const b = this.audio.createBuffer(1, Math.floor(this.audio.sampleRate * seconds), this.audio.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  good() { this.tone(660, 0.12, 'triangle', 0.25); this.tone(990, 0.25, 'triangle', 0.25, undefined, 0.1); }
  bad() { this.tone(160, 0.3, 'sawtooth', 0.18); }
}

const BTN_CSS = 'font:600 17px system-ui;padding:13px 20px;border:0;border-radius:12px;cursor:pointer';
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

// ---- text labels ------------------------------------------------------------
export function makeLabel(text: string, w = 0.4, h = 0.12, opts: { bg?: string; fg?: string; px?: number } = {}): THREE.Mesh {
  const canvas = document.createElement('canvas');
  const scale = 1024 / w;
  canvas.width = 1024; canvas.height = Math.round(h * scale);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  m.userData = { canvas, tex, opts, text: null };
  m.renderOrder = 10;
  setLabel(m, text);
  return m;
}
export function setLabel(m: THREE.Mesh, text: string) {
  const u = m.userData;
  if (u.text === text) return;
  u.text = text;
  const c: HTMLCanvasElement = u.canvas;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, c.width, c.height);
  if (!text) { u.tex.needsUpdate = true; return; }
  g.fillStyle = u.opts.bg ?? 'rgba(8,10,18,0.78)';
  const r = 28;
  g.beginPath(); g.roundRect(0, 0, c.width, c.height, r); g.fill();
  const lines = text.split('\n');
  let px = u.opts.px ?? Math.min(72, Math.floor((c.height - 30) / lines.length / 1.2));
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = u.opts.fg ?? '#eef2ff';
  for (;;) {
    g.font = `600 ${px}px system-ui, sans-serif`;
    if (px <= 18 || Math.max(...lines.map((l) => g.measureText(l).width)) < c.width - 50) break;
    px -= 3;
  }
  const lh = px * 1.2;
  const y0 = c.height / 2 - (lh * (lines.length - 1)) / 2;
  lines.forEach((l, i) => g.fillText(l, c.width / 2, y0 + i * lh));
  u.tex.needsUpdate = true;
}
export { THREE };
