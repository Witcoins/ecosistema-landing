# /alianzas-educativas — guía para terminarla y publicarla

Página nueva para **asociaciones y redes de colegios** (México, Perú y el resto de
Latinoamérica). Es el destino de los correos de la campaña y tiene **un solo
objetivo: que pidan una reunión institucional.**

No se reconstruyó nada: es una vista más del mismo `index.html`, con la misma
marca, los mismos botones, campos y estilos, y el mismo sistema de rutas que
`/logbooks` o `/acp`.

## Qué ya está hecho (en este repositorio)

| Archivo | Qué tiene |
|---|---|
| `index.html` | Las dos secciones de la vista: `#alianzas-educativas` (todo el contenido, puntos 1 a 10 del brief) y `#alianzas-formulario` (formulario y pie de la campaña, puntos 11 y 12). Enlace nuevo en el pie general. |
| `css/alianzas.css` | Los estilos propios, todos con prefijo `.ali`. Reutiliza `.btn`, `.campo`, `.form-rejilla`, `.ciclo` y `.metricas` de `styles.css`. |
| `js/alianzas.js` | Envío del formulario a `/api/alianza`, captura de `utm_*`, y eventos de GA4. Los textos de confirmación y error están arriba del archivo. |
| `js/vistas.js` | La vista `alianzas-educativas` en `VISTAS`, `TITULOS` y `DESCRIPCIONES`. |
| `firebase.json` | La ruta en los **dos** rewrites de vistas, y el rewrite `/api/alianza → landingAlianza`. |
| `sitemap.xml`, `llms.txt` | La ruta nueva. |
| `herramientas/landingAlianza.referencia.js` | **Referencia** de la función de backend (no se despliega desde aquí). |

Los botones:

- **"Solicitar reunión institucional"** (arriba y en la franja final) bajan al formulario
  con `/alianzas-educativas#alianzas-formulario`. Ese enlace también sirve para los correos
  si se quiere caer directo en el formulario.
- **"Conocer i’Witown"** lleva a `/` (la landing principal).
- **"Solicitar una demostración institucional"** baja al formulario y deja marcada la
  opción "Organizar una demostración".
- **"Ver el ecosistema en funcionamiento"** lleva a `/ecosistema`.
- Debajo del formulario hay un **"Agendar directamente"** que abre el mismo calendario de
  Teams del resto de la página (`data-teams="calendario"`).

> No se agregó al menú de arriba a propósito: el menú ya está apretado (ver el commit de
> Logbooks) y esta página es de campaña, se llega por el enlace del correo. Si se quiere
> en el menú, es un `<a href="/alianzas-educativas">` en `#menu`.

## Lo que falta: la función `landingAlianza`

El formulario **no** usa `/api/contacto`, para que estos contactos no se mezclen con los
de familias y colegios. Hay que crear la función en **`witown-cloud-functions`**
(partiendo de `herramientas/landingAlianza.referencia.js` y reutilizando lo de
`landingContacto`: topes por IP, `ipDe`, plantilla de correo).

**Contrato:** `POST /api/alianza`, `application/x-www-form-urlencoded`.

| Campo | Obligatorio | Valores |
|---|---|---|
| `website` | — | trampa anti-spam: si trae algo, responder `ok` y no guardar |
| `nombre`, `cargo`, `organizacion` | sí | texto |
| `tipo_organizacion` | sí | `asociacion` · `red-federacion` · `directivos` · `grupo-educativo` · `otra` |
| `pais` | sí | `MX` · `PE` · `otro` |
| `pais_otro` | si `pais=otro` | texto |
| `correo` | sí | correo |
| `telefono` | sí | con código de país, mínimo 8 dígitos |
| `colegios` | sí | `1-20` · `21-50` · `51-100` · `100+` · `por-definir` |
| `interes` | sí, uno o más | **llega repetido**, uno por casilla: `conocer` · `demostracion` · `piloto` · `convenio` · `otra` |
| `mensaje` | no | texto, hasta 1000 |
| `autoriza` | sí | `si` |
| `origen` | — | siempre `alianzas-educativas` |
| `utm_source`, `utm_medium`, `utm_campaign` | — | los del enlace del correo, si venían |

