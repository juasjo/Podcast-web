# Podcast Web

Plataforma web para gestionar y publicar episodios de podcast con:

- Web + API de episodios
- Subida de audio
- Feed RSS compatible con podcatchers
- Importador de YouTube (video, channel, subscription)
- Ejecucion diaria automatizada en Docker (`web` + `scheduler`)

## 1) Requisitos

### Opcion recomendada (Docker)

- Docker Desktop o Docker Engine con Compose

### Opcion local (sin Docker)

- Node.js 20+
- `yt-dlp`
- `ffmpeg` y `ffprobe`

## 2) Estructura importante

- `src/` -> servidor, API, feed, frontend y validadores
- `scripts/publish-youtube-from-md.js` -> importador YouTube
- `scripts/start-scheduler.sh` -> arranque cron en contenedor scheduler
- `scripts/run-import-with-lock.sh` -> import manual/cron con lock anti-solape
- `data/youtube-sources.md` -> fuentes de importacion
- `docker-compose.yml` -> servicios `web` + `scheduler`
- `Dockerfile` -> imagen base con dependencias multimedia

## 3) Formato de fuentes YouTube

Archivo: `data/youtube-sources.md`

Formatos soportados:

- `video: https://www.youtube.com/watch?v=VIDEO_ID`
- `channel: https://www.youtube.com/@canal | latest=5`
- `subscription: https://www.youtube.com/@canal`
- `https://www.youtube.com/watch?v=VIDEO_ID`

Regla `subscription`:

- pensada para ejecucion diaria
- procesa como maximo el ultimo video del canal por ejecucion
- aplica deduplicacion y filtros anti-shorts/reels

## 4) Arranque rapido con Docker

Desde la raiz del proyecto:

```bash
docker compose up -d --build
```

Comprobar estado:

```bash
docker compose ps
docker compose logs -f web scheduler
```

Parar stack:

```bash
docker compose down
```

## 5) Variables de entorno clave

Definidas en `docker-compose.yml` (puedes sobreescribirlas con `.env`):

- `BASE_URL`
  - `web` default: `http://localhost:3000`
  - `scheduler` default: `http://web:3000`
- `TZ` default: `Europe/Madrid`
- `SCHEDULE_CRON` default: `0 6 * * *`
- `IMPORT_MIN_DURATION` default: `180`
- `RUN_ON_STARTUP` default: `false`
- `LOCK_PATH` default: `/app/data/.import.lock`

## 6) Produccion detras de Nginx

Si usas dominio + TLS con Nginx, es obligatorio configurar:

- `BASE_URL=https://tu-dominio.com`

Si no, el feed puede publicar enlaces internos/no accesibles para podcatchers.

Checklist minimo:

1. Nginx reverse proxy -> `web:3000` (o `127.0.0.1:3000`)
2. Certificado HTTPS activo
3. `BASE_URL` en scheduler apuntando al dominio publico HTTPS
4. Verificar `https://tu-dominio.com/feed.xml`

## 7) Persistencia de datos

El stack usa volumenes bind para persistir:

- `./data` -> `episodes.json`, `youtube-imported.json`, lock
- `./public/audio` -> MP3 publicados
- `./logs` -> logs del scheduler/import

No borres estas carpetas si quieres conservar estado.

## 8) Actualizacion manual del importador

Ejecutar un import manual inmediato:

```bash
docker compose exec -T scheduler sh -lc '/app/scripts/run-import-with-lock.sh'
```

Notas:

- Usa lock anti-solape
- Si ya hay lock activo, el job se omite

## 9) Logs y observabilidad basica

Logs en vivo:

```bash
docker compose logs -f scheduler
docker compose logs -f web
```

Archivos persistidos:

- `/var/log/podcas/cron.log`
- `/var/log/podcas/import.log`

En host (por bind mount): `./logs/`

## 10) Healthchecks

- `web`: chequeo HTTP a `/`
- `scheduler`: chequeo de proceso `crond`

Comprobar:

```bash
docker compose ps
```

## 11) Pruebas y validacion

Ejecutar test suite:

```bash
npm test
```

Incluye validadores de:

- parser del importador
- feed RSS
- frontend
- integracion end-to-end

## 12) Troubleshooting

### El scheduler no importa

1. Revisar `docker compose logs scheduler`
2. Validar cron en contenedor:
   ```bash
   docker compose exec -T scheduler sh -lc 'cat /etc/crontabs/root'
   ```
3. Verificar dependencias:
   ```bash
   docker compose exec -T scheduler sh -lc 'yt-dlp --version && ffmpeg -version && ffprobe -version'
   ```

### Feed con enlaces incorrectos

- Revisar `BASE_URL` del scheduler (debe ser dominio publico HTTPS si hay Nginx)

### No se sirven audios

1. Confirmar archivo en `public/audio/`
2. Revisar endpoint de audio desde web
3. Verificar permisos de escritura en volumenes

### Puerto 3000 ocupado

- Parar proceso local o cambiar publish en compose

## 13) Flujo recomendado para tercero

1. Clonar repo
2. Configurar `data/youtube-sources.md`
3. Ajustar `BASE_URL`, `TZ`, `SCHEDULE_CRON`
4. `docker compose up -d --build`
5. Verificar `feed.xml` y logs
6. Ejecutar import manual una vez para validar

Con eso queda operativo en modo continuo.
