"use client";

import Image from "next/image";
import { motion } from "motion/react";
import ImpactoLogoChico from "./ImpactoLogoChico";

export default function FooterSection() {
  return (
    <footer className="relative w-full bg-[#2D2C67] overflow-hidden flex flex-col items-center">
      {/* --- CONTENEDOR PRINCIPAL --- */}
      {/* CAMBIO CLAVE: min-h-[900px] en lugar de h-[...]. 
          Esto permite que crezca si falta espacio y evita el corte. 
          Aumenté el pb (padding-bottom) a 20 para darle aire abajo. */}
      <div className="relative w-full max-w-[1440px] min-h-[900px] h-auto flex flex-col justify-between pt-32 pb-24 px-8 md:px-16">
        {/* Fondo del Mapa */}
        <div className="absolute inset-0 flex justify-center items-start pt-20 pointer-events-none opacity-40 md:opacity-100">
          <div className="relative w-[1301px] h-[715px]">
            <Image
              src="/logos/icono-mapa.png"
              alt="Mapa de puntos mundial"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* --- CONTENIDO CENTRAL --- */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-10 md:mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="font-alte-bold text-light text-4xl md:text-[96px] leading-[1.1] tracking-[-0.03em] uppercase mb-6"
          >
            SOMOS UNA ASOCIACIÓN <br className="hidden md:block" /> SIN ÁNIMOS
            DE LUCRO
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-alte text-light text-sm md:text-[16px] leading-[1.4] tracking-[-0.03em] mb-10 opacity-80 uppercase"
          >
            Tu apoyo marca la diferencia en la vida de muchas personas
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            viewport={{ once: true }}
            // CAMBIO AQUÍ: text-primary por text-light
            className="group h-9 bg-secondary hover:bg-light text-light hover:text-secondary font-alte-bold text-xs md:text-[16px] px-6 rounded-full flex items-center gap-2 transition-colors shadow-lg cursor-pointer uppercase "
          >
            SE PARTE
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors"
            >
              <path
                d="M1 13L13 1M13 1H5M13 1V9"
                className="stroke-primary group-hover:stroke-secondary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>

        {/* --- PIE DE PÁGINA (LINKS) --- */}
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end md:items-end mt-16 pt-20 border-t border-white/10 md:border-none">
          {/* Logo Izquierda */}
          <div className="mb-8 md:mb-0">
            <div className="w-24 md:w-32">
              <ImpactoLogoChico fill="#4A69FF" className="w-full h-auto" />
            </div>
          </div>

          {/* Columnas de Links */}
          <div className="flex flex-wrap gap-12 md:gap-24 text-[10px] md:text-[16px] font-alte text-secondary uppercase text-left">
            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF]">FIND US</h4>
              <a href="#" className="hover:text-accent transition-colors">
                BARCELONA, SPAIN
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF] ">LET'S TALK</h4>
              <a href="#" className="hover:text-accent transition-colors">
                LINKEDIN
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                INSTAGRAM
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF] ">WORK WITH US</h4>
              <a
                href="mailto:crew.impacto@gmail.com"
                className="hover:text-accent transition-colors"
              >
                CREW.IMPACTO@GMAIL.COM
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                APPLY HERE
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
