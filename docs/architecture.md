# Arquitectura modular por agentes

## Módulos

- **frontend**: render web responsive (`src/frontend`)
- **backend**: CRUD y validación de episodios (`src/backend`, `src/contracts`)
- **audio**: subida, almacenamiento y normalización técnica (`src/audio`)
- **rss**: generación RSS 2.0 + iTunes (`src/rss`)
- **validadores**: feed, web responsive e integración e2e (`src/validators`)

## Responsabilidades por agente

- `planificador_arquitectura`: define estructura, contratos, rutas base.
- `planificador_feed`: define reglas RSS y campos obligatorios.
- `ejecutor_backend`: implementa API de episodios y persistencia.
- `ejecutor_audio`: implementa subida y URL pública estable.
- `ejecutor_frontend`: implementa listado y detalle responsive.
- `ejecutor_feed`: implementa generador + endpoint feed.
- `validador_feed`: valida RSS 2.0/iTunes y obligatoriedad.
- `validador_web`: valida responsive para vistas principales.
- `validador_integracion`: valida flujo end-to-end completo.
- `agente_orquestador`: coordina orden/dependencias, sin ejecutar código.

## Contrato canónico de episodio

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "duration": 0,
  "publishDate": "ISO date string",
  "audioUrl": "string|null",
  "status": "draft|published|archived"
}
```

## Convenciones de rutas

- `GET /api/episodes`
- `POST /api/episodes`
- `PUT /api/episodes/:id`
- `DELETE /api/episodes/:id`
- `POST /api/episodes/:id/audio?filename=<file>`
- `GET /feed.xml`
- `GET /` y `GET /episodes/:id`
