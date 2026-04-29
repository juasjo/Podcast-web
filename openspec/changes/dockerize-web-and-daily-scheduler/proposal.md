## Why

El sistema funciona en entorno local, pero su operación depende del host y configuraciones manuales, lo que dificulta reproducibilidad y mantenimiento. Necesitamos un despliegue contenedorizado con scheduler diario dentro de Docker para ejecutar importaciones de forma estable y predecible.

## What Changes

- Definir una arquitectura Docker basada en dos servicios: `web` y `scheduler`.
- Estandarizar ejecución diaria del importador dentro de un contenedor dedicado con cron.
- Establecer persistencia obligatoria para datos, audios e historial de importación.
- Definir controles operativos mínimos: zona horaria, logs, no-solapamiento de ejecuciones y configuración de URL pública.

## Capabilities

### New Capabilities
- `dockerized-runtime-operations`: Define requisitos de ejecución en contenedores para web y scheduler diario con almacenamiento persistente.

### Modified Capabilities
- `podcast-web-platform`: Amplía el comportamiento operativo para soportar ejecución diaria automatizada del importador bajo entorno Docker sin romper feed ni estado existente.

## Impact

- Afecta archivos de despliegue (`Dockerfile`, `docker-compose`, entrypoints/scripts de cron).
- Afecta documentación operativa de ejecución diaria y monitoreo básico.
- Afecta configuración de importación (base URL, timezone y volúmenes compartidos).
