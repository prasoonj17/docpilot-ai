import { useEffect, useState } from "react";
import TextField from "./TextField";
import { useMascot } from "./MascotContext";
import { login } from "../../api/authApi";
import { validateEmail } from "../../utils/validators";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function LoginForm({ initialEmail = "", notice = "", onSuccess }) {
  const mascot = useMascot();
  const [values, setValues] = useState({ email: initialEmail, password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [pwShown, setPwShown] = useState(false);

  // Prefill email after a successful signup.
  useEffect(() => {
    if (initialEmail) setValues((v) => ({ ...v, email: initialEmail }));
  }, [initialEmail]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
    if (key !== "password") mascot.typed();
  };

  // Quick helper to fill test credentials
  const fillTestCredentials = () => {
    setValues({
      email: "test@gmail.com",
      password: "Test@123",
    });
    setErrors({});
    setServerError("");
    mascot.flash("happy", 1200);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {
      email: validateEmail(values.email),
      password: values.password ? "" : "Enter your password.",
    };
    setErrors(next);
    setServerError("");
    if (Object.values(next).some(Boolean)) {
      mascot.flash("error", 1500);
      return;
    }

    setStatus("loading");
    mascot.hold("loading");
    try {
      const data = await login({
        email: values.email.trim(),
        password: values.password,
      });
      setStatus("success");
      mascot.flash("success", 1500);
      await wait(1300);
      onSuccess(data);
    } catch (err) {
      setServerError(err.message);
      setStatus("idle");
      mascot.flash("error", 1800);
    }
  }

  const label = { idle: "Log in", loading: "Logging in...", success: "You're in!" }[status];

  return (
    <form className="panel-inner" onSubmit={handleSubmit} noValidate>
      <h1>Hey, welcome back</h1>
      <p className="sub">Log in to keep going.</p>

      {/* Demo Credentials Box */}
      <div
        style={{
          background: "rgba(218, 184, 157, 0.25)",
          border: "2px dashed var(--ink)",
          borderRadius: "14px",
          padding: "10px 14px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.82rem",
          fontWeight: "700",
          color: "var(--ink)",
        }}
      >
        <div>
          <div>👤 <code>test@gmail.com</code></div>
          <div>🔑 <code>Test@123</code></div>
        </div>
        <button
          type="button"
          onClick={fillTestCredentials}
          style={{
            padding: "4px 10px",
            fontSize: "0.75rem",
            fontWeight: "800",
            borderRadius: "999px",
            border: "1.5px solid var(--ink)",
            background: "var(--cream)",
            color: "var(--ink)",
            cursor: "pointer",
          }}
        >
          Auto-fill
        </button>
      </div>

      <div className="stack">
        {notice && (
          <p className="alert alert--success" role="status">
            {notice}
          </p>
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          onFocus={() => mascot.setBase("typing")}
          onBlur={() => mascot.setBase("idle")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          onFocus={() => mascot.setBase(pwShown ? "peek" : "password")}
          onBlur={() => mascot.setBase("idle")}
          onToggleShow={(shown) => {
            setPwShown(shown);
            mascot.setBase(shown ? "peek" : "password");
          }}
        />
        {serverError && (
          <p className="alert alert--error" role="alert">
            {serverError}
          </p>
        )}
        <button className="btn btn--block" type="submit" disabled={status !== "idle"}>
          {label}
        </button>
      </div>
    </form>
  );
}