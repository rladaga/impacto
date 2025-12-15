"use client";

import { motion } from "motion/react";

const actions = [
  { label: "DONAR", href: "#" },
  { label: "VOLUNTARIADO DIGITAL", href: "#" },
  { label: "SE SOCIO", href: "#" },
  { label: "PATROCINIO Y ALIANZAS", href: "#" },
];

export default function ContributeSection() {
  return (
    <section
      id="get-involved"
      className="relative z-10 w-full py-32 bg-[#2D2C67] overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div className="relative z-10 max-w-4xl px-6">
        {/* TÍTULOS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-white font-alte-bold text-4xl md:text-6xl uppercase">
            <span className="opacity-90 block md:inline">¿CÓMO PUEDES</span>{" "}
            <span className="block md:inline">SER PARTE?</span>
          </h2>
        </motion.div>

        {/* BOTONES */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          {actions.map((action, index) => (
            <motion.a
              key={index}
              href={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group w-fit min-w-[180px] bg-[#4A69FF] hover:bg-light text-white font-alte-bold py-2 px-6 rounded-full flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
            >
              <span className="text-sm md:text-base group-hover:text-secondary whitespace-nowrap">
                {action.label}
              </span>

              {/* Icono Flecha SVG */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-colors duration-300"
              >
                <path
                  d="M1 13L13 1M13 1H5M13 1V9"
                  className="stroke-[#2D2C67] group-hover:stroke-secondary"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
