import { createContext, useContext, createResource, JSX } from "solid-js";
import { isServer } from "solid-js/web"; // <--- CAMBIO AQUÍ
import { adminApi, userApi } from "~/lib/api";

const AdminAuthContext = createContext<any>();

export function AdminAuthProvider(props: { children: JSX.Element }) {
  // Solo intentamos cargar el perfil si estamos en el navegador
  const [profile, { mutate, refetch }] = createResource(async () => {
  const data = await userApi.getProfile();
  // Solo aceptamos si es admin
  if (!data || data.error || data.role !== "admin") return null;
  return data;
})

  const login = async (email: string, pass: string) => {
    try {
      const res = await adminApi.loginAdmin({ email, password: pass });
      if (res && !res.error) {
        await refetch();
        return true;
      }
    } catch (err) {
      console.error("Login Error:", err);
    }
    return false;
  };

  const logout = async () => {
    await adminApi.logout();
    mutate(null);
    window.location.href = "/admin/login";
  };

  return (
    <AdminAuthContext.Provider value={{
      email: () => profile()?.email || "",
      isLoggedIn: () => !!profile(),
      isSuperAdmin: () => profile()?.is_super_admin === true,
      loading: () => profile.loading,
      login,
      logout,
      refetch
    }}>
      {props.children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    // Retorno seguro para evitar errores de undefined durante la carga
    return {
      isLoggedIn: () => false,
      loading: () => true,
      login: async () => false,
      logout: () => {}
    };
  }
  return context;
};