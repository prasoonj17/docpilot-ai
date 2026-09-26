export const validateName = (v) =>
  v.trim().length < 2 ? "Add your name (2+ characters)." : "";

export const validateEmail = (v) =>
  /^\S+@\S+\.\S+$/.test(v.trim())
    ? ""
    : "Enter a valid email like you@example.com.";

export const validatePassword = (v) =>
  v.length < 8 ? "Use at least 8 characters." : "";
