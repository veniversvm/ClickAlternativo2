// src/components/Logo/Logo.tsx

export default function Logo() {
  return (
    <div class="logo-container">
      <img
        class="logo"
        src="/Logo/LogoClickAlternativo.png" // Ruta desde la carpeta public
        alt="Logo de Click Alternativo"
        // No usamos lazy aquí porque el logo suele ser parte del "Above the Fold" (SEO/LCP)
        decoding="async"
      />
    </div>
  );
}