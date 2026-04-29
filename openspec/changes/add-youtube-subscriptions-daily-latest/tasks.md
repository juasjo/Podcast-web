## 1. Parser y modelo de fuentes

- [x] 1.1 Extender el parser de `youtube-sources.md` para aceptar `subscription: <channel-url>`
- [x] 1.2 Validar URLs de `subscription` con las mismas reglas base que `channel`
- [x] 1.3 Añadir pruebas unitarias del parser para casos válidos e inválidos de `subscription`

## 2. Resolución y selección de videos

- [x] 2.1 Implementar resolución de `subscription` contra la pestaña `/videos` del canal
- [x] 2.2 Limitar la selección a un único candidato por suscripción (`playlist-items 1-1`)
- [x] 2.3 Aplicar filtros anti-shorts/reels y duración mínima antes de crear episodio

## 3. Pipeline de publicación robusto

- [x] 3.1 Integrar `subscription` en el pipeline existente (create draft -> upload audio -> publish)
- [x] 3.2 Asegurar deduplicación por ID y por título para suscripciones
- [x] 3.3 Garantizar rollback si falla subida/publicación para evitar episodios sin audio

## 4. Documentación y operación diaria

- [x] 4.1 Actualizar `data/youtube-sources.md` con ejemplos de `subscription`
- [x] 4.2 Actualizar `docs/youtube-import.md` con comportamiento diario y límites de suscripción
- [x] 4.3 Documentar comando recomendado para ejecución diaria (cron externo)

## 5. Validación final

- [x] 5.1 Ejecutar importación de prueba con fuentes mixtas (`video`, `channel`, `subscription`)
- [x] 5.2 Verificar que cada `subscription` produce como máximo un episodio por ejecución
- [x] 5.3 Ejecutar validadores y comprobar feed sin episodios rotos
