"use client";

import { Suspense } from "react";
import { motion } from "motion/react";
import ContactForm from "@/components/ContactForm";
import ImpactoLogo from "@/components/ImpactoLogo";
import { useSearchParams } from "next/navigation";

function ContactContent() {
  const searchParams = useSearchParams();
  const participationType = searchParams.get("type") || "voluntariado";

  return (
    <main className="pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-alte-bold text-light mb-4 uppercase tracking-wide">
            Nos encantaría conocerte y sumar tu mirada a{" "}
            <ImpactoLogo fill="#D5D6DA" className="inline w-70 h-auto -mt-4" />
          </h1>
          <p className="text-lg text-accent font-alte leading-relaxed">
            Completa el formulario y te contactaremos.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-light/10 backdrop-blur-md border border-light/20 rounded-2xl p-8 md:p-12 shadow-xl"
        >
          <ContactForm defaultParticipation={participationType} />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-1 gap-8 text-center"
        >
          <div>
            <h3 className="text-xl font-alte-bold text-light mb-2">
              Privacidad
            </h3>
            <p className="text-accent">
              Tus datos son seguros y no serán compartidos
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-primary">
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-8 shadow-lg">
        <a href="/" className="flex items-center w-40">
          <ImpactoLogo fill="#D5D6DA" className="w-32 h-auto" />
        </a>
      </nav>

      <Suspense
        fallback={
          <div className="pt-40 flex justify-center items-center">
            <div className="text-white animate-pulse">
              Cargando formulario...
            </div>
          </div>
        }
      >
        <ContactContent />
      </Suspense>
    </div>
  );
}
