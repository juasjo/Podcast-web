## ADDED Requirements

### Requirement: Subscription source rule in markdown
El sistema SHALL aceptar una nueva regla `subscription` en `youtube-sources.md` para describir canales monitorizados diariamente.

#### Scenario: Parseo válido de regla subscription
- **WHEN** el parser procesa una línea con formato `subscription: <channel-url>`
- **THEN** crea una entrada de tipo `subscription` con URL de canal válida

### Requirement: Daily latest-only retrieval for subscriptions
Por cada entrada `subscription`, el importador MUST seleccionar solo el último video publicado en la pestaña de videos del canal durante una ejecución.

#### Scenario: Canal con videos disponibles
- **WHEN** una suscripción apunta a un canal con publicaciones
- **THEN** el importador resuelve exactamente un video candidato (el más reciente)

#### Scenario: Canal sin videos disponibles
- **WHEN** una suscripción apunta a un canal sin videos elegibles
- **THEN** el importador no crea episodios y continúa con la siguiente fuente

### Requirement: Compatibility with existing import safeguards
Las fuentes `subscription` MUST respetar deduplicación y filtros anti-shorts/reels antes de publicar episodios.

#### Scenario: Último video ya importado
- **WHEN** el video más reciente ya existe por ID o título
- **THEN** el importador lo marca como omitido y no crea episodio nuevo

#### Scenario: Último video no elegible por filtros
- **WHEN** el video más reciente cae en `/shorts/`, `/reel/` o por debajo de la duración mínima
- **THEN** el importador omite la publicación para esa suscripción en esa ejecución
