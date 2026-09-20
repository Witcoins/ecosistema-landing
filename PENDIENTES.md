# Antes de poner la landing en línea

Lista corta de lo que falta. La página funciona sin nada de esto
—no se rompe—, pero conviene resolverlo antes de mostrarla.

El manual completo de montaje está en `README.md`.

---

## 1. Lo que hay que llenar sí o sí

### `enviar.php` — el formulario de "Conversemos"

Líneas 29 a 33: las credenciales de la base de datos del hosting.

```php
define('DB_HOST',    'localhost');
define('DB_NOMBRE',  'nombre_de_la_base');     // <-- REEMPLAZAR
define('DB_USUARIO', 'usuario_de_la_base');    // <-- REEMPLAZAR
define('DB_CLAVE',   'clave_de_la_base');      // <-- REEMPLAZAR
```

La tabla se crea con `db/crear-tabla.sql`.

Si todavía no hay base de datos, se deja `DB_HOST` en `''`
(comillas vacías) y el formulario solo manda el correo, sin guardar
nada. Así funciona igual.

### `agendar-teams.php` — el formulario antes de la reunión

Línea 26: el remitente **debe ser una dirección del mismo dominio
del hosting**, o los correos se van a spam (o no salen).

```php
define('CORREO_REMITENTE', 'no-responder@iwitown.com');   // <-- REEMPLAZAR
```

---

## 2. Requisitos del hosting

* **PHP 7.4 o más nuevo**, con `mail()` habilitado. Casi todos los
  hostings compartidos lo traen.
* **Soporte de rangos** (`Accept-Ranges: bytes`) para que los videos
  puedan adelantarse. Apache y Nginx lo hacen solos; no hay que
  configurar nada.
* **No sirve GitHub Pages ni Netlify**: no ejecutan PHP, así que el
  formulario y el correo de Teams no funcionarían. Todo lo demás sí
  se vería bien.

---

## 3. Archivos que la página busca y todavía no existen

Ninguno rompe nada: la página los pide, no los encuentra y sigue.

| Archivo | Para qué es | Qué pasa si falta |
|---|---|---|
| `politica-datos.html` | Política de tratamiento de datos (Ley 1581) | El enlace del pie da error 404 |
| `terminos.html` | Términos y condiciones | El enlace del pie da error 404 |
| `assets/img/og-portada.jpg` | La imagen que se ve al compartir el enlace | Al compartir por WhatsApp no sale imagen |
| `assets/fonts/*.woff2` | Las tipografías de la marca | Usa las del sistema, se ve bien igual |
| `assets/audio/recorrido/01..16.mp3` | La voz del recorrido narrado | El recorrido va sin voz, con subtítulos |

Los dos primeros son los que más urgen: son enlaces visibles en el
pie de página de todas las pestañas.

---

## 4. Contenido pendiente

* **WiwiQuest** no está en el recorrido del ecosistema: faltan las
  capturas de la aplicación.
* Los videos `assets/video/solucion-1.mp4`, `-2` y `-3` son
  grabaciones de pantalla con **datos de personas reales**
  (nombres de acudientes, de una docente y el estado de pagos de un
  estudiante). Antes de publicar la página conviene volver a
  grabarlos con datos de ejemplo, como se hizo con las capturas.

---

## 5. Cuando se cambie cualquier archivo

En `index.html` todos los archivos llevan `?v=` con un número al
final:

```html
<link rel="stylesheet" href="css/styles.css?v=303">
```

Al cambiar un css, un js o una imagen, hay que **subirle el número a
todos** (buscar y reemplazar `v=303` por `v=304`). Si no, los
navegadores de quienes ya visitaron la página les siguen mostrando
la versión vieja.
