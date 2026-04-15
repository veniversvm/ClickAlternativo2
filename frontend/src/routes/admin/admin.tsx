// src/routes/admin.tsx — layout del panel admin
import { JSX } from "solid-js";
import { AdminAuthProvider } from "~/context/AdminAuthContext";
import "~/styles/admin.scss";

export const config = { ssr: false };

export default function AdminLayout(props: { children: JSX.Element }) {
  return (
    <AdminAuthProvider>
      {props.children}
    </AdminAuthProvider>
  );
}