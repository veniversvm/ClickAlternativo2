import { createContext, useContext, createResource, JSX, createEffect } from "solid-js";
import { userApi, authApi } from "~/lib/api";

const AuthContext = createContext<any>();

export function AuthProvider(props: { children: JSX.Element }) {

  const [user, { mutate, refetch }] = createResource(
    async () => {
      const data = await userApi.getProfile();
      // 1. Si no hay datos o hay error de API, retornamos null (No logueado)
      console.log("DATA ",data)
      if (!data || data.error) {
        return null;
      }
      // 2. Si el que entró es un ADMIN, este contexto debe ignorarlo
      // (Para que no se crucen las sesiones en la UI)
      if (data.role === "admin") {
        return null;
      }
      // 3. ¡VITAL!: Retornar los datos si todo es correcto
      // Antes no tenías este return, por eso 'user()' siempre era undefined
      return data;
    },
    {
      deferStream: true, // Mantiene la conexión abierta para inyectar los datos después del shell
    },
  );

  const logout = async () => {
    await authApi.logout();
    mutate(null);
    window.location.href = "/";
  };

  const login = async (credentials: any) => {
    const result = await authApi.login(credentials);
    if (result && !result.error) {
      await refetch(); // actualiza el estado de auth inmediatamente
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: () => user.loading,
      logout, 
      login, 
      refetch 
    }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
