-- backend/infra/postgres/init-db.sql

-- 1. Activamos la extensión de trigramas para búsqueda de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Creamos los índices GIN. 
-- Importante: GORM creará las tablas, pero nosotros forzamos los índices de alto rendimiento.
-- gin_trgm_ops permite que "ILIKE %termino%" use el índice en lugar de escanear toda la tabla.

-- Nota: Si las tablas aún no existen cuando este script corra, 
-- el backend (GORM) las creará y nosotros podemos ejecutar esto desde Go.
-- Pero para asegurar la extensión, este paso es vital aquí.