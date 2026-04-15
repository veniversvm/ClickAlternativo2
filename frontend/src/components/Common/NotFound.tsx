import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { A } from "@solidjs/router";

export default function NotFound(props: { message?: string }) {
  // Paleta de colores de tu marca
  const colors = {
    primary: "#6BBF5B",
    background: "#121212",
    card: "#1e1e1e",
    text: "#ffffff",
    muted: "#888888"
  };

  return (
    <div 
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "85vh",
        "text-align": "center",
        padding: "2rem",
        "background-color": colors.background,
        color: colors.text,
        width: "100%",
        "box-sizing": "border-box",
        "font-family": "'Poppins', sans-serif"
      }}
    >
      <HttpStatusCode code={404} />
      <Title>404 - No Encontrado | Click Alternativo</Title>

      <div style={{ "max-width": "600px", width: "100%" }}>
        {/* IMAGEN MOBILE-FIRST */}
        <img 
          src="/assets/404/404.svg" 
          alt="Error 404" 
          style={{
            width: "60%",
            "max-width": "250px",
            height: "auto",
            "margin-bottom": "2rem",
            filter: `drop-shadow(0 0 10px ${colors.primary}33)`
          }}
        />
        
        <h1 style={{
          "font-family": "'Anton', sans-serif",
          "font-size": "clamp(2.2rem, 8vw, 3.8rem)",
          "margin-bottom": "1rem",
          color: colors.text,
          "line-height": "1.1",
          "text-transform": "uppercase"
        }}>
          ¡Ups! Página no encontrada
        </h1>

        <p style={{ 
          color: colors.muted, 
          "margin-bottom": "3rem", 
          "max-width": "450px",
          margin: "0 auto 3rem auto",
          "line-height": "1.6",
          "font-size": "1.1rem"
        }}>
          {props.message || "El recurso buscado no existe o no pudo ser encontrado en nuestra curaduría."}
        </p>
        
        <div style={{ display: "flex", "justify-content": "center" }}>
          <A 
            href="/" 
            style={{
              "background-color": colors.card,
              color: colors.primary,
              padding: "0.9rem 2.5rem",
              "border-radius": "50px",
              "text-decoration": "none",
              "font-weight": "bold",
              "font-size": "1.1rem",
              border: "2px solid #333",
              transition: "transform 0.2s ease",
              "box-shadow": "0 4px 15px rgba(0,0,0,0.3)"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            VOLVER AL INICIO
          </A>
        </div>
      </div>
    </div>
  );
}