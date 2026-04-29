# Especificación Funcional

## Capacidad: podcast-web-platform

### Requirement: Responsive podcast web experience
La plataforma SHALL ofrecer una interfaz web responsive para escritorio y móvil con listado de episodios y página de detalle por episodio.

#### Scenario: Render listado de episodios
- **WHEN** un usuario visita la página principal
- **THEN** el sistema muestra una lista de episodios con título, descripción corta y estado de publicación

#### Scenario: Render detalle de episodio
- **WHEN** un usuario abre la página individual de un episodio existente
- **THEN** el sistema muestra metadatos completos y un reproductor con acceso al audio del episodio

### Requirement: Episode management API
El backend MUST exponer una API para crear, editar, consultar y eliminar episodios con metadatos validados.

#### Scenario: Crear episodio válido
- **WHEN** un cliente envía una solicitud de creación con título, descripción y duración válidos
- **THEN** el sistema persiste el episodio y devuelve su identificador junto con el estado inicial

#### Scenario: Rechazar metadatos inválidos
- **WHEN** un cliente envía campos obligatorios vacíos o formato inválido
- **THEN** el sistema responde con error de validación y no persiste cambios

### Requirement: Audio upload and public access
El sistema MUST permitir la subida de archivos de audio, normalizar metadatos técnicos y asociar una URL pública estable a cada episodio.

#### Scenario: Subida de audio exitosa
- **WHEN** un archivo de audio compatible se sube para un episodio
- **THEN** el sistema almacena el archivo y registra una URL de acceso público vinculada al episodio

#### Scenario: Subida de formato no compatible
- **WHEN** se intenta subir un archivo de audio no soportado
- **THEN** el sistema rechaza la operación con un mensaje de error claro

### Requirement: Automatic RSS generation
El sistema SHALL generar automáticamente un feed RSS 2.0 con extensiones de podcast (incluyendo iTunes) a partir de episodios publicados.

#### Scenario: Publicar episodio en feed
- **WHEN** un episodio cambia al estado publicado
- **THEN** el feed RSS incluye un item con metadatos y referencia al audio del episodio

#### Scenario: Excluir episodios no publicados
- **WHEN** un episodio está en estado draft o archived
- **THEN** el feed RSS no lo incluye como item distribuible

### Requirement: Automated platform validation
La plataforma MUST ejecutar validaciones automáticas de feed RSS, experiencia web responsive e integración entre frontend, backend y audio.

#### Scenario: Validación de feed correcta
- **WHEN** se ejecuta la suite de validación RSS sobre el feed generado
- **THEN** el sistema confirma cumplimiento de RSS 2.0 y campos obligatorios de extensiones de podcast

#### Scenario: Validación de integración end-to-end
- **WHEN** se ejecuta el flujo de prueba desde creación de episodio hasta publicación
- **THEN** el sistema verifica que el episodio aparece en la web y en el feed con audio accesible
