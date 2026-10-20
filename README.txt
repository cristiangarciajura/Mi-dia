MI DÍA V3 — guía rápida

ARCHIVOS DE ESTA CARPETA
- index.html: aplicación principal.
- sw.js: caché/offline de la PWA.
- manifest.webmanifest: configuración de instalación.
- icon.svg: icono.
- backup-v2/: copia de los archivos originales consultados en el repositorio.

CÓMO PUBLICAR DESDE EL MÓVIL
1. Abre https://github.com/cristiangarciajura/Mi-dia
2. Antes de reemplazar archivos, descarga el ZIP de la versión actual desde Code > Download ZIP.
3. En el repositorio, abre index.html > lápiz Edit > reemplaza todo el contenido por el index.html de esta carpeta. Repite con sw.js, manifest.webmanifest e icon.svg.
4. Pulsa Commit changes.
5. Espera a que GitHub Pages publique y abre https://cristiangarciajura.github.io/Mi-dia/
6. Si sigue apareciendo la versión anterior, cierra la PWA por completo y vuelve a abrirla. El service worker ahora usa caché mi-dia-v3.

QUÉ INCLUYE
- Mantiene el estilo oscuro y verde de la versión actual.
- Previsión meteorológica de Open-Meteo sin clave API.
- Duración/distancia de ruta estimada mediante OSRM/OpenStreetMap.
- Enlaces de tráfico en tiempo real de Google Maps y del SCT.
- Notas guardadas localmente en el navegador.

LIMITACIONES IMPORTANTES
- La ruta OSRM NO incluye retenciones ni tráfico en tiempo real; la duración es orientativa.
- La dirección del trabajo se intenta localizar con Nominatim. Si no encuentra la dirección o el servicio limita consultas, la estimación de ruta no aparecerá; los enlaces a Maps siguen funcionando.
- La sección de fútbol enlaza con la FCF, pero no muestra calendario ni resultados automáticos hasta confirmar el grupo oficial exacto.
- No se incluye una clave de Meteocat. No pegues claves secretas en index.html ni en ningún repositorio público.
- Los servicios gratuitos pueden limitar disponibilidad o cambiar condiciones. La previsión necesita Internet; la PWA conserva la estructura básica sin conexión.
