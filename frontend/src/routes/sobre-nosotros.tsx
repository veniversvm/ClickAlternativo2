// src/routes/about.tsx
import { Title, Meta, Link } from "@solidjs/meta";
import { AboutUsComponent } from "~/components/About-Us/AboutUs";

export default function SobreNosotros() {
  const description = "Click Alternativo: El buscador humano que prioriza la calidad. Conocé a nuestro equipo y nuestra metodología de curaduría de contenido web verificado.";
  
  // Datos Estructurados para Google (Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Click Alternativo",
      "description": "Buscador de contenido web curado manualmente por humanos.",
      "url": "https://clickalternativo.com"
    }
  };

  return (
    <main>
      {/* SEO Dinámico */}
      <Title>Sobre Nosotros | Click Alternativo - Curaduría Humana</Title>
      <Meta name="description" content={description} />
      
      {/* Open Graph (Para que se vea bien al compartir en redes) */}
      <Meta property="og:title" content="Sobre Nosotros | Click Alternativo" />
      <Meta property="og:description" content={description} />
      <Meta property="og:type" content="website" />
      <Link rel="canonical" href="https://clickalternativo.com/about" />

      {/* Inyectamos el Schema.org en el head */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <AboutUsComponent />
    </main>
  );
}