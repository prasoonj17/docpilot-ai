import React, { useEffect, useState } from "react";

export default function PetCompanion({ state = "idle", boySpeech = "" }) {
  const [dogAction, setDogAction] = useState(state);

  useEffect(() => {
    setDogAction(state);
  }, [state]);

  return (
    <div className={`companion-stage status-${dogAction}`}>
      {boySpeech && (
        <div className="companion-bubble" role="status">
          {boySpeech}
        </div>
      )}

      <div className="characters-wrap">
        {/* Boy Character */}
        <div className="boy-avatar">
          <svg viewBox="0 0 100 120" width="70" height="90" fill="none">
            <circle cx="50" cy="40" r="28" fill="#e1ddd3" stroke="#302b2d" strokeWidth="4" />
            <path d="M22 36 C24 16, 76 16, 78 36 Z" fill="#4a2e1f" stroke="#302b2d" strokeWidth="3" />
            {/* Eyes */}
            <circle cx="42" cy="42" r="3.5" fill="#302b2d" />
            <circle cx="58" cy="42" r="3.5" fill="#302b2d" />
            {/* Expression */}
            {state === "searching" ? (
              <path d="M44 54 Q50 49 56 54" stroke="#302b2d" strokeWidth="3" fill="none" />
            ) : (
              <path d="M43 51 Q50 58 57 51" stroke="#302b2d" strokeWidth="3" fill="none" />
            )}
            {/* Body */}
            <path d="M30 68 L70 68 L76 110 L24 110 Z" fill="#dab89d" stroke="#302b2d" strokeWidth="4" />
          </svg>
        </div>

        {/* Dog Character */}
        <div className={`dog-avatar dog-${dogAction}`}>
          <svg viewBox="0 0 120 90" width="85" height="70" fill="none">
            {/* Tail */}
            <path className="dog-tail" d="M18 52 Q6 35 14 26" stroke="#4a2e1f" strokeWidth="6" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="56" cy="56" rx="34" ry="22" fill="#dab89d" stroke="#302b2d" strokeWidth="4" />
            {/* Head */}
            <circle cx="86" cy="38" r="18" fill="#e1ddd3" stroke="#302b2d" strokeWidth="4" />
            {/* Ear */}
            <path d="M78 26 C72 16, 64 36, 74 42 Z" fill="#6a4a34" stroke="#302b2d" strokeWidth="3" />
            {/* Eye */}
            {dogAction === "sleeping" ? (
              <path d="M86 36 Q91 40 96 36" stroke="#302b2d" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <circle cx="92" cy="36" r="3" fill="#302b2d" />
            )}
            {/* Snout */}
            <ellipse cx="98" cy="42" rx="7" ry="5" fill="#f7f4ed" stroke="#302b2d" strokeWidth="2.5" />
            <circle cx="102" cy="40" r="2.5" fill="#302b2d" />
            {/* Legs */}
            <path d="M42 76 L40 88 M68 76 L70 88" stroke="#302b2d" strokeWidth="5" strokeLinecap="round" />
          </svg>
          {dogAction === "barking" && <span className="bark-tag">WOOF! 🐾</span>}
          {dogAction === "sleeping" && <span className="sleep-tag">Zzz...</span>}
        </div>
      </div>
    </div>
  );
}