import { createContext, useContext, createResource, JSX } from "solid-js";
import { isServer } from "solid-js/web";
import { userApi, authApi } from "~/lib/api";

const AuthContext = createContext<any>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, { mutate, refetch }] = createResource(
    async () => {
      if (isServer) return undefined;
      const data = await userApi.getProfile();
      if (!data || data.error) return null;
      return data;
    },
    { deferStream: true }  // ← clave: no bloquea el stream SSR
  );

  const logout = async () => {
    await authApi.logout();
    mutate(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, logout, refetch }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);