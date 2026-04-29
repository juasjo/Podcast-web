## 1. Contenedores base y compose

- [x] 1.1 Crear Dockerfile base con Node, yt-dlp, ffmpeg y ffprobe para runtime reproducible
- [x] 1.2 Definir `docker-compose` con servicios separados `web` y `scheduler`
- [x] 1.3 Configurar red, puertos y variables de entorno compartidas (`BASE_URL`, `TZ`)

## 2. Persistencia y estado compartido

- [x] 2.1 Montar volúmenes persistentes para `data/` y `public/audio/` en ambos servicios
- [x] 2.2 Verificar que `episodes.json` y `youtube-imported.json` sobreviven reinicios
- [x] 2.3 Validar que audios subidos por scheduler son servidos correctamente por web

## 3. Scheduler diario dentro de Docker

- [x] 3.1 Configurar cron en el servicio `scheduler` para ejecución diaria de `import:youtube`
- [x] 3.2 Implementar lock de ejecución para evitar solapamientos de jobs
- [x] 3.3 Registrar logs de importación en salida del contenedor y archivo persistente

## 4. Robustez operativa

- [x] 4.1 Asegurar que el scheduler usa `BASE_URL` pública correcta al publicar episodios
- [x] 4.2 Añadir healthcheck para servicio `web` y validación básica de arranque en `scheduler`
- [x] 4.3 Probar recuperación tras reinicio durante importación sin generar episodios rotos

## 5. Documentación y validación final

- [x] 5.1 Documentar comandos de arranque/parada y operación diaria del stack Docker
- [x] 5.2 Documentar troubleshooting básico (cron, permisos de volumen, dependencias multimedia)
- [x] 5.3 Ejecutar prueba end-to-end: import diario simulado, feed válido y ausencia de duplicados/solapes
