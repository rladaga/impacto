"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

interface CityResult {
  name: string;
  countryName: string;
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    message: "",
    interested_in: "familia/persona",
  });

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchQuery.includes(",")) {
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=10&dedupe=1&accept-language=es`;

        console.log("Fetching:", url);

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
        });

        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Data received:", data);

        if (data && data.length > 0) {
          const results: CityResult[] = data
            .map((place: any) => {
              const city = place.name || "";
              // Extrae el país del final de display_name
              const displayNameParts = place.display_name.split(",");
              const country =
                displayNameParts[displayNameParts.length - 1]?.trim() || "";
              return {
                name: city,
                countryName: country,
              };
            })
            .filter((item: CityResult) => item.name && item.countryName)
            .filter(
              (item: CityResult, index: number, self: CityResult[]) =>
                index ===
                self.findIndex(
                  (t) =>
                    t.name === item.name && t.countryName === item.countryName
                )
            );

          console.log("Filtered results:", results);
          setSearchResults(results);
          setShowDropdown(true);
        } else {
          console.log("No data returned or empty array");
        }
      } catch (error) {
        console.error("Error buscando ciudades:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSelectCity = (city: CityResult) => {
    const fullName = `${city.name}, ${city.countryName}`;
    setFormData({
      ...formData,
      location: fullName,
    });
    setSearchQuery(fullName);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("¡Gracias! Tu información fue registrada.");
        setFormData({
          name: "",
          email: "",
          location: "",
          message: "",
          interested_in: "familia/persona",
        });
        setSearchQuery("");
      } else {
        setMessage(data.error || "Error al enviar. Intenta de nuevo.");
      }
    } catch (error) {
      setMessage("Error de conexión.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const messageVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <label className="block text-dark text-md font-medium mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre y apellido"
          required
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-dark text-md font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Tu correo de contacto"
          required
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <label className="block text-dark text-md font-medium mb-1">
          Ciudad y País
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Dónde estás (para acercarte recursos)"
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />

        {searching && (
          <div className="absolute right-3 top-10 text-gray-500">
            <span>Buscando...</span>
          </div>
        )}

        {showDropdown && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-2 bg-accent border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {searchResults.map((city, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition text-black"
              >
                <div className="font-medium">
                  {city.name}, {city.countryName}
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {showDropdown &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 &&
          !searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-10 w-full mt-2 bg-accent border border-gray-300 rounded-lg shadow-lg p-4 text-light text-center"
            >
              No se encontraron ciudades
            </motion.div>
          )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-dark text-md font-medium mb-1">
          ¿Cómo quieres participar?
        </label>
        <select
          name="interested_in"
          value={formData.interested_in}
          onChange={handleChange}
          className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option className="text-black" value="familia/persona">
            Familia/Persona
          </option>
          <option className="text-black" value="profesional">
            Profesional
          </option>
          <option className="text-black" value="proyecto/asociacion">
            Proyecto/Asociación
          </option>
          <option className="text-black" value="empresa/fundacion">
            Empresa/Fundación
          </option>
          <option className="text-black" value="otro">
            Otro
          </option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-dark text-md font-medium mb-1">
          Cuéntanos en una frase qué te trae aquí (opcional):
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Esto nos ayuda a conectar mejor contigo."
          rows={4}
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </motion.div>

      <motion.button
        type="submit"
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="w-full bg-secondary text-white font-medium py-2 rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
      >
        {loading ? "Enviando..." : "Quiero formar parte"}
      </motion.button>

      {message && (
        <motion.p
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          className={`text-md text-center ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </motion.p>
      )}
    </motion.form>
  );
}
