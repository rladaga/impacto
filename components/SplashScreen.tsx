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
  const [globeReady, setGlobeReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* CAPA 1: EL FONDO (TEXTURA)
        Ponemos la textura al fondo.
      */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/Textura-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* CAPA 2: EL GLOBO
        Se renderiza ENCIMA de la textura. 
        Gracias al `mixBlendMode: "screen"` en HollowGlobe.tsx, 
        el negro del globo se vuelve transparente y solo queda la luz azul.
      */}
      {isClient && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
          <div className="w-full h-full md:h-[80%]">
            <HollowGlobe onReady={setGlobeReady} />
          </div>
        </div>
      )}

      {/* CAPA 3: VIGNETTE (Opcional)
         Un degradado sutil para oscurecer las esquinas y centrar la atención
      */}
      <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

      {/* CAPA 4: CONTENIDO UI */}
      {!globeReady && (
        <motion.div
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="w-[180px] md:w-auto transform md:scale-100">
            <ImpactoLogo />
          </div>
        </motion.div>
      )}

      {globeReady && (
        <div className="text-center space-y-8 relative z-30 px-4 mt-10">
          <motion.p
            className="text-light font-medium text-sm md:text-lg inline-block px-6 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Estamos preparando algo grande
          </motion.p>

          <motion.div
            className="w-24 h-1 bg-primary mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Somos el punto donde la necesidad encuentra la oportunidad.
          </motion.h1>

          <motion.button
            onClick={onEnter}
            className="mt-12 px-10 py-4 bg-primary text-white text-lg font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(62,100,255,0.6)] transition-all cursor-pointer border border-white/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05, backgroundColor: "#3250cc" }}
            whileTap={{ scale: 0.95 }}
          >
            Entrar
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
