## Context

El importador de YouTube ya soporta fuentes de tipo `video` y `channel`, además de filtros de duración para evitar shorts/reels. Sin embargo, no existe una semántica explícita para "suscripciones" que permita revisar un canal de forma periódica y traer solo el último contenido largo publicado.

## Goals / Non-Goals

**Goals:**
- Definir una regla `subscription` en `youtube-sources.md` para canales monitorizados diariamente.
- Garantizar que por cada entrada `subscription` se procese como máximo un video por ejecución (el más reciente de la pestaña de videos del canal).
- Mantener compatibilidad con deduplicación por ID/título y filtro anti-shorts existente.
- Permitir que la operación diaria sea incremental y barata en ancho de banda/tiempo.

**Non-Goals:**
- Implementar un scheduler dentro de la aplicación (cron externo seguirá siendo responsable de la periodicidad diaria).
- Cambiar el comportamiento de las reglas `video` y `channel` más allá de lo necesario para compatibilidad.
- Añadir nuevas dependencias externas para orquestación o colas.

## Decisions

- Añadir sintaxis de fuente `subscription: <channel-url>` con soporte opcional de flags futuras mediante `| key=value`.
  - Alternativa: reutilizar `channel` con `latest=1`. Se descarta para evitar ambigüedad semántica y facilitar automatización diaria por categoría.
- Resolver `subscription` contra la pestaña `videos` del canal y seleccionar solo el primer elemento (`playlist-items 1-1`).
  - Alternativa: resolver feed RSS del canal. Se descarta por variabilidad de metadatos y mayor complejidad de normalización con el flujo actual.
- Aplicar pipeline existente (metadata -> create draft -> upload audio -> publish) para suscripciones.
  - Alternativa: flujo especial simplificado para suscripciones. Se descarta para no duplicar lógica de robustez y rollback.
- Mantener deduplicación por `videoId` (archivo de importados) y por título en estado actual del repositorio.
  - Alternativa: deduplicación solo por ID. Se descarta porque el usuario pidió evitar repeticiones por mismo nombre.

## Risks / Trade-offs

- [El canal publica shorts fijados o videos no deseados como primer elemento] -> Mitigación: aplicar filtro de duración mínima y exclusión por `/shorts/` antes de crear episodio.
- [Ejecuciones diarias frecuentes pueden generar bloqueos temporales de YouTube] -> Mitigación: conservar reintentos con backoff y logs de fallo por URL.
- [Dos reglas apuntan al mismo canal y duplican trabajo] -> Mitigación: deduplicación por ID/título y recomendación documental de no repetir fuentes.

## Migration Plan

1. Extender parser para aceptar `subscription` en el markdown de fuentes.
2. Implementar resolución del último video por suscripción (`1-1` en pestaña `videos`).
3. Actualizar documentación de formato y ejemplos de uso diario.
4. Ejecutar importación de prueba y validar que cada suscripción trae máximo un episodio por ejecución.

## Open Questions

- ¿Conviene permitir `subscription` con `min-duration` por línea (override local) además del global?
- ¿Queremos marcar episodios importados por suscripción con metadato de origen para analítica futura?
