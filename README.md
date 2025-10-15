# data

## Tablero de proyectos de investigación

Este repositorio contiene un tablero interactivo para visualizar los proyectos de investigación del curso Investigación Acción 2025-II.

### Cómo usarlo

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` en tu navegador preferido (no se requiere servidor adicional).
3. Utiliza el mapa, los filtros y la tabla para explorar los proyectos, sus notas y las sesiones de tutoría.

El tablero utiliza una ilustración del mapa de Colombia incrustada en formato Base64 dentro de `script.js`. Si deseas cambiarla por otra versión, reemplaza el valor de la constante `MAP_IMAGE_URL` con el nuevo _data URI_ generado a partir de tu imagen. Ajusta también los límites de `MAP_BOUNDS` (`minLat`, `maxLat`, `minLng`, `maxLng`) para que los pines sigan alineados; los valores actuales (`-4.3`, `13.4`, `-79.1`, `-66.85`) se calibraron contra esta ilustración y sirven como respaldo cuando un proyecto no incluye posiciones precalculadas.

### Datos incluidos

- 19 equipos consolidados (18 activos) con sus integrantes, operadores y estado actual.
- Notas promedio calculadas por actividad y registro detallado de asistencias a asesorías con fechas, horarios detectados y observaciones.
- Coordenadas geográficas de cada ciudad y su respectiva `mapPosition` (porcentaje X/Y) ya calculada para alinear los pines sobre la imagen estática.
- Enlaces rápidos a repositorios, agendas y evidencias de las sesiones de tutoría.
