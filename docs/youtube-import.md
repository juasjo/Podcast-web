# Importador de YouTube a Podcast

Este script descarga videos de YouTube, los convierte a MP3 y los publica como episodios en la API local.

## Requisitos

- `yt-dlp`
- `ffmpeg`
- Servidor de la web levantado (`npm start`)

## Archivo de entrada

Por defecto lee `data/youtube-sources.md`.

Formatos soportados:

- `video: https://www.youtube.com/watch?v=VIDEO_ID`
- `channel: https://www.youtube.com/@canal | latest=5`
- `subscription: https://www.youtube.com/@canal`
- `https://www.youtube.com/watch?v=VIDEO_ID`

### Regla `subscription`

- Se interpreta como suscripcion diaria a canal.
- En cada ejecucion, procesa como maximo el ultimo video publicado del canal.
- Aplica los mismos filtros de seguridad que el resto del flujo:
  - deduplicacion por ID importado
  - deduplicacion por titulo
  - exclusion de shorts/reels y videos por debajo de `--min-duration`

## Uso

```bash
npm run import:youtube
```

Opciones:

```bash
node scripts/publish-youtube-from-md.js --file data/youtube-sources.md --latest 3 --base-url http://localhost:3000 --status published --min-duration 180
```

## Ejecucion diaria recomendada (cron)

Ejemplo (cada dia a las 06:00):

```bash
0 6 * * * cd /ruta/a/Podcas-web && /usr/bin/env npm run import:youtube -- --min-duration 180 >> /tmp/podcas-import.log 2>&1
```

## Operacion con Docker (web + scheduler)

La opcion recomendada en contenedor usa dos servicios:

- `web`: API + frontend + feed RSS
- `scheduler`: cron diario dentro de Docker

Comandos:

```bash
docker compose up -d --build
docker compose logs -f web
docker compose logs -f scheduler
```

Variables importantes:

- `BASE_URL` (default `http://localhost:3000` en web, `http://web:3000` en scheduler)
- `TZ` (default `Europe/Madrid`)
- `SCHEDULE_CRON` (default `0 6 * * *`)
- `IMPORT_MIN_DURATION` (default `180`)
- `RUN_ON_STARTUP` (`true` para disparar import al arrancar scheduler)

El scheduler escribe logs en:

- `/var/log/podcas/cron.log`
- `/var/log/podcas/import.log`

### Troubleshooting rapido

- Si no corre cron: revisar `docker compose logs scheduler` y que `SCHEDULE_CRON` sea valido.
- Si falla importacion: revisar `import.log` para errores de YouTube/red.
- Si no hay persistencia: comprobar montajes `./data` y `./public/audio`.
- Si faltan dependencias multimedia: validar dentro del contenedor `yt-dlp --version` y `ffmpeg -version`.

## Que publica

- Titulo del video -> `title`
- Descripcion del video -> `description`
- Duracion del video -> `duration`
- Miniatura de YouTube -> `thumbnailUrl`
- Audio MP3 convertido -> subido a `/api/episodes/:id/audio`

El script evita duplicados guardando IDs importados en `data/youtube-imported.json`.
