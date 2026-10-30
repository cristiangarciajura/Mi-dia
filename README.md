# Mi Día V6.4 — reparación del motor de actualización

## Archivos
Sube estos seis archivos a la raíz del repositorio GitHub Pages y sustituye los anteriores: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`.

## Correcciones principales
- Corregido un error crítico de inicialización: la versión anterior construía la URL meteorológica con `HOME.lat` y `HOME.lon`, pero `HOME` no estaba definido. Ese error detenía la ejecución completa de `app.js`, por lo que no arrancaba ni la carga automática ni el botón.
- La previsión se construye ahora después de geocodificar la dirección de casa; si Nominatim falla, se usa un punto aproximado del municipio y se identifica como aproximado.
- Las peticiones externas tienen tiempo máximo, reintentos y mensajes de error; cada servicio se procesa de forma independiente para que un fallo no detenga los demás.
- Ida y vuelta se calculan de forma independiente.
- Se consulta primero el enlace exacto de la competición FCF facilitado por Cristian y se deja elFutbol como alternativa. La página FCF puede cargar parte del contenido dinámicamente y no siempre permite lectura automática desde otro dominio; si la respuesta no contiene datos reconocibles, se informa como fallo y no se presenta como actualización correcta.
- El service worker usa caché de red primero para HTML, JavaScript y CSS; la caché solo se utiliza si no hay conexión. Las respuestas de APIs externas no se guardan en caché.
- El registro del service worker solicita comprobación de actualización sin usar la caché HTTP y la versión de JS/CSS lleva un parámetro de versión.

## Instalación (importante)
1. Guarda una copia de la versión que funciona ahora, aunque tenga fallos de actualización.
2. Descomprime el ZIP y sube los seis archivos a la raíz del repositorio, sustituyendo los anteriores. No subas el ZIP como archivo único.
3. Espera a que GitHub Pages termine el despliegue.
4. Cierra completamente la PWA/Chrome. Abre la URL de GitHub Pages en Chrome y recarga. Si aún aparece la versión anterior, entra en Chrome > Ajustes > Configuración de sitios > Todos los sitios > tu dominio de GitHub Pages > Borrar y restablecer. Esto elimina la caché local del sitio; las notas guardadas podrían perderse, así que expórtalas antes desde Mi Día si las necesitas.
5. Pulsa Actualizar datos. La barra superior indicará cuántos servicios han respondido y cuáles han fallado.

## Límites reales
- OSRM proporciona una ruta y tiempo estimado de referencia, no tráfico en vivo ni retenciones.
- ESPN y elFutbol/FCF son fuentes externas. Sus endpoints y páginas pueden cambiar o bloquear peticiones desde GitHub Pages. Se aplican reintentos y errores explícitos, pero no se puede garantizar disponibilidad permanente sin un backend propio.
- El origen de casa sigue siendo aproximado porque no se ha indicado número de portal. El punto de respaldo es el centro aproximado de Sant Vicenç dels Horts.
- No se incluyen claves privadas ni servicios de pago.
