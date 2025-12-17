"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function QuestionsSection() {
  return (
    <section
      id="to-think"
      className="relative z-10 w-full py-40 px-4 bg-light overflow-hidden flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* Arriba Izquierda */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute top-24 left-[14%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Arriba Centro */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
          className="absolute top-20 left-[48%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Arriba Derecha */}
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{
            duration: 2.3,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
          className="absolute top-32 right-[10%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Centro Izquierda */}
        <motion.div
          animate={{ y: [0, -22, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "linear",
            delay: 0.2,
          }}
          className="absolute top-80 left-[10%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Abajo Izquierda */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{
            duration: 2.1,
            repeat: Infinity,
            ease: "linear",
            delay: 0.8,
          }}
          className="absolute bottom-24 left-[12%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Abajo Derecha (Cerca del borde) */}
        <motion.div
          animate={{ y: [0, -19, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "linear",
            delay: 0.3,
          }}
          className="absolute bottom-40 right-[8%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
        {/* Abajo Centro-Derecha */}
        <motion.div
          animate={{ y: [0, -21, 0] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "linear",
            delay: 0.6,
          }}
          className="absolute bottom-20 right-[25%] w-8 h-8 bg-secondary pointer-events-auto hover:bg-primary transition-colors duration-200 rounded-full"
        />
      </div>

      {/* --- CONTENEDOR DE TARJETAS --- */}
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-center max-w-7xl mx-auto gap-8 md:gap-0">
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: 0 }}
          whileInView={{ opacity: 1, x: 0, rotate: 6 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          viewport={{ once: true }}
          className="z-10 md:mr-[-15px]"
        >
          <div className="w-[459.95px] h-[337.93px] bg-primary rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="mb-2 relative w-[120px] h-[120px] shrink-0">
              <Image
                src="/logos/icono-pregunta-1.png"
                alt="Icono Entrada"
                fill
                className="object-contain"
              />
            </div>

            <h3 className="font-alte-bold text-light text-xl md:text-xl leading-snug tracking-wide uppercase mb-2">
              ¿CÓMO PODEMOS ASEGURARNOS DE QUE EL ACCESO A OPORTUNIDADES NO
              DEPENDA DE LA SUERTE, SINO DE SISTEMAS JUSTOS Y ACCESIBLES PARA
              TODOS?
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 0 }}
          whileInView={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          viewport={{ once: true }}
          className="z-0 md:ml-[-15px]"
        >
          <div className="w-[459.95px] h-[337.93px] bg-secondary rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="mb-2 relative w-[120px] h-[120px] shrink-0">
              <Image
                src="/logos/icono-pregunta.png"
                alt="Icono Pregunta"
                fill
                className="object-contain"
              />
            </div>

            <h3 className="font-alte-bold text-light text-xl md:text-xl leading-snug tracking-wide uppercase relative mb-2">
              <span className="relative z-10">¿QUÉ IMPACTO TENDRÍA EN TU </span>
              <span className="relative inline-block mx-1">
                <span className="relative z-10">
                  COMUNIDAD SI LOS PROYECTOS INCLUSIVOS LOCALES TUVIERAN EL
                </span>

                <span className="absolute bottom-1 left-0 w-full h-3 -rotate-1 z-0"></span>
              </span>
              <span className="relative z-10">
                {" "}
                APOYO Y LA VISIBILIDAD QUE NECESITAN{" "}
              </span>
              <span className="relative inline-block mx-1">
                <span className="relative z-10">PARA CRECER?</span>
                <span className="absolute bottom-1 left-0 w-full h-3 -rotate-1 z-0"></span>
              </span>
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
