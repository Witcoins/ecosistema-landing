# Antes de poner la landing en línea

Lista corta de lo que falta. La página funciona sin nada de esto —no se
rompe—, pero conviene resolverlo antes de mostrarla.

**Cómo se publica está en [`DESPLIEGUE.md`](DESPLIEGUE.md)**, que es la fuente
única. El sitio va a **Firebase Hosting** (sitio `ecosistema-iwitown`), no a un
hosting compartido por FTP.

---

## 1. Lo que bloquea la publicación

Los dos bloqueantes están en [`DESPLIEGUE.md`](DESPLIEGUE.md) §0. El más
importante, resumido: **los videos `assets/video/solucion-1.mp4` y `-3.mp4`
tienen datos de personas reales** y hay que regrabarlos. Ojo también con
`solucion-2.mp4`: ninguna pantalla lo muestra, pero se publica igual porque
viaja dentro de `assets/`.

---

## 2. Requisitos del hosting

Ya no hay requisitos de hosting que cumplir: Firebase Hosting da HTTPS,
compresión, caché y rangos de video sin configurar nada. El formulario de
contacto y el agendamiento los atienden tres Cloud Functions (ver
[`DESPLIEGUE.md`](DESPLIEGUE.md) §2); el calendario es nuestro, no el de pago de
Google.

Lo único que hay que tener instalado en la máquina es la CLI de Firebase.

---

## 3. Archivos que la página busca y todavía no existen

Ninguno rompe nada: la página los pide, no los encuentra y sigue.

| Archivo | Para qué es | Qué pasa si falta |
|---|---|---|
| `assets/img/og-portada.jpg` | La imagen que se ve al compartir el enlace | Al compartir por WhatsApp no sale imagen |
| `assets/fonts/*.woff2` | Las tipografías de la marca | Usa las del sistema, se ve bien igual |
| `assets/audio/recorrido/01..16.mp3` | La voz del recorrido narrado | El recorrido va sin voz, con subtítulos |
| `assets/audio/witutor/agenda.mp3` | Una de las marcas de voz de I'Witutor | Ese tramo va sin voz |

Esta es **la lista completa**: si algo más no aparece después de publicar, es un
problema de la subida, no un archivo que falte. Las páginas legales ya no están
acá: los tres enlaces van a las páginas externas vigentes
(ver [`DESPLIEGUE.md`](DESPLIEGUE.md) §7).

---

## 3 bis. La medición: lo que falta y no es técnico

La medición de visitas ya está montada (GA4, con aviso de cookies; ver
[`DESPLIEGUE.md`](DESPLIEGUE.md) §2 ter). Lo que falta no es código:

- **La política de `politicasprivacidadwitcoins.com` tiene que nombrar a Google
  como encargado del tratamiento** y mencionar las cookies analíticas. Mientras
  no lo diga, el aviso promete algo que la política no respalda.
- **En la consola de Analytics:** apagar Google Signals y bajar la retención de
  datos. Son los dos ajustes que más amplían lo que se recoge.

---

## 4. Contenido pendiente

* **WiwiQuest** no está en el recorrido del ecosistema: faltan las
  capturas de la aplicación.
* Los videos `assets/video/solucion-1.mp4`, `-2` y `-3` son
  grabaciones de pantalla con **datos de personas reales**
  (nombres de acudientes, de una docente y el estado de pagos de un
  estudiante). Antes de publicar la página hay que volver a
  grabarlos con datos de ejemplo, como se hizo con las capturas.
  `-1` y `-3` se muestran en la página; `-2` no se muestra, pero se
  publica igual. **Ojo: el sitio ya está en línea y el 2026-10-14 los
  tres respondían 200** en `ecosistema-iwitown.web.app`.
* Confirmar que **"Nicolas Alberto Páez López"** (`js/simulador.js` e
  `index.html`, el saludo del simulador) es un nombre inventado. Si es de
  un estudiante real, se cambia como los videos.

---

## 4 bis. Que la IA y los buscadores encuentren a i'Witown

Ya está: `robots.txt` (deja pasar a los rastreadores de IA), `sitemap.xml`,
`llms.txt` (resumen en texto plano para asistentes) y los datos de schema.org
en el `<head>` de `index.html`. **Todo dice solo lo que la página ya dice**, salvo los precios de `llms.txt` (ver abajo):
si se cambia un texto de la página que también está ahí, se cambia en los dos.

Falta, y no es código:

* **Los precios están SOLO en `llms.txt`, a propósito** (decisión del
  2026-10-15): los leen los asistentes de IA, pero la página no los muestra.
  Son los de lista de los correos comerciales (`Documents\GMG`) **más un 10 %**
  para tener margen de negociación. Ojo: `llms.txt` no está enlazado, pero es
  público — cualquiera que escriba `/llms.txt` lo ve. **No van en el
  schema.org del `<head>`**: Google castiga los datos estructurados que
  dicen algo que el visitante no ve. Si cambian los precios de los correos,
  se recalculan aquí.
* **Ficha para colegios** con los datos que se comparan: grados exactos,
  tiempo de implementación, qué incluye cada aplicación, cómo se tratan los
  datos de menores y un caso real (Gimnasio Cordilleras, con su permiso).
* **Preguntas frecuentes** de rectores, escritas en el HTML (no en JS).
* **El título** ("Que el colegio muestre su propia identidad") no dice qué es
  i'Witown. Una opción: "i'Witown — Plataforma educativa para colegios de
  primaria en Colombia".
* **Decidir si un asistente puede agendar la demo solo**: `/api/horas` y
  `/api/agendar` ya existen; documentarlos en `llms.txt` lo permite, pero
  también abre la puerta a citas basura.
* **Dominio:** `www.iwitown.com` sirve la aplicación (login), no esta página.
  Por ahora la landing se queda en `www.ecosistema.iwitown.com`.
* Al publicar: dar de alta el sitio en Google Search Console y enviarle el
  `sitemap.xml`.

---

## 5. Cuando se cambie cualquier archivo

En `index.html` todos los archivos llevan `?v=` con un número al final:

```html
<link rel="stylesheet" href="css/styles.css?v=320">
```

El número vigente es **320**. Al cambiar un css, un js o una imagen hay que
**subirle el número a todos** (buscar `v=320` y reemplazar por `v=321`). Si no,
los navegadores de quienes ya visitaron la página les siguen mostrando la
versión vieja.

Este número es lo que hace que la caché de Firebase (un año para imágenes y
video, una semana para css y js) no se convierta en un problema.
