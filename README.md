# Mi Día V6.1 — actualización de datos

## Archivos incluidos
- `index.html`: estructura de la aplicación.
- `styles.css`: diseño adaptable para móvil y ordenador, modo oscuro/claro.
- `app.js`: meteorología, ruta, calendarios deportivos, avisos de lluvia y notas.
- `manifest.webmanifest`: configuración PWA.
- `sw.js`: caché de la app; versión renovada para forzar la actualización.
- `icon.svg`: icono de Mi Día.

## Instalación desde el móvil
1. Descarga y descomprime `mi-dia-v6.1-completo.zip`.
2. Abre tu repositorio de Mi Día en GitHub.
3. Sube los seis archivos de la aplicación a la raíz del repositorio (`index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`) y sustituye los del mismo nombre. Puedes subir también este README si quieres.
4. Espera a que GitHub Pages publique los cambios.
5. Abre la web y pulsa **Actualizar datos**. Se ha cambiado la versión de caché del service worker para que descargue los archivos nuevos. Si siguiera apareciendo V6, cierra la PWA, vuelve a abrirla y recarga.

## Cambios en V6.1
- El botón **Actualizar datos** consulta en una sola acción meteorología, rutas y calendarios deportivos.
- Real Madrid: busca sus dos próximos partidos en LaLiga y Champions League, cuando el calendario público de ESPN responde.
- RCD Espanyol: busca sus dos próximos partidos de LaLiga.
- Los calendarios se consultan al pulsar el botón y también al abrir la app. Se muestra un mensaje si falla la fuente, en vez de ocultar el error.
- La ruta se recalcula al actualizar, tanto de ida como de vuelta (dos llamadas independientes a OSRM/OpenStreetMap). El destino se geocodifica con varias búsquedas de respaldo.
- Añadidos enlaces directos al grupo 14 de la FCF y a la ficha del equipo en el portal elFutbol.
- Se conservan el diseño, modo claro/oscuro, avisos de lluvia, notas, importación/exportación y datos locales.

## Límites importantes
- **Tráfico:** OSRM calcula una ruta base y duración estimada, no tráfico en tiempo real. Los enlaces de Google Maps y SCT siguen siendo los adecuados para ver retenciones actuales.
- **Calendarios profesionales:** la app consulta un endpoint público de ESPN; no se ha podido probar en este entorno si responde desde todos los navegadores/móviles. Si la fuente falla, aparecen mensajes de error y siguen disponibles los enlaces oficiales.
- **FCF y clasificación:** se han añadido enlaces directos, pero la carga automática de resultados y clasificación de FCF todavía no está conectada: no se ha verificado un endpoint oficial accesible desde una web estática. No se muestran rivales, puntos ni posiciones inventados. La página de FCF puede cambiar de jornada en la ruta; si el enlace abre una jornada antigua, usa el portal oficial para elegir la actual.
- **Meteorología y avisos:** Open-Meteo es una fuente de previsión, no un aviso oficial de Meteocat. Las notificaciones solo se revisan mientras la página está abierta y el navegador permite notificaciones.
- **Notas:** se guardan en el almacenamiento local del navegador. Exporta una copia antes de cambiar de móvil o borrar datos del sitio.
- **Clave Meteocat:** no se incluye ninguna clave privada en los archivos públicos.

## Fuentes
- Open-Meteo: https://open-meteo.com/
- OpenStreetMap / Nominatim: https://www.openstreetmap.org/
- OSRM: https://project-osrm.org/
- FCF: https://www.fcf.cat/
- FCF, resultados Cadet Segona Divisió S15, Grup 14: https://www.fcf.cat/resultats/2627/futbol-11/cadet-segona-divisio-s15/grup-14/jornada-5
- Ficha del equipo en elFutbol: https://elfutbol.co/es/team/pa-barc-sant-vicenc-horts-cadet-s15-a
- Real Madrid: https://www.realmadrid.com/
- RCD Espanyol: https://www.rcdespanyol.com/
- LaLiga: https://www.laliga.com/
