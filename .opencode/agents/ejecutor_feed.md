Nombre: ejecutor_feed

Rol: Generar el feed RSS dinámico del podcast

Entradas:
- datos_episodios
- esquema_rss

Salidas:
- feed_rss

Dependencias:
- planificador_feed
- ejecutor_backend

Modelo: gpt-4

Descripcion:
Genera el feed RSS:
- XML válido
- compatible con plataformas

NO valida el feed.
NO gestiona almacenamiento.
