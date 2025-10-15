# data

## Tablero de proyectos de investigación

Este repositorio contiene un tablero interactivo para visualizar los proyectos de investigación del curso Investigación Acción 2025-II.

### Cómo usarlo

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` en tu navegador preferido (no se requiere servidor adicional).
3. Utiliza el mapa, los filtros y la tabla para explorar los proyectos, sus notas y las sesiones de tutoría.

El tablero dibuja un croquis de Colombia directamente en SVG (`script.js`) para evitar dependencias con imágenes externas o binarios. Si deseas modificar el contorno, ajusta las constantes `MAP_PATH_MAIN`, `MAP_PATH_ACCENT` y `MAP_PATH_HIGHLIGHT`. En caso de alterar las proporciones, recuerda actualizar también los límites de `MAP_BOUNDS` (`minLat`, `maxLat`, `minLng`, `maxLng`) y los márgenes `MAP_PADDING` para que la proyección de coordenadas mantenga los pines alineados con el croquis.

### Datos incluidos

- 19 equipos consolidados (18 activos) con sus integrantes, operadores y estado actual.
- Notas promedio calculadas por actividad y registro detallado de asistencias a asesorías con fechas, horarios detectados y observaciones.
- Coordenadas geográficas de cada ciudad (la proyección dinámica calcula la ubicación de los pines; `mapPosition` permanece como respaldo manual en caso de necesitar ajustes puntuales).
- Enlaces rápidos a repositorios, agendas y evidencias de las sesiones de tutoría.
