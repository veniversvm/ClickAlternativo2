import { IoSearch } from 'solid-icons/io';
import "./SearchBar.scss";

interface SearchProps {
  size?: 'small' | 'large';
}

export const Search = (props: SearchProps) => {
  return (
    <div 
      class="search-wrapper" 
      classList={{ "search-wrapper--small": props.size === 'small' }}
    >
      {/* 
        SolidStart intercepta este formulario. Al enviarlo, 
        navegará a /search?q=lo-que-escribas 
      */}
      <form class="search-form" action="/search" method="get">
        <input
          type="search"
          name="q"
          placeholder="Buscar en el sitio..."
          aria-label="Campo de búsqueda"
          class="search-input"
          required
        />
        <button type="submit" class="search-button" aria-label="Buscar">
          <IoSearch size={22} />
        </button>
      </form>
    </div>
  );
}