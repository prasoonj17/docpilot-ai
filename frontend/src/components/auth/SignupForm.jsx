import { useState } from "react";
import TextField from "./TextField";
import { useMascot } from "./MascotContext";
import { register } from "../../api/authApi";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../../utils/validators";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function SignupForm({ onSuccess }) {
  const mascot = useMascot();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [pwShown, setPwShown] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
    if (key !== "password") mascot.typed();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
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
      const email = values.email.trim();
      await register({ name: values.name.trim(), email, password: values.password });
      setStatus("success");
      mascot.flash("success", 1500);
      await wait(1000);
      setValues({ name: "", email: "", password: "" });
      setStatus("idle");
      onSuccess(email);
    } catch (err) {
      setServerError(err.message);
      setStatus("idle");
      mascot.flash("error", 1800);
    }
  }

  const label = {
    idle: "Create account",
    loading: "Creating account...",
    success: "Account created!",
  }[status];

  return (
    <form className="panel-inner" onSubmit={handleSubmit} noValidate>
      <h1>Let's get you set up</h1>
      <p className="sub">Takes less than a minute.</p>

      <div className="stack">
        <TextField
          label="Name"
          autoComplete="name"
          placeholder="What should we call you?"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          onFocus={() => mascot.setBase("typing")}
          onBlur={() => mascot.setBase("idle")}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
