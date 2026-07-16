"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import ImpactoLogo from "../../components/ImpactoLogo";
import ImpactoLogoChico from "../../components/ImpactoLogoChico";
import ComingSoon from "../../components/ComingSoon";

/* ---------------------------------------------------------------------------
   Profiles are loaded from Supabase (`professionals` table — the "Profesionales"
   CMS collection from the brief: name, specialty, descriptions, tags, price,
   calendly_url, …). The `Professional` interface below is the row contract.
   When `photo` is empty the card/ficha fall back to a gradient avatar with
   initials; set `photo` (a public image URL) from the admin to wire real ones.
--------------------------------------------------------------------------- */
interface Professional {
  id: string;
  name: string;
  photo?: string;
  specialty: string;
  description_short: string;
  description_long: string;
  experience_years: number;
  disabilities: string[];
  ages: string[];
  modality: string;
  location: string;
  price: number;
  calendly_url: string;
  verified: boolean;
  active: boolean;
}

/* Filter option lists — derived loosely from the data, matching the brief's
   four filters: Especialidad, Modalidad, Zona, Edad. */
const FILTERS = {
  especialidad: [
    "Psicología",
    "Musicoterapia",
    "Fonoaudiología",
    "Trabajo Social",
  ],
  modalidad: ["Presencial", "Remoto", "Remoto y presencial"],
  zona: ["Eixample", "Gràcia", "Les Corts", "Sants-Montjuïc"],
  edad: [
    "Niños y adolescentes",
    "Adultos y personas mayores",
    "Todas las edades",
  ],
};

type FilterKey = keyof typeof FILTERS;

