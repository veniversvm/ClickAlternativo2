import  Logo  from '../Logo/Logo'
import { Search } from '../SearchBar/SearchBar';
import "./Welcome.scss";

export default function Welcome() {
  return (
    <section class="welcome-content">
      <Logo />
      
      {/* SEO: Este mensaje es el "pitch" de tu sitio para los buscadores */}
      <p id="initial-message">
        Contenido web seleccionado a mano, con criterio humano.
      </p>

      {/* Usamos el buscador en tamaño grande para la bienvenida */}
      <Search size="large" />
    </section>
  );
}