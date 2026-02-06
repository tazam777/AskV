import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const playgroundRef = useRef(null);
  const noRef = useRef(null);

  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");

  // stable hearts (don’t reshuffle every render)
  const hearts = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      duration: `${8 + Math.random() * 10}s`,
      delay: `${-Math.random() * 10}s`,
      scale: `${0.7 + Math.random() * 1.1}`,
      opacity: `${0.15 + Math.random() * 0.25}`,
    }));
  }, []);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;

  const moveNoButton = () => {
    const box = playgroundRef.current;
    const btn = noRef.current;
    if (!box || !btn) return;

    const c = box.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const pad = 14;
    const maxX = c.width - b.width - pad;
    const maxY = c.height - b.height - pad;

    const x = clamp(rand(pad, maxX), pad, maxX);
    const y = clamp(rand(pad, maxY), pad, maxY);

    // smooth because CSS transition is on .no
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
  };

  useEffect(() => {
    // initial position inside playground
    const box = playgroundRef.current;
    const btn = noRef.current;
    if (!box || !btn) return;

    const c = box.getBoundingClientRect();
    btn.style.left = `${Math.floor(c.width * 0.62)}px`;
    btn.style.top = `${Math.floor(c.height * 0.58)}px`;
  }, []);

  const onYes = () => {
    setAccepted(true);
    setMessage("YAY. Okay now you’re officially stuck with me.");

    // quick confetti burst (lightweight, no libs)
    const burst = document.createElement("div");
    burst.className = "burst";
    burst.textContent = "💘 💞 💝 💖 💗 💓";
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 2200);
  };

  const onPlaygroundPointerMove = (e) => {
    if (accepted) return;

    const btn = noRef.current;
    if (!btn) return;

    const b = btn.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 160) moveNoButton();
  };

  return (
    <div className="page">
      <div className="bgHearts" aria-hidden="true">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{
              left: h.left,
              animationDuration: h.duration,
              animationDelay: h.delay,
              transform: `scale(${h.scale}) rotate(45deg)`,
              opacity: h.opacity,
            }}
          />
        ))}
      </div>

      <main className="card" role="main">
        <h1 className="title">Will you be my Valentine?</h1>
        <p className="sub">Be honest. But also… choose wisely.</p>

        <div
          className="playground"
          ref={playgroundRef}
          onPointerMove={onPlaygroundPointerMove}
          aria-label="Valentine playground"
        >
          <button className="btn yes" onClick={onYes} disabled={accepted}>
            Yes
          </button>

          <button
            className="btn no"
            ref={noRef}
            disabled={accepted}
            onMouseEnter={() => !accepted && moveNoButton()}
            onPointerDown={(e) => {
              if (accepted) return;
              e.preventDefault();
              moveNoButton();
            }}
          >
            No
          </button>
        </div>

        <div className="hint">Tip: the “No” button is… shy.</div>
        <div className="result" aria-live="polite">{message}</div>

        <div className="footer">Made with questionable engineering and good intentions.</div>
      </main>
    </div>
  );
}
