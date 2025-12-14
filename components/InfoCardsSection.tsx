"use client";

import Image from "next/image";
import TiltedCard from "./TiltedCard";
import { motion } from "motion/react";

const cardsData = [
  {
    id: 1,
    title: "¿QUÉ?",
    text: "IMPACTO ES UNA PLATAFORMA DIGITAL QUE CENTRALIZA Y ORGANIZA INFORMACIÓN SOBRE PROYECTOS INCLUSIVOS EN DISTINTOS PAÍSES. A TRAVÉS DE UN MAPA INTERACTIVO, CONTENIDO EDUCATIVO Y ESPACIOS DE CONEXIÓN, AYUDAMOS A QUE CADA INICIATIVA CREZCA Y TENGA EL IMPACTO QUE MERECE.",
    imageSrc: "/images/image-what.png",
    align: "left",
  },
  {
    id: 2,
    title: "¿POR QUÉ?",
    text: "CREEMOS QUE LA VISIBILIDAD NO DEBERÍA SER UN PRIVILEGIO. EXISTEN MILES DE PROYECTOS INCLUSIVOS TRANSFORMANDO VIDAS, PERO MUCHOS PERMANECEN INVISIBLES, DESCONECTADOS ENTRE SÍ Y SIN ACCESO A LOS RECURSOS QUE PODRÍAN POTENCIAR SU IMPACTO. IMPACTO NACE PARA CAMBIAR ESO. QUEREMOS CONSTRUIR UN MUNDO DONDE LAS INICIATIVAS INCLUSIVAS NO TENGAN QUE LUCHAR POR SER VISTAS, SINO QUE SEAN RECONOCIDAS, APOYADAS Y MULTIPLICADAS.",
    imageSrc: "/images/image-why.png",
    align: "right",
  },
  {
    id: 3,
    title: "¿CÓMO?",
    text: "LO HACEMOS SIMPLIFICANDO EL ACCESO A LA INFORMACIÓN Y CONSTRUYENDO PUENTES ENTRE INICIATIVAS INCLUSIVAS Y QUIENES PUEDEN APOYARLAS. USAMOS HERRAMIENTAS DIGITALES INTUITIVAS, UN LENGUAJE ACCESIBLE Y UNA RED COLABORATIVA PARA QUE ESTOS PROYECTOS SEAN MÁS VISIBLES Y SOSTENIBLES.",
    imageSrc: "/images/image-how.png",
    align: "left",
  },
];

export default function InfoCardsSection() {
  return (
    <section className="relative z-10 bg-[#2D2C67] w-full py-40 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-32">
        {cardsData.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`
              w-full md:w-[90%]
              ${card.align === "right" ? "self-end" : "self-start"}
            `}
          >
            {/* CONTENEDOR AZUL PADRE */}
            <div
              className={`
                relative h-[503px] w-[1183px] bg-[#4A69FF] rounded-[3rem] shadow-2xl
                flex flex-col md:flex-row items-center
                ${card.align === "right" ? "md:flex-row-reverse" : ""}
              `}
            >
              {/* COLUMNA IMAGEN */}
              {/* Ajuste: Mantenemos las dimensiones fijas que pediste */}
              <div className="w-full md:w-5/12 h-[644px] md:-my-12 px-6 md:px-10 py-6 md:py-0 z-20 shrink-0 flex justify-center">
                <TiltedCard className="w-full h-full flex justify-center">
                  <div className="relative w-[466px] h-[644px] rounded-[20px] overflow-hidden">
                    <Image
                      src={card.imageSrc}
                      alt={card.title}
                      fill
                      className="object-cover opacity-100"
                    />
                  </div>
                </TiltedCard>
              </div>

              <div className="flex-1 py-12 px-8 md:px-16 text-white flex flex-col justify-center md:text-left items-start">
                <h2 className="text-[60px] md:text-6xl font-alte-bold mb-8 uppercase tracking-wide">
                  {card.title}
                </h2>
                <p className="font-alte text-[16px] md:text-base leading-relaxed tracking-wide opacity-100 max-w-2xl">
                  {card.text}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
