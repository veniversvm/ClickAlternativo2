import { Title } from "@solidjs/meta";
import AdminGuard from "~/components/Admin/AdminGuard";
import { useNavigate } from "@solidjs/router";
import EntryForm from "../../../components/Admin/EntryForm";

export default function NewPostPage() {
  const navigate = useNavigate();

  return (
    <AdminGuard>
      <div class="admin-main">
        <Title>Nueva Entrada | Admin</Title>
        <h1>Crear nueva curaduría</h1>
        <EntryForm onSuccess={() => navigate("/admin/posts")} />
      </div>
    </AdminGuard>
  );
}