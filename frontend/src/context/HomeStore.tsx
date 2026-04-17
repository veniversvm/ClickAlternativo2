import { createSignal, createContext, useContext, JSX } from "solid-js";

const HomeStoreContext = createContext<any>();

export function HomeStoreProvider(props: { children: JSX.Element }) {
  // Estos estados ahora viven fuera de la página
  const [posts, setPosts] = createSignal<any[]>([]);
  const [page, setPage] = createSignal(1);
  const [hasMore, setHasMore] = createSignal(true);
  const [lastSearch, setLastSearch] = createSignal<string | null>(null);
  const [scrollPosition, setScrollPosition] = createSignal(0);

  return (
    <HomeStoreContext.Provider value={{ 
      posts, setPosts, 
      page, setPage, 
      hasMore, setHasMore,
      lastSearch, setLastSearch,
      scrollPosition, setScrollPosition 
    }}>
      {props.children}
    </HomeStoreContext.Provider>
  );
}

// En src/context/HomeStore.tsx
export const useHomeStore = () => {
  const context = useContext(HomeStoreContext);
  if (!context) {
    // Retorno de emergencia para evitar el crash del ErrorBoundary
    return {
      posts: () => [],
      setPosts: () => {},
      page: () => 1,
      scrollPos: () => 0,
      setScrollPos: () => {},
      lastSearch: () => "",
      setLastSearch: () => {},
      hasMore: () => false,
      setHasMore: () => {}
    };
  }
  return context;
};