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
  publica igual.

---

## 5. Cuando se cambie cualquier archivo

En `index.html` todos los archivos llevan `?v=` con un número al final:

```html
<link rel="stylesheet" href="css/styles.css?v=313">
```

El número vigente es **313**. Al cambiar un css, un js o una imagen hay que
**subirle el número a todos** (buscar `v=313` y reemplazar por `v=314`). Si no,
los navegadores de quienes ya visitaron la página les siguen mostrando la
versión vieja.

Este número es lo que hace que la caché de Firebase (un año para imágenes y
video, una semana para css y js) no se convierta en un problema.
