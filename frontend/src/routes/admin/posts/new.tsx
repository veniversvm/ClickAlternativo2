import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import EntryForm from "~/components/Admin/EntryForm";
import AdminGuard from "~/components/Admin/AdminGuard";

export const config = { ssr: false };

export default function NewPostPage() {
  const navigate = useNavigate();

  return (
    <AdminGuard>
      <div class="admin-main">
        <Title>Nueva Entrada | Admin</Title>
        <header class="admin-header-title">
          <h1>Crear Nueva <span>Curaduría</span></h1>
          <p>Sube las imágenes y redacta el contenido en Markdown.</p>
        </header>

        <div class="admin-card-bg">
           <EntryForm onSuccess={() => navigate("/admin/posts")} />
        </div>
      </div>
    </AdminGuard>
  );
}