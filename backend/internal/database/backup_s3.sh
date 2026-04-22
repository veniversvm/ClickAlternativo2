#!/bin/bash

# Configuración
# Docker guarda los volúmenes normalmente en /var/lib/docker/volumes/
# Pero lo más seguro es usar el path relativo de tu docker-compose
S3_VOLUME_PATH="direccion"
BACKUP_PATH="/home/admin/backups/s3"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

echo "📦 Iniciando backup de S3 (MinIO)..."

# Comprimir el contenido del bucket
tar -czf $BACKUP_PATH/s3_$DATE.tar.gz -C $S3_VOLUME_PATH .

# Limpieza: Borrar backups de más de 7 días
find $BACKUP_PATH -type f -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup de S3 completado: s3_$DATE.tar.gz"
