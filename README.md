# Mi Día V6.2 — actualización de datos

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
- Real Madrid: intenta cargar los dos próximos partidos de LaLiga y Champions League con ESPN y usa el calendario oficial de LaLiga como alternativa.
- RCD Espanyol: intenta cargar los dos próximos partidos con ESPN y usa el calendario oficial de LaLiga como alternativa.
- Los calendarios se consultan al pulsar el botón y también al abrir la app. Se muestra un mensaje si falla la fuente, en vez de ocultar el error.
- La ruta se recalcula al actualizar, tanto de ida como de vuelta (dos llamadas independientes a OSRM/OpenStreetMap). El destino se geocodifica con varias búsquedas de respaldo.
- FCF: intenta leer el próximo partido y datos de clasificación desde la ficha del equipo en elFutbol; si la lectura no funciona, mantiene los enlaces al grupo oficial de la FCF.
- La ruta usa Travessera d’Aragó, Sant Vicenç dels Horts como origen y Ernesto Ventós, Ctra. Reial 120B, como destino. Sin número de portal de casa, el punto de salida puede ser aproximado.
- Se conservan el diseño, modo claro/oscuro, avisos de lluvia, notas, importación/exportación y datos locales.

## Límites importantes
- **Tráfico:** OSRM calcula una ruta base y duración estimada, no tráfico en tiempo real. Los enlaces de Google Maps y SCT siguen siendo los adecuados para ver retenciones actuales.
- **Calendarios profesionales:** se consulta ESPN y, como alternativa, se intenta leer la página oficial de LaLiga a través de un proxy público. Las políticas de CORS, el proxy o cambios de estructura de las páginas pueden impedir la lectura automática; si ocurre, se muestra un aviso y quedan los enlaces oficiales.
- **FCF y clasificación:** la app intenta leer la ficha pública de elFutbol mediante un proxy. No es una API oficial y la estructura puede cambiar; verifica los datos en la FCF si no aparecen completos. No se inventan datos si falla la fuente.
- **Meteorología y avisos:** Open-Meteo es una fuente de previsión, no un aviso oficial de Meteocat. Las notificaciones solo se revisan mientras la página está abierta y el navegador permite notificaciones.
- **Notas:** se guardan en el almacenamiento local del navegador. Exporta una copia antes de cambiar de móvil o borrar datos del sitio.
- **Clave Meteocat:** no se incluye ninguna clave privada en los archivos públicos.

## Fuentes
- Open-Meteo: https://open-meteo.com/
- OpenStreetMap / Nominatim: https://www.openstreetmap.org/
- OSRM: https://project-osrm.org/
- FCF: https://www.fcf.cat/
- FCF, resultados Cadet Segona Divisió S15, Grup 14: https://www.fcf.cat/ca/competicio?temporadaId=22&disciplinaId=19308233&competicioId=58780268&grupId=60210831&jornada=5
- Ficha del equipo en elFutbol: https://elfutbol.co/es/team/pa-barc-sant-vicenc-horts-cadet-s15-a
- Real Madrid: https://www.realmadrid.com/
- RCD Espanyol: https://www.rcdespanyol.com/
- LaLiga: https://www.laliga.com/
