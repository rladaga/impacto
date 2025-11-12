import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-light to-secondary">
      <div className="container mx-auto px-4 py-12">
        <img
          src="logos/logo_impacto.png"
          alt="Impacto Logo"
          className="mx-auto mb-10 w-140 h-auto"
        />

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl text-secondary font-semibold mb-3">
            Mantente informado
          </h2>
          <p className="text-dark mb-3">
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
