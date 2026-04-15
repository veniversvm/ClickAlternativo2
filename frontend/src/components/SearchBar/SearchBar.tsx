import { useNavigate } from "@solidjs/router";
import { IoSearch } from 'solid-icons/io';
import "./SearchBar.scss";

export const Search = (props: { size?: 'small' | 'large' }) => {
  const navigate = useNavigate();

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault(); // <--- VITAL: Evita que la página se recargue
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const query = formData.get("search")?.toString() || "";
    
    if (query.trim()) {
      // Navegamos a la ruta de búsqueda usando el router de Solid
      navigate(`/search?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div class="search-wrapper" classList={{ "search-wrapper--small": props.size === 'small' }}>
      <form onSubmit={handleSearch} class="search-form">
        <input
          type="search"
          name="search"
          placeholder="Buscar curadurías..."
          class="search-input"
          required
        />
        <button type="submit" class="search-button">
          <IoSearch size={22} />
        </button>
      </form>
    </div>
  );
}