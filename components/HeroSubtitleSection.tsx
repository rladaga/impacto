"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function HeroSubtitleSection() {
  return (
    <section className="relative z-10 bg-[#2D2C67] w-full py-24 px-8 flex flex-col items-center justify-center text-center">
      {/* Contenedor de Iconos:*/}
      <div className="flex justify-center items-start mt-4 mb-2">
        {/* Icono del mundo (Izquierda - Abajo) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          viewport={{ once: true }}
          className="pt-14 md:pt-16 z-10"
        >
          <Image
            src="/logos/icono-mundito.png"
            alt="Icono Mundo"
            width={160}
            height={160}
            className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl"
          />
        </motion.div>

        {/* Icono sonriente (Derecha - Arriba) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 10 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          viewport={{ once: true }}
          className="-ml-6 md:-ml-10 pb-4 z-20"
        >
          <Image
            src="/logos/icono-smile.png"
            alt="Icono Sonriente"
            width={160}
            height={160}
            className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Texto del subtítulo */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="text-white font-alte-bold text-lg md:text-2xl leading-relaxed max-w-4xl mx-auto mb-16 tracking-wide px-4"
      >
        UN ESPACIO QUE AMPLIFICA, UNA HERRAMIENTA QUE CONECTA. QUE NINGUNA
        FAMILIA, NINGÚN PROYECTO Y NINGUNA BUENA IDEA SE QUEDE SOLA O INVISIBLE.
      </motion.h2>

      {/* Flecha hacia abajo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.5,
          delay: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        viewport={{ once: true }}
        className="mt-2"
      >
        <Image
          src="/logos/icono-flecha.png"
          alt="Flecha hacia abajo"
          width={160}
          height={160}
          className="w-32 h-32 md:w-32 md:h-32 rotate-90 opacity-90"
        />
      </motion.div>
    </section>
  );
}
