# Mi Día V6 — paquete completo para GitHub Pages

## Archivos incluidos
- `index.html`: estructura de la aplicación.
- `styles.css`: diseño adaptable para móvil y ordenador, modo oscuro/claro.
- `app.js`: meteorología, cálculo orientativo de ruta, avisos de lluvia, notas y copia de seguridad.
- `manifest.webmanifest`: configuración de instalación como PWA.
- `sw.js`: caché básica de los archivos de la app y actualización de versión.
- `icon.svg`: icono de Mi Día.

## Instalación desde el móvil
1. Descarga y descomprime `mi-dia-v6-completo.zip`.
2. Abre el repositorio de Mi Día en GitHub.
3. Sube los seis archivos anteriores a la raíz del repositorio. Sustituye los archivos del mismo nombre; no borres carpetas ajenas al proyecto.
4. Espera a que GitHub Pages publique los cambios.
5. Abre la web y recarga. Si aparece la versión anterior, cierra la PWA, vuelve a abrirla y recarga; el service worker se actualiza con la nueva versión.

## Mejoras
- Interfaz renovada y adaptable; navegación rápida por secciones.
- Modo claro/oscuro con preferencia guardada.
- Resumen del día, fecha y saludo dinámicos.
- Meteorología horaria y diaria desde Open-Meteo.
- Avisos de lluvia del navegador, conservando la preferencia anterior de V5/V5.1.
- Ruta por carretera y accesos directos a Google Maps y al Servei Català de Trànsit.
- Sección de fútbol con enlaces a los calendarios oficiales; escudos del Real Madrid y Espanyol cargados desde football-data.org, y escudo de la Penya cargado desde la imagen pública del perfil @PBSV1978 con emblema de respaldo.
- Notas con marcar como completadas, eliminar, borrar, exportar e importar una copia JSON.
- Migración automática de las notas guardadas en V5/V5.1 a la nueva estructura, sin borrar la clave anterior.

## Limitaciones importantes
- **Tráfico:** OSRM/OpenStreetMap da una duración base sin retenciones en tiempo real. Los enlaces a Google Maps/SCT son los que deben usarse para consultar incidencias actuales.
- **Meteorología y avisos:** Open-Meteo es una fuente de previsión, no un aviso oficial de Meteocat. Las notificaciones solo se revisan mientras la página está abierta y el navegador permite notificaciones.
- **Partidos:** Real Madrid y Espanyol intentan cargar próximos partidos y el último resultado desde un endpoint público de ESPN al abrir la app; si falla, quedan disponibles los calendarios oficiales. Para el equipo cadete de FCF no se inventan fechas ni resultados: no se ha confirmado una API de FCF accesible desde una web estática, así que el enlace oficial debe usarse para verificar el siguiente partido.
- **Escudos:** los logos de Real Madrid y Espanyol se cargan desde un servicio externo (requieren conexión). El emblema de la Penya es un distintivo provisional, no un escudo oficial. Cuando tengas una imagen oficial del club, puede incorporarse como archivo local.
- **Datos personales:** las notas se guardan en el almacenamiento local del navegador, no en una cuenta online. Exporta una copia antes de cambiar de móvil o borrar los datos del sitio.
- **Clave Meteocat:** no se incluye ninguna clave privada en los archivos públicos.

## Fuentes
- Open-Meteo: https://open-meteo.com/
- OpenStreetMap / Nominatim: https://www.openstreetmap.org/
- OSRM: https://project-osrm.org/
- Federació Catalana de Futbol: https://www.fcf.cat/
- LaLiga: https://www.laliga.com/
- Real Madrid: https://www.realmadrid.com/
- RCD Espanyol: https://www.rcdespanyol.com/
- Escudos de fútbol: https://crests.football-data.org/
- Escudo de la Penya: imagen pública del perfil @PBSV1978 en X: https://x.com/pbsv1978
- Calendarios de Real Madrid y Espanyol: endpoint público de ESPN; enlaces oficiales disponibles dentro de la app.
