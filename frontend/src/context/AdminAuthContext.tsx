import { createContext, useContext, createSignal, JSX } from "solid-js";
import { adminApi } from "~/lib/api";

const AdminAuthContext = createContext<any>();

export function AdminAuthProvider(props: { children: JSX.Element }) {
  const [email, setEmail] = createSignal<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = createSignal(false);

  const login = async (email: string, password: string) => {
    const result = await adminApi.login({ email, password });
    if (result && !result.error) {
      setEmail(email);
      // El JWT tiene is_super — lo leemos del perfil si hace falta
      return true;
    }
    return false;
  };

  const logout = async () => {
    await adminApi.logout();
    setEmail(null);
    window.location.href = "/admin/login";
  };

  return (
    <AdminAuthContext.Provider value={{ email, isSuperAdmin, login, logout }}>
      {props.children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);