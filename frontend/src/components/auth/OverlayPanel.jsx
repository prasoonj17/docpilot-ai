import Boy from "../character/Boy";

export default function OverlayPanel({ isSignup, onSwitch }) {
  return (
    <div className="overlay-wrap">
      <div className="overlay">
        {/* Shown when the signup form is open (form is on the right) */}
        <div className="overlay-side overlay-side--left" aria-hidden={!isSignup}>
          <Boy formDir={1} active={isSignup} outfit="cream" />
          <h2>Welcome back!</h2>
          <p>Already part of the crew? Log in and pick up where you left off.</p>
          <button
            type="button"
            className="btn btn--ghost"
            tabIndex={isSignup ? 0 : -1}
            onClick={() => onSwitch("login")}
          >
            Log in
          </button>
        </div>

        {/* Shown when the login form is open (form is on the left) */}
        <div className="overlay-side overlay-side--right" aria-hidden={isSignup}>
          <Boy formDir={-1} active={!isSignup} outfit="cream" />
          <h2>First time here?</h2>
          <p>Make an account and jump in. It's quick, promise.</p>
          <button
            type="button"
            className="btn btn--ghost"
            tabIndex={isSignup ? -1 : 0}
            onClick={() => onSwitch("signup")}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
