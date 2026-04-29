## ADDED Requirements

### Requirement: Docker-aware import configuration
La plataforma MUST soportar configuración por entorno para ejecución en contenedores, incluyendo `BASE_URL` y `TZ`, sin degradar comportamiento funcional existente.

#### Scenario: Feed generado en entorno Docker
- **WHEN** el importador publica episodios bajo configuración de contenedor
- **THEN** el feed RSS utiliza enlaces coherentes con la `BASE_URL` configurada

### Requirement: Scheduled import resilience in containerized operation
La operación programada de importación en Docker SHALL mantener consistencia del feed incluso ante fallos parciales del job.

#### Scenario: Fallo parcial durante job diario
- **WHEN** una importación falla durante descarga o subida de audio
- **THEN** no se publican episodios incompletos y el feed mantiene items válidos
