"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ImpactoLogo from "../components/ImpactoLogo";
import HeroSubtitleSection from "../components/HeroSubtitleSection";
import InfoCardsSection from "@/components/InfoCardsSection";
import InfoGridSection from "@/components/InfoGridSection";
import ContributeSection from "@/components/ContributionSection";
import QuestionsSection from "@/components/QuestionsSection";
import FooterSection from "@/components/FooterSection";
import SplashScreen from "@/components/SplashScreen";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface Project {
  id: number;
  name: string;
  services: string;
  audience: string;
  description: string;
  address: string;
  contact: string;
  created_at?: string;
  updated_at?: string;
  lng?: number;
  lat?: number;
  image_url?: string;
  image?: string;
  instagram_url?: string;
  facebook_url?: string;
  email?: string;
  disability_type?: string;
  activity_type?: string;
  modality?: string;
  accessibility?: string;
}

const barcelonaBounds: [number, number][] = [
  [2.0534, 41.3202],
  [2.228, 41.4637],
];

const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const hoverPopup = useRef<maplibregl.Popup | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<
    Record<number, { marker: maplibregl.Marker; el: HTMLElement }>
  >({});

  const [showSplash, setShowSplash] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [[page, direction], setPage] = useState([0, 0]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [filterCategories, setFilterCategories] = useState<
    Record<string, { label: string; options: string[] }>
  >({
    disability_type: { label: "Tipo de discapacidad", options: [] },
    age: { label: "Edad", options: [] },
    activity_type: { label: "Tipo de actividad", options: [] },
    modality: { label: "Modalidad", options: [] },
    accessibility: { label: "Accesibilidad", options: [] },
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const imagesLoadedRef = useRef(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        imagesLoadedRef.current = false; // Reset cuando cargan proyectos nuevos
      }

      // Load Categories from Database
      const supabase = createClient();
      const { data: catData } = await supabase
        .from("config_options")
        .select("*")
        .eq("is_active", true)
        .order("value");

      if (catData) {
        setFilterCategories((prev) => {
          const next = { ...prev };
          // Reset options to avoid duplication in React Strict Mode
          Object.keys(next).forEach((k) => (next[k].options = []));
          catData.forEach((opt) => {
            if (next[opt.category]) {
              next[opt.category].options.push(opt.value);
            }
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función separada para cargar imágenes en background
  const fetchProjectImages = async (projectsToUpdate: Project[]) => {
    if (imagesLoadedRef.current) return; // Evitar cargar imágenes múltiples veces

    const updatedProjects = await Promise.all(
      projectsToUpdate.map(async (project) => {
        if (project.image_url && !project.image) {
          try {
            const imageResponse = await fetch("/api/proxy-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: project.image_url }),
            });

            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const imageUrl = URL.createObjectURL(blob);
              return { ...project, image: imageUrl };
            }
          } catch (error) {
            console.error(
              `Error fetching image for project ${project.id}:`,
              error,
            );
          }
        }
        return project;
      }),
    );

    imagesLoadedRef.current = true;
    setProjects(updatedProjects);
  };

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (
        searchQuery &&
        !project.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Filters
      for (const [key, selectedOptions] of Object.entries(activeFilters)) {
        if (selectedOptions.length === 0) continue;

        // We assume the key in activeFilters matches the key in Project interface
        // e.g. 'disability_type', 'audience', etc.
        const projectValue = project[key as keyof Project];

        if (!projectValue) return false;

        // Handle if the value in DB is a string (comma separated) or already an array
        // This makes it robust for different DB structures
        const projectOptions = Array.isArray(projectValue)
          ? projectValue
          : [String(projectValue)];

        // Función para normalizar quitando tildes y pasando a minúsculas
        const normalizeText = (text: string) =>
          text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Función para extraer solo palabras clave
        const getTokens = (text: string) => {
          const stopWords = [
            "discapacidad",
            "sindrome",
            "enfermedades",
            "personas",
            "las",
            "los",
            "de",
            "con",
            "tipo",
            "para",
          ];
          return normalizeText(text)
            .split(/[^a-z0-9]+/) // Separa por cualquier cosa que no sea letra o número
            .filter((w) => w.length > 2 && !stopWords.includes(w)); // Ignora palabras cortas y stopwords
        };

        // Check if ANY of the selected options match the project's options
        const hasMatch = selectedOptions.some((option) =>
          projectOptions.some((po) => {
            const poStr = String(po);
            const poNorm = normalizeText(poStr);
            const optNorm = normalizeText(option);

            // 1. Match directo de frase completa (Ej: "paralisis cerebral" detecta "paralisis cerebral / pluridiscapacidad")
            if (poNorm.includes(optNorm) || optNorm.includes(poNorm))
              return true;

            // 2. Match por palabras clave (Ej: extraer "tea" de "Autismo (TEA)" y cruzarlo con "Neurodivergencias (TEA / Asperger)")
            const poTokens = getTokens(poStr);
            const optTokens = getTokens(option);

            return optTokens.some((optToken) => poTokens.includes(optToken));
          }),
        );

        if (!hasMatch) return false;
      }

      return true;
    });
  }, [projects, searchQuery, activeFilters]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !imagesLoadedRef.current) {
      const timer = setTimeout(() => {
        fetchProjectImages(projects);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [projects.length]);

  useEffect(() => {
    if (!mapContainer.current || projects.length === 0) return;

    // Verificar si el mapa ya existe
    if (map.current) return;

    // Inicializar RTL plugin solo en cliente
    if (typeof window !== "undefined") {
      try {
        maplibregl.setRTLTextPlugin(
          "https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
          true,
        );
      } catch (e) {
        console.warn("RTL text plugin initialization:", e);
      }
    }

    // Initialize map solo una vez
    fetch("/new_map_style.json")
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
          attributionControl: false,
        });

        map.current.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "bottom-right",
        );

        if (!hoverPopup.current) {
          hoverPopup.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15, // Distancia vertical desde el punto
            className: "rounded-project-tooltip", // Clase opcional para estilos CSS globales
          });
        }

        map.current.on("load", () => {
          const geojson = {
            type: "FeatureCollection",
            features: projects
              .filter((p) => p.lng && p.lat)
              .map((p) => ({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [p.lng, p.lat],
                },
                properties: {
                  id: p.id,
                  name: p.name,
                },
              })),
          };

          map.current?.addSource("projects-source", {
            type: "geojson",
            data: geojson as any,
          });

          map.current?.addLayer({
            id: "projects-circles",
            type: "circle",
            source: "projects-source",
            paint: {
              "circle-radius": 8,
              "circle-color": "#4A69FF",
              "circle-stroke-width": 3,
              "circle-stroke-color": "#4A69FF",
            },
          });

          map.current?.on("click", "projects-circles", (e) => {
            if (e.features && e.features[0].properties) {
              const projectId = e.features[0].properties.id;
              selectProject(projectId);
            }
          });

          map.current?.on("mouseenter", "projects-circles", (e) => {
            if (!map.current) return;

            map.current.getCanvas().style.cursor = "pointer";

            const coordinates = (
              e.features![0].geometry as any
            ).coordinates.slice();
            const name = e.features![0].properties?.name;

            if (hoverPopup.current) {
              hoverPopup.current
                .setLngLat(coordinates)
                .setHTML(
                  `<div class="text-[#4A69FF] font-alte-bold text-sm px-1 py-1">
                            ${name.toUpperCase()}
                        </div>`,
                )
                .addTo(map.current);
            }
          });

          map.current?.on("mouseleave", "projects-circles", () => {
            if (!map.current) return;
            map.current.getCanvas().style.cursor = "";
            hoverPopup.current?.remove();
          });

          // Fit Bounds inicial
          map.current?.fitBounds(
            barcelonaBounds as maplibregl.LngLatBoundsLike,
            {
              padding: { top: 100, bottom: 50, left: 50, right: 50 },
              animate: false,
            },
          );
        });
        setMapLoaded(true);
      });
  }, [projects.length]);

  useEffect(() => {
    // Update map markers when filteredProjects changes
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource(
      "projects-source",
    ) as maplibregl.GeoJSONSource;

    if (source) {
      const geojson = {
        type: "FeatureCollection",
        features: filteredProjects
          .filter((p) => p.lng && p.lat)
          .map((p) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [p.lng!, p.lat!],
            },
            properties: {
              id: p.id,
              name: p.name,
            },
          })),
      };
      source.setData(geojson as any);
    }
  }, [filteredProjects, mapLoaded]);

  useEffect(() => {
    if (!map.current || !selectedProjectId) return;

    const project = projects.find((p) => p.id === selectedProjectId);
    if (project && project.lng && project.lat) {
      map.current.flyTo({
        center: [project.lng, project.lat],
        zoom: 15,
        duration: 1000,
        offset: [0, 0],
      });
    }
  }, [selectedProjectId, projects]);

  const currentIndex = projects.findIndex((p) => p.id === selectedProjectId);
  const selectedProject = projects[currentIndex];

  const selectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setPage([projectId, 0]);
  };

  const closeDetail = () => {
    setSelectedProjectId(null);
    // Resetear zoom al cerrar
    if (map.current) {
      map.current.fitBounds(barcelonaBounds as maplibregl.LngLatBoundsLike, {
        padding: { top: 100, bottom: 50, left: 50, right: 50 },
      });
    }
  };

  const paginate = (newDirection: number) => {
    if (currentIndex === -1) return;

    setPage([page + newDirection, newDirection]);

    let newIndex = currentIndex + newDirection;
    // Loop infinito
    if (newIndex < 0) newIndex = projects.length - 1;
    if (newIndex >= projects.length) newIndex = 0;

    // Al setear el ID aquí, se dispara el useEffect de arriba y mueve el mapa automáticamente
    setSelectedProjectId(projects[newIndex].id);
  };

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);

    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const toggleFilter = (category: string, option: string) => {
    setActiveFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  };

  return (
    <div id="top" className="w-full min-h-screen bg-primary">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onEnter={() => setShowSplash(false)}
            isMapReady={mapLoaded}
          />
        )}
      </AnimatePresence>
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-4 md:px-8 shadow-lg">
        <a
          href="#top"
          onClick={(e) => handleScroll(e, "top")}
          className="flex items-center w-32 md:w-40 relative z-50"
        >
          <ImpactoLogo fill="#D5D6DA" className="w-full h-auto" />
        </a>
        <div className="hidden md:flex gap-8 items-center">
          <a
            href="#about-us"
            onClick={(e) => handleScroll(e, "about-us")}
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            CONÓCENOS
          </a>
          <a
            href="#get-involved"
            onClick={(e) => handleScroll(e, "get-involved")}
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            ÚNETE
          </a>
          <a
            href="#to-think"
            onClick={(e) => handleScroll(e, "to-think")}
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            REFLEXIONA
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#D5D6DA] relative z-50 p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 w-full bg-primary shadow-xl flex flex-col items-center pt-24 pb-10 gap-8 md:hidden z-40 border-b border-white/10"
            >
              <a
                href="#about-us"
                onClick={(e) => {
                  handleScroll(e, "about-us");
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                CONÓCENOS
              </a>
              <a
                href="#get-involved"
                onClick={(e) => {
                  handleScroll(e, "get-involved");
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                ÚNETE
              </a>
              <a
                href="#to-think"
                onClick={(e) => {
                  handleScroll(e, "to-think");
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                REFLEXIONA
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative w-full h-screen pt-20">
        <div ref={mapContainer} className="w-full h-full absolute inset-0" />

        {/* SEARCH & FILTER BAR */}
        <div className="absolute top-24 left-4 right-4 md:left-8 md:w-[400px] z-30 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-lg shadow-lg flex items-center px-4 py-3 border border-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-dark font-alte placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`px-4 py-2 rounded-lg shadow-lg font-alte-bold transition-colors flex items-center justify-center cursor-pointer ${
                isFiltersOpen ||
                Object.keys(activeFilters).some(
                  (k) => activeFilters[k].length > 0,
                )
                  ? "bg-secondary text-white"
                  : "bg-white text-dark hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl shadow-xl p-4 max-h-[60vh] overflow-y-auto border border-gray-200 custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-alte-bold text-secondary">Filtros</h3>
                  <button
                    onClick={() => setActiveFilters({})}
                    className="text-xs text-gray-500 hover:text-secondary underline cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(filterCategories).map(([key, category]) => (
                    <div key={key}>
                      <h4 className="font-alte-bold text-sm text-dark mb-2 uppercase">
                        {category.label}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.options.map((option) => {
                          const isActive = activeFilters[key]?.includes(option);
                          return (
                            <button
                              key={option}
                              onClick={() => toggleFilter(key, option)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                isActive
                                  ? "bg-secondary text-white border-secondary"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-secondary"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Overlay de fondo un poco más oscuro para resaltar el glassmorphism
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2C67]/40 backdrop-blur-sm p-4 md:p-8"
              onClick={closeDetail}
            >
              {/* TARJETA PRINCIPAL (CONTENEDOR DE CRISTAL) */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-6xl h-[85vh] md:h-[680px] bg-white/40 backdrop-blur-2xl border rounded-4xl md:rounded-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden p-4 md:p-10 gap-4 md:gap-10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* BOTÓN CERRAR (Azul Oscuro) */}
                <button
                  onClick={closeDetail}
                  className="absolute top-4 right-4 md:top-6 md:right-6 z-50 text-[#2D2C67]/70 hover:text-[#2D2C67] cursor-pointer transition-colors p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* FLECHAS DE NAVEGACIÓN (Azul Oscuro, ubicadas en el borde del cristal) */}
                <button
                  className="absolute top-[126px] md:top-1/2 left-1 md:left-2 z-40 -translate-y-1/2 cursor-pointer p-2 opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                  onClick={() => paginate(-1)}
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src="/logos/icono-flecha-oscura.png"
                      alt="Anterior"
                      fill
                      className="object-contain rotate-180"
                    />
                  </div>
                </button>

                {/* FLECHA DERECHA (OSCURA) */}

                <button
                  className="absolute top-[126px] md:top-1/2 right-1 md:right-2 z-40 -translate-y-1/2 p-2 opacity-70 hover:opacity-100 hover:scale-110 cursor-pointer transition-all"
                  onClick={() => paginate(1)}
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src="/logos/icono-flecha-oscura.png"
                      alt="Siguiente"
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>

                {/* CONTENEDOR DEL SLIDER (Ocupa el espacio interno respetando el padding) */}
                <div className="w-full h-full relative z-10 flex-1 min-h-0">
                  <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="popLayout"
                  >
                    <motion.div
                      key={selectedProject.id}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="w-full h-full flex px-0 md:px-6 flex-col md:flex-row gap-4 md:gap-10"
                    >
                      {/* --- IZQUIERDA: --- */}

                      <div className="w-full md:w-5/12 h-[220px] md:h-full flex flex-col relative bg-[#4A69FF] rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl shrink-0">
                        {/* IMAGEN (55% Alto) */}
                        <div className="h-[55%] relative w-full overflow-hidden bg-gray-200">
                          {selectedProject.image ? (
                            <Image
                              src={selectedProject.image}
                              alt={selectedProject.name}
                              fill
                              className="object-cover grayscale"
                            />
                          ) : (
                            <div className="w-full h-full bg-light flex items-center justify-center text-white/50 font-alte-bold tracking-widest">
                              NO IMAGE
                            </div>
                          )}
                          {/* Filtro azulado sobre la imagen */}
                          <div className="absolute inset-0 z-10 bg-white opacity-40 mix-blend-normal" />
                          <div className="absolute inset-0 z-10 bg-linear-to-t from-light to-secondary mix-blend-multiply opacity-90" />
                          <div
                            className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                            }}
                          />
                        </div>

                        {/* TÍTULO Y DECORACIÓN  */}

                        <div className="h-[45%] bg-[#4A69FF] p-4 md:p-0 mb-2 flex flex-col items-center justify-center gap-2 md:gap-6">
                          {/* Título: Texto blanco, centrado */}
                          <h2 className="text-white text-center font-alte-bold text-base md:text-2xl lg:text-3xl leading-snug uppercase w-full px-2 md:px-4">
                            {selectedProject.name}
                          </h2>

                          {/* Decoración Morse*/}
                          <div className="hidden md:flex flex-col gap-4 opacity-80">
                            {/* Fila Superior */}
                            <div className="flex gap-1">
                              <div className="w-20 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-4"></div>
                              <div className="w-4"></div>
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-16 h-4 bg-[#2D2C67] rounded-full"></div>
                            </div>

                            {/* Fila del Medio */}
                            <div className="flex gap-1 items-center self-end mr-8">
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-16 h-4 bg-[#2D2C67] rounded-full"></div>
                            </div>

                            {/* Fila Inferior  */}
                            <div className="flex gap-1 items-center">
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-8 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                              <div className="w-4 h-4 bg-[#2D2C67] rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* --- DERECHA: TEXTO SOBRE EL CRISTAL --- */}

                      <div className="w-full md:w-7/12 flex-1 md:h-full overflow-y-auto flex flex-col gap-3 md:gap-5 text-[#2D2C67] pr-1 md:pr-2 relative z-20 pb-4">
                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 font-alte-bold text-secondary mt-2 md:mt-0">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          ULTIMA ACTUALIZACION:{" "}
                          {selectedProject.updated_at
                            ? new Date(
                                selectedProject.updated_at,
                              ).toLocaleDateString("es-ES")
                            : selectedProject.created_at
                              ? new Date(
                                  selectedProject.created_at,
                                ).toLocaleDateString("es-ES")
                              : "N/A"}
                        </div>

                        {/* Descripción */}

                        <p className="font-alte text-base md:text-lg leading-relaxed ">
                          {selectedProject.description}
                        </p>

                        {/* Pills y Contenido */}
                        <div className="flex flex-col gap-4 mt-2">
                          {/* Público Objetivo */}
                          <div>
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[18px] px-6 py-1 rounded-full mb-2 uppercase tracking-wider leading-relaxed shadow-sm">
                              PÚBLICO OBJETIVO
                            </div>
                            <p className="text-sm opacity-90 font-alte font-bold ml-1">
                              {selectedProject.audience}
                            </p>
                          </div>

                          {/* Servicios */}
                          <div>
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[18px] px-6 py-1 rounded-full mb-2 uppercase tracking-wider leading-relaxed shadow-sm">
                              SERVICIOS
                            </div>
                            <p className="text-sm opacity-90 font-alte ml-1">
                              {selectedProject.services ||
                                "Consultar servicios disponibles."}
                            </p>
                          </div>

                          {/* Contacto (Al final) */}
                          <div className="mt-auto pt-4 flex flex-wrap items-center gap-3">
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[18px] px-6 py-1 rounded-full uppercase tracking-wider leading-relaxed shadow-sm">
                              CONTACTO
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {/* Website */}
                              {selectedProject.contact && (
                                <a
                                  href={
                                    selectedProject.contact.startsWith("http")
                                      ? selectedProject.contact
                                      : `https://${selectedProject.contact}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-[#4A69FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                                  title="Website"
                                >
                                  <div className="relative w-8 h-8">
                                    <Image
                                      src="/logos/mundo-gris.png"
                                      alt="Web"
                                      fill
                                      className="object-contain brightness-0 invert"
                                    />
                                  </div>
                                </a>
                              )}

                              {/* Email */}
                              {selectedProject.email && (
                                <a
                                  href={`mailto:${selectedProject.email}`}
                                  className="w-10 h-10 bg-[#4A69FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                                  title="Email"
                                >
                                  <div className="relative w-7 h-7">
                                    <Image
                                      src="/logos/email-gris.png"
                                      alt="Email"
                                      fill
                                      className="object-contain brightness-0 invert"
                                    />
                                  </div>
                                </a>
                              )}

                              {/* Facebook */}
                              {selectedProject.facebook_url && (
                                <a
                                  href={selectedProject.facebook_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-[#4A69FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                                  title="Facebook"
                                >
                                  <div className="relative w-6 h-6">
                                    <Image
                                      src="/logos/fb-gris.png" // Asegúrate de tener este icono o actualiza la ruta
                                      alt="Facebook"
                                      fill
                                      className="object-contain brightness-0 invert"
                                    />
                                  </div>
                                </a>
                              )}

                              {/* Instagram */}
                              {selectedProject.instagram_url && (
                                <a
                                  href={selectedProject.instagram_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-[#4A69FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                                  title="Instagram"
                                >
                                  <div className="relative w-8 h-8">
                                    <Image
                                      src="/logos/ig-gris.png"
                                      alt="Instagram"
                                      fill
                                      className="object-contain brightness-0 invert"
                                    />
                                  </div>
                                </a>
                              )}

                              {/* Address / Maps */}
                              {selectedProject.address && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    selectedProject.address,
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 bg-[#4A69FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                                  title="Ubicación"
                                >
                                  <div className="relative w-6 h-6">
                                    <Image
                                      src="/logos/map-gris.png"
                                      alt="Mapa"
                                      fill
                                      className="object-contain brightness-0 invert"
                                    />
                                  </div>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <HeroSubtitleSection />

      <InfoCardsSection />

      <InfoGridSection />

      <ContributeSection />

      <QuestionsSection />

      <FooterSection />
    </div>
  );
}
