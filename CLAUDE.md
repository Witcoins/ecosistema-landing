# Landing i'Witown — instrucciones para Claude

Lo que se pide una y otra vez en este repositorio. Hosting ignora `*.md`, así que
este archivo no se publica.

## Cómo se trabaja

- **Todo en español**: las respuestas, los comentarios del código, los commits y
  la documentación. Los comentarios explican el *porqué*, con el mismo tono de los
  archivos que ya existen (recuadros `┌──┐` arriba de cada archivo con "lo que se
  cambia está aquí").
- **Una rama por tarea**, creada desde `origin/main` (`feature/...`, `fix/...`).
  Los cambios entran por **Pull Request**, nunca con push directo a `main`. El
  repositorio es compartido con otro desarrollador que también publica.
- **Antes de subir, pasar el verificador** (`/code-review`). Se corrige lo
  **bloqueante** y lo que **afecta directamente al usuario** de la página; lo
  demás se reporta y se deja. Se vuelve a pasar hasta que no quede nada
  bloqueante, y solo entonces se sube a GitHub y se abre el PR.
- **Probar en el navegador antes de dar algo por hecho**: escritorio y celular
  (375 px), sin scroll horizontal, sin errores de consola, y el formulario
  enviado de verdad contra un servidor de prueba local.
- **Dejar todo listo para que el otro desarrollador lo termine sin preguntar**:
  si un cambio necesita backend, se documenta el contrato (campos, valores,
  respuestas) en un `.md` de la raíz y se deja una referencia de la función en
  `herramientas/` (que no se publica).

## Lo que no se puede olvidar

- **Subir el `?v=` en `index.html`** cada vez que cambie un `.css` o `.js`
  (todos a la vez, ver `DESPLIEGUE.md` §6). Firebase guarda js y css 7 días: sin
  esto, quien ya visitó la página sigue viendo la versión vieja.
- **Respetar los finales de línea** de cada archivo (`README.md` es CRLF, la
  mayoría LF). Un cambio que convierte un archivo entero ensucia el diff y le da
  conflictos al compañero. Comprobar con `git ls-files --eol` y que
  `git diff --stat` cuente solo las líneas reales.
- **Agregar una vista son cuatro sitios**: `VISTAS`, `TITULOS` y `DESCRIPCIONES`
  en `js/vistas.js`, y los **dos** rewrites de `firebase.json`. Y además
  `sitemap.xml`, `llms.txt` y la lista de rutas de `DESPLIEGUE.md` §2 bis.
- **Nunca `href="#algo"` a secas**: con `<base href="/">` lleva a la portada.
  Para bajar a una sección se usa `/vista#seccion`, y la sección tiene que estar
  en la lista de esa vista en `VISTAS`.
- **La lógica de servidor no está aquí**: correos, leads y agenda son Cloud
  Functions del repo `witown-cloud-functions`. Se despliegan **antes** que el
  Hosting. Toda función pública lleva trampa anti-spam y **topes de envío**.
- **Datos personales**: nada de capturas o videos con datos de personas reales;
  usar datos de ejemplo. Toda casilla de autorización enlaza
  `https://politicas.iwitown.com/`. GA4 solo mide con permiso de cookies
  (`js/analitica.js`); nunca medir a mano las visitas de página.
- **Textos para colegios fuera de Colombia**: español neutro, con "usted", sin
  referencias al sistema educativo colombiano.

## Dónde está cada cosa

- `DESPLIEGUE.md`: cómo se publica y qué revisar antes.
- `PENDIENTES.md`: lo que falta y lo que nunca existió (no confundirlo con
  errores de publicación).
- `ALIANZAS.md`: la página `/alianzas-educativas` y el contrato de la función
  `landingAlianza` (vive en `witown-cloud-functions`).
