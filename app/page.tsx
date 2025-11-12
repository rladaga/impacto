import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl text-blue-600 text-blue-600 font-bold text-center mb-4">
          IMPACTO
        </h1>
        <p className="text-center text-blue-600 mb-12 max-w-2xl mx-auto">
          Plataforma para visibilizar proyectos inclusivos para personas con
          discapacidad.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl text-blue-600 font-semibold mb-6">
            Mantente informado
          </h2>
          <p className="text-gray-600 mb-6">
            Estamos trabajando en una plataforma para visibilizar proyectos
            inclusivos. Déjanos tu información para estar al tanto de nuestras
            novedades.
          </p>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
