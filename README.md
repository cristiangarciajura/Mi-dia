# Mi Día V7.0 — calendarios con actualización programada

## Qué cambia
La app deja de consultar ESPN/FCF directamente desde el navegador. Un flujo de GitHub Actions genera `sports-data.json` en el propio repositorio cada 6 horas; la web solo descarga ese archivo local. Así se evitan CORS, proxies públicos y cambios de conexión del móvil. La app guarda también la última copia correcta en el móvil.

## Instalación
1. Haz una copia del repositorio actual.
2. Descomprime este ZIP y sube **todo su contenido** a la raíz del repositorio, conservando la carpeta `.github/workflows` y la carpeta `scripts`. Sustituye los archivos anteriores.
3. En GitHub abre **Settings → Actions → General → Workflow permissions** y activa **Read and write permissions**. Guarda.
4. Abre la pestaña **Actions**, selecciona **Actualizar calendarios deportivos** y pulsa **Run workflow** para la primera actualización. Después se ejecutará automáticamente cada 6 horas.
5. Comprueba que se haya creado/actualizado `sports-data.json` en la raíz. Después abre Mi Día y pulsa **Actualizar datos**.

## Fuentes y límites
- Real Madrid: ESPN, competiciones LaLiga y Champions League.
- RCD Espanyol: ESPN, LaLiga.
- Penya Barcelonista Sant Vicenç Horts Cadete S15: enlace de competición FCF que facilitaste. La FCF puede servir contenido dinámico; si el HTML no contiene la jornada, el panel lo indicará y enlazará a la competición, sin inventar partidos.
- La automatización requiere que GitHub Actions esté habilitado y tenga permiso de escritura. No necesita claves API ni un servidor propio.

## Diagnóstico
Si no hay partidos, entra en Actions y revisa el último workflow. Si falla la consulta ESPN/FCF, `sports-data.json` conservará el resultado del último intento y mostrará el error de FCF.
