// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";

export default function SearchBar({ options = [], placeholder = "Search...", onSelect }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(options);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef();

  useEffect(() => {
    setFiltered(
      options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    );
    setActive(0);
  }, [query, options]);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  const choose = (opt) => {
    setQuery(opt.label);
    setOpen(false);
    if (onSelect) onSelect(opt);
  };

  return (
    <div className="searchbar-wrap" ref={wrapRef}>
      <input
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={handleKey}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="search-list">
          {filtered.length === 0 ? (
            <div className="search-item empty">No results</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={opt.value}
                className={`search-item ${i === active ? "active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={() => choose(opt)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
