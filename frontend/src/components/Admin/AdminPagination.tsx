// src/components/admin/AdminPagination.tsx
export function AdminPagination(props: { page: number, setPage: any, hasNext: boolean }) {
  return (
    <div class="admin-pagination">
      <button 
        class="pagination-btn"
        disabled={props.page === 1} 
        onClick={() => props.setPage((p: number) => p - 1)}
      >
        ← Anterior
      </button>
      
      <div class="page-indicator">
        Página <span>{props.page}</span>
      </div>

      <button 
        class="pagination-btn"
        disabled={!props.hasNext} 
        onClick={() => props.setPage((p: number) => p + 1)}
      >
        Siguiente →
      </button>
    </div>
  );
}