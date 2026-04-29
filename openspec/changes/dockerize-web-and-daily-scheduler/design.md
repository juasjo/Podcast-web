## Context

La aplicación ya cubre publicación web, API, importación de YouTube y generación de feed RSS, pero su operación depende del entorno local. Para ejecución continua necesitamos encapsular dependencias (Node, yt-dlp, ffmpeg), scheduler diario y persistencia en una arquitectura Docker reproducible.

## Goals / Non-Goals

**Goals:**
- Ejecutar la web/API en un contenedor dedicado y estable.
- Ejecutar importaciones diarias desde un scheduler dentro de Docker (servicio separado del web).
- Compartir estado persistente entre servicios para `episodes.json`, audios e historial de importación.
- Definir configuración operativa mínima (TZ, base URL, logs y protección anti-solapamiento).

**Non-Goals:**
- Cambiar el modelo funcional del dominio podcast (episodios, feed, validaciones funcionales).
- Implementar orquestación distribuida (Kubernetes, colas, autoscaling).
- Añadir observabilidad avanzada (tracing/métricas) en esta iteración.

## Decisions

- Adoptar opción B: dos servicios Docker (`web` + `scheduler`) con imagen/base compartida y responsabilidades separadas.
  - Alternativa considerada: un único contenedor con web+cron. Se descarta por acoplamiento operativo y depuración más difícil.
- Ejecutar cron dentro del contenedor `scheduler`, no en host.
  - Alternativa considerada: cron en host con `docker exec`. Se descarta por menor portabilidad entre entornos.
- Usar volúmenes compartidos para `data/` y `public/audio/` entre ambos servicios.
  - Alternativa considerada: almacenamiento efímero en contenedor. Se descarta por pérdida de estado y duplicaciones.
- Mantener pipeline robusto ya existente (draft -> upload -> publish) y sumar lock de ejecución en scheduler para evitar solapamientos.
  - Alternativa considerada: permitir solapamiento y confiar en deduplicación. Se descarta por riesgo operativo y gasto innecesario.
- Configurar `TZ` y `BASE_URL` como variables de entorno obligatorias para consistencia de cron y feed.
  - Alternativa considerada: valores hardcodeados. Se descarta por falta de portabilidad.

## Risks / Trade-offs

- [Cron activo pero web no disponible temporalmente] -> Mitigación: retries existentes, healthcheck web y logging claro de errores de import.
- [Crecimiento de audios en volumen compartido] -> Mitigación: política de retención futura y monitoreo básico de espacio.
- [Ejecución duplicada por reinicios/arranque concurrente] -> Mitigación: lockfile de ejecución y limpieza defensiva en entradas/salidas.
- [Drift entre entornos por versiones de herramientas] -> Mitigación: fijar versiones de imagen y validar arranque con smoke test.

## Migration Plan

1. Crear Dockerfile(s) y compose con servicios `web` y `scheduler`.
2. Configurar cron diario en `scheduler` para ejecutar `import:youtube`.
3. Conectar volúmenes persistentes compartidos para data/audio/importados.
4. Añadir lock anti-solape y logging operativo de jobs.
5. Ejecutar validación end-to-end: web arriba, job ejecutado, feed correcto.

## Open Questions

- ¿Horario definitivo del job diario (y timezone objetivo) para producción?
- ¿Retención de audios por cantidad, edad o manual en esta fase?
