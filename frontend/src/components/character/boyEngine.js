/*
  Procedural animation engine driving both character and dog:
  - wave: High hand wave, enthusiastic greeting, dog wags happily
  - typing: Boy's eyes lock downward at the input, dog perches alert
  - thinking / loading: Boy holds chin in deep thought, dog sprints full laps
  - sorry / confused: Boy shrugs with open palms & sad tilt, dog cocks head in confusion
  - success / happy: Both bounce and celebrate with fist pumps & barks
  - error: Boy shakes head, dog barks with animated comic bubble
  - idle: Relaxed breathing, dog sleeps peacefully with rising Zzz snores
*/

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mk = (v = 0) => ({ x: v, v: 0 });
const r2 = (n) => Math.round(n * 100) / 100;

const P = {
  eye: [520, 36],
  head: [150, 18],
  arm: [120, 16],
  face: [240, 26],
  body: [100, 14],
  nod: [220, 15],
  dogHead: [170, 18],
  dogBody: [120, 15],
  tail: [360, 22],
  dogSleep: [35, 8],
  dogMove: [160, 18],
};

export const GEO = {
  l1: 34,
  l2: 34,
  shoulderX: 34,
  shoulderY: 122,
  neck: [100, 108],
  eyeL: [84, 68],
  eyeR: [116, 68],
  headScale: 0.94,
};

function ik(sx, sy, tx, ty, side, mem) {
  const { l1, l2 } = GEO;
  const dx = tx - sx;
  const dy = ty - sy;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.4);
  const base = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const B = Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));

  const score = (s) => side * (sx + l1 * Math.cos(base + s * A));
  const cur = mem.s;
  const other = -cur;
  if (score(other) > score(cur) + 2) mem.s = other;
  const s = mem.s;

  const sh = ((base + s * A) * 180) / Math.PI;
  const el = ((-s * (Math.PI - B)) * 180) / Math.PI;
  return { sh, el };
}

function mouthPath(w, curve, open, tilt) {
  const cx = 100;
  const y = 94;
  const k = Math.min(1, Math.max(0, open) / 6);
  const cu = curve * (1 - 0.65 * k);
  const cl = curve + 2 * Math.max(0, open);
  const x0 = cx - w;
  const x1 = cx + w;
  const y1 = y + tilt;
  return `M${r2(x0)} ${y} Q${cx} ${r2(y + cu)} ${r2(x1)} ${r2(y1)} Q${cx} ${r2(y + cl)} ${r2(x0)} ${y} Z`;
}

function jump(tm, n, dur, h) {
  if (tm < 0 || tm >= n * dur) return { y: 0, sq: 0 };
  const ph = (tm % dur) / dur;
  const y = -h * 4 * ph * (1 - ph);
  const edge = Math.min(ph, 1 - ph);
  const squash = edge < 0.14 ? (0.14 - edge) / 0.14 : 0;
  const stretch = Math.sin(Math.PI * ph) * 0.05;
  return { y, sq: squash * 0.1 - stretch };
}

