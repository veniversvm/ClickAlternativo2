import { createContext, useContext, createResource, JSX } from "solid-js";
import { userApi, authApi } from "~/lib/api";

const AuthContext = createContext<any>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, { mutate, refetch }] = createResource(
    async () => {
      const data = await userApi.getProfile();
      if (!data || data.error) return null;
      return data;
    },
    { deferStream: true }
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
    <AuthContext.Provider value={{ user, logout, login, refetch }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);