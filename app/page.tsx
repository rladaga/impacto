"use client";

import { useEffect, useRef, useState } from "react";
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
import Image from "next/image";

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
  updated_at?: string;
  lng?: number;
  lat?: number;
  image?: string;
}

const barcelonaBounds: [number, number][] = [
  [2.0534, 41.3202],
  [2.228, 41.4637],
];

const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

let rtlPluginInitialized = false;

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
  const map = useRef<maplibregl.Map | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<
    Record<number, { marker: maplibregl.Marker; el: HTMLElement }>
  >({});

  const [[page, direction], setPage] = useState([0, 0]);

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
          attributionControl: false,
        });

        map.current.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "bottom-right"
        );

        map.current.on("load", () => {
          map.current?.fitBounds(
            barcelonaBounds as maplibregl.LngLatBoundsLike,
            {
              padding: { top: 100, bottom: 50, left: 50, right: 50 },
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
    id: string
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

  return (
    <div id="top" className="w-full min-h-screen bg-primary">
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-8 shadow-lg">
        <a
          href="#top"
          onClick={(e) => handleScroll(e, "top")}
          className="flex items-center w-40"
        >
          <ImpactoLogo fill="#D5D6DA" className="w-32 h-auto" />
        </a>
        <div className="flex gap-8 items-center">
          <a
            href="#about-us"
            onClick={(e) => handleScroll(e, "about-us")}
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            ABOUT US
          </a>
          <a
            href="#get-involved"
            onClick={(e) => handleScroll(e, "get-involved")}
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            GET INVOLVED
          </a>
          <a
            href="#to-think"
            onClick={(e) => handleScroll(e, "to-think")}
            className="text-sm text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            TO THINK
          </a>
        </div>
      </nav>

      {/* MAPA */}
      <section className="relative w-full h-screen pt-20">
        <div ref={mapContainer} className="w-full h-full absolute inset-0" />
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
                className="relative w-full max-w-6xl h-auto max-h-[90vh] md:h-[680px] bg-white/40 backdrop-blur-2xl border rounded-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden p-6 md:p-10 gap-6 md:gap-10"
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
                  className="absolute top-1/2 left-1 md:left-2 z-40 -translate-y-1/2 cursor-pointer p-2 opacity-70 hover:opacity-100 hover:scale-110 transition-all"
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
                  className="absolute top-1/2 right-1 md:right-2 z-40 -translate-y-1/2 p-2 opacity-70 hover:opacity-100 hover:scale-110 cursor-pointer transition-all"
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
                      className="w-full h-full flex px-6 flex-col md:flex-row gap-6 md:gap-10"
                    >
                      {/* --- IZQUIERDA: --- */}

                      <div className="w-full md:w-5/12 h-[300px] md:h-full flex flex-col relative bg-[#4A69FF] rounded-[2.5rem] overflow-hidden shadow-xl shrink-0">
                        {/* IMAGEN (55% Alto) */}
                        <div className="h-[55%] relative w-full overflow-hidden bg-gray-200">
                          {selectedProject.image ? (
                            <Image
                              src={selectedProject.image}
                              alt={selectedProject.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-light flex items-center justify-center text-white/50 font-alte-bold tracking-widest">
                              NO IMAGE
                            </div>
                          )}
                          {/* Filtro azulado sobre la imagen */}
                        </div>

                        {/* TÍTULO Y DECORACIÓN  */}

                        <div className="h-[45%] bg-[#4A69FF] p-6 flex flex-col items-center justify-center gap-6">
                          {/* Título: Texto blanco, centrado */}
                          <h2 className="text-white text-center font-alte-bold text-3xl md:text-4xl leading-none uppercase wrap-break-word px-4">
                            {selectedProject.name}
                          </h2>

                          {/* Decoración Morse*/}
                          <div className="flex flex-col gap-4 opacity-80">
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

                      <div className="w-full md:w-7/12 h-full overflow-y-auto flex flex-col gap-5 text-[#2D2C67] pr-2 relative z-20">
                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 font-alte-bold text-primary mt-2 md:mt-0">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          ULTIMA ACTUALIZACION:{" "}
                          {selectedProject.updated_at
                            ? new Date(
                                selectedProject.updated_at
                              ).toLocaleDateString("es-ES")
                            : selectedProject.created_at
                            ? new Date(
                                selectedProject.created_at
                              ).toLocaleDateString("es-ES")
                            : "N/A"}
                        </div>

                        {/* Descripción */}
                        <p className="font-alte text-sm md:text-[15px] leading-relaxed text-justify opacity-90 font-medium">
                          {selectedProject.description}
                        </p>

                        {/* Pills y Contenido */}
                        <div className="flex flex-col gap-4 mt-2">
                          {/* Público Objetivo */}
                          <div>
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[14px] px-3 py-1 rounded-full mb-2 uppercase tracking-wider shadow-sm">
                              PÚBLICO OBJETIVO
                            </div>
                            <p className="text-sm opacity-90 font-alte font-bold ml-1">
                              {selectedProject.audience}
                            </p>
                          </div>

                          {/* Servicios */}
                          <div>
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[14px] px-3 py-1 rounded-full mb-2 uppercase tracking-wider shadow-sm">
                              SERVICIOS
                            </div>
                            <p className="text-sm opacity-90 font-alte ml-1">
                              {selectedProject.project_type ||
                                "Consultar servicios disponibles."}
                            </p>
                          </div>

                          {/* Contacto (Al final) */}
                          <div className="mt-auto pt-4">
                            <div className="inline-block bg-[#4A69FF] text-white font-alte-bold text-[14px] px-3 py-1 rounded-full mb-2 uppercase tracking-wider shadow-sm">
                              CONTACTO
                            </div>
                            <p className="text-sm opacity-90 font-alte font-bold ml-1">
                              {selectedProject.contact}
                            </p>
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