export function createEngine({ formDir = -1, reduceMotion = false } = {}) {
  const kk = reduceMotion ? 4 : 1;
  const sp = (st, target, dt, [k, c]) => {
    const K = k * kk;
    const C = c * Math.sqrt(kk);
    st.v += ((target - st.x) * K - st.v * C) * dt;
    st.x += st.v * dt;
  };

  const defaultDogX = formDir > 0 ? 175 : 25;
  const defaultFacing = formDir > 0 ? 1 : -1;

  const s = {
    gx: mk(), gy: mk(),
    hr: mk(), hx: mk(), hy: mk(), lean: mk(), nod: mk(),
    mw: mk(11), mc: mk(6), mo: mk(0), mt: mk(0),
    bL: mk(), bR: mk(), bt: mk(), cheek: mk(0.2),
    eoL: mk(1), eoR: mk(1), happy: mk(), err: mk(),
    lx: mk(54), ly: mk(192), rx: mk(146), ry: mk(192),
    shrug: mk(), crouch: mk(), rootX: mk(),

    // Dog Position & Transformation Springs
    dogPosX: mk(defaultDogX),
    dogPosY: mk(280),
    dogScaleX: mk(defaultFacing),
    dogSleep: mk(1), // Starts asleep
    dogTail: mk(-35),
    dHeadR: mk(18),
    dHeadX: mk(6),
    dHeadY: mk(38),
    dEarL: mk(12),
    dEarR: mk(12),
    dPawLX: mk(-2),
    dPawLY: mk(2),
    dPawRX: mk(18),
    dPawRY: mk(2),
    dMouthO: mk(0),
    dGx: mk(0),
    dGy: mk(0),
    dHop: mk(0),
    dBarkPop: mk(0),
  };

  const memL = { s: -1 };
  const memR = { s: 1 };
  let lastMood = "idle";
  let moodT0 = 0;
  let lastNod = 0;
  let lastNotice = 0;
  let nextBlink = 1.5;
  let blinkT0 = -1;

  function headPt(x, y, fx, fy) {
    const [nx, ny] = GEO.neck;
    const a = (s.hr.x * Math.PI) / 180;
    const hs = GEO.headScale;
    const px = (x + fx - nx) * hs;
    const py = (y + fy - ny) * hs;
    return [
      nx + px * Math.cos(a) - py * Math.sin(a) + s.hx.x,
      ny + px * Math.sin(a) + py * Math.cos(a) + s.hy.x
    ];
  }

  function step(dtRaw, t, inp) {
    const rm = reduceMotion;
    const dt = Math.min(dtRaw, 1 / 30) / 2;
    const mood = inp.mood;
    if (mood !== lastMood) {
      lastMood = mood;
      moodT0 = t;
    }
    const tm = t - moodT0;

    if (inp.nod !== lastNod) {
      if (inp.nod > lastNod) s.nod.v += 45;
      lastNod = inp.nod;
    }
    let wantBlink = false;
    if (inp.notice !== lastNotice) {
      if (inp.notice > lastNotice) {
        s.nod.v += 22;
        wantBlink = true;
      }
      lastNotice = inp.notice;
    }

    // ---- Boy Blink Timing
    if (blinkT0 < 0 && (t >= nextBlink || wantBlink)) blinkT0 = t;
    let blink = 1;
    if (blinkT0 >= 0) {
      const p = (t - blinkT0) / 0.15;
      if (p >= 1) {
        blinkT0 = -1;
        nextBlink = t + 2 + Math.random() * 3;
      } else {
        blink = 1 - Math.sin(Math.PI * p);
      }
    }

    // ---- Boy Gaze & Gaze Tracking
    let gx = inp.gaze.x;
    let gy = inp.gaze.y;
    let headK = 0.6;

    if (inp.wander && !rm && (mood === "idle" || mood === "wave" || mood === "happy")) {
      gx = Math.sin(t * 0.6) * 0.55;
      gy = Math.sin(t * 0.43 + 1) * 0.2;
    }

    if (mood === "typing") {
      gx = 0;
      gy = 0.95; // Stare directly down at the input box
      headK = 0.85;
    } else if (mood === "thinking" || mood === "loading") {
      gx = 0.65;
      gy = -0.8; // Looking up into the corner thoughtfully
      headK = 0.8;
    } else if (mood === "sorry" || mood === "confused") {
      gx = -0.3;
      gy = 0.35; // Apologetic, sheepish gaze
      headK = 0.75;
    } else if (mood === "peek") {
      gx = formDir * 0.9;
      gy = 0.2;
    } else if (mood === "error") {
      gx = 0;
      gy = 0.85;
      headK = 0.4;
    } else if (mood === "password") {
      gx = 0;
      gy = 0.2;
    } else if (mood === "wave") {
      gx = 0;
      gy = -0.2;
    }

    // ---- Facial Expressions, Brows & Mouth
    let mw = 11, mc = 6, mo = 0, mt = 0, cheek = 0.2, bL = 0, bR = 0, bt = 0;
    let eoL = 1, eoR = 1, happy = 0, err = 0;

    if (inp.hover) {
      mw = 12; mc = 7; mo = 2; cheek = 0.4; bL = bR = -2;
    }

    switch (mood) {
      case "wave":
        mw = 14; mc = 7; mo = 5; cheek = 0.55; bL = bR = -4; // Warm, welcoming smile
        break;
      case "typing":
        mw = 9; mc = 3; mo = 1; bL = bR = 1.5; // Focused, attentive expression
        break;
      case "thinking":
      case "loading":
        mw = 6; mc = -4; mo = 4; bL = -7; bR = 3; bt = -12; // Asymmetric furrowed brow, thinking mouth
        break;
      case "sorry":
      case "confused":
        mw = 12; mc = -7; mo = 2; bt = 16; cheek = 0.1; err = 1; // Sad / confused pout with sweat tear
        break;
      case "success":
      case "happy":
        happy = 1; mw = 18; mc = 5; mo = 12; cheek = 0.6; bL = bR = -5; // Big grin
        break;
      case "password":
        mw = 8; mc = 2; mo = 0; eoL = eoR = 0.05;
        break;
      case "peek":
        mw = 10; mc = 4; mo = 0; mt = -3; eoL = 0.05; cheek = 0.5; bR = -4;
        break;
      case "error":
        mw = 10; mc = -6; mo = 0; bt = 14; cheek = 0.1; err = 1;
        break;
      default:
        break;
    }

    const pressed = inp.press ? 1 : 0;
    eoL *= blink * (1 - pressed * 0.5);
    eoR *= blink * (1 - pressed * 0.5);

    const shake = (mood === "error" || mood === "sorry") && !rm
      ? Math.exp(-tm * 2.8) * Math.sin(tm * 22)
      : 0;

    let hrT = gx * headK * 9 + shake * 9;
    if (mood === "thinking" || mood === "loading") hrT += 7; // Head cocked sideways in thought
    if (mood === "sorry" || mood === "confused") hrT -= 6; // Head tilted in regret
    if (mood === "peek") hrT += formDir * 4;
    if ((mood === "success" || mood === "happy") && !rm) hrT += Math.sin(t * 12) * 3;

    const breath = rm ? 0 : Math.sin(t * 2.2);
    const hxT = gx * headK * 2.5;
    const hyT = gy * headK * 2.5 + ((mood === "error" || mood === "sorry") ? 4 : 0) + breath * 0.7 + s.crouch.x * 8;
    const leanT = gx * headK * 2 + (mood === "typing" ? 4 : 0) + (rm ? 0 : Math.sin(t * 0.9) * 0.5);

    let jp = { y: 0, sq: 0 };
    if (!rm) {
      if (mood === "success") jp = jump(tm, 2, 0.55, 22);
      else if (mood === "happy") jp = jump(tm, 1, 0.6, 20);
      else if (mood === "wave") jp = jump(tm, 1, 0.45, 8);
    }
    const rootXT = (mood === "error" || mood === "sorry") && !rm ? shake * 3 : 0;

    // ---- Arms & Procedural Poses
    const sway = rm ? 0 : Math.sin(t * 1.1);
    let L = [54 + sway * 1.5, 192];
    let R = [146 - sway * 1.5, 192];
    let shrug = 0;
    const [fx, fy] = [s.gx.x * 5, s.gy.x * 3];

    switch (mood) {
      case "wave":
        // Right hand waves high in the air
        R = [168 + (rm ? 0 : 12 * Math.sin(t * 12)), 48 + (rm ? 0 : 4 * Math.cos(t * 12))];
        L = [44, 185];
        break;
      case "typing":
        // Hands rest slightly forward over keyboard
        L = [66, 176];
        R = [134, 176];
        break;
      case "thinking":
      case "loading":
        // Right hand props up the chin, left hand rests on belly
        R = headPt(112, 102, fx, fy);
        L = [72, 156];
        break;
      case "sorry":
      case "confused":
        // Shrug: Both hands raised outward with open palms
        L = [20, 148];
        R = [180, 148];
        shrug = 12;
        break;
      case "password":
        L = headPt(GEO.eyeL[0] - 1, GEO.eyeL[1] + 2, fx, fy);
        R = headPt(GEO.eyeR[0] + 1, GEO.eyeR[1] + 2, fx, fy);
        break;
      case "peek":
        L = headPt(GEO.eyeL[0] - 1, GEO.eyeL[1] + 2, fx, fy);
        R = headPt(140, 44, fx, fy);
        break;
      case "success":
      case "happy": {
        const pump = rm ? 0 : 7 * Math.sin(t * 16);
        L = [36, 32 + pump];
        R = [164, 32 - pump];
        break;
      }
      case "error":
        L = [32, 166];
        R = [168, 166];
        shrug = 8;
        break;
      default:
        break;
    }

    // ====================================================================
    // DOG LOGIC: SLEEPING, SPRINTING LAPS, COCKED HEAD, BARKING, JOY
    // ====================================================================
    const isSleepMode = mood === "idle";
    const dogSleepTarget = isSleepMode ? 1 : 0;

    let targetDogX = defaultDogX;
    let targetDogY = 280;
    let targetDogScaleX = defaultFacing;

    let tailSpd = 6;
    let tailAmp = 12;
    let dHeadRot = 0;
    let dHeadX = 0;
    let dHeadY = 0;
    let dEarL = 0;
    let dEarR = 0;
    let dPawLX = 4, dPawLY = -4;
    let dPawRX = 24, dPawRY = -4;
    let dMouthO = 0.3;
    let dGx = 0;
    let dGy = 0;
    let dHop = 0;
    let dBarkPop = 0;

    if (mood === "wave") {
      // Wakes up happily, wags tail sitting beside boy
      dHeadRot = -6;
      dHeadX = 2;
      tailSpd = 18;
      tailAmp = 26;
      dEarL = -8;
      dEarR = -8;
      dMouthO = 0.6;
    } else if (mood === "typing") {
      // Alert posture, looks attentively at the chat field
      dHeadRot = 14;
      dHeadX = 8;
      dGx = 0.8;
      dGy = 0.8;
      dEarL = -16;
      dEarR = -16; // Perked ears
      tailSpd = 12;
      tailAmp = 18;
      dMouthO = 0.4;
    } else if (mood === "thinking" || mood === "loading") {
      // Dog sprints full loops around the boy in anticipation
      const theta = t * 4.4;
      targetDogX = 100 + Math.cos(theta) * 78;
      targetDogY = 278 + Math.sin(theta) * 8;
      targetDogScaleX = Math.sin(theta) > 0 ? -1 : 1; // Dynamically faces running direction

      const runCycle = t * 24;
      dPawLX = Math.sin(runCycle) * 16;
      dPawLY = -4 - Math.abs(Math.cos(runCycle)) * 14;
      dPawRX = -Math.sin(runCycle) * 16;
      dPawRY = -4 - Math.abs(Math.sin(runCycle)) * 14;

      dEarL = -28;
      dEarR = -28;
      tailSpd = 28;
      tailAmp = 34;
      dMouthO = 1.1; // Tongue out
      dHeadY = rm ? 0 : Math.sin(t * 16) * 3;
    } else if (mood === "sorry" || mood === "confused") {
      // Dog tilts head sideways in confusion / sympathy
      dHeadRot = 24;
      dHeadX = 4;
      dEarL = -18;
      dEarR = 8;
      tailSpd = 4;
      tailAmp = 8;
      dMouthO = 0.15;
    } else if (mood === "success" || mood === "happy") {
      // Both celebrate and bounce together
      tailSpd = 30;
      tailAmp = 42;
      dEarL = -22;
      dEarR = -22;
      dMouthO = 1.2;
      dHop = rm ? 0 : Math.abs(Math.sin(t * 14)) * 20;
      dPawLX = 8;
      dPawLY = -18;
      dPawRX = 28;
      dPawRY = -18;
    } else if (mood === "error") {
      // Dog barks with animated WOOF bubble
      const barkRhythm = (t * 7) % 3;
      const isBarking = barkRhythm < 0.4 || (barkRhythm > 0.6 && barkRhythm < 1.0);

      if (isBarking) {
        dHeadY = -8;
        dHeadRot = -14;
        dMouthO = 1.4;
        dBarkPop = 1.0;
        dEarL = -24;
        dEarR = -24;
        dPawLX = 6;
        dPawLY = 2;
        dPawRX = 26;
        dPawRY = 2;
      } else {
        dHeadY = 0;
        dHeadRot = 0;
        dMouthO = 0.15;
        dBarkPop = 0;
      }
      tailSpd = 24;
      tailAmp = 30;
    }

    // Blend into Sleeping State
    const slp = s.dogSleep.x;
    if (slp > 0.02) {
      dHeadX = (1 - slp) * dHeadX + slp * 6;
      dHeadY = (1 - slp) * dHeadY + slp * (38 + (rm ? 0 : Math.sin(t * 1.5) * 1.8)); // Rests on paws
      dHeadRot = (1 - slp) * dHeadRot + slp * 18;
      dEarL = (1 - slp) * dEarL + slp * 12;
      dEarR = (1 - slp) * dEarR + slp * 12;
      tailAmp *= (1 - slp);
      dMouthO *= (1 - slp);
      dPawLX = (1 - slp) * dPawLX + slp * -2;
      dPawRX = (1 - slp) * dPawRX + slp * 18;
      dPawLY = (1 - slp) * dPawLY + slp * 2;
      dPawRY = (1 - slp) * dPawRY + slp * 2;
    }

    const dogTailAngle = rm ? 0 : Math.sin(t * tailSpd) * tailAmp;

    // ---- Integrate All Springs
    for (let i = 0; i < 2; i++) {
      sp(s.gx, gx, dt, P.eye);
      sp(s.gy, gy, dt, P.eye);
      sp(s.hr, hrT, dt, P.head);
      sp(s.hx, hxT, dt, P.head);
      sp(s.hy, hyT, dt, P.head);
      sp(s.lean, leanT, dt, P.body);
      sp(s.nod, 0, dt, P.nod);
      sp(s.mw, mw, dt, P.face);
      sp(s.mc, mc, dt, P.face);
      sp(s.mo, mo, dt, P.face);
      sp(s.mt, mt, dt, P.face);
      sp(s.bL, bL, dt, P.face);
      sp(s.bR, bR, dt, P.face);
      sp(s.bt, bt, dt, P.face);
      sp(s.cheek, cheek, dt, P.face);
      sp(s.eoL, eoL, dt, [700, 42]);
      sp(s.eoR, eoR, dt, [700, 42]);
      sp(s.happy, happy, dt, P.face);
      sp(s.err, err, dt, P.face);
      sp(s.lx, L[0], dt, P.arm);
      sp(s.ly, L[1], dt, P.arm);
      sp(s.rx, R[0], dt, P.arm);
      sp(s.ry, R[1], dt, P.arm);
      sp(s.shrug, shrug, dt, P.body);
      sp(s.crouch, inp.press ? 0.06 : 0, dt, [400, 30]);
      sp(s.rootX, rootXT, dt, [500, 40]);

      // Dog Springs
      sp(s.dogSleep, dogSleepTarget, dt, P.dogSleep);
      sp(s.dogPosX, targetDogX, dt, P.dogMove);
      sp(s.dogPosY, targetDogY, dt, P.dogMove);
      sp(s.dogScaleX, targetDogScaleX, dt, [300, 24]);
      sp(s.dogTail, dogTailAngle, dt, P.tail);
      sp(s.dHeadR, dHeadRot, dt, P.dogHead);
      sp(s.dHeadX, dHeadX, dt, P.dogHead);
      sp(s.dHeadY, dHeadY, dt, P.dogHead);
      sp(s.dEarL, dEarL, dt, P.dogHead);
      sp(s.dEarR, dEarR, dt, P.dogHead);
      sp(s.dPawLX, dPawLX, dt, P.dogBody);
      sp(s.dPawLY, dPawLY, dt, P.dogBody);
      sp(s.dPawRX, dPawRX, dt, P.dogBody);
      sp(s.dPawRY, dPawRY, dt, P.dogBody);
      sp(s.dMouthO, dMouthO, dt, P.face);
      sp(s.dGx, dGx, dt, P.eye);
      sp(s.dGy, dGy, dt, P.eye);
      sp(s.dHop, dHop, dt, [320, 20]);
      sp(s.dBarkPop, dBarkPop, dt, [600, 36]);
    }

    // ---- Render Frame Attribute Operations
    const out = [];
    const put = (name, attr, val) => out.push([name, attr, val]);

    // Boy Output
    const sq = jp.sq + s.crouch.x;
    put("root", "transform",
      `translate(${r2(s.rootX.x)} ${r2(jp.y)}) translate(100 286) scale(${r2(1 + sq * 0.6)} ${r2(1 - sq)}) translate(-100 -286)`);
    const sc = clamp(1 + jp.y / 120, 0.5, 1.1);
    put("shadow", "rx", r2(44 * sc));
    put("shadow", "opacity", r2(0.35 * sc));

    const bob = s.nod.x * 0.3;
    put("upper", "transform",
      `translate(0 ${r2(bob)}) translate(100 200) rotate(${r2(s.lean.x)}) scale(1 ${r2(1 + (rm ? 0 : 0.012 * Math.sin(t * 2.2)))}) translate(-100 -200)`);
    put("head", "transform", `translate(${r2(s.hx.x)} ${r2(s.hy.x + s.nod.x)}) rotate(${r2(s.hr.x)} 100 108)`);
    put("feat", "transform", `translate(${r2(s.gx.x * 5)} ${r2(s.gy.x * 3)})`);

    const px = r2(s.gx.x * 3.2);
    const py = r2(s.gy.x * 1.8);
    put("pupL", "transform", `translate(${px} ${py})`);
    put("pupR", "transform", `translate(${px} ${py})`);
    const eyeT = (c, o) => `translate(${c[0]} ${c[1]}) scale(1 ${r2(clamp(o, 0.06, 1))}) translate(${-c[0]} ${-c[1]})`;
    put("eyeL", "transform", eyeT(GEO.eyeL, s.eoL.x));
    put("eyeR", "transform", eyeT(GEO.eyeR, s.eoR.x));
    put("eyes", "opacity", r2(clamp(1 - s.happy.x, 0, 1)));
    put("arcs", "opacity", r2(clamp(s.happy.x, 0, 1)));
    put("browL", "transform", `translate(0 ${r2(s.bL.x)}) rotate(${r2(-s.bt.x)} 84 53)`);
    put("browR", "transform", `translate(0 ${r2(s.bR.x)}) rotate(${r2(s.bt.x)} 116 53)`);
    put("cheekL", "opacity", r2(clamp(s.cheek.x, 0, 1)));
    put("cheekR", "opacity", r2(clamp(s.cheek.x, 0, 1)));
    put("mouth", "d", mouthPath(s.mw.x, s.mc.x, s.mo.x, s.mt.x));
    const tearPulse = rm ? 1 : (tm * 1.2) % 1;
    put("tear", "opacity", r2(clamp(s.err.x, 0, 1) * (1 - tearPulse * 0.8)));
    put("tear", "transform", `translate(0 ${r2(tearPulse * 14)})`);

    // Arms
    const shY = GEO.shoulderY - s.shrug.x;
    const aL = ik(66, shY, s.lx.x, s.ly.x, -1, memL);
    const aR = ik(134, shY, s.rx.x, s.ry.x, 1, memR);
    put("armL", "transform", `translate(66 ${r2(shY)}) rotate(${r2(aL.sh)})`);
    put("armR", "transform", `translate(134 ${r2(shY)}) rotate(${r2(aR.sh)})`);
    for (const [n, a] of [["armL", aL], ["armR", aR]]) {
      put(`${n}O`, "transform", `translate(34 0) rotate(${r2(a.el)})`);
      put(`${n}F`, "transform", `translate(34 0) rotate(${r2(a.el)})`);
    }

    // ==========================================
    // BIG DOG OUTPUT OPERATIONS
    // ==========================================
    const dogSleepVal = clamp(s.dogSleep.x, 0, 1);

    put("dogContainer", "transform",
      `translate(${r2(s.dogPosX.x)} ${r2(s.dogPosY.x)}) scale(${r2(s.dogScaleX.x)} 1)`);

    put("dogRoot", "transform",
      `translate(0 ${r2(-s.dHop.x)}) scale(${r2(1 + dogSleepVal * 0.08)} ${r2(1 - dogSleepVal * 0.12)})`);

    put("dogShadow", "rx", r2(38 + dogSleepVal * 8));
    put("dogShadow", "opacity", r2(0.32 + dogSleepVal * 0.05));

    put("dogTail", "transform", `translate(-22 -22) rotate(${r2(s.dogTail.x)})`);

    const torsoBreathe = dogSleepVal > 0.5 && !rm ? Math.sin(t * 1.5) * 1.2 : 0;
    put("dogTorso", "transform", `translate(0 ${r2(torsoBreathe)})`);

    put("dogHead", "transform",
      `translate(${r2(18 + s.dHeadX.x)} ${r2(-76 + s.dHeadY.x)}) rotate(${r2(s.dHeadR.x)})`);

    put("dogEarL", "transform", `translate(-14 -14) rotate(${r2(s.dEarL.x)})`);
    put("dogEarR", "transform", `translate(-4 -14) rotate(${r2(s.dEarR.x)})`);

    put("dogPawL", "transform", `translate(${r2(s.dPawLX.x)} ${r2(s.dPawLY.x)})`);
    put("dogPawR", "transform", `translate(${r2(s.dPawRX.x)} ${r2(s.dPawRY.x)})`);

    const mOpen = clamp(s.dMouthO.x, 0, 1.4);
    put("dogMouth", "transform", `translate(20 12) scale(1 ${r2(mOpen)})`);
    put("dogTongue", "transform", `translate(0 0) scale(${r2(clamp(mOpen, 0.2, 1.2))})`);

    put("dogEyes", "opacity", r2(clamp(1 - dogSleepVal, 0, 1)));
    put("dogSleepEyes", "opacity", r2(clamp(dogSleepVal, 0, 1)));

    const dogPupX = r2(s.dGx.x * 2.8);
    const dogPupY = r2(s.dGy.x * 2.0);
    put("dogPupL", "transform", `translate(${dogPupX} ${dogPupY})`);
    put("dogPupR", "transform", `translate(${dogPupX} ${dogPupY})`);

    // Floating Snore "Zzz"
    if (dogSleepVal > 0.3) {
      const zDriftY = rm ? -55 : -55 - ((t * 16) % 22);
      const zDriftX = rm ? 18 : 18 + Math.sin(t * 2) * 4;
      put("dogZzz", "opacity", r2(clamp((dogSleepVal - 0.3) * 1.4, 0, 1)));
      put("dogZzz", "transform", `translate(${r2(zDriftX)} ${r2(zDriftY)})`);
    } else {
      put("dogZzz", "opacity", 0);
    }

    // Bark Comic Bubble Pop
    const barkAlpha = clamp(s.dBarkPop.x, 0, 1);
    put("dogBark", "opacity", r2(barkAlpha));
    put("dogBark", "transform", `translate(32 -96) scale(${r2(0.85 + barkAlpha * 0.25)})`);

    return out;
  }

  function warm(inp, seconds = 1.2) {
    for (let t = -seconds; t < 0; t += 1 / 60) step(1 / 60, t, inp);
    return step(1 / 60, 0, inp);
  }

  return { step, warm };
}