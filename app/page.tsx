"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ImpactoLogoChico from "../components/ImpactoLogoChico";

interface Project {
  id: number;
  name: string;
  project_type: string;
  audience: string;
  disability_type: string;
  description: string;
  address: string;
  contact: string;
  created_at?: string;
  lng?: number;
  lat?: number;
}

const barcelonaBounds: [number, number][] = [
  [2.0534, 41.3202],
  [2.228, 41.4637],
];

const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

let rtlPluginInitialized = false;

async function geocodeAddress(
  address: string
): Promise<{ lng: number; lat: number } | null> {
  try {
    const response = await fetch("/api/geocoding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Geocoding error:", error);
    return { lng: 2.1728, lat: 41.3851 };
  }
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [markers, setMarkers] = useState<
    Record<number, { marker: maplibregl.Marker; el: HTMLElement }>
  >({});
  const [activePage, setActivePage] = useState<"home" | "projects">("home");
  const [loading, setLoading] = useState(true);

  const calculateDistance = (lat: number, lng: number): string => {
    const centerLat = 41.3851;
    const centerLng = 2.1657;
    const R = 111;
    const dLat = (lat - centerLat) * R;
    const dLng = (lng - centerLng) * R * Math.cos((centerLat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();

        // Geocode each project address
        const projectsWithCoords = await Promise.all(
          data.map(async (project: Project) => {
            const coords = await geocodeAddress(project.address);
            return {
              ...project,
              lng: coords?.lng || 2.1728,
              lat: coords?.lat || 41.3851,
            };
          })
        );

        setProjects(projectsWithCoords);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || projects.length === 0) return;

    // Set RTL text plugin only once
    if (!rtlPluginInitialized) {
      maplibregl.setRTLTextPlugin(
        "https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
        true
      );
      rtlPluginInitialized = true;
    }

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
            if (!project.lng || !project.lat) return;

            const el = document.createElement("div");
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
  }, [projects]);

  const selectProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.lng || !project.lat) return;

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
        zoom: 15,
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
            className={`text-sm cursor-pointer font-medium transition-colors ${
              activePage === "home"
                ? "text-light"
                : "text-secondary hover:text-accent"
            }`}
          >
            home
          </button>
          <button
            onClick={() => setActivePage("projects")}
            className={`text-sm cursor-pointer font-medium transition-colors ${
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
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedProject.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedProject.project_type}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="text-slate-400 hover:text-white hover:bg-blue-500/10 rounded-md p-2 transition-colors text-2xl font-light"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 mb-3 text-sm text-slate-400 flex-wrap">
              <span>📍 {selectedProject.address}</span>
              {selectedProject.lat && selectedProject.lng && (
                <span>
                  ~{calculateDistance(selectedProject.lat, selectedProject.lng)}{" "}
                  km from center
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <p className="text-slate-500">Audiencia</p>
                <p className="text-slate-300">{selectedProject.audience}</p>
              </div>
              <div>
                <p className="text-slate-500">Tipo de Discapacidad</p>
                <p className="text-slate-300">
                  {selectedProject.disability_type}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Contacto</p>
                <p className="text-slate-300">{selectedProject.contact}</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              {selectedProject.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white text-lg">Cargando proyectos...</div>
        </div>
      )}
    </div>
  );
}
