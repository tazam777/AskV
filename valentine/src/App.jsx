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
      scale: 0.7 + Math.random() * 1.1,
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, []);

  const rand = (min, max) => Math.random() * (max - min) + min;

  const moveNoButton = () => {
    const box = playgroundRef.current;
    const btn = noRef.current;
    if (!box || !btn) return;

    const yesBtn = box.querySelector(".yes");
    if (!yesBtn) return;

    const c = box.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const y = yesBtn.getBoundingClientRect();

    // Since .no uses transform: translate(-50%, -50%),
    // left/top are the *center* of the button.
    const pad = 12;
    const halfW = b.width / 2;
    const halfH = b.height / 2;

    const minX = pad + halfW;
    const maxX = c.width - pad - halfW;
    const minY = pad + halfH;
    const maxY = c.height - pad - halfH;

    if (maxX <= minX || maxY <= minY) return;

    // YES center in playground coords
    const yesCx = y.left - c.left + y.width / 2;
    const yesCy = y.top - c.top + y.height / 2;

    // Minimum separation so NO never overlaps YES (plus an extra gap)
    const gap = 18;
    const minDist =
      Math.max(b.width, y.width) / 2 +
      Math.max(b.height, y.height) / 2 +
      gap;

    // Try a bunch of random spots until we find one far enough from YES
    for (let i = 0; i < 35; i++) {
      const x = rand(minX, maxX);
      const yy = rand(minY, maxY);

      const dx = x - yesCx;
      const dy = yy - yesCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= minDist) {
        btn.style.left = `${x}px`;
        btn.style.top = `${yy}px`;
        return;
      }
    }

    // Fallback: opposite side of YES
    const fallbackX = yesCx < c.width / 2 ? maxX : minX;
    const fallbackY = yesCy < c.height / 2 ? maxY : minY;
    btn.style.left = `${fallbackX}px`;
    btn.style.top = `${fallbackY}px`;
  };

  useEffect(() => {
    const placeNo = () => {
      const box = playgroundRef.current;
      const noBtn = noRef.current;
      if (!box || !noBtn) return;
  
      const yesBtn = box.querySelector(".yes");
      if (!yesBtn) return;
  
      const c = box.getBoundingClientRect();
      const y = yesBtn.getBoundingClientRect();
  
      // Exact YES center inside playground
      const yesCenterY = (y.top - c.top) + y.height / 2;
  
      // Place NO same vertical level
      noBtn.style.left = `${c.width * 0.68}px`;
      noBtn.style.top = `${yesCenterY}px`;
    };
  
    // Delay a tick so layout fully settles (important on mobile)
    setTimeout(placeNo, 50);
  
    window.addEventListener("resize", placeNo);
    return () => window.removeEventListener("resize", placeNo);
  }, []);
  
  const onYes = () => {
    setAccepted(true);
    setMessage("YAY. Okay now you’re officially stuck with me.");

    const burst = document.createElement("div");
    burst.className = "burst";
    burst.textContent = "💘 💞 💝 💖 💗";
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

    // More forgiving on mobile
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
        <div className="result" aria-live="polite">
          {message}
        </div>

        <div className="footer">
          Made with love for my Pookie.
        </div>
      </main>
    </div>
  );
}
