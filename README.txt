MI DÍA V5 — METEOROLOGÍA Y AVISOS DE LLUVIA

NOVEDADES V5
- Avisos de lluvia basados en la previsión horaria gratuita de Open-Meteo.
- Umbral configurable de probabilidad: 30%, 50% o 70%.
- Solicita permiso de notificaciones del navegador y evita repetir el mismo aviso horario.
- Revisa la previsión al abrir/actualizar la web y cada 30 minutos mientras la página permanece abierta.
- Enlace directo a Meteocat para consultar sus avisos oficiales.
- Mantiene los módulos de tráfico, fútbol y notas, además de copias de seguridad v2, v3 y v4.

LIMITACIONES IMPORTANTES
- Esta versión no consulta la API autenticada de Meteocat. Su API deshabilita CORS y requiere servidor; insertar la clave en GitHub Pages la expondría públicamente. Consulta la documentación oficial: https://apidocs.meteocat.gencat.cat/documentacio/seguretat/
- La alternativa usa Open-Meteo sin cuenta ni clave y no sustituye avisos oficiales de Meteocat.
- Las notificaciones solo se pueden generar cuando Mi Día está abierta y el navegador permite ejecutarla. Al cerrar la web, no hay comprobación en segundo plano ni notificación push garantizada, porque GitHub Pages no ejecuta código de servidor.
- Para ver notificaciones en Android, abre la web por HTTPS, pulsa “Activar avisos de lluvia” y acepta el permiso. Si no aparece, revisa los permisos de notificación del navegador.
- La previsión meteorológica es orientativa. Para emergencias y avisos oficiales, consulta Meteocat.
- Tráfico: OSRM da una estimación de ruta sin congestión en tiempo real.
- Partidos: la lista de fixtures sigue siendo estática y hay que verificar los cambios en los enlaces oficiales.
- Las notas y preferencias se guardan localmente en el navegador del dispositivo.

SUBIR DESDE EL MÓVIL
1. Descarga y descomprime el ZIP.
2. Conserva el ZIP como copia de seguridad.
3. En el repositorio https://github.com/cristiangarciajura/Mi-dia, sube los archivos de la carpeta principal `mi-dia-v5` a la raíz: index.html, sw.js, manifest.webmanifest, icon.svg y README.txt.
4. No subas las carpetas backup-v2, backup-v3 ni backup-v4 a la raíz.
5. Espera a que GitHub Pages publique los cambios. Abre https://cristiangarciajura.github.io/Mi-dia/ y recarga. Si se ve la versión anterior, cierra la pestaña y vuelve a abrirla.

FUENTES
- Meteocat API: https://apidocs.meteocat.gencat.cat/documentacio/seguretat/
- Open-Meteo: https://open-meteo.com/en/docs
- Meteocat avisos: https://www.meteo.cat/prediccio/general
