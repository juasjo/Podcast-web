## ADDED Requirements

### Requirement: Subscription-aware YouTube import flow
El flujo de importación de la plataforma MUST soportar fuentes de tipo `subscription` sin degradar el comportamiento de `video` y `channel`.

#### Scenario: Ejecución mixta con múltiples tipos de fuente
- **WHEN** el archivo de fuentes contiene entradas `video`, `channel` y `subscription`
- **THEN** el importador procesa cada tipo según sus reglas y finaliza sin conflictos entre categorías

### Requirement: Published episodes require successful subscription audio pipeline
Para una fuente `subscription`, el sistema SHALL publicar episodios solo después de completar metadata, subida de audio y validación de `audioUrl`.

#### Scenario: Falla durante subida de audio
- **WHEN** una importación de suscripción falla en descarga o subida de audio
- **THEN** el episodio se mantiene fuera de estado `published` o se revierte para evitar items rotos en feed
