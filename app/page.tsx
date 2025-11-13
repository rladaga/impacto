"use client";

import { motion, type Variants } from "motion/react";
import { useState, useEffect } from "react";
import ContactForm from "@/components/ContactForm";
import ImpactoLogo from "@/components/ImpactoLogo";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* SPLASH SCREEN - Fondo blanco con isotipo */}
      {!showContent && (
        <motion.div
          className="fixed inset-0 bg-white flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{
            duration: 1.2,
            delay: 2.8,
            ease: "easeOut",
          }}
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width="254"
              height="374"
              viewBox="0 0 254 374"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_25)">
                <path
                  d="M228.26 119.44H177.54C163.54 119.44 152.18 130.8 152.18 144.8V296.97C152.18 310.97 140.82 322.33 126.82 322.33C112.82 322.33 101.46 310.97 101.46 296.97V144.8C101.46 130.8 90.1 119.44 76.1 119.44H25.36C11.36 119.44 0 108.08 0 94.08C0 80.08 11.36 68.72 25.36 68.72H76.08C90.08 68.72 101.44 80.08 101.44 94.08C101.44 108.08 112.8 119.44 126.8 119.44C140.8 119.44 152.16 108.08 152.16 94.08C152.16 80.08 163.52 68.72 177.52 68.72H228.24C242.24 68.72 253.6 80.08 253.6 94.08C253.6 108.08 242.24 119.44 228.24 119.44H228.26Z"
                  fill="#4A69FF"
                />
                <path
                  d="M25.36 322.34H76.08C90.08 322.34 101.44 310.98 101.44 296.98V144.81C101.44 130.81 112.8 119.45 126.8 119.45C140.8 119.45 152.16 130.81 152.16 144.81V296.98C152.16 310.98 163.52 322.34 177.52 322.34H228.24C242.24 322.34 253.6 333.7 253.6 347.7C253.6 361.7 242.24 373.06 228.24 373.06H177.52C163.52 373.06 152.16 361.7 152.16 347.7C152.16 333.7 140.8 322.34 126.8 322.34C112.8 322.34 101.44 333.7 101.44 347.7C101.44 361.7 90.08 373.06 76.08 373.06H25.36C11.36 373.06 0 361.7 0 347.7C0 333.7 11.36 322.34 25.36 322.34Z"
                  fill="#4A69FF"
                />
                <path
                  d="M126.81 56.46C142.401 56.46 155.04 43.821 155.04 28.23C155.04 12.639 142.401 0 126.81 0C111.219 0 98.58 12.639 98.58 28.23C98.58 43.821 111.219 56.46 126.81 56.46Z"
                  fill="#4A69FF"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_25">
                  <rect width="253.62" height="373.06" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <motion.main
        className="min-h-screen bg-linear-to-b from-light to-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {/* Logo con animación */}
            <motion.div variants={itemVariants}>
              <ImpactoLogo />
            </motion.div>

            {/* Card blanca con contenido */}
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              <motion.h2
                className="text-2xl text-secondary font-semibold mb-3"
                variants={itemVariants}
              >
                Mantente informado
              </motion.h2>

              <motion.p className="text-dark mb-3" variants={itemVariants}>
                Estamos trabajando en una plataforma para visibilizar proyectos
                inclusivos. Déjanos tu información para estar al tanto de
                nuestras novedades.
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
  );
}