const FILTER_LABELS: Record<FilterKey, string> = {
  especialidad: "Especialidad",
  modalidad: "Modalidad",
  zona: "Zona",
  edad: "Edad",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* Small inline marks ---------------------------------------------------- */
function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function ModalityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

/* Avatar — uses the portrait when available, otherwise a gradient + initials. */
function Avatar({ pro, className }: { pro: Professional; className?: string }) {
  return (
    <div
      className={`relative rounded-full overflow-hidden ring-4 ring-secondary shrink-0 ${className ?? ""}`}
    >
      {pro.photo ? (
        <Image src={pro.photo} alt={pro.name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-secondary to-primary flex items-center justify-center">
          <span className="text-white font-alte-bold text-xl md:text-2xl tracking-wide">
            {initials(pro.name)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ProfesionalesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    especialidad: "",
    modalidad: "",
    zona: "",
    edad: "",
  });
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  // The card currently expanded into its full "ficha" detail (in-place).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Unified free-encuentro flow (PDF): form → Calendly embed.
  const [encuentroPro, setEncuentroPro] = useState<Professional | null>(null);
  const [encuentroStep, setEncuentroStep] = useState<"form" | "calendar">(
    "form",
  );

  // Profiles come from Supabase (CMS collection "Profesionales"). Returns all;
  // we filter `active` below, same convention as the home map.
  useEffect(() => {
    fetch("/api/professionals")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProfessionals(Array.isArray(data) ? data : []))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false));
  }, []);

  const setFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
    setOpenFilter(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return professionals.filter((p) => {
      if (!p.active) return false;
      if (q) {
        const haystack = [
          p.name,
          p.specialty,
          p.location,
          ...p.disabilities,
          ...p.ages,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (
        filters.especialidad &&
        !p.specialty
          .toLowerCase()
          .includes(filters.especialidad.toLowerCase().slice(0, 5))
      )
        return false;
      if (filters.modalidad && p.modality !== filters.modalidad) return false;
      if (filters.zona && !p.location.includes(filters.zona)) return false;
      if (filters.edad && !p.ages.some((a) => a === filters.edad)) return false;
      return true;
    });
  }, [search, filters, professionals]);

  const selectedPro = professionals.find((p) => p.id === selectedId) ?? null;

  const openEncuentro = (pro: Professional) => {
    setEncuentroPro(pro);
    setEncuentroStep("form");
  };

  const closeEncuentro = () => {
    setEncuentroPro(null);
    setTimeout(() => setEncuentroStep("form"), 300);
  };

  const handleEncuentroSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    // Trazabilidad (PDF): registra la solicitud (usuario, profesional, mensaje)
    // y manda copia a IMPACTO. Best-effort — si falla, igual mostramos el
    // calendario para no bloquear al usuario.
    try {
      await fetch("/api/free-meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          professional_id: encuentroPro?.id,
        }),
      });
    } catch (err) {
      console.error("Error registrando encuentro:", err);
    }
    setEncuentroStep("calendar");
  };

  return (
    <div className="w-full min-h-screen bg-primary flex flex-col">
      {/* Nav — identical to the Voluntariado page (PROFESIONALES highlighted). */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-primary z-50 flex items-center justify-between px-4 md:px-8 shadow-lg">
        <Link
          href="/#top"
          className="flex items-center w-32 md:w-40 relative z-50"
        >
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
            className="text-md text-secondary font-alte-bold transition-colors tracking-wide"
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
                className="text-lg text-secondary font-alte-bold transition-colors tracking-wide"
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
        {/* HERO */}
        <section className="relative w-full min-h-[560px] md:min-h-[700px] flex items-center justify-center px-4 md:px-8 py-24 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-secondary/10 via-primary to-primary pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl text-center">
            {/* Cube isotipo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-8 w-[110px] h-[110px] md:w-[140px] md:h-[140px] relative"
            >
              <Image
                src="/logos/icono_profesionales.png"
                alt="Profesionales"
                fill
                className="object-contain"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-hero-title mb-8"
            >
              Profesionales <br /> que impactan
            </motion.h1>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto max-w-md"
            >
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-5 py-3 backdrop-blur-sm focus-within:border-secondary transition-colors">
                <svg
                  className="w-5 h-5 text-light/70 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Busca aquí el perfil adecuado..."
                  className="bg-transparent w-full outline-none text-light placeholder:text-light/60 font-alte text-sm md:text-base"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center mt-12"
            >
              <svg
                className="w-10 h-5 md:w-12 md:h-6 text-light animate-bounce"
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

        {/* GRADIENT WRAPPER (cards + tagline) — same stops as Voluntariado. */}
        <div
          style={{
            background:
              "linear-gradient(to bottom, hsla(228, 6%, 85%, 1) 0%, hsla(230, 72%, 75%, 1) 55%, hsla(230, 100%, 65%, 1) 100%)",
          }}
        >
          <section className="w-full px-4 md:px-8 pb-28 md:pb-44">
            {/* Full-bleed frosted "Próximamente" band — covers filters + cards.
                Top padding lives INSIDE the band so the frost reaches the top of
                the gradient (no unfrosted light strip above it). */}
            <div className="relative -mx-4 md:-mx-8">
              <div className="max-w-5xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-24 min-h-[440px]">
                {/* Filters row */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-light shrink-0">
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
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </div>

                  {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
                    <div key={key} className="relative">
                      <button
                        onClick={() =>
                          setOpenFilter(openFilter === key ? null : key)
                        }
                        className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-colors font-alte text-sm ${
                          filters[key]
                            ? "bg-secondary text-white border-secondary"
                            : "bg-primary text-light border-primary hover:bg-secondary hover:border-secondary"
                        }`}
                      >
                        <span>{filters[key] || FILTER_LABELS[key]}</span>
                        <svg
                          className={`w-3 h-3 transition-transform ${openFilter === key ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {openFilter === key && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-2 z-30 min-w-[200px] bg-white rounded-2xl shadow-xl border border-primary/10 p-2"
                          >
                            {FILTERS[key].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setFilter(key, opt)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-alte transition-colors ${
                                  filters[key] === opt
                                    ? "bg-secondary text-white"
                                    : "text-dark hover:bg-secondary/10"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {(filters.especialidad ||
                    filters.modalidad ||
                    filters.zona ||
                    filters.edad) && (
                    <button
                      onClick={() =>
                        setFilters({
                          especialidad: "",
                          modalidad: "",
                          zona: "",
                          edad: "",
                        })
                      }
                      className="text-primary/70 hover:text-primary text-sm font-alte underline ml-1"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Cards grid — Figma spec: 544×590 portrait cards, 230px avatar top-left. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 max-w-[1136px] mx-auto">
                  {loading && (
                    <div className="sm:col-span-2 text-center py-16 text-primary/70 font-alte">
                      Cargando profesionales...
                    </div>
                  )}

                  {!loading && filtered.length === 0 && (
                    <div className="sm:col-span-2 text-center py-16 text-primary/70 font-alte">
                      No encontramos profesionales con esos criterios.
                    </div>
                  )}

                  {filtered.map((pro) => (
                    <motion.div
                      key={pro.id}
                      layout
                      className="bg-light/85 backdrop-blur-sm rounded-[28px] shadow-lg border border-white/40 p-7 md:p-10 flex flex-col min-h-[540px] md:min-h-[590px]"
                    >
                      {/* Header: 230px avatar + identity (vertically centered) */}
                      <div className="flex items-center gap-5 md:gap-6 mb-6">
                        <Avatar
                          pro={pro}
                          className="w-32 h-32 md:w-[200px] md:h-[200px] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl font-alte-bold text-primary uppercase leading-tight">
                            {pro.name},
                          </h3>
                          <p className="text-secondary font-alte-bold uppercase text-base md:text-lg leading-tight mt-1">
                            {pro.specialty}
                          </p>
                          <div className="mt-3 flex flex-col gap-1.5 text-primary/75 text-sm font-alte">
                            <span className="flex items-center gap-2">
                              <PinIcon className="w-4 h-4 text-secondary shrink-0" />
                              {pro.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <ModalityIcon className="w-4 h-4 text-secondary shrink-0" />
                              {pro.modality}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags — stacked, each on its own row, left-aligned */}
                      <div className="flex flex-col items-start gap-2 mb-5">
                        {[...pro.disabilities, ...pro.ages].map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-white text-[11px] font-alte uppercase tracking-wide px-4 py-1.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-primary/80 font-alte text-sm md:text-[15px] leading-relaxed mb-6">
                        {pro.description_short}
                      </p>

                      <button
                        onClick={() => setSelectedId(pro.id)}
                        className="mt-auto mx-auto inline-flex items-center justify-center gap-2 bg-primary text-light font-alte-bold text-sm uppercase tracking-wide rounded-full px-10 py-3.5 hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <ArrowIcon className="w-4 h-4" />
                        Ver perfil
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
              <ComingSoon
                className="absolute inset-0"
                subtitle="El directorio de profesionales estará disponible muy pronto."
              />
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Tagline */}
              <div className="text-center mt-28 md:mt-40">
                <div className="mx-auto w-40 h-40 md:w-52 md:h-52 relative mb-8">
                  <Image
                    src="/logos/icono-personas.png"
                    alt="Comunidad IMPACTO"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-primary font-alte-bold uppercase tracking-wide text-xl md:text-[24px] max-w-4xl mx-auto leading-snug">
                  IMPACTO conecta familias con profesionales especializados en
                  discapacidad, facilitando un proceso seguro y confiable.
                </p>
              </div>
            </div>
          </section>
        </div>
        {/* /gradient wrapper */}

        {/* FICHA MODAL — full profile, opens on top of the grid (like the project
            modal on the home map). Layout follows the Figma ficha. */}
        <AnimatePresence>
          {selectedPro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
              onClick={() => setSelectedId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-light w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Cerrar perfil"
                  className="absolute top-5 right-5 z-10 text-primary/60 hover:text-primary transition-colors bg-white/70 hover:bg-white rounded-full p-2"
                >
                  <svg
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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 p-5 md:p-8">
                  {/* Left: photo */}
                  <div className="md:col-span-5 relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[440px] ring-1 ring-primary/10">
                    {selectedPro.photo ? (
                      <Image
                        src={selectedPro.photo}
                        alt={selectedPro.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-secondary to-primary flex items-center justify-center">
                        <span className="text-white/90 font-alte-bold text-6xl">
                          {initials(selectedPro.name)}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-primary/90 text-light text-[11px] font-alte-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Disponible desde hoy
                    </span>
                  </div>

                  {/* Right: info + actions */}
                  <div className="md:col-span-7 flex flex-col pr-2">
                    {/* pr on this row keeps the location/modality clear of the
                        absolutely-positioned X close button in the corner. */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3 pr-10 md:pr-12">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-alte-bold text-primary uppercase leading-none">
                          {selectedPro.name},
                        </h3>
                        <p className="text-lg md:text-xl font-alte-bold text-secondary uppercase leading-tight mt-1">
                          {selectedPro.specialty}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0 text-primary/80">
                        <span className="flex items-center gap-2 text-sm font-alte">
                          <PinIcon className="w-4 h-4 text-secondary" />
                          {selectedPro.location}
                        </span>
                        <span className="flex items-center gap-2 text-sm font-alte">
                          <ModalityIcon className="w-4 h-4 text-secondary" />
                          {selectedPro.modality}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[...selectedPro.disabilities, ...selectedPro.ages].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-white text-[11px] font-alte uppercase tracking-wide px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                      <span className="bg-primary/10 text-primary text-[11px] font-alte uppercase tracking-wide px-3 py-1 rounded-full">
                        {selectedPro.experience_years} años de experiencia
                      </span>
                    </div>

                    <p className="text-secondary font-alte-bold text-sm mb-3">
                      Consulta desde €{selectedPro.price}
                    </p>

                    <div className="mb-6">
                      <p className="text-primary/60 font-alte-bold text-xs uppercase tracking-widest mb-1">
                        Sobre mí
                      </p>
                      <p className="text-primary/80 font-alte text-sm leading-relaxed">
                        {selectedPro.description_long}
                      </p>
                    </div>

                    {/* Actions — unified flow per brief */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <button
                        onClick={() => openEncuentro(selectedPro)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-white font-alte-bold text-sm uppercase tracking-wide rounded-full px-6 py-3 hover:bg-primary transition-colors cursor-pointer shadow-md"
                      >
                        <ArrowIcon className="w-4 h-4" />
                        Consulta gratuita
                      </button>
                      <button
                        disabled
                        title="Próximamente — reserva y pago dentro de la plataforma"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary/20 text-primary/50 font-alte-bold text-sm uppercase tracking-wide rounded-full px-6 py-3 cursor-not-allowed"
                      >
                        Reservar sesión
                        <span className="text-[9px] bg-primary/20 rounded-full px-2 py-0.5 normal-case tracking-normal">
                          Próximamente
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENCUENTRO GRATUITO MODAL — unified flow: form → Calendly embed. */}
        <AnimatePresence>
          {encuentroPro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
              onClick={closeEncuentro}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6 md:p-8 relative shrink-0">
                  <button
                    onClick={closeEncuentro}
                    className="absolute top-6 right-6 text-gray-400 hover:text-dark transition bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                    aria-label="Cerrar"
                  >
                    <svg
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
                  <p className="text-secondary font-alte-bold uppercase text-xs tracking-widest mb-1">
                    {encuentroStep === "form" ? "Paso 1 de 2" : "Paso 2 de 2"}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-alte-bold text-primary uppercase pr-10 leading-tight">
                    {encuentroStep === "form"
                      ? "Solicitar encuentro gratuito"
                      : "Agenda tu encuentro"}
                  </h2>
                  <p className="text-dark/70 font-alte mt-2 text-sm">
                    {encuentroStep === "form" ? (
                      <>
                        Con{" "}
                        <strong className="text-secondary">
                          {encuentroPro.name}
                        </strong>{" "}
                        · {encuentroPro.specialty}
                      </>
                    ) : (
                      "Videollamada gratuita de 30 minutos. Elige el día y la hora que mejor te vengan."
                    )}
                  </p>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  {encuentroStep === "form" ? (
                    <form
                      onSubmit={handleEncuentroSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Nombre *
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
                      <div>
                        <label className="block text-secondary text-sm font-alte-bold mb-2 uppercase tracking-wide">
                          Mensaje de presentación *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={4}
                          placeholder="Cuéntanos brevemente tu caso para que el profesional pueda prepararse."
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-dark focus:ring-2 focus:ring-secondary outline-none font-alte resize-none transition-shadow"
                        />
                      </div>
                      <p className="text-dark/50 text-xs font-alte">
                        Tu mensaje se gestiona a través de IMPACTO para
                        garantizar un contacto seguro y acompañado.
                      </p>
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 py-4 bg-secondary text-white font-alte-bold rounded-xl hover:bg-primary transition-colors cursor-pointer uppercase tracking-widest shadow-md"
                      >
                        Continuar
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div>
                      {/* Calendly inline embed — never redirects out of the platform.
                          Each professional carries its own calendly_url in the CMS. */}
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                        <iframe
                          src={encuentroPro.calendly_url}
                          title={`Calendario de ${encuentroPro.name}`}
                          className="w-full h-[480px] border-0"
                        />
                      </div>
                      <button
                        onClick={() => setEncuentroStep("form")}
                        className="mt-4 text-secondary font-alte-bold text-sm hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        ← Volver
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Footer — identical to the Voluntariado page. */}
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
