// src/routes/sitemap.xml.ts
import { blogApi } from "~/lib/api";

export async function GET() {
  // 1. Obtener los datos simplificados del Backend
  const posts = await blogApi.getSitemapData();
  const baseUrl = "https://clickalternativo.com";

  // 2. Definir las secciones fijas (estáticas)
  const staticPages = [
    "",
    "/noticias",
    "/software",
    "/gaming",
    "/cine",
    "/musica",
    "/lectura",
    "/paginas",
    "/sobre-nosotros",
    "/faq",
  ];

  // 3. Construir el XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
  ${posts
    ?.map((post: any) => {
      // Usamos la primera categoría para la URL, igual que en el frontend
      const category = post.categories?.[0]?.slug || "blog";
      return `
  <url>
    <loc>${baseUrl}/${category}/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

  // 4. Retornar la respuesta con el Content-Type correcto para que Google lo reconozca
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600", // Cache de 1 hora para no saturar a Go
    },
  });
}