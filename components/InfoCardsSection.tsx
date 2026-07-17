"use client";

import Image from "next/image";
import TiltedCard from "./TiltedCard";
import { motion } from "motion/react";

const cardsData = [
  {
    id: 1,
    title: "¿QUÉ?",
    text: (
      <>
        IMPACTO ES UNA PLATAFORMA DIGITAL QUE{" "}
        <span className="font-alte-bold">
          CENTRALIZA Y ORGANIZA INFORMACIÓN SOBRE PROYECTOS INCLUSIVOS{" "}
        </span>{" "}
        EN DISTINTAS CIUDADES,{" "}
        <span className="font-alte-bold">COMENZAMOS EN BARCELONA</span>. A
        TRAVÉS DE UN MAPA INTERACTIVO, CONTENIDO EDUCATIVO Y ESPACIOS DE
        CONEXIÓN,{" "}
        <span className="font-alte-bold">
          AYUDAMOS A QUE CADA INICIATIVA SEA FÁCIL DE ENCONTRAR PARA QUIEN LA
          NECESITA
        </span>
        , Y A QUE BUSCAR ESPACIOS SEGUROS E INCLUSIVOS DEJE DE SER UN DESAFÍO.
      </>
    ),
    imageSrc: "/images/image-what.jpg",
    align: "left",
  },
  {
    id: 2,
    title: "¿POR QUÉ?",
    text: (
      <>
        CREEMOS QUE{" "}
        <span className="font-alte-bold">
          LA VISIBILIDAD NO DEBERÍA SER UN PRIVILEGIO, SABEMOS LO QUE IMPLICA
          BUSCAR ESPACIOS SEGUROS E INCLUSIVOS:
        </span>{" "}
        INVERTIR TIEMPO, ENERGÍA Y MUCHAS VECES ACABAR CON MÁS DUDAS QUE
        RESPUESTAS. LA INFORMACIÓN SUELE ESTAR DISPERSA, DESACTUALIZADA O
        DEPENDE DEL BOCA A BOCA.{" "}
        <span className="font-alte-bold">
          IMPACTO NACE PARA REDUCIR ESA CARGA Y FACILITAR EL ACCESO
        </span>{" "}
        A RECURSOS, DE FORMA CLARA Y SEGURA.
      </>
    ),
    imageSrc: "/images/image-why.jpg",
    align: "right",
  },
  {
    id: 3,
    title: "¿CÓMO?",
    text: (
      <>
        <span className="font-alte-bold">
          GEOLOCALIZAMOS INICIATIVAS INCLUSIVAS EN UN MAPA PARA QUE LA
          INFORMACIÓN ESTÉ ORGANIZADA
        </span>{" "}
        Y SEA FÁCIL DE EXPLORAR. CONVERTIMOS DATOS DISPERSOS EN RECURSOS CLAROS,
        CON DESCRIPCIONES COMPRENSIBLES Y CRITERIOS COMUNES, Y{" "}
        <span className="font-alte-bold">
          FOMENTAMOS LA COLABORACIÓN ENTRE INICIATIVAS Y COMUNIDAD.{" "}
        </span>
        PARA QUE ORIENTARSE SEA MÁS SENCILLO Y ENCONTRAR OPCIONES SEA MÁS FACIL.
      </>
    ),
    imageSrc: "/images/image-how.jpg",
    align: "left",
  },
];

export default function InfoCardsSection() {
  return (
    <section
      id="about-us"
      className="relative z-10 bg-[#2D2C67] w-full py-20 md:py-40 px-4 md:px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-32">
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
                relative h-auto md:h-[503px] w-full bg-[#4A69FF] rounded-4xl md:rounded-[3rem] shadow-2xl
                flex flex-col md:flex-row items-center
                ${card.align === "right" ? "md:flex-row-reverse" : ""}
              `}
            >
              {/* COLUMNA IMAGEN */}
              <div
                className={`w-full md:w-5/12 h-auto md:h-[570px] md:-my-12 px-6 py-8 md:py-0 z-20 shrink-0 flex justify-center
                  ${
                    card.align === "right"
                      ? "md:justify-start"
                      : "md:justify-end"
                  }
                  ${
                    card.align === "right"
                      ? "md:pr-10 md:pl-0"
                      : "md:pl-10 md:pr-0"
                  }
                  `}
              >
                <TiltedCard className="w-full h-auto md:h-full flex justify-center items-center rounded-[40px] overflow-hidden">
                  <div className="relative w-full max-w-[280px] md:max-w-[380px] h-[350px] md:h-[565px] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-lg">
                    <Image
                      src={card.imageSrc}
                      alt={card.title}
                      width={600}
                      height={800}
                      className="w-full h-full object-cover grayscale"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="eager"
                    />
                    <div className="absolute inset-0 z-10 bg-white opacity-40 mix-blend-normal" />
                    <div className="absolute inset-0 z-10 bg-linear-to-t from-light to-secondary mix-blend-multiply opacity-90" />
                    <div
                      className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                      }}
                    />
                  </div>
                </TiltedCard>
              </div>

              <div className="flex-1 py-8 px-6 md:py-12 md:px-16 text-white flex flex-col justify-center items-center md:items-start text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-alte-bold mb-4 md:mb-8 uppercase tracking-wide">
                  {card.title}
                </h2>
                <p className="font-alte text-sm md:text-md leading-relaxed opacity-100 max-w-2xl">
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
