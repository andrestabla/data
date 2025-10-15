# data

## Tablero de proyectos de investigación

Este repositorio contiene un tablero interactivo para visualizar los proyectos de investigación del curso Investigación Acción 2025-II.

### Cómo usarlo

1. Descarga o clona el repositorio.
2. Edita `config.js` y reemplaza el valor de `window.GOOGLE_MAPS_API_KEY` con tu clave de [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key). Si aún no tienes una, crea una clave restringida al dominio o a `file://` para desarrollo local.
3. Abre el archivo `index.html` en tu navegador preferido (no se requiere servidor adicional).
4. Utiliza el mapa, los filtros y la tabla para explorar los proyectos, sus notas y las sesiones de tutoría.

El tablero utiliza Google Maps como base cartográfica, permitiendo aprovechar la forma oficial del país y zooms detallados. Si la clave es inválida o no está definida se mostrará un mensaje con las instrucciones para actualizarla.

### Datos incluidos

- 19 equipos consolidados (18 activos) con sus integrantes, operadores y estado actual.
- Notas promedio calculadas por actividad y registro detallado de asistencias a asesorías con fechas, horarios detectados y observaciones.
- Enlaces rápidos a repositorios, agendas y evidencias de las sesiones de tutoría.
