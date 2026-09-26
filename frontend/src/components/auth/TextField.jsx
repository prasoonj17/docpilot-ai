import { useId, useState } from "react";

export default function TextField({
  label,
  type = "text",
  error,
  onFocus,
  onBlur,
  onToggleShow,
  ...rest
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  // Fire onBlur only when focus leaves the whole control (input + show button).
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.();
  };

  const toggle = () => {
    const next = !show;
    setShow(next);
    onToggleShow?.(next);
  };

  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div
        className={`field-control ${isPassword ? "has-toggle" : ""}`}
        onFocus={() => onFocus?.()}
        onBlur={handleBlur}
      >
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={toggle}
            onMouseDown={(e) => e.preventDefault()}
            aria-pressed={show}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
