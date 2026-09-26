import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useMascot } from "../auth/MascotContext";
import { boyInner, BOY_VIEWBOX } from "./boyArt";
import { createEngine } from "./boyEngine";

const BUBBLES = {
  password: "I won't look!",
  peek: "Just a tiny peek...",
  success: "Found it!",
  error: "Couldn't find that!",
  wave: "Hey! Need help?",
  happy: "Here you go!",
  loading: "Thinking...",
  typing: "I'm listening...",
};

const pointer = { x: 0, y: 0, moved: -1e9, notice: 0 };
let subscribers = 0;

const onMove = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.moved = performance.now();
};
const onDown = (e) => {
  onMove(e);
  pointer.notice += 1;
};
const onLeave = () => {
  pointer.moved = -1e9;
};

function subscribe() {
  if (subscribers++ === 0) {
    pointer.x = window.innerWidth / 2;
    pointer.y = window.innerHeight / 2;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }
  return () => {
    if (--subscribers === 0) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    }
  };
}

function apply(els, ops) {
  for (let i = 0; i < ops.length; i++) {
    const [name, attr, value] = ops[i];
    const el = els[name];
    if (el) el.setAttribute(attr, value);
  }
}

export default function Boy({ formDir = 1, active = true, outfit = "street" }) {
  const { mood, nudge, flash } = useMascot();
  const svgRef = useRef(null);
  const engineRef = useRef(null);
  const elsRef = useRef(null);
  const clicks = useRef(0);
  const markup = useMemo(() => boyInner(outfit), [outfit]);
  const live = useRef({ mood, nudge, hover: false, press: false });
  live.current.mood = mood;
  live.current.nudge = nudge;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const els = {};
    svg.querySelectorAll("[data-p]").forEach((el) => {
      const key = el.getAttribute("data-p");
      if (!els[key]) els[key] = el;
    });
    elsRef.current = els;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = createEngine({ formDir, reduceMotion: reduce });
    engineRef.current = engine;
    apply(
      els,
      engine.warm({
        mood: live.current.mood,
        gaze: { x: 0, y: 0 },
        wander: false,
        hover: false,
        press: false,
        nod: live.current.nudge,
        notice: pointer.notice,
      })
    );
  }, [formDir, outfit]);

  useEffect(() => {
    if (!active) return undefined;
    const svg = svgRef.current;
    const els = elsRef.current;
    const engine = engineRef.current;
    if (!svg || !els || !engine) return undefined;

    const unsubscribe = subscribe();
    let raf = 0;
    let last = performance.now();
    let rect = svg.getBoundingClientRect();
    let rectAt = last;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (now - rectAt > 100) {
        rect = svg.getBoundingClientRect();
        rectAt = now;
      }
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * (65 / 290);
      const gaze = {
        x: Math.tanh((pointer.x - cx) / 240),
        y: Math.tanh((pointer.y - cy) / 240),
      };
      const s = live.current;
      apply(
        els,
        engine.step(dt, now / 1000, {
          mood: s.mood,
          gaze,
          wander: now - pointer.moved > 3500,
          hover: s.hover,
          press: s.press,
          nod: s.nudge,
          notice: pointer.notice,
        })
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [active, formDir, outfit]);

  const handleClick = () => {
    if (mood === "loading" || mood === "success") return;
    clicks.current += 1;
    flash(clicks.current % 2 ? "happy" : "wave", 1700);
  };

  const bubble = BUBBLES[mood];

  return (
    <div
      className="boy-wrap"
      aria-hidden="true"
      onPointerEnter={() => (live.current.hover = true)}
      onPointerLeave={() => {
        live.current.hover = false;
        live.current.press = false;
      }}
      onPointerDown={() => (live.current.press = true)}
      onPointerUp={() => (live.current.press = false)}
      onClick={handleClick}
    >
      {active && bubble && (
        <span key={mood} className="boy-bubble">
          {mood === "loading" ? (
            <span className="boy-dots">
              <i />
              <i />
              <i />
            </span>
          ) : (
            bubble
          )}
        </span>
      )}
      <svg
        ref={svgRef}
        className="boy"
        viewBox={BOY_VIEWBOX}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}