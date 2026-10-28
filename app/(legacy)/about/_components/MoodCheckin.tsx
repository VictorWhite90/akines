"use client";

import { useState } from "react";

const MOODS = [
  { face: "😞", label: "Low", reply: "Thank you for being honest. Would quiet company help?" },
  { face: "😕", label: "Unsettled", reply: "That's okay. A small, gentle room might feel right today." },
  { face: "😐", label: "Okay", reply: "Steady is good. Want a low-pressure way to connect?" },
  { face: "🙂", label: "Good", reply: "Lovely. Maybe make something with someone today?" },
  { face: "😄", label: "Great", reply: "Love that energy. Bring it to a KinCircle or a Banter." },
];

export default function MoodCheckin() {
  const [mood, setMood] = useState(0);

  return (
    <div className="ak-mood">
      <div className="ak-mood-options" role="radiogroup" aria-label="How are you arriving today?">
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            type="button"
            role="radio"
            aria-checked={i === mood}
            aria-label={m.label}
            className={`ak-mood-option${i === mood ? " is-active" : ""}`}
            onClick={() => setMood(i)}
          >
            <span aria-hidden>{m.face}</span>
          </button>
        ))}
      </div>
      <p className="ak-mood-reply" aria-live="polite">{MOODS[mood].reply}</p>
    </div>
  );
}
