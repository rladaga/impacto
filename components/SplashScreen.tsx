"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import HollowGlobe from "./HollowGlobe";
import ImpactoLogo from "./ImpactoLogo";

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [globeReady, setGlobeReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-9999 overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* --- CAPA 1: FONDO GRADIENTE + RUIDO --- */}

      <div className="absolute inset-0 z-0 bg-linear-to-t from-[#2D2C67] to-[#050510]" />

      {/* 2. Textura de Ruido (Noise) generada con SVG para evitar archivos externos */}
      <div
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* --- CAPA 2: GLOBO 3D (CENTRADO EXACTO) --- */}
      {isClient && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <video
            autoPlay
            muted
            loop
            onCanPlayThrough={() => setVideoReady(true)}
            className="w-screen h-screen md:w-screen md:h-screen transition-opacity duration-1000 ease-out object-cover"
            style={{ opacity: videoReady ? 1 : 0 }}
          >
            <source src="/videos/Impacto-mundo.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* --- CAPA DE CARGA (Placeholder mientras carga el globo) --- */}
      {!videoReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-[200px] animate-pulse opacity-30">
            <ImpactoLogo fill="#FFFFFF" />
          </div>
        </div>
      )}

      {/* --- CAPA 3: UI (LOGO Y BOTÓN) --- */}

      {videoReady && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
          {/* LOGO IMPACTO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-[280px] md:w-[620px] mb-6"
          >
            <ImpactoLogo fill="#FFFFFF" />
          </motion.div>

          {/* BOTÓN "COMENZAR" */}
          <motion.button
            onClick={onEnter}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#2D2C67] px-8 py-2 rounded-full text-[11px] md:text-lg hover:text-xl font-alte-bold  uppercase transition-all cursor-pointer z-40 pointer-events-auto"
          >
            COMENZAR
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
