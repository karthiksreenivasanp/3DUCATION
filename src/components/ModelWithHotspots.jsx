// src/components/ModelWithHotspots.jsx
import React, { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import "./model-hotspots.css"; // create this file (CSS below)

export default function ModelWithHotspots({ src, hotspots = [] }) {
  const viewerRef = useRef(null);
  const [openInfo, setOpenInfo] = useState(null); // hotspot id currently open

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    // Attach click listeners for the hotspot buttons rendered inside model-viewer
    // We render plain buttons in React (slot="hotspot-N") so need no special native listeners.
    return () => {
      // cleanup if needed (no persistent listeners added)
    };
  }, [hotspots]);

  return (
    <div className="model-with-hotspots">
      <model-viewer
        ref={viewerRef}
        src={src}
        alt="3D Model"
        camera-controls
        auto-rotate
        ar
        shadow-intensity="0.8"
        exposure="1"
        style={{ width: "100%", height: "640px", background: "#0b0b0b" }}
      >
        {/* Render each hotspot as a button in a named slot */}
        {hotspots.map((h, i) => {
          // model-viewer expects hotspot elements to have slot="hotspot-N"
          // and data-position / data-normal attributes (3 numbers)
          const slotName = `hotspot-${i + 1}`;
          const pos = Array.isArray(h.position) ? h.position.join(" ") : h.position;
          const normal = Array.isArray(h.normal) ? h.normal.join(" ") : (h.normal || "0 1 0");
          return (
            <button
              key={h.id || i}
              slot={slotName}
              className="model-hotspot-btn"
              data-position={pos}
              data-normal={normal}
              aria-label={h.label}
              onClick={(ev) => {
                ev.stopPropagation();
                setOpenInfo({ id: h.id ?? i, label: h.label, desc: h.desc, x: h.position[0], y: h.position[1], z: h.position[2] });
              }}
            >
              <div className="hotspot-circle">{i + 1}</div>
            </button>
          );
        })}
      </model-viewer>

      {/* Info drawer / popup */}
      <div className={`hotspot-info ${openInfo ? "open" : ""}`}>
        {openInfo && (
          <>
            <button className="hotspot-info-close" onClick={() => setOpenInfo(null)}>✕</button>
            <h3>{openInfo.label}</h3>
            <p>{openInfo.desc}</p>
            <small className="hotspot-coords">Coords: {openInfo.x}, {openInfo.y}, {openInfo.z}</small>
          </>
        )}
      </div>
    </div>
  );
}
