// src/components/HeartExplorer.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import Fuse from "fuse.js";
import "./heart.css"; // small overlay style

// quick synonyms -> canonical part mapping (example)
const heartParts = {
  "left atrium": ["left atrium", "upper left chamber", "left upper chamber"],
  "right atrium": ["right atrium", "upper right chamber", "right upper chamber"],
  "left ventricle": ["left ventricle", "lower left chamber", "left bottom chamber"],
  "right ventricle": ["right ventricle", "lower right chamber", "right bottom chamber"],
  "aorta": ["aorta", "main artery", "large artery"],
  "pulmonary artery": ["pulmonary artery", "lung artery"],
};

// search array for Fuse
const searchData = Object.entries(heartParts).flatMap(([part, synonyms]) =>
  synonyms.map((s) => ({ synonym: s, part }))
);

/**
 * Model component: renders gltf scene and attaches pointer handlers.
 * We assume the model's mesh names contain meaningful identifiers.
 */
function HeartScene({ modelPath, onPartClick, highlightedPartName }) {
  const group = useRef();
  const gltf = useGLTF(modelPath);

  // rotate a little
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.0015;
  });

  // helper: highlight mesh by name
  const setHighlight = useCallback(
    (name) => {
      if (!gltf || !gltf.scene) return;
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // reset to default first
          if (child.userData.__origColor === undefined && child.material) {
            // store original color in userData
            child.userData.__origColor = child.material.color ? child.material.color.clone() : null;
          }
          if (child.material && child.name === name) {
            // set emissive or color highlight
            if (child.material.emissive) {
              child.material.emissive.setHex(0x33aaff);
              child.material.emissiveIntensity = 0.6;
            } else if (child.material.color) {
              child.material.color.setHex(0x33aaff);
            }
          } else {
            // restore original
            if (child.material && child.userData.__origColor) {
              try {
                child.material.emissive && child.material.emissive.setHex(0x000000);
                child.material.emissiveIntensity = 0;
                child.material.color && child.material.color.copy(child.userData.__origColor);
              } catch {
                // ignore non-color materials
              }
            }
          }
        }
      });
    },
    [gltf]
  );

  // run highlight whenever highlightedPartName changes
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    // If highlightedPartName is null, reset all
    if (!highlightedPartName) {
      setHighlight(null);
    } else {
      // try to find a mesh whose name contains the canonical part name
      let matchedName = null;
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name) {
          const n = child.name.toLowerCase();
          if (n.includes(highlightedPartName.toLowerCase())) {
            matchedName = child.name;
          }
        }
      });
      setHighlight(matchedName);
    }
  }, [highlightedPartName, gltf, setHighlight]);

  // pointer down: find mesh clicked and notify parent with best guess name
  const onPointerDown = (e) => {
    e.stopPropagation();
    const clicked = e.object; // mesh clicked
    if (!clicked) return;

    // try object name or parent name
    let meshName = clicked.name || (clicked.parent && clicked.parent.name) || "";
    meshName = meshName.trim();

    // If meshName empty, try to identify by material name or userData
    if (!meshName && clicked.material && clicked.material.name) {
      meshName = clicked.material.name;
    }

    // normalize and find canonical part using heartParts map
    const lower = meshName.toLowerCase();
    // try exact contains match:
    let foundPart = null;
    Object.keys(heartParts).forEach((partKey) => {
      if (!foundPart) {
        if (lower.includes(partKey)) foundPart = partKey;
        else {
          // check synonyms
          heartParts[partKey].forEach((syn) => {
            if (!foundPart && lower.includes(syn.toLowerCase())) foundPart = partKey;
          });
        }
      }
    });

    // fallback: if still not found, just return the meshName as-is
    onPartClick(foundPart || meshName || "Unknown part");
  };

  return (
    <group ref={group} dispose={null}>
      {/* render the whole glTF scene; attach pointer handler on each mesh by traversing */}
      <primitive
        object={gltf.scene}
        onPointerDown={onPointerDown}
        // make model slightly bigger if tiny
        // scale={[1,1,1]}
      />
    </group>
  );
}

/**
 * Parent component that contains search + canvas + result panel
 */
export default function HeartExplorer({ modelPath = "/biology/heart2.glb" }) {
  const [query, setQuery] = useState("");
  const [foundPart, setFoundPart] = useState(null); // canonical part name OR mesh name
  const [fuse] = useState(() => new Fuse(searchData, { keys: ["synonym"], threshold: 0.35 }));

  // text search handler (fuzzy search)
  const handleSearch = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (!text) {
      setFoundPart(null);
      return;
    }
    const res = fuse.search(text);
    if (res && res.length > 0) {
      setFoundPart(res[0].item.part);
    } else {
      setFoundPart(null);
    }
  };

  // when a mesh is clicked inside the 3D scene, this callback is invoked
  const onPartClick = (partOrMeshName) => {
    // If partOrMeshName matches a canonical part, keep it; else set raw name
    const lower = (partOrMeshName || "").toLowerCase();
    let canonical = null;
    Object.keys(heartParts).forEach((p) => {
      if (!canonical) {
        if (lower.includes(p.toLowerCase())) canonical = p;
        else {
          heartParts[p].forEach((syn) => {
            if (!canonical && lower.includes(syn.toLowerCase())) canonical = p;
          });
        }
      }
    });
    setFoundPart(canonical || partOrMeshName);
  };

  return (
    <div className="heart-explorer-root">
      <div className="explorer-header">
        <h2>AI Smart Heart Explorer</h2>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Type a heart part (e.g. upper left chamber)"
          className="heart-search"
        />
        <div className="hint">Click on a part of the heart model or search above</div>
      </div>

      <div className="explorer-canvas">
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <HeartScene modelPath={modelPath} onPartClick={onPartClick} highlightedPartName={foundPart} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>

        {/* overlay panel showing the selected/found part */}
        <div className="part-panel">
          <strong>Selected:</strong>{" "}
          <span className="part-name">{foundPart ? foundPart : "None"}</span>
        </div>
      </div>
    </div>
  );
}
