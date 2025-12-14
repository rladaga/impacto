"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ImpactoLogo from "../components/ImpactoLogo";
import HeroSubtitleSection from "../components/HeroSubtitleSection";
import InfoCardsSection from "@/components/InfoCardsSection";
import InfoGridSection from "@/components/InfoGridSection";

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
        setProjects(data);
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
          zoom: 4,
          minZoom: -2,
          maxZoom: 16,
          scrollZoom: false,
          cooperativeGestures: true,
          maxBounds: barcelonaBounds as maplibregl.LngLatBoundsLike,
        });

        map.current.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "bottom-right"
        );

        map.current.on("load", () => {
          map.current?.fitBounds(
            barcelonaBounds as maplibregl.LngLatBoundsLike,
            {
              padding: 50, // Un poco de margen en los bordes
              animate: false, // Ajuste instantáneo al cargar
            }
          );

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
            el.style.backgroundColor = "#D5D6DA";
            el.style.cursor = "pointer";
            /* el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
            el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))"; */

            el.onmouseenter = () => {};

            el.onmouseleave = () => {};

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

    /* Object.entries(markers).forEach(([id, m]) => {
      if (id === projectId.toString()) {
        m.el.style.filter =
          "drop-shadow(0 0 35px rgba(59, 130, 246, 1)) brightness(1.5) saturate(1.2)";
        m.el.style.boxShadow = "0 0 35px rgba(59, 130, 246, 1)";
      } else {
        m.el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";
        m.el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
      }
    }); */

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
    /* Object.values(markers).forEach((m) => {
      m.el.style.filter = "drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))";
      m.el.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.8)";
    }); */

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
    <div className="w-full min-h-screen bg-primary">
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-8 shadow-lg">
        {/* Placeholder Logo Izquierda */}
        <div className="flex items-center w-40">
          {/* Aquí controlas el tamaño del logo pasando width y height en className */}
          <ImpactoLogo fill="#D5D6DA" className="w-32 h-auto" />
        </div>

        {/* Links Derecha */}
        <div className="flex gap-8 items-center">
          <a
            href="#"
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            ABOUT US
          </a>
          <a
            href="#"
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            GET INVOLVED
          </a>
          <a
            href="#"
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            TO THINK
          </a>
        </div>
      </nav>
      {/* Map */}
      <section className="relative w-full h-screen pt-20">
        <div ref={mapContainer} className="w-full h-full absolute inset-0" />

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
                    ~
                    {calculateDistance(
                      selectedProject.lat,
                      selectedProject.lng
                    )}{" "}
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
      </section>

      <HeroSubtitleSection />

      <InfoCardsSection />

      <InfoGridSection />
    </div>
  );
}
