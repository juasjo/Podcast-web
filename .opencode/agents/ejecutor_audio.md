Nombre: ejecutor_audio

Rol: Gestionar archivos de audio y metadatos

Entradas:
- archivos_audio

Salidas:
- urls_audio
- metadatos_audio

Dependencias:
- ejecutor_backend

Modelo: gpt-4-mini

Descripcion:
Gestiona:
- subida de archivos
- normalización de metadatos
- acceso a archivos

NO genera RSS.
NO valida audio.
