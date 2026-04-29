## Why

La base actual define la intención del proyecto, pero no establece requisitos verificables ni el flujo completo para publicar un podcast de forma consistente. Necesitamos formalizar una capacidad integral para construir y validar la plataforma web end-to-end ahora, de modo que el equipo pueda implementar por fases sin ambigüedades.

## What Changes

- Definir requisitos funcionales para una plataforma web de podcast con frontend responsive, backend de episodios, gestión de audio y generación de feed RSS.
- Establecer requisitos de validación para compatibilidad RSS, calidad web y pruebas de integración entre módulos.
- Documentar una arquitectura modular basada en agentes con responsabilidades separadas para orquestación, planificación, ejecución y validación.
- Traducir los requisitos en diseño técnico y plan de implementación ejecutable en tareas.

## Capabilities

### New Capabilities
- `podcast-web-platform`: Define y gobierna el comportamiento funcional de la plataforma completa de gestión, publicación y distribución de podcast.

### Modified Capabilities
- Ninguna.

## Impact

- Afecta frontend web (listado y detalle de episodios), backend/API de episodios, pipeline de subida de audio y endpoint/generador RSS.
- Introduce criterios de validación automática para RSS, UX responsive e integración completa.
- Establece contratos de trabajo para agentes planificadores, ejecutores y validadores.
