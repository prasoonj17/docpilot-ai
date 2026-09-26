import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
  Moods: idle | typing | password | peek | loading | success | error | wave | happy

  setBase(m)  -> the "resting" mood while the user is doing something (focus in a field)
  flash(m,ms) -> temporary mood, then falls back to the resting mood
  hold(m)     -> stays until the next flash (used for "loading")
  typed()     -> tiny nod on every keystroke
*/
const noop = () => {};
const MascotContext = createContext({
  mood: "idle",
  nudge: 0,
  setBase: noop,
  flash: noop,
  hold: noop,
  typed: noop,
});

export const useMascot = () => useContext(MascotContext);

export function MascotProvider({ children }) {
  const [mood, setMood] = useState("idle");
  const [nudge, setNudge] = useState(0);
  const base = useRef("idle");
  const busy = useRef(false);
  const timer = useRef(null);

  const setBase = useCallback((m) => {
    base.current = m;
    if (!busy.current) setMood(m);
  }, []);

  const flash = useCallback((m, ms = 1600) => {
    clearTimeout(timer.current);
    busy.current = true;
    setMood(m);
    timer.current = setTimeout(() => {
      busy.current = false;
      timer.current = null;
      setMood(base.current);
    }, ms);
  }, []);

  const hold = useCallback((m) => {
    clearTimeout(timer.current);
    timer.current = null;
    busy.current = true;
    setMood(m);
  }, []);

  const typed = useCallback(() => setNudge((n) => n + 1), []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({ mood, nudge, setBase, flash, hold, typed }),
    [mood, nudge, setBase, flash, hold, typed]
  );

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}