**Respuesta:** `200 { "ok": true }` si se guardó; `422 { "ok": false, "mensaje": "..." }`
si falta algo (el `mensaje` se le muestra tal cual al visitante); `429 { "ok": false, "mensaje": "..." }` si se pasó del tope. Cualquier otra cosa
(404, 500, red) hace que la página muestre "escríbanos a contacto@iwitown.com o por
WhatsApp".

**Debe:** aplicar topes de envío (la referencia usa 20 por IP a la hora y 200 al día, en `LandingTopes`; si `landingContacto` ya tiene un helper, usar ese) —**sin topes no se puede desplegar**: el correo de confirmación va a la dirección que escriba cualquiera—, guardar en la colección `LandingAlianzas` con `estado: "nuevo"`, avisar a
`contacto@iwitown.com` y `witownnetwork@gmail.com`, y mandarle al visitante el correo de
confirmación (el texto está en la referencia).

**Orden de despliegue** (igual que el resto, ver `DESPLIEGUE.md`): **primero la función,
después el Hosting**. Si se publica el Hosting antes, el formulario responde 404.

```bash
# en witown-cloud-functions, desde main
firebase deploy --only functions:landingAlianza

# en este repositorio
firebase deploy --only hosting
```

Comprobar que la función está arriba, sin desplegar nada:

```bash
curl -s -X POST https://ecosistema-iwitown.web.app/api/alianza -d "x=1"
```

Un 404 = falta desplegar la función. Un 422 = está arriba y validando.

## Medición

| Qué | Cómo se mide |
|---|---|
| Visitas | GA4, solo, por la ruta `/alianzas-educativas` (no se manda nada a mano). |
| Clics en los botones | Evento `ali_cta_clic` con `boton` = `portada`, `final`, `demostracion`, `conocer`, `ecosistema` o `calendario`. |
| Formularios enviados | Evento `generate_lead` con `origen`, `pais`, `tipo_organizacion` y `colegios`. En GA4 marcarlo como **evento clave**. También queda cada uno en `LandingAlianzas`. |
| De qué correo vino | Los `utm_*` del enlace se guardan con el lead. Usar enlaces así: `https://www.ecosistema.iwitown.com/alianzas-educativas?utm_source=correo&utm_medium=email&utm_campaign=asociaciones-mx` (y `-pe` para Perú). |
| Reuniones efectivamente agendadas | No lo puede saber la página. Se lleva en el campo `estado` de `LandingAlianzas` (`nuevo → contactado → reunion-agendada → reunion-hecha → piloto / descartado`), actualizado por el equipo comercial. |

GA4 solo mide a quien aceptó cookies (`js/analitica.js`), así que los números de GA4
serán menores que los de Firestore: **la cifra de verdad de formularios es
`LandingAlianzas`**.

## Antes de publicar (lista del brief)

- [ ] La función `landingAlianza` está desplegada y el `curl` de arriba da 422.
- [ ] Se envió un formulario de prueba de verdad: llegó el aviso a las dos bandejas
      (revisar spam), le llegó la confirmación al visitante, y quedó el documento en
      `LandingAlianzas` con sus `intereses` y `utm_*`. Después, borrarlo.
- [ ] La política enlazada en la casilla de autorización (`politicas.iwitown.com`) es la
      vigente y cubre a titulares de **México y Perú**, no solo la Ley 1581 de Colombia.
      Si hace falta otra URL, se cambia en `index.html` (sección `#alianzas-formulario`).
- [ ] Se confirmó que lo que describe la página está operativo: los cuatro módulos,
      la A.C.P., los logbooks de las cuatro áreas, mensajes, agenda y asignaciones.
- [ ] Probada en teléfono: el formulario se apila en una columna y los botones ocupan el ancho.
- [ ] `generate_lead` marcado como evento clave en GA4.

## Algo que esta ruta no resuelve

Como todas las vistas, `/alianzas-educativas` sirve el mismo `index.html`. El título y la
descripción los pone el JavaScript, así que **la vista previa del enlace en WhatsApp, Gmail
o LinkedIn mostrará la del inicio**, no la de alianzas (ver la nota en `js/vistas.js`,
`ponerLosDatosDeLaVista`). Para los correos no importa (el enlace va en un botón), pero si
se va a compartir por WhatsApp habría que servir un html propio para esta ruta.
