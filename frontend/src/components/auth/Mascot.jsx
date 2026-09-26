import { useCallback, useEffect, useRef } from "react";
import { useMascot } from "./MascotContext";

const BUBBLES = {
  password: "I won't look!",
  peek: "Just a tiny peek...",
  success: "Yay!",
  error: "Oops!",
  wave: "Hi there!",
  happy: "Hehe!",
  loading: "dots",
};

function Mouth({ mood }) {
  switch (mood) {
    case "success":
    case "happy":
      return (
        <path
          className="mascot-line"
          d="M60 86 Q80 122 100 86 Z"
          style={{ fill: "var(--clay)" }}
          strokeLinejoin="round"
        />
      );
    case "loading":
      return (
        <ellipse
          className="mascot-line"
          cx="80"
          cy="100"
          rx="5"
          ry="6"
          style={{ fill: "var(--clay)" }}
        />
      );
    case "error":
      return (
        <path className="mascot-line" d="M64 104 Q80 90 96 104" fill="none" strokeLinecap="round" />
      );
    case "peek":
      return (
        <path className="mascot-line" d="M64 94 Q80 106 98 90" fill="none" strokeLinecap="round" />
      );
    default:
      return (
        <path className="mascot-line" d="M64 92 Q80 108 96 92" fill="none" strokeLinecap="round" />
      );
  }
}

/**
 * color    - body fill (css color / var)
 * ears     - "round" | "sprout"
 * formDir  - which way the form is relative to this character (-1 left, 1 right)
 */
export default function Mascot({ color = "var(--sand)", ears = "round", formDir = -1 }) {
  const { mood, nudge, flash } = useMascot();
  const svgRef = useRef(null);
  const nodRef = useRef(null);
  const cursor = useRef({ x: 0, y: 0 });
  const moodRef = useRef(mood);
  const raf = useRef(0);

  // Writes gaze direction as CSS variables (no re-render on every mouse move).
  const applyLook = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    let { x, y } = cursor.current;
    const m = moodRef.current;
    if (m === "typing" || m === "peek") {
      x = formDir;
      y = 0.35;
    } else if (m === "loading") {
      x = 0;
      y = -0.9;
    } else if (m === "error") {
      x = 0;
      y = 0.8;
    }
    el.style.setProperty("--look-x", x.toFixed(3));
    el.style.setProperty("--look-y", y.toFixed(3));
  }, [formDir]);

  useEffect(() => {
    moodRef.current = mood;
    applyLook();
  }, [mood, applyLook]);

  // Follow the cursor.
  useEffect(() => {
    const onMove = (e) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const el = svgRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.45);
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, dist / 260);
        cursor.current = { x: (dx / dist) * strength, y: (dy / dist) * strength };
        applyLook();
      });
    };
    const onLeave = () => {
      cursor.current = { x: 0, y: 0 };
      applyLook();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [applyLook]);

  // Small nod on every keystroke.
  useEffect(() => {
    if (!nudge) return;
    const g = nodRef.current;
    if (!g) return;
    g.classList.remove("is-nod");
    g.getBoundingClientRect(); // force reflow so the animation restarts
    g.classList.add("is-nod");
  }, [nudge]);

  const happy = mood === "success" || mood === "happy";
  const sad = mood === "error";
  const bubble = BUBBLES[mood];

  const handleClick = () => {
    if (mood === "loading" || mood === "success") return;
    flash("happy", 1300);
  };

  return (
    <div className="mascot-wrap" aria-hidden="true" onClick={handleClick}>
      {bubble && (
        <span key={mood} className="mascot-bubble">
          {mood === "loading" ? (
            <span className="mascot-dots">
              <i />
              <i />
              <i />
            </span>
          ) : (
            bubble
          )}
        </span>
      )}

      <svg ref={svgRef} className={`mascot mascot--${mood}`} viewBox="-10 -24 180 190">
        <g className="m-float">
          <g className="m-tilt">
            <g className="m-motion">
              <g className="m-nod" ref={nodRef}>
                {/* ears / sprout (behind the body) */}
                {ears === "round" ? (
                  <>
                    <circle className="mascot-line" cx="34" cy="26" r="16" style={{ fill: color }} />
                    <circle className="mascot-line" cx="126" cy="26" r="16" style={{ fill: color }} />
                    <circle cx="34" cy="27" r="7" fill="var(--clay)" opacity="0.45" />
                    <circle cx="126" cy="27" r="7" fill="var(--clay)" opacity="0.45" />
                  </>
                ) : (
                  <g className="m-sprout">
                    <path className="mascot-line" d="M80 16 Q76 2 84 -8" fill="none" strokeLinecap="round" />
                    <path
                      className="mascot-line"
                      d="M84 -8 Q100 -24 114 -10 Q100 2 84 -8 Z"
                      style={{ fill: "var(--sage)" }}
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* body */}
                <path
                  className="mascot-line"
                  style={{ fill: color }}
                  d="M80 12 C118 8 150 34 148 74 C146 116 116 140 78 138 C36 136 10 110 12 72 C14 36 44 16 80 12 Z"
                />

                {/* face */}
                <g className="m-face">
                  <circle className="m-cheek" cx="42" cy="90" r="8" />
                  <circle className="m-cheek" cx="118" cy="90" r="8" />

                  {sad && (
                    <g className="mascot-line" fill="none" strokeLinecap="round">
                      <path d="M46 60 L68 54" />
                      <path d="M92 54 L114 60" />
                    </g>
                  )}

                  {happy ? (
                    <g className="mascot-line" fill="none" strokeLinecap="round">
                      <path d="M50 78 Q58 64 66 78" />
                      <path d="M94 78 Q102 64 110 78" />
                    </g>
                  ) : (
                    <g className="m-look">
                      <g className="m-eye">
                        <ellipse cx="58" cy="72" rx="5.5" ry="7.5" fill="var(--ink)" />
                        <circle cx="60" cy="69" r="1.8" fill="var(--cream)" />
                      </g>
                      <g className="m-eye">
                        <ellipse cx="102" cy="72" rx="5.5" ry="7.5" fill="var(--ink)" />
                        <circle cx="104" cy="69" r="1.8" fill="var(--cream)" />
                      </g>
                    </g>
                  )}

                  {sad && <path className="m-tear" d="M44 84 Q40 92 44 96 Q48 92 44 84 Z" />}

                  <g key={mood} className="m-mouth">
                    <Mouth mood={mood} />
                  </g>
                </g>

                {/* hands (on top, so they can cover the eyes) */}
                <g className="m-hand m-hand--l">
                  <g className="m-hand-inner">
                    <circle className="mascot-line" cx="12" cy="102" r="11" style={{ fill: color }} />
                  </g>
                </g>
                <g className="m-hand m-hand--r">
                  <g className="m-hand-inner">
                    <circle className="mascot-line" cx="148" cy="102" r="11" style={{ fill: color }} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
