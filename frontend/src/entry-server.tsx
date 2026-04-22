// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* ICONO PARA LA PESTAÑA (Favicon) */}
          <link rel="icon" type="image/svg+xml" href="/Logo/MiniLogo.svg" />

          {/* ICONO PARA DISPOSITIVOS MÓVILES (Apple/Android) */}
          <link rel="apple-touch-icon" href="/Logo/MiniLogo.svg" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
