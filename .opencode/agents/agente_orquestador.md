Nombre: agente_orquestador

Rol: Coordinar el flujo completo del sistema multi-agente

Entradas:
- descripcion_proyecto
- configuracion_global

Salidas:
- plan_ejecucion
- estado_global

Dependencias:
- planificador_arquitectura
- planificador_feed
- ejecutor_frontend
- ejecutor_backend
- ejecutor_feed
- ejecutor_audio
- validador_feed
- validador_web
- validador_integracion

Modelo: gpt-5.3

Descripcion:
Coordina la ejecución completa del sistema.
Define el orden de ejecución de los agentes.
Gestiona dependencias y flujo de datos.

NO ejecuta tareas técnicas.
NO genera código.
