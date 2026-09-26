import { useEffect, useRef, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import OverlayPanel from "./OverlayPanel";
import { MascotProvider, useMascot } from "./MascotContext";

function AuthCardInner({ initialMode = "login", onAuthenticated, onModeChange }) {
  const { setBase, flash } = useMascot();
  const [mode, setMode] = useState(initialMode);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [notice, setNotice] = useState("");
  const firstRender = useRef(true);
  const isSignup = mode === "signup";

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const delay = firstRender.current ? 900 : 700;
    firstRender.current = false;
    setBase("idle");
    const id = setTimeout(() => flash("wave", 2200), delay);
    return () => clearTimeout(id);
  }, [mode, setBase, flash]);

  const switchTo = (next) => {
    setNotice("");
    setMode(next);
    onModeChange?.(next);
  };

  const handleRegistered = (email) => {
    setPrefillEmail(email);
    setNotice("Account created! Log in to continue.");
    switchTo("login");
  };

  return (
    <section className={`auth-card ${isSignup ? "is-signup" : ""}`}>
      <div className={`panel panel--login ${!isSignup ? "is-active" : ""}`}>
        <LoginForm
          initialEmail={prefillEmail}
          notice={notice}
          onSuccess={onAuthenticated}
        />
      </div>

      <div className={`panel panel--signup ${isSignup ? "is-active" : ""}`}>
        <SignupForm onSuccess={handleRegistered} />
      </div>

      <OverlayPanel isSignup={isSignup} onSwitch={switchTo} />

      <p className="mobile-switch">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button type="button" onClick={() => switchTo(isSignup ? "login" : "signup")}>
          {isSignup ? "Log in" : "Create account"}
        </button>
      </p>
    </section>
  );
}

export default function AuthCard(props) {
  return (
    <MascotProvider>
      <AuthCardInner {...props} />
    </MascotProvider>
  );
}