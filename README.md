# Mi Día V5.1 — paquete GitHub Pages

## Archivos incluidos
- `index.html`: app principal. Conserva meteorología, ruta estimada, avisos de lluvia y notas de V5; mejora la tarjeta de fútbol.
- `manifest.webmanifest`: configuración PWA.
- `sw.js`: caché básica para mejorar la carga con conexión inestable.
- `icon.svg`: icono de la aplicación.

## Publicación
1. Guarda una copia de seguridad de los archivos actuales de GitHub.
2. Sube estos cuatro archivos a la **raíz** del mismo repositorio, sustituyendo los archivos con el mismo nombre si existen.
3. Comprueba en `Settings → Pages` que se publica desde la rama/carpeta correcta.
4. Abre la web y recarga. Si ves la versión antigua, cierra la PWA y borra la caché del sitio en el navegador.

## Limitaciones
- Tráfico: ruta estimada OSRM, sin retenciones en tiempo real.
- Meteorología: Open-Meteo; los avisos solo se revisan mientras la página está abierta y el navegador permite notificaciones.
- Fútbol: partido mostrado provisionalmente hasta confirmarlo en FCF. Los distintivos PB/PS son emblemas gráficos abreviados, no escudos oficiales. GitHub Pages es estático y no puede garantizar sincronización semanal automática con FCF sin una fuente/API accesible o un proceso externo.
- No se incluye ninguna clave privada de Meteocat.
