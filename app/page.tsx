"use client";

import { motion, AnimatePresence, type Variants } from "motion/react";
import { useState, useEffect } from "react";
import ContactForm from "@/components/ContactForm";
import ImpactoLogo from "@/components/ImpactoLogo";
import SplashScreen from "@/components/SplashScreen";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [navBgColor, setNavBgColor] = useState("rgb(6, 22, 90)");

  const handleEnter = () => {
    setShowContent(true);
  };

  useEffect(() => {
    const getBackgroundColor = () => {
      const element = document.querySelector("main");
      if (element) {
        const color = window.getComputedStyle(element).backgroundColor;
        setNavBgColor(color);
      }
    };
    window.addEventListener("scroll", getBackgroundColor);
    return () => window.removeEventListener("scroll", getBackgroundColor);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsLogoVisible(window.scrollY < 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {!showContent && <SplashScreen onEnter={handleEnter} />}

      {showContent && (
        <>
          {isLogoVisible ? null : (
            <motion.nav
              className="fixed top-0 left-0 right-0 z-40 bg-light/99 backdrop-blur-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: navBgColor,
                boxShadow: "0 2px 16px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div className="w-full flex items-center mb-0 justify-center sm:h-[55px] lg:h-[70px] mt-4 text-center">
                {/* Logo in Navbar - Centered */}
                <motion.div
                  animate={{
                    scale: isLogoVisible ? 0 : 1,
                    opacity: isLogoVisible ? 0 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="scale-40 lg:scale-30"
                >
                  <ImpactoLogo />
                </motion.div>
              </div>
            </motion.nav>
          )}

          {/* CONTENIDO PRINCIPAL */}
          <motion.main
            className="min-h-screen bg-linear-to-b from-light to-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          >
            <div className="container mx-auto px-4 py-12">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* Logo con animación */}
                <motion.div className="mb-16" variants={itemVariants}>
                  <ImpactoLogo />
                </motion.div>
                <motion.section
                  className="max-w-4xl mx-auto mb-12 px-6"
                  variants={itemVariants}
                >
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight text-center"
                    variants={itemVariants}
                  >
                    Un espacio que amplifica, una herramienta que conecta.
                  </motion.h2>
                  <motion.div
                    className="space-y-4 text-dark text-lg leading-relaxed text-center"
                    variants={itemVariants}
                  >
                    <p>
                      En todo el mundo, existen miles de proyectos, personas y
                      espacios que trabajan por la inclusión y la discapacidad.
                      Pero muchos siguen sin visibilidad, sin conexión y sin el
                      alcance que merecen.
                    </p>
                    <p>
                      <span className="font-bold text-secondary">
                        <strong>IMPACTO</strong>
                      </span>{" "}
                      nace como una red digital que geolocaliza iniciativas,
                      conecta actores y amplifica el trabajo inclusivo.
                    </p>
                    <p>
                      Una herramienta sencilla para algo muy grande: Que ninguna
                      familia, ningún proyecto y ninguna buena idea se quede
                      sola o invisible.
                    </p>
                    <p className="text-secondary font-medium">
                      Todavía estamos desarrollando la plataforma, pero la red
                      ya está creciendo.
                    </p>
                  </motion.div>
                </motion.section>
                {/* Card blanca con contenido */}
                <motion.div
                  className="bg-linear-to-b from-secondary to-accent rounded-lg shadow-lg p-8 max-w-2xl mx-auto"
                  variants={itemVariants}
                >
                  <motion.h2
                    className="text-2xl text-light font-semibold mb-3"
                    variants={itemVariants}
                  >
                    Comienza a generar impacto desde hoy
                  </motion.h2>
                  <motion.p className="text-dark mb-3" variants={itemVariants}>
                    Súmate dejando tu contacto.{" "}
                  </motion.p>
                  <motion.p className="text-dark mb-6" variants={itemVariants}>
                    En <strong>IMPACTO</strong> buscamos{" "}
                    <strong>familias y personas con discapacidad</strong> que
                    necesiten recursos cercanos, <strong>profesionales</strong>{" "}
                    que quieran aportar,{" "}
                    <strong>proyectos y asociaciones</strong> que buscan
                    visibilidad y alianzas, y{" "}
                    <strong>empresas o fundaciones</strong> con RSC/ESG. Si te
                    interesa conectar, aprender o colaborar, déjanos tu
                    contacto: te avisaremos del lanzamiento, novedades y
                    oportunidades para participar.
                  </motion.p>
                  {/* Formulario */}
                  <motion.div variants={itemVariants}>
                    <ContactForm />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.main>
        </>
      )}
    </AnimatePresence>
  );
}
