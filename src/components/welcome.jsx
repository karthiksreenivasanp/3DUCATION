// src/components/Welcome.jsx
import React, { useEffect, useRef, useState } from "react";

/* background + icons */
const skyImg = new URL("../assets/sky.png", import.meta.url).href;
const mountainImg = new URL("../assets/mountain.png", import.meta.url).href;

const bioImg = new URL("../assets/dna.png", import.meta.url).href;
const chemImg = new URL("../assets/micro.png", import.meta.url).href;
const phyImg = new URL("../assets/book.png", import.meta.url).href;
const geoImg = new URL("../assets/pi.png", import.meta.url).href;
const histImg = new URL("../assets/atom.png", import.meta.url).href;

const pencilImg = new URL("../assets/pencil.png", import.meta.url).href;
const rocketImg = new URL("../assets/rocket.png", import.meta.url).href;
const robotImg = new URL("../assets/robort.png", import.meta.url).href;

/* kid image behind the start button */
const kidImg = new URL("../assets/kid.png", import.meta.url).href;

export default function Welcome({ onStart = () => {} }) {
  const skyRef = useRef(null);
  const mountainRef = useRef(null);

  const subjectRefs = useRef({
    bio: { current: null },
    chem: { current: null },
    phy: { current: null },
    geo: { current: null },
    hist: { current: null },
    pencil: { current: null },
    rocket: { current: null },
    robot: { current: null },
  });

  // start + kid refs
  const startBtnRef = useRef(null);
  const kidRef = useRef(null);

  // parallax refs
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // whether cursor is near start button
  const [nearStart, setNearStart] = useState(false);

  // fixed positions (8 icons)
  const positions = [
    { top: 20, left: 10, scale: 1, rot: 0 }, // bio
    { top: 20, left: 80, scale: 1, rot: 0 }, // chem
    { top: 70, left: 15, scale: 1, rot: 0 }, // phy
    { top: 70, left: 75, scale: 1, rot: 0 }, // geo
    { top: 45, left: 5, scale: 1, rot: 0 }, // hist
    { top: 80, left: 45, scale: 1.1, rot: -10 }, // pencil
    { top: 5, left: 50, scale: 1.2, rot: 5 }, // rocket
    { top: 50, left: 90, scale: 1, rot: 0 }, // robot
  ];

  // entrance animation state
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // main parallax loop
  useEffect(() => {
    const handleMove = (e) => {
      if (!e) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = cx / w - 0.5;
      const ny = cy / h - 0.5;

      // global strength
      target.current.x = nx * -80;
      target.current.y = ny * -40;

      // proximity detection to start button
      if (startBtnRef.current) {
        const rect = startBtnRef.current.getBoundingClientRect();
        const bx = rect.left + rect.width / 2;
        const by = rect.top + rect.height / 2;
        const dx = cx - bx;
        const dy = cy - by;
        const dist = Math.hypot(dx, dy);

        // threshold radius: 160px (adjustable)
        const THRESHOLD = 160;
        const isNear = dist <= THRESHOLD;
        setNearStart((prev) => (prev === isNear ? prev : isNear));
      }
    };

    const handleLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      setNearStart(false);
    };

    const tick = () => {
      const ease = 0.12;
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

      // sky movement
      if (skyRef.current) {
        skyRef.current.style.transform = `translate3d(${Math.round(
          current.current.x
        )}px, ${Math.round(current.current.y)}px, 0) scale(1.02)`;
      }

      // element multipliers
      const mult = {
        bio: 0.42,
        chem: -0.28,
        phy: 0.6,
        geo: -0.4,
        hist: 0.36,
        pencil: 0.9,
        rocket: 1.2,
        robot: 0.28,
      };

      Object.keys(subjectRefs.current).forEach((k) => {
        const el = subjectRefs.current[k].current;
        if (!el) return;
        const m = mult[k] ?? 0.4;
        const sx = Math.round(current.current.x * m);
        const sy = Math.round(current.current.y * m);
        el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseout", handleLeave);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseout", handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // animate kid when nearStart changes (JS not strictly needed because CSS handles transitions,
  // but we keep a small JS nudge for accessibility: ensure kid transform uses updated nearStart)
  useEffect(() => {
    if (!kidRef.current || !startBtnRef.current) return;
    // we set a CSS class via state (nearStart) — CSS handles the visual growth.
    // No more JS transform here.
  }, [nearStart]);

  const triggerExit = () => {
    setExiting(true);
    setTimeout(() => onStart(), 420);
  };

  // enlarge start button when nearStart; kid visible/pop
  return (
    <section
      className={`welcome-multi ${mounted ? "welcome--in" : ""} ${
        exiting ? "welcome--exit" : ""
      }`}
      aria-label="Welcome to 3DCATION"
    >
      <div
        ref={skyRef}
        className="layer layer-sky welcome-bg"
        style={{ backgroundImage: `url(${skyImg})` }}
      />
      <div
        ref={mountainRef}
        className="layer layer-mountains"
        style={{ backgroundImage: `url(${mountainImg})` }}
      />

      {/* floating icons */}
      {[
        { key: "bio", img: bioImg, alt: "Biology" },
        { key: "chem", img: chemImg, alt: "Chemistry" },
        { key: "phy", img: phyImg, alt: "Physics" },
        { key: "geo", img: geoImg, alt: "Geography" },
        { key: "hist", img: histImg, alt: "History" },
        { key: "pencil", img: pencilImg, alt: "Pencil" },
        { key: "rocket", img: rocketImg, alt: "Rocket" },
        { key: "robot", img: robotImg, alt: "Robot" },
      ].map((item, idx) => (
        <img
          key={item.key}
          ref={(el) => (subjectRefs.current[item.key].current = el)}
          className={`subject-icon ${item.key}`}
          src={item.img}
          alt={item.alt}
          style={{
            top: `${positions[idx].top}%`,
            left: `${positions[idx].left}%`,
            transform: `translate3d(0,0,0) scale(${positions[idx].scale}) rotate(${positions[idx].rot}deg)`,
          }}
        />
      ))}

      {/* center UI */}
      <div className="welcome-ui" style={{ background: "transparent" }}>
        <div className="welcome-center" style={{ pointerEvents: "none" }}>
          <h1 className="brand-title welcome-title" style={{ pointerEvents: "auto" }}>
            3DCATION
          </h1>

          <p className="brand-sub brand-sub--accent" style={{ pointerEvents: "auto" }}>
            Explore Science, Geography and History with immersive 3D models.
          </p>

          {/* start wrapper centered; pointer-events on wrapper allow button clicks */}
          <div
            className="start-wrapper"
            style={{ pointerEvents: "auto" }}
            aria-hidden={false}
          >
            {/* kid behind */}
            <img
              ref={kidRef}
              src={kidImg}
              alt=""
              className={`kid-behind ${nearStart ? "kid--pop" : ""}`}
              aria-hidden="true"
            />

            {/* start button */}
            <button
              ref={startBtnRef}
              className={`start-btn ${nearStart ? "start--pop" : ""}`}
              onClick={triggerExit}
              aria-label="Start"
            >
              <span className="btn-inner">Start</span>
            </button>
          </div>
        </div>

        <footer className="welcome-footer welcome-credits">Designed for curious students ✨</footer>
      </div>
    </section>
  );
}
