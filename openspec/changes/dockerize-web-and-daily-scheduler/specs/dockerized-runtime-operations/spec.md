## ADDED Requirements

### Requirement: Two-service Docker runtime architecture
El sistema SHALL ejecutarse en Docker con dos servicios separados: `web` para API/feed/frontend y `scheduler` para importación diaria.

#### Scenario: Arranque de stack contenedorizado
- **WHEN** se inicia la configuración Docker del proyecto
- **THEN** los servicios `web` y `scheduler` quedan operativos con responsabilidades no solapadas

### Requirement: Shared persistent storage across services
La ejecución en Docker MUST compartir almacenamiento persistente entre `web` y `scheduler` para datos de episodios, historial de importación y archivos de audio.

#### Scenario: Reinicio de servicios sin pérdida de estado
- **WHEN** se reinicia uno o ambos contenedores
- **THEN** episodios, audios e historial de importación permanecen disponibles

### Requirement: Daily scheduler execution inside Docker
El servicio `scheduler` MUST ejecutar la importación de YouTube diariamente dentro del contenedor usando zona horaria configurable.

#### Scenario: Disparo diario de importación
- **WHEN** llega la ventana horaria configurada
- **THEN** el scheduler ejecuta el comando de importación sin intervención manual

### Requirement: Non-overlapping scheduled imports
El scheduler MUST prevenir ejecuciones solapadas del importador para evitar operaciones duplicadas.

#### Scenario: Job previo en ejecución
- **WHEN** un nuevo disparo ocurre mientras otro job sigue activo
- **THEN** el nuevo disparo se omite o espera según política de lock definida
