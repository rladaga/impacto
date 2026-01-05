"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import ImpactoLogoChico from "./ImpactoLogoChico";

export default function FooterSection() {
  return (
    <footer className="w-full bg-[#2D2C67] overflow-hidden flex flex-col items-center">
      <div className="relative w-full max-w-[1440px] flex flex-col items-center justify-center px-8 md:px-16 pt-24 md:pt-32 pb-10 md:pb-20 min-h-[500px] md:min-h-[950px]">
        <div className="absolute inset-0 flex justify-center items-start pt-10 md:pt-20 pointer-events-none opacity-40 md:opacity-100 ">
          <div className="relative w-[180%] h-[450px] md:w-[1301px] md:h-[715px]">
            <Image
              src="/logos/icono-mapa.png"
              alt="Mapa de puntos mundial"
              fill
              className="object-contain object-top"
              priority
            />
          </div>
        </div>

        {/* --- CONTENIDO CENTRAL (TÍTULO Y BOTÓN) --- */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="font-alte-bold text-light text-4xl md:text-[76px] leading-[1.1] tracking-[-0.03em] uppercase mb-6"
          >
            SOMOS UNA ASOCIACIÓN SIN ÁNIMO DE LUCRO
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-alte text-light text-sm md:text-[16px] leading-[1.4] tracking-[-0.03em] mb-10 opacity-80 uppercase"
          >
            TU TIEMPO Y TU TALENTO PUEDEN MARCAR LA DIFERENCIA. SÚMATE A LA RED.
          </motion.p>

          <Link href="/contact">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              viewport={{ once: true }}
              className="group h-9 bg-secondary hover:bg-light text-light hover:text-secondary font-alte-bold text-xs md:text-[16px] px-6 rounded-full flex items-center gap-2 transition-colors shadow-lg cursor-pointer uppercase mt-10 "
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
          </Link>
        </div>
      </div>

      {/* --- PIE DE PÁGINA (LINKS) --- */}
      <div className="w-full max-w-[1440px] px-8 md:px-16 pb-16 z-20">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end pt-0 md:pt-12">
          {/* Logo Izquierda */}
          <div className="mb-8 md:mb-0">
            <div className="w-24 md:w-32">
              <ImpactoLogoChico fill="#4A69FF" className="w-full h-auto" />
            </div>
          </div>

          {/* Columnas de Links */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-24 text-xs md:text-[16px] font-alte text-secondary uppercase text-left w-full md:w-auto">
            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF]">ENCUÉNTRANOS</h4>
              <p className="hover:text-accent cursor-default transition-colors">
                BARCELONA, ESPAÑA
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF] ">HABLEMOS</h4>
              <a
                href="https://www.linkedin.com/company/makeimpacto/"
                target="_blank"
                className="hover:text-accent transition-colors"
              >
                LINKEDIN
              </a>
              <a
                href="https://www.instagram.com/make.impacto/"
                target="_blank"
                className="hover:text-accent transition-colors"
              >
                INSTAGRAM
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-alte-bold text-[#4A69FF] ">
                COLABORA CON NOSOTROS
              </h4>
              <a
                href="mailto:crew.impacto@gmail.com"
                className="hover:text-accent transition-colors"
              >
                CREW.IMPACTO@GMAIL.COM
              </a>
              <a
                href="/contact"
                className="hover:text-accent transition-colors"
              >
                SÚMATE AQUÍ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
