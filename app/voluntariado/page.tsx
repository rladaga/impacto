"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import ImpactoLogo from "../../components/ImpactoLogo";
import ImpactoLogoChico from "../../components/ImpactoLogoChico";

interface Opportunity {
  id: string;
  title: string;
  entity: string;
  area: string;
  about_project: string;
  role: string;
  image_url?: string;
  location: string;
  hours: string;
  start_date: string;
  is_active?: boolean;
}

const DECORATIVE_DOTS = [
  { left: "11.4%", top: "5%" },
  { left: "21.4%", top: "47%" },
  { left: "30.5%", top: "80%" },
  { left: "79.2%", top: "55%" },
  { left: "63.2%", top: "86%" },
  { left: "88.3%", top: "8%" },
  { left: "59.3%", top: "5%" },
  { left: "38.3%", top: "0%" },
  { left: "10.3%", top: "93%" },
  { left: "47.6%", top: "96%" },
  { left: "82.8%", top: "88%" },
];

export default function VoluntariadoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [currentOpportunitiesIndex, setCurrentOpportunitiesIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);

  // Active opportunities from Supabase (`volunteer_opportunities`).
  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) =>
        setOpportunities(
          Array.isArray(data)
            ? data.filter((o: Opportunity) => o.is_active !== false)
            : [],
        ),
      )
      .catch(() => setOpportunities([]))
      .finally(() => setLoadingOpportunities(false));
  }, []);

  const openModal = (opportunity?: Opportunity) => {
    setSelectedOpportunity(opportunity || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOpportunity(null), 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Single form, two modes (PDF): an opportunity_id makes it a postulación
    // (email entidad + IMPACTO); without it, a perfil stored in the DB.
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          opportunity_id: selectedOpportunity?.id ?? null,
        }),
      });

      if (!res.ok) throw new Error("request failed");
      alert("¡Gracias! Tus datos han sido registrados.");
      closeModal();
    } catch (err) {
      console.error("Error registrando voluntario:", err);
      alert("Hubo un error al enviar tus datos. Inténtalo de nuevo.");
    }
  };

  const nextOpportunity = () => {
    setCurrentOpportunitiesIndex((prev) =>
      opportunities.length ? (prev + 1) % opportunities.length : 0,
    );
  };

  const prevOpportunity = () => {
    setCurrentOpportunitiesIndex((prev) =>
      opportunities.length
        ? (prev - 1 + opportunities.length) % opportunities.length
        : 0,
    );
  };

  const currentOpportunity = opportunities[currentOpportunitiesIndex];

  return (
    <div className="w-full min-h-screen bg-primary flex flex-col">
      {/* Nav — mirrors the home page navbar (text, sizes, anchors). The anchor links
          point at /#section so they navigate home and scroll to the right area.
          Logo links to /#top so the splash is skipped (same hash signal). */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-4 md:px-8 shadow-lg">
        <Link href="/#top" className="flex items-center w-32 md:w-40 relative z-50">
          <ImpactoLogo fill="#D5D6DA" className="w-full h-auto" />
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="/voluntariado"
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            VOLUNTARIADO
          </Link>
          <Link
            href="/profesionales"
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            PROFESIONALES
          </Link>
          <Link
            href="/#about-us"
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            CONÓCENOS
          </Link>
          <Link
            href="/#get-involved"
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            ÚNETE
          </Link>
          <Link
            href="/#to-think"
            className="text-md text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
          >
            REFLEXIONA
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#D5D6DA] relative z-50 p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 w-full bg-primary shadow-xl flex flex-col items-center pt-24 pb-10 gap-8 md:hidden z-40 border-b border-white/10"
            >
              <Link
                href="/voluntariado"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                VOLUNTARIADO
              </Link>
              <Link
                href="/profesionales"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                PROFESIONALES
              </Link>
              <Link
                href="/#about-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                CONÓCENOS
              </Link>
              <Link
                href="/#get-involved"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                ÚNETE
              </Link>
              <Link
                href="/#to-think"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-light font-alte-bold hover:text-accent transition-colors tracking-wide"
              >
                REFLEXIONA
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grow pt-20 text-light"
      >
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[600px] md:min-h-[760px] flex items-center justify-center px-4 md:px-8 py-24 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-secondary/10 via-primary to-primary pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-10 w-[160px] h-[160px] md:w-[200px] md:h-[200px] relative"
            >
              <Image
                src="/logos/icono-smile.png"
                alt="Voluntario"
                fill
                className="object-contain"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-hero-title mb-6"
            >
              Quiero ser <br /> Voluntario
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base md:text-display-subtitle text-secondary mx-auto max-w-sm md:max-w-[500px] text-pretty mb-14"
            >
              Explora búsquedas activas de voluntariado o completa tu perfil
              para formar parte de futuras oportunidades.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center"
            >
              {/* Simple chevron-down matching the wide/short shape from Figma (33x16). */}
              <svg
                className="w-10 h-5 md:w-12 md:h-6 text-[hsla(228,6%,85%,1)] animate-bounce"
                viewBox="0 0 32 16"
                fill="none"
              >
                <path
                  d="M2 2 L16 14 L30 2"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* GRADIENT WRAPPER (opportunities + CTA): exact Figma stops —
            light gray-blue at top → soft lavender-blue in the middle → vibrant blue at the bottom.
            Section is intentionally tall to match the airy spacing in the Figma file. */}
        <div
          style={{
            background:
              "linear-gradient(to bottom, hsla(228, 6%, 85%, 1) 0%, hsla(230, 72%, 75%, 1) 50%, hsla(230, 100%, 65%, 1) 100%)",
          }}
        >
          {/* OPPORTUNITIES SECTION */}
          <section className="w-full px-4 md:px-8 pt-20 md:pt-32 pb-32 md:pb-56">
            <div className="max-w-6xl mx-auto">
              {/* Badge — Figma: pill text fills almost all of the pill space, regular weight, 23.47px */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center bg-primary rounded-full px-6 md:px-8 py-1 md:py-1.5 shadow-lg">
                  <span className="text-light text-sm md:text-pill-label uppercase">
                    Voluntariados Disponibles
                  </span>
                </div>
              </motion.div>

              {/* Carousel */}
              {loadingOpportunities ? (
                <div className="text-center py-16 text-primary font-alte-bold uppercase tracking-wide">
                  Cargando oportunidades...
                </div>
              ) : !currentOpportunity ? (
                <div className="text-center py-16 text-primary font-alte-bold uppercase tracking-wide">
                  No hay oportunidades disponibles ahora mismo.
                  <br />
                  Crea tu perfil para futuras búsquedas.
                </div>
              ) : (
                <div className="relative flex items-center gap-3 md:gap-6">
                {/* Left Arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevOpportunity}
                  className="z-20 p-2 opacity-50 hover:opacity-100 transition-all cursor-pointer shrink-0"
                  aria-label="Anterior oportunidad"
                >
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </motion.button>

                {/* Opportunity Card */}
                <motion.div
                  key={currentOpportunity.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 bg-white border border-primary/10 rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-0 p-5 md:p-8">
                    {/* Left: Image */}
                    <div className="md:col-span-4 relative h-56 md:h-auto min-h-[300px] rounded-2xl overflow-hidden shadow-lg shrink-0">
                      {currentOpportunity.image_url ? (
                        <>
                          <Image
                            src={currentOpportunity.image_url}
                            alt={currentOpportunity.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-secondary to-accent" />
                      )}
                      {/* Entity overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-alte-bold uppercase tracking-wider text-sm leading-tight">
                          {currentOpportunity.entity}
                        </p>
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="md:col-span-8 flex flex-col md:pl-6 pt-5 md:pt-0">
                      {/* Header row: title + info chips */}
                      <div className="flex gap-4 mb-5">
                        {/* Title area */}
                        <div className="flex-1 min-w-0">
                          <span className="text-secondary font-alte-bold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full inline-block mb-3">
                            {currentOpportunity.entity}
                          </span>
                          <h3 className="text-xl md:text-2xl font-alte-bold uppercase leading-snug text-dark mb-1">
                            Buscamos: {currentOpportunity.title}
                          </h3>
                          <p className="text-dark/60 font-alte text-xs uppercase tracking-wider">
                            Área: {currentOpportunity.area}
                          </p>
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-col gap-2 shrink-0 pt-1">
                          <div className="flex items-center gap-2">
                            {/* Pin icon */}
                            <svg
                              className="w-4 h-4 text-secondary shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-dark/70 font-alte text-xs">
                              {currentOpportunity.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Clock icon */}
                            <svg
                              className="w-4 h-4 text-secondary shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-dark/70 font-alte text-xs">
                              {currentOpportunity.hours}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Calendar icon */}
                            <svg
                              className="w-4 h-4 text-secondary shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-dark/70 font-alte text-xs">
                              {currentOpportunity.start_date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sections */}
                      <div className="space-y-4 flex-1 mb-6">
                        <div>
                          <span className="inline-block bg-secondary/15 text-secondary font-alte-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                            Sobre el proyecto
                          </span>
                          <p className="text-dark/70 font-alte text-sm leading-relaxed">
                            {currentOpportunity.about_project}
                          </p>
                        </div>
                        <div>
                          <span className="inline-block bg-secondary/15 text-secondary font-alte-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                            El rol
                          </span>
                          <p className="text-dark/70 font-alte text-sm leading-relaxed">
                            {currentOpportunity.role}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => openModal(currentOpportunity)}
                        className="w-full py-3 px-6 bg-secondary text-white font-alte-bold text-base rounded-xl hover:bg-primary transition-colors cursor-pointer uppercase tracking-widest inline-flex items-center justify-center gap-2 shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        Postularme
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Right Arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextOpportunity}
                  className="z-20 p-2 opacity-50 hover:opacity-100 transition-all cursor-pointer shrink-0"
                  aria-label="Siguiente oportunidad"
                >
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
                </div>
              )}
            </div>
          </section>

          {/* CTA SECTION — text positioned high in the section, then ~400px of empty
            gradient tail before the footer (so the section reads tall and airy). */}
          <section className="relative w-full px-4 md:px-8 pt-24 md:pt-40 pb-[280px] md:pb-[400px] overflow-hidden">
            {/* Decorative dots — Figma color hsla(0, 0%, 85%, 1).
                Wrapped in a region that stops short of the section's bottom edge,
                so no dot sits flush against where the gradient meets the footer. */}
            <div className="absolute inset-x-0 top-0 bottom-16 md:bottom-24 pointer-events-none">
              {DECORATIVE_DOTS.map((dot, i) => (
                <div
                  key={i}
                  className="absolute w-9 h-9 rounded-full bg-[hsla(0,0%,85%,1)]"
                  style={{ left: dot.left, top: dot.top }}
                />
              ))}
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-section-title text-primary mb-10"
              >
                Tu Perfil También <br /> Puede Generar Impacto
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-display-subtitle text-primary mx-auto max-w-2xl mb-12"
              >
                Si hoy no ves una propuesta que se ajuste a tu
                <br className="hidden md:inline" />{" "}
                disponibilidad o intereses, podés dejar tu perfil cargado y
                <br className="hidden md:inline" />{" "}
                te contactaremos cuando surja una oportunidad acorde.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onClick={() => openModal()}
                className="px-10 py-4 bg-[hsla(230,100%,65%,1)] text-[hsla(228,6%,85%,1)] text-sm md:text-button-large rounded-full hover:brightness-110 transition shadow-lg cursor-pointer"
              >
                Crear Perfil de Voluntario
              </motion.button>
            </div>
          </section>
        </div>
        {/* /gradient wrapper */}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white border border-gray-200 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6 md:p-8 relative shrink-0">
                  <button
                    onClick={closeModal}
                    className="absolute top-6 right-6 text-gray-400 hover:text-dark transition bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h2 className="text-3xl font-alte-bold text-secondary uppercase pr-10">
                    {selectedOpportunity
                      ? "Postular a oportunidad"
                      : "Perfil de Voluntario"}
                  </h2>
                  {selectedOpportunity && (
                    <p className="text-dark/70 font-alte mt-2">
                      Estás aplicando a:{" "}
                      <strong className="text-secondary">
                        {selectedOpportunity.title}
                      </strong>{" "}
                      en {selectedOpportunity.entity}
                    </p>
                  )}
                </div>

                {/* Form */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {selectedOpportunity && (
                      <input
                        type="hidden"
                        name="opportunity_id"
                        value={selectedOpportunity.id}
                      />
                    )}
                    <input
                      type="hidden"
                      name="form_mode"
                      value={selectedOpportunity ? "postulation" : "profile"}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Ej: Barcelona"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte transition-shadow"
                      />
                    </div>

                    <hr className="border-gray-200 my-6" />
                    <h3 className="text-dark font-alte-bold uppercase text-lg mb-4">
                      Datos de Perfil
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Disponibilidad
                        </label>
                        <select
                          name="availability"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte cursor-pointer transition-shadow"
                        >
                          <option value="Fines de semana">
                            Fines de semana
                          </option>
                          <option value="Entre semana (mañanas)">
                            Entre semana (mañanas)
                          </option>
                          <option value="Entre semana (tardes)">
                            Entre semana (tardes)
                          </option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Modalidad
                        </label>
                        <select
                          name="modality"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte cursor-pointer transition-shadow"
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Online">Online</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                        Intereses principales
                      </label>
                      <input
                        type="text"
                        name="interests"
                        placeholder="Ej: Educación, Deportes, Cultura..."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte transition-shadow"
                      />
                    </div>

                    <hr className="border-gray-200 my-6" />
                    <h3 className="text-gray-400 font-alte-bold uppercase text-sm mb-4 tracking-wider">
                      Opcional
                    </h3>

                    <div>
                      <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                        Experiencia previa
                      </label>
                      <textarea
                        name="experience"
                        rows={2}
                        placeholder="¿Has hecho voluntariado antes?"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte resize-none transition-shadow"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                        Motivación
                      </label>
                      <textarea
                        name="motivation"
                        rows={2}
                        placeholder="¿Qué te impulsa a colaborar?"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte resize-none transition-shadow"
                      ></textarea>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-4 bg-secondary text-white font-alte-bold rounded-xl hover:bg-primary transition-colors cursor-pointer uppercase tracking-widest text-lg shadow-md hover:shadow-lg"
                      >
                        {selectedOpportunity
                          ? "Enviar Postulación"
                          : "Guardar Perfil"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Custom footer for the Voluntariado page — link columns only, no map/hero. */}
      <footer className="w-full bg-primary">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-16 py-14 md:py-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="w-24 md:w-32 shrink-0">
              <ImpactoLogoChico fill="#4A69FF" className="w-full h-auto" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-24 text-xs md:text-base font-alte text-secondary uppercase">
              <div className="flex flex-col gap-3">
                <h4 className="font-alte-bold text-secondary">Encuéntranos</h4>
                <p className="hover:text-accent cursor-default transition-colors">
                  Barcelona, España
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-alte-bold text-secondary">Hablemos</h4>
                <a
                  href="https://www.linkedin.com/company/makeimpacto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/make.impacto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="tel:+34613036362"
                  className="hover:text-accent transition-colors"
                >
                  +34 613 03 63 62
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-alte-bold text-secondary">
                  Colabora con nosotros
                </h4>
                <a
                  href="mailto:crew.impacto@gmail.com"
                  className="hover:text-accent transition-colors"
                >
                  crew.impacto@gmail.com
                </a>
                <a
                  href="/contact"
                  className="hover:text-accent transition-colors"
                >
                  Súmate aquí
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
