MI DÍA V4 — INSTALACIÓN

Incluye:
- Meteorología por horas mediante Open-Meteo (sin clave API).
- Estimación de ruta por carretera mediante OSRM, sin tráfico en tiempo real.
- Enlaces a Google Maps y a incidencias oficiales del Servei Català de Trànsit.
- Próximos partidos publicados para Real Madrid y RCD Espanyol, con enlaces a calendarios oficiales. Los horarios pueden cambiar; compruébalos en los enlaces.
- Notas guardadas en el navegador del móvil.
- Copias de seguridad completas de v2 y v3.

SUBIR DESDE EL MÓVIL
1. Descomprime este ZIP.
2. Entra en el repositorio GitHub Mi-dia.
3. Abre cada archivo de la carpeta principal de v4 y usa el lápiz/Edit o Add file para reemplazarlo/subirlo.
4. Sube index.html, sw.js, manifest.webmanifest, icon.svg y README.txt a la raíz del repositorio.
5. Espera a que GitHub Pages publique los cambios y recarga la web. Si ves la versión antigua, cierra la pestaña y vuelve a abrirla.
6. No subas las carpetas backup-v2 ni backup-v3 a la raíz de publicación si no quieres que se publiquen como parte de la web; quedan dentro del ZIP como copias locales.

IMPORTANTE
- Los datos de partidos de esta versión son una lista de próximos encuentros basada en calendarios consultados el 21/10/2026, no una conexión en tiempo real. Usa los enlaces oficiales para confirmar cambios.
- Meteocat: la clave API no está incluida ni publicada. La integración autenticada de Meteocat y los avisos automáticos es el siguiente paso; la previsión actual sigue usando Open-Meteo.
- El tiempo OSRM es una duración orientativa sin congestión actual. Para incidencias y tráfico real, usa los enlaces de Maps/SCT.
- Las notas se guardan en localStorage de este navegador y no se sincronizan entre dispositivos.

Estructura:
index.html, sw.js, manifest.webmanifest, icon.svg, README.txt
backup-v2/ = copia de v2
backup-v3/ = copia de v3
