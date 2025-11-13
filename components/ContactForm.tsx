"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    message: "",
    interested_in: "newsletter",
  });

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=translations,name")
      .then((res) => res.json())
      .then((data) => {
        const countryNames = data
          .map(
            (country: any) =>
              country.translations?.spa?.common || country.name.common
          )
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b));
        setCountries(countryNames);
      })
      .catch(() => setCountries([]));
  }, []);

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
          country: "",
          message: "",
          interested_in: "newsletter",
        });
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
        <label className="block text-secondary text-md font-medium mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre"
          required
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-secondary text-md font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          required
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-secondary text-md font-medium mb-1">
          País
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option value="" disabled>
            Selecciona tu país
          </option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-secondary text-md font-medium mb-1">
          ¿Te interesa?
        </label>
        <select
          name="interested_in"
          value={formData.interested_in}
          onChange={handleChange}
          className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
        >
          <option className="text-black" value="newsletter">
            Solo el newsletter
          </option>
          <option className="text-black" value="participar">
            Participar como proyecto
          </option>
          <option className="text-black" value="ambos">
            Ambos
          </option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-secondary text-md font-medium mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Cuéntanos más..."
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
        {loading ? "Enviando..." : "Enviar"}
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
