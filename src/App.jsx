// src/App.jsx
import React, { useState } from "react";
import "@google/model-viewer";
import "./index.css";
import "./styles/subjects.css"; // optional if SubjectsPage already imports it


import Welcome from "./components/welcome"; // keep your existing welcome
import SearchBar from "./components/SearchBar"; // keep existing searchbar if used in viewer
import Topbar from "./components/Topbar";      // new topbar
import SubjectsPage from "./components/SubjectsPage"; // new subjects page



// ... in render when showing selectedModel (for heart) ...



/* SUBJECTS map — update images to point to public assets */
// inside src/App.jsx (replace the old SUBJECTS constant)
const SUBJECTS = {
  Biology: {
    
    // file located at src/assets/subjects/bio.png
    image: new URL("./assets/subjects/bio.png", import.meta.url).href,
    models: {
      "Human Heart (full)": "/biology/heart2.glb",
      "Human Brain (full)": "/biology/brain_full.glb",
      "Lung": "/biology/lungs.glb",
      "Liver": "/biology/liver.glb",
      "Kidney": "/biology/kidney.glb",
      "Ear":"/biology/ear.glb"
    
      

    },
  },

  Chemistry: {
    image: new URL("./assets/subjects/chem.png", import.meta.url).href,
    models: {
      "Water molecule (H2O)": "/chemistry/water_h2o.glb",
      "Beaker + liquid": "/chemistry/beaker.glb",
    },
  },

  Physics: {
    image: new URL("./assets/subjects/phy.png", import.meta.url).href, // or physics.png if you have that
    models: {
      "Atom model (Bohr)": "/physics/atom_bohr.glb",
      "Pendulum demo": "/physics/pendulum.glb",
    },
  },

  Mathematics: {
    image: new URL("./assets/subjects/maths.png", import.meta.url).href,
    models: {
      "Pi sign (3D)": "/math/pi.glb",
      "3D axes": "/math/axes.glb",
    },
  },

  Geography: {
    image: new URL("./assets/subjects/geo.png", import.meta.url).href,
    models: {
      "Solar System": "/geography/solar-system.glb",
      "World Globe": "/geography/globe.glb",
    },
  },

  Art: {
    image: new URL("./assets/subjects/art.png", import.meta.url).href,
    models: {
      "Sculpture sample": "/art/sculpture.glb",
    },
  },

  History: {
    image: new URL("./assets/subjects/his.png", import.meta.url).href,
    models: {
      "Taj Mahal": "/history/tajmahal.glb",
    },
  },

  Computer: {
    image: new URL("./assets/subjects/comp.png", import.meta.url).href,
    models: {
      "Robot Head": "/computer/robot_head.glb",
    },
  },
};


export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("grid"); // 'grid' | 'viewer'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const handleOpenSubject = (subjectKey) => {
    setSelectedSubject(subjectKey);
    const subj = SUBJECTS[subjectKey];
    const firstModel = subj && Object.values(subj.models)[0];
    setSelectedModel(firstModel || null);
    setCurrentScreen("viewer");
  };

  const handleBackToGrid = () => {
    setCurrentScreen("grid");
    setSelectedSubject(null);
    setSelectedModel(null);
  };

  // topbar always shown once Welcome dismissed
  if (showWelcome) {
    return (
      <div className="app-root">
        <Welcome
          onStart={() => {
            setShowWelcome(false);
            setCurrentScreen("grid");
          }}
          onHome={() => setShowWelcome(true)}
        />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Topbar onSearch={()=> { /* optionally wire search to filter subjects */ }} />

      <main className="main-content">
        {/* SUBJECTS GRID PAGE (NEW UI) */}
        {currentScreen === "grid" && (
          <SubjectsPage subjects={SUBJECTS} onSelectSubject={handleOpenSubject} />
        )}

        {/* VIEWER (unchanged) */}
        {currentScreen === "viewer" && selectedSubject && (
          <section className="viewer-screen">
            <div className="viewer-header">
              <button className="back-btn" onClick={handleBackToGrid}>← Back</button>
              <h2 className="subject-title">{selectedSubject}</h2>
            </div>

            {Object.keys(SUBJECTS[selectedSubject].models).length > 0 ? (
              <>
                <div className="model-select-row">
                  <SearchBar
                    options={Object.entries(SUBJECTS[selectedSubject].models).map(([label, path]) => ({ label, value: path }))}
                    placeholder="Search models (e.g. Heart, Brain, Volcano)..."
                    onSelect={(opt) => setSelectedModel(opt.value)}
                  />
                </div>

                <div className="model-frame">
                  {selectedModel ? (
                    <model-viewer src={selectedModel} alt="3D Model" camera-controls auto-rotate ar style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <div className="model-empty">No model selected</div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-models">No 3D models available for this subject yet.</div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
