import { IoSearch } from 'solid-icons/io';
import "./SearchBar.scss";

interface SearchProps {
  size?: 'small' | 'large';
}

export const Search = (props: SearchProps ) => {
  return (
    <div class="search-wrapper" classList={{ "search-wrapper--small": props.size === 'small' }}>
      <form action="/search" method="get" class="search-form">
        <input
          type="search"
          name="search" // <--- DEBE SER "search"
          placeholder="Buscar curadurías..."
          class="search-input"
          required
        />
        <button type="submit" class="search-button">🔍</button>
      </form>
    </div>
  );
}