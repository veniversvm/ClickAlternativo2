// src/routes/faq.tsx
import { Title, Meta } from "@solidjs/meta";
import { FAQComponent } from "~/components/FAQ/FaqComponent";

export const config = { prerender: false, ssr: true };

export default function Faq() {
  return (
    <>
      <Title>Preguntas Frecuentes | Click Alternativo</Title>
      <Meta name="description" content="Preguntas frecuentes sobre Click Alternativo." />
      <FAQComponent />
    </>
  );
}