// components/SplashScreen.tsx
"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import HollowGlobe from "./HollowGlobe";
import ImpactoLogo from "./ImpactoLogo";

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isClient, setIsClient] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-linear-to-b from-light to-secondary flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Isotipo mientras carga */}
      {!globeReady && (
        <motion.div
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute inset-0 flex items-center justify-center z-20 scale-60"
        >
          <ImpactoLogo />
        </motion.div>
      )}

      {/* Globe Container */}
      {isClient && (
        <div
          className="absolute top-0 left-0 right-0 bottom-0 w-full"
          style={{ height: "500px" }}
        >
          <HollowGlobe onReady={setGlobeReady} />
        </div>
      )}

      {/* Contenedor principal */}
      {globeReady && (
        <div className="text-center space-y-8 relative z-10">
          {/* Texto superior - "Estamos preparando algo grande" */}
          <motion.p
            className="text-light font-medium text-lg w-fit flex mx-auto px-4 py-2 rounded-md text-center bg-primary/70 backdrop-blur-sm font-alte-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Estamos preparando algo grande
          </motion.p>

          {/* Línea divisora animada */}
          <motion.div
            className="w-24 h-1 bg-primary mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          {/* Texto principal */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-light max-w-2xl leading-tight font-alte-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Somos el punto donde la necesidad encuentra la oportunidad.
          </motion.h1>

          {/* Botón "Entrar" */}
          <motion.button
            onClick={onEnter}
            className="mt-12 px-8 py-3 bg-primary text-light font-semibold rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 8px 15px rgba(74, 105, 255, 0.3)",
              backgroundColor: "#3b4fc1",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Entrar
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
