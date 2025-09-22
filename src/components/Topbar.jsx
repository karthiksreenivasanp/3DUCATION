// src/components/Topbar.jsx
import React from "react";
import "./Topbar.css";

export default function Topbar({ onSearch }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-3d">3D</span><span className="brand-rest">UATION</span>
        </div>

        <nav className="top-nav">
          <a className="nav-link" href="#" onClick={(e)=>e.preventDefault()}>Home</a>
          <a className="nav-link active" href="#" onClick={(e)=>e.preventDefault()}>Subjects</a>
          <a className="nav-link" href="#" onClick={(e)=>e.preventDefault()}>AI Chat</a>
          <a className="nav-link" href="#" onClick={(e)=>e.preventDefault()}>3D Models</a>
        </nav>

        <div className="search-wrap">
          <input
            className="top-search"
            placeholder="Search subjects..."
            onChange={(e)=> onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
