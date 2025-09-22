// src/components/SubjectsPage.jsx
import React from "react";
import "./SubjectsPage.css";

export default function SubjectsPage({ subjects = {}, onSelectSubject }) {
  return (
    <div className="subjects-page">
      {/* Hero / Welcome-like top (matches screenshot) */}
      <section className="subjects-hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span className="accent">3D</span>UCATION</h1>
          <p className="hero-sub">Dive into interactive lessons and 3D models across various subjects. Enhance your learning experience with our AI chat feature.</p>
          <button className="hero-cta" onClick={() => { /* optionally trigger something */ }}>Get Started</button>
        </div>
      </section>

      {/* Subjects row */}
      <section className="subjects-row">
        <h2 className="subjects-row-title">Our Subjects</h2>

        <div className="subjects-cards">
          {Object.entries(subjects).map(([key, meta]) => (
            <button
              key={key}
              className="subject-card"
              onClick={() => onSelectSubject && onSelectSubject(key)}
            >
              <div className="card-inner">
                <div className="icon-wrap">
                  {/* Use image from meta.image (should be public path) */}
                  <img src={meta.image} alt={key} className="subject-icon" />
                </div>
                <div className="subject-label">{key}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <footer className="subjects-footer">© 2025 3DUATION. All rights reserved.</footer>
    </div>
  );
}
