"use client";

import Image from "next/image";
import { motion } from "motion/react";

const infoItems = [
  {
    title: "ACCESIBILIDAD:",
    text: "HACEMOS QUE LA INFORMACIÓN SEA CLARA Y FÁCIL DE ENCONTRAR.",
  },
  {
    title: "CONEXIÓN:",
    text: "FOMENTAMOS LA COLABORACIÓN Y EL INTERCAMBIO DE EXPERIENCIAS.",
  },
  {
    title: "INNOVACIÓN:",
    text: "USAMOS TECNOLOGÍA PARA FACILITAR EL ACCESO A INFORMACIÓN CLAVE.",
  },
  {
    title: "RESPETO:",
    text: "CELEBRAMOS LA DIVERSIDAD COMO MOTOR DE CAMBIO.",
  },
];

export default function InfoGridSection() {
  return (
    <section className="relative z-10 w-full h-auto md:h-[848px] flex flex-col md:flex-row">
      {/* --- COLUMNA IZQUIERDA (TEXTO) --- */}
      <div className="w-full md:w-1/2 bg-[#D9D9D9] flex flex-col justify-center items-center py-16 px-8 md:px-20">
        <div className="max-w-xl w-full flex flex-col items-center gap-12">
          {infoItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center w-full"
            >
              <h3 className="text-[#2D2C67] font-alte-bold text-xl md:text-2xl leading-6 uppercase mb-2">
                {item.title}{" "}
                <span className="font-alte-bold text-[#2D2C67]">
                  {item.text}
                </span>
              </h3>

              {/* Puntos separadores (Solo si no es el último elemento) */}
              {index !== infoItems.length - 1 && (
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="w-5 h-5 bg-[#4A69FF] rounded-full mt-12 hover:shadow-[#4A69FF]"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- COLUMNA DERECHA (IMAGEN) --- */}
      <div className="w-full md:w-1/2 h-[500px] md:h-full relative overflow-hidden">
        {/* Imagen de Fondo (Basket) */}
        <Image
          src="/images/image-basket.jpg"
          alt="Basket Inclusivo"
          fill
          className="object-cover grayscale"
        />

        {/* Logo Superpuesto (Gente conectada) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.2 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 10,
            }}
            viewport={{ once: true }}
          >
            <Image
              src="/logos/icono-personas.png"
              alt="Icono Conexión"
              width={300}
              height={300}
              className="w-40 h-auto md:w-64 opacity-90"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
