## Why

El importador actual procesa reglas de `video` y `channel`, pero no distingue fuentes que deben comportarse como suscripciones continuas con una política más acotada. Necesitamos una regla específica para revisar canales diariamente y traer solo el último video publicado, reduciendo ruido y evitando cargas innecesarias.

## What Changes

- Añadir una nueva regla en `youtube-sources.md` para fuentes tipo suscripción.
- Definir el comportamiento de importación para suscripciones: revisar diariamente y seleccionar únicamente el último video del canal.
- Alinear filtros existentes (anti shorts/reels y deduplicación) con el nuevo tipo de fuente.
- Incorporar validaciones para asegurar que la regla se interpreta correctamente y no descarga más de un video por suscripción en cada ejecución.

## Capabilities

### New Capabilities
- `youtube-subscription-sources`: Gestiona reglas de suscripción diaria en el archivo de fuentes para importar solo el último video de cada canal.

### Modified Capabilities
- `podcast-web-platform`: Se amplía el comportamiento del importador para soportar un nuevo tipo de regla de fuente (`subscription`) con política de descarga diaria de último video.

## Impact

- Afecta el parser y orquestación del importador en `scripts/publish-youtube-from-md.js`.
- Afecta documentación operativa de fuentes en `data/youtube-sources.md` y `docs/youtube-import.md`.
- Puede requerir ajustes en pruebas de integración del flujo de importación para cubrir la nueva regla.
