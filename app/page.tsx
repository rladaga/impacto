"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ImpactoLogoChico from "../components/ImpactoLogoChico";

interface Project {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  description: string;
  services: string[];
}

const projects: Project[] = [
  {
    id: 1,
    name: "Centre de Recursos",
    area: "Eixample",
    lat: 41.3851,
    lng: 2.1734,
    description:
      "Comprehensive rehabilitation and therapeutic services for people with physical and cognitive disabilities.",
    services: ["Physical therapy", "Speech therapy", "Occupational therapy"],
  },
  {
    id: 2,
    name: "Taller Ocupacional",
    area: "Gràcia",
    lat: 41.3954,
    lng: 2.1566,
    description:
      "Occupational workshop providing vocational training and employment opportunities for people with intellectual disabilities.",
    services: [
      "Vocational training",
      "Employment support",
      "Social integration",
    ],
  },
  {
    id: 3,
    name: "Espai Inclusiu",
    area: "Sants",
    lat: 41.3736,
    lng: 2.1412,
    description:
      "Community center focused on inclusive activities, sports, and cultural events for all abilities.",
    services: ["Adaptive sports", "Cultural events", "Social programs"],
  },
  {
    id: 4,
    name: "Fundació Acceso",
    area: "Les Corts",
    lat: 41.3813,
    lng: 2.1159,
    description:
      "Works on accessibility improvements and advocacy for people with disabilities across Barcelona.",
    services: ["Accessibility consulting", "Advocacy", "Community education"],
  },
  {
    id: 5,
    name: "Centre de Dia",
    area: "Montjuïc",
    lat: 41.3629,
    lng: 2.1627,
    description:
      "Day care facility offering support, activities, and respite services for people with various disabilities.",
    services: ["Day care", "Activities", "Respite care"],
  },
];

const barcelonaBounds: [number, number][] = [
  [2.0534, 41.3202],
  [2.228, 41.4637],
];

const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [markers, setMarkers] = useState<
    Record<number, { marker: maplibregl.Marker; el: HTMLElement }>
  >({});
  const [activePage, setActivePage] = useState<"home" | "projects">("home");

  const calculateDistance = (lat: number, lng: number): string => {
    const centerLat = 41.3851;
    const centerLng = 2.1657;
    const R = 111;
    const dLat = (lat - centerLat) * R;
    const dLng = (lng - centerLng) * R * Math.cos((centerLat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set RTL text plugin
    maplibregl.setRTLTextPlugin(
      "https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      true
    );

    // Initialize map
    fetch("/map_style.json")
      .then((res) => res.json())
      .then((style) => {
        const styleString = JSON.stringify(style);
        const updatedStyleString = styleString.replace(/{key}/g, API_KEY);
        const updatedStyle = JSON.parse(updatedStyleString);

        map.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: updatedStyle,
          center: [2.1728, 41.3851],
          zoom: 12,
          minZoom: 11,
          maxZoom: 20,
          maxBounds: barcelonaBounds as maplibregl.LngLatBoundsLike,
        });

        map.current.on("load", () => {
          const newMarkers: Record<
            number,
            { marker: maplibregl.Marker; el: HTMLElement }
          > = {};

          projects.forEach((project) => {
            const el = document.createElement("div");
            el.className =
              "w-4 h-4 rounded-full bg-white cursor-pointer transition-all";
            el.style.width = "16px";
            el.style.height = "16px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "white";
            el.style.cursor = "pointer";
            el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
            el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";

            el.onmouseenter = () => {
              el.style.filter =
                "drop-shadow(0 0 25px rgba(139, 92, 246, 1)) brightness(1.2)";
              el.style.boxShadow = "0 0 25px rgba(139, 92, 246, 1)";
            };

            el.onmouseleave = () => {
              if (selectedProjectId !== project.id) {
                el.style.filter =
                  "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";
                el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
              }
            };

            el.onclick = () => selectProject(project.id);

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([project.lng, project.lat])
              .addTo(map.current!);

            newMarkers[project.id] = { marker, el };
          });

          setMarkers(newMarkers);
        });
      });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const selectProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    setSelectedProjectId(projectId);

    Object.entries(markers).forEach(([id, m]) => {
      if (id === projectId.toString()) {
        m.el.style.filter =
          "drop-shadow(0 0 35px rgba(59, 130, 246, 1)) brightness(1.5) saturate(1.2)";
        m.el.style.boxShadow = "0 0 35px rgba(59, 130, 246, 1)";
      } else {
        m.el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";
        m.el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
      }
    });

    if (map.current) {
      map.current.flyTo({
        center: [project.lng, project.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  };

  const closeDetail = () => {
    setSelectedProjectId(null);
    Object.values(markers).forEach((m) => {
      m.el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";
      m.el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
    });

    // Restore to initial view
    if (map.current) {
      map.current.flyTo({
        center: [2.1728, 41.3851],
        zoom: 12,
        duration: 1000,
      });
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden">
      {/* Map */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-8 left-8 z-20 w-20 h-20"
      >
        <ImpactoLogoChico initial="hidden" animate="visible" />
      </motion.div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 left-1/2 transform -translate-x-1/2 z-20 bg-primary backdrop-blur-md border border-secondary rounded-full px-6 py-3 shadow-lg"
      >
        <div className="flex gap-6 items-center">
          <button
            onClick={() => setActivePage("home")}
            className={`text-sm font-medium transition-colors ${
              activePage === "home"
                ? "text-light"
                : "text-secondary hover:text-accent"
            }`}
          >
            home
          </button>
          <button
            onClick={() => setActivePage("projects")}
            className={`text-sm font-medium transition-colors ${
              activePage === "projects"
                ? "text-light"
                : "text-secondary hover:text-accent"
            }`}
          >
            projects
          </button>
        </div>
      </motion.nav>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-15 bg-linear-to-t from-slate-900/98 to-slate-900/95 border-t border-blue-500/20 backdrop-blur-md px-8 py-6 max-h-80 overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedProject.name}
              </h2>
              <button
                onClick={closeDetail}
                className="text-slate-400 hover:text-white hover:bg-blue-500/10 rounded-md p-2 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 mb-3 text-sm text-slate-400 flex-wrap">
              <span>📍 {selectedProject.area}</span>
              <span>
                ~{calculateDistance(selectedProject.lat, selectedProject.lng)}{" "}
                km from center
              </span>
            </div>

            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="flex gap-2 flex-wrap">
              {selectedProject.services.map((service) => (
                <span
                  key={service}
                  className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs text-blue-400"
                >
                  {service}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
