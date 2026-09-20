# Landing page i'Witown — Manual de montaje

Este paquete contiene una landing page completa, lista para subir a un hosting.
**No necesita Node, ni npm, ni compilar nada.** Son archivos planos: se suben y funcionan.

---

## 1. Qué hay en cada archivo

```
landing-iwitown/
├── index.html          La página completa. La estructura de todo está aquí.
├── css/
│   ├── styles.css        Estilos generales. Los colores están en las primeras 30 líneas.
│   ├── presentacion.css  Estilos del video, los subtítulos y la frase.
│   ├── simulador.css     Estilos del simulador del recorrido.
│   ├── actividades.css   Estilos de las pantallas de cada actividad.
│   └── apps.css          Estilos de las maquetas de las cuatro apps.
├── js/
│   ├── script.js         Menú, pestañas, animaciones y envío del formulario.
│   │                     El WhatsApp, el correo y el enlace de Teams,
│   │                     arriba del archivo.
│   ├── presentacion.js   El orden de la apertura y los subtítulos van aquí.
│   ├── ecosistema.js     La rueda y lo que dice cada una de las 4 apps.
│   ├── recorrido.js      El guion del recorrido narrado del simulador.
│   ├── witutor.js        Las 6 pantallas del recorrido de I'Witutor.
│   ├── simulador.js      Contenido y mecánica del simulador (los textos van aquí).
│   └── actividades.js    Contenido de las pantallas de cada actividad.
├── firebase.json        Que se publica, la cache y las rutas /api/ de los formularios.
└── assets/
    ├── img/              Logos e imágenes.
    ├── video/            Los videos de la presentación inicial.
    ├── audio/            Las grabaciones de voz, y el guion para grabarlas.
    └── fonts/            Aquí van las tipografías de la marca (opcional).
```

> **Sobre el simulador:** la primera pantalla de la página no es una imagen,
> es un simulador interactivo que reproduce la plataforma del docente.
> Todo su contenido (el tema, la docente, las 16 modalidades y sus recursos)
> está en `js/simulador.js`, no en el HTML. Ver la sección 7 de este documento.

---

## 2. Como se publica

El sitio va a **Firebase Hosting** (sitio `ecosistema-iwitown`, proyecto
`witcoins-network`). El procedimiento completo —que se publica, en que orden, los
bloqueantes y el checklist— esta en [`DESPLIEGUE.md`](DESPLIEGUE.md), que es la
fuente unica. Resumido:

```bash
firebase deploy --only hosting
```

> **Antes de publicar por primera vez, lee [`DESPLIEGUE.md`](DESPLIEGUE.md) §0.**
> Hay videos con datos de personas reales que se tienen que regrabar primero.

Los formularios **ya no son PHP**: Firebase Hosting no ejecuta PHP, asi que los
atiende una Cloud Function que vive en el repositorio `witown-cloud-functions`
(ver [`DESPLIEGUE.md`](DESPLIEGUE.md) §2). En este repositorio no hay
credenciales que llenar.

### Lo unico que se configura aca: el numero de WhatsApp

Abre `js/script.js`. En la línea 14 está esto:

```javascript
var WHATSAPP = "573000000000";   // <-- REEMPLAZAR
```

Cambia ese número por el real. **Sin el signo +, sin espacios y sin guiones.**
Para Colombia va con el 57 adelante:

| Número real      | Cómo se escribe aquí |
|------------------|----------------------|
| +57 300 123 4567 | `573001234567`       |
| +57 310 987 6543 | `573109876543`       |

Ese número alimenta los cuatro botones de WhatsApp de la página y el botón
flotante de la esquina. Se cambia en un solo lugar.

## 3. Los cambios que faltan (checklist)

Todo lo que hay que reemplazar está marcado en el código con la palabra
**REEMPLAZAR** dentro de un comentario. Búscala con Ctrl+F en cada archivo.

| # | Qué | Dónde |
|---|-----|-------|
| 1 | Número de WhatsApp | `js/script.js`, arriba |
| 2 | Correo, teléfono y ciudad de contacto | `index.html`:1278-1280, bloque CONTACTO: LAS MANERAS DE HABLAR |
| 3 | Logo de i'Witown | `assets/img/logo-iwitown.svg` |
| 4 | Ícono del navegador | `assets/img/favicon.svg` |
| 5 | Logo del Gimnasio Cordilleras | `assets/img/logo-cordilleras.svg` |
| 6 | Captura de Wiwi Quest | `assets/img/wiwiquest.svg` |
| 7 | Imagen para redes sociales | `assets/img/og-portada.jpg` (todavía no existe) |
| 7c | **Subtítulos del tramo del medio** | `js/presentacion.js` (ver sección 8) |
| 7f | **Capturas de I'Witutor con datos de ejemplo** | `assets/img/witutor/` (ver sección 8) |
| 7d | **Enlace de la reunión de Teams** | `TEAMS` en `js/script.js` **y** `ENLACE_TEAMS` en la Cloud Function |
| 7e | **Revisar los textos de las 4 maquetas** | `js/ecosistema.js`, lista `ECO_APPS` |
| 8 | Colores oficiales de i'Witown | `css/styles.css` líneas 15–27 |
| 9 | Colores oficiales de WiTeacher | `css/simulador.css` líneas 10–17 |
| 10 | Tipografías de marca | `assets/fonts/` + `css/styles.css` |
| 14 | **Las 17 grabaciones que faltan** | `assets/audio/` (la de I'Witutor ya está) |
| 14b | **Comprobar de oído las marcas de I'Witutor** | `js/witutor.js`, `WITUTOR_NARRACION` |

### Sobre el peso de las imágenes

Las imágenes de la landing van en el formato que menos pese sin que se note:

- **SVG** para logos e ilustraciones planas (pesan menos de 3 KB cada una).
- **WebP** para lo que sea una foto o un dibujo con degradados, como el robot.

Si más adelante hay que meter fotos (del colegio, de los niños, de la app),
conviene guardarlas en **WebP** y no en JPG ni PNG: pesan entre un 25% y un
80% menos y se ven igual. Todos los navegadores lo soportan desde 2020.

### Cómo cambiar los colores

En `css/styles.css`, desde la línea 15:

```css
:root {
  --morado-900: #2E1065;   /* fondos oscuros */
  --morado-800: #4C1D95;
  --morado-700: #5B21B6;   /* color principal de marca */
  --morado-600: #7C3AED;   /* botones y acentos */
  --morado-300: #C4B5FD;
  --morado-100: #EDE9FE;   /* fondos suaves */
  --morado-050: #F5F3FF;
}
```

Cambias esos siete valores y **toda la página cambia sola**.
No hay que buscar colores repartidos por el archivo.

### Cómo cambiar las imágenes

Las imágenes que vienen son `.svg` de relleno, dibujadas para que la página se
vea completa desde el primer momento. Cuando lleguen las reales:

1. Guarda la imagen real en `assets/img/` (sirve `.png`, `.jpg` o `.svg`).
2. En `index.html` cambia la extensión en el `src`.
   Por ejemplo `hero-app.svg` → `hero-app.png`.

### Cómo poner las tipografías de la marca

1. Consigue los archivos en formato `.woff2` y ponlos en `assets/fonts/`.
2. En `css/styles.css`, busca el bloque **FUENTES DE LA MARCA** y quítale
   los comentarios (borra el `/*` de arriba y el `*/` de abajo).
3. Ajusta los nombres de los archivos si son distintos.

Mientras eso no se haga, la página usa la fuente del sistema y se ve bien igual.

---

## 4. Problemas comunes

| Síntoma | Causa más probable | Solución |
|---|---|---|
| **Cambiaste un archivo y la página sigue igual** | El navegador guardó la versión vieja | Ver "Al actualizar archivos" aquí abajo |
| La página se ve sin estilos, texto plano | Se subió mal la estructura de carpetas | Verifica que exista `css/styles.css` al lado de `index.html` |
| Los botones de WhatsApp no abren nada | Falta cambiar el número, o tiene `+` o espacios | `js/script.js` línea 14, solo dígitos |
| El formulario dice que no pudo enviar | Las Cloud Functions no están desplegadas | Desplegarlas (`DESPLIEGUE.md` §2) y mirar `firebase functions:log` |
| El lead queda guardado pero no llega el correo | La extensión Trigger Email no lo despachó | Revisar la colección `mail` en Firestore y los registros de la extensión |
| Los acentos se ven como `Ã±` o `â€"` | El archivo se guardó en otra codificación | Guarda siempre en **UTF-8 sin BOM** |
| El logo del pie de página no se ve | El pie es oscuro y el logo también | Ya hay un filtro que lo vuelve blanco. Si tienes versión blanca del logo, úsala y borra la línea `filter:` en `.pie__logo` |

### Al actualizar archivos: subir la versión

Los navegadores guardan una copia de los CSS y los JS para que la página cargue
más rápido. Eso significa que si subes un archivo corregido, **el visitante que
ya entró puede seguir viendo el viejo durante días**.

Por eso los enlaces de `index.html` llevan un número de versión:

```html
<link rel="stylesheet" href="css/styles.css?v=304">
<script src="js/presentacion.js?v=304"></script>
```

**Cada vez que se cambie un CSS o un JS, hay que subirle ese número** a todos:
`?v=304` pasa a `?v=305`, y así. El número vigente está en `PENDIENTES.md` §5. Con eso el navegador entiende que es un archivo
distinto y lo vuelve a bajar. Es un buscar-y-reemplazar de diez segundos, y se
ahorra el clásico "a mí me sigue saliendo igual".

Si estás probando en tu propio computador y no quieres tocar el número, sirve
recargar con **Ctrl+F5** (o Cmd+Shift+R en Mac).

### Para revisar los leads

Los contactos quedan en Firestore, en la coleccion `LandingLeads`, y las
reuniones agendadas en `LandingReuniones`. Se ven desde la consola de Firebase
del proyecto `witcoins-network`, sin necesidad de ninguna herramienta aparte.

---

## 5. Datos personales — importante

El formulario incluye una casilla de autorización de tratamiento de datos,
como exige la **Ley 1581 de 2012** (Habeas Data) en Colombia. Esa casilla
es obligatoria: sin marcarla el formulario no envía, y la Cloud Function
también la valida del lado del servidor.

Esa casilla enlaza a la política publicada en
<https://www.politicasprivacidadwitcoins.com/>, y el pie enlaza además los
términos. Son páginas externas ya vigentes: no hay nada que crear en este
repositorio. Ver [`DESPLIEGUE.md`](DESPLIEGUE.md) §7.

---

## 6. Notas de la página

- Funciona en celular, tablet y computador. Está probada desde 320px de ancho.
- Tiene navegación por teclado y etiquetas de accesibilidad en las pestañas.
- Respeta la preferencia del sistema de "reducir movimiento": si el usuario la
  tiene activada, las animaciones no corren.
- No carga nada desde internet: ni fuentes externas, ni librerías, ni CDN.
  Por eso se ve igual en cualquier computador y no se rompe si un servicio de
  terceros se cae.
- El formulario tiene una trampa anti-spam invisible (el campo `website`).
  **No hay que borrarla** — es lo que frena a los robots sin molestar a las personas.

---

## 7. El simulador del recorrido

La primera pantalla de la página es un simulador interactivo. Reproduce la
plataforma del docente (WiTeacher) para que el visitante **vea** que la profesora
escoge cómo enseñar un tema, en vez de solo leerlo.

**Vista 1 — Modalidad.** El tema ya está definido por el colegio. El visitante
hace clic en cualquiera de las 15 modalidades y el simulador le muestra los
recursos que i'Witown entrega para esa forma de enseñar. Hay también un botón
de **recorrido narrado** que lo muestra todo solo, contándolo con voz: está
explicado más abajo, en "El recorrido narrado".

**Pantalla del estudiante (Wiwi Quest).** Al hacer clic en **Afianzamiento**,
en vez de la lista de recursos se abre la pantalla tal como la ve el niño:
la barra negra con su nombre y su saldo, el robot flotando, la pregunta, las
cuatro opciones, el reloj corriendo y la barra de herramientas de la derecha.
**Aviso para quien esté trabajando en la landing:** si algún video tiene los
subtítulos de relleno, o si su guion no cabe en su duración, sale un aviso en
la **consola del navegador** (tecla F12). Antes era una franja amarilla en la
página; se quitó para no ensuciar la vista del visitante.

**La pantalla se explica sola.** Apenas se abre arranca un recorrido automático:

1. La pregunta se enciende en **verde neón** — es lo primero que el ojo busca.
2. El recorrido escoge a propósito una respuesta **equivocada**, que se pinta
   de **rosado neón**.
3. Después escoge la **correcta**, que se pinta de **verde neón**.
4. Sale el **modal de retroalimentación**, rotulado *Ratificación* — el tercer
   paso del ciclo de la A.C.P. — explicando por qué esa es la buena y por qué
   la otra no.

Si el visitante se adelanta y responde él mismo, el recorrido se detiene y
manda él: se le marca su respuesta y le sale igual la retroalimentación.
El botón **"Volver al selector para escoger otra"** —con borde morado neón para
que no pase desapercibido— regresa a la pantalla de la docente.

### Cómo cambiar el ritmo del recorrido

En `js/simulador.js` está esto, dentro de la parte de la pantalla del estudiante:

```javascript
var DEMO_TIEMPOS = {
  enciendePregunta:  700,   // cuándo se enciende la pregunta
  escogeErrada:     2600,   // cuándo escoge la equivocada
  escogeCorrecta:   4800,   // cuándo escoge la correcta
  muestraModal:     6300    // cuándo sale la retroalimentación
};
```

Son milisegundos contados desde que se abre la pantalla (1000 = 1 segundo).
Si se siente lento o apurado, se cambian esos cuatro números.

Los colores neón están en `css/simulador.css`, arriba:
`--wq-verde-neon`, `--wq-rosa-neon` y `--wq-morado-neon`.

> **El robot** es el oficial de la plataforma, el mismo de
> `wiwiquest-app/src/assets/robot_wiwiquest.svg`. Aquí va como
> `assets/img/robot_wiwiquest.webp` porque el SVG original pesa 716 KB
> (lleva dos imágenes incrustadas adentro) y en WebP pesa 28 KB viéndose
> igual. El tamaño y el movimiento de flotar los pone el CSS
> (`.wq__robot-img` en `css/simulador.css`).
>
> Si en la app cambian el robot, hay que volver a convertirlo — no sirve
> pegar el SVG tal cual, porque son 716 KB para una imagen que se muestra
> a 150 píxeles.

### Cómo cambiar el contenido del simulador

Todo está en `js/simulador.js`, en la parte de arriba del archivo. No hay que
tocar el HTML.

```javascript
var SIM_TEMA = {
  asignatura: "Matemáticas",
  grado: "4.º de primaria",
  tema: "Fracciones equivalentes",
  periodo: "Periodo 2"
};

var SIM_DOCENTE = {
  nombre: "Diana Carolina Bustamante Miranda",
  colegio: "Colegio Santa María"
};
```

Más abajo está la lista `MODALIDADES`. Cada una se ve así:

```javascript
{
  id: "juego",
  nombre: "Juego",
  icono: '...',                       // el dibujo, en SVG
  recursos: [
    "Dominó de fracciones equivalentes",
    "Carrera de parejas equivalentes por equipos",
    "Bingo de fracciones para todo el salón"
  ]
}
```

Para cambiar los recursos de prueba por los reales, se editan los textos de
`recursos`. Se pueden poner más de tres. Para agregar una modalidad nueva,
se copia un bloque completo y se cambian `id`, `nombre` y `recursos`.

### El catálogo de actividades interactivas

La modalidad **Actividades interactivas** no muestra una lista de recursos:
abre el catálogo de las 20 actividades de la plataforma, con su ícono, su
color y su nombre.

Está en `js/simulador.js`, dentro de esa modalidad, en la lista `actividades`:

```javascript
{ nombre: "Sopa de Letras", color: "verde",
  descripcion: "Encuentra las palabras escondidas en la cuadrícula.",
  icono: '...' },
{ nombre: "Mapa Interactivo", color: "azul",
  descripcion: "Ubica cada nombre en el punto correcto de la imagen.",
  icono: '...' },
```

- `color` puede ser `verde`, `azul`, `morado`, `naranja` o `rojo`.
  Los cinco están definidos en `css/simulador.css`, bloque **ACTIVIDADES**.
- `descripcion` **no se ve en pantalla**: sale al pasar el mouse por encima.
  Con 20 tarjetas en cuatro filas no hay alto para mostrarla sin que la
  última fila quede cortada.

Para agregar o quitar actividades se edita esa lista; la cuadrícula y el
conteo del encabezado se ajustan solos.

### Al tocar una actividad se abre su pantalla

Cada tarjeta del catálogo es cliqueable y abre la actividad con el marco de
la plataforma: barra verde arriba con el nombre, el tema y los contadores
(reloj, aciertos, ayuda y cerrar), el tablero debajo, y al pie los botones
del docente —*Adjuntar a la tarea*, *Corregir a mano*, *Generar otra versión*—
más el botón para volver al catálogo.

Todo el contenido está en `js/actividades.js`:

| Actividad | Qué se ve |
|---|---|
| **Sopa de Letras** | Cuadrícula de 12×12 con las 8 palabras **puestas de verdad** dentro (en horizontal, vertical y diagonal) y el resto relleno al azar. Las palabras están en `ACT_PALABRAS`. |
| **Crucigrama** | Rejilla con las casillas y su numeración, y las pistas separadas en horizontales y verticales. Se define en `ACT_CRUCIGRAMA` diciendo fila, columna, largo y pista de cada palabra; la numeración se calcula sola. |
| **Wiwi Jumps** | Tablero espacial con la pregunta, los cuatro planetas y la ruta de la Base a la Torre. Está en `ACT_JUMPS`. |
| **Las otras 17** | Usan una de tres plantillas —**pregunta**, **parejas** u **ordenar**— con el mismo marco. Cuál usa cada una se decide en `ACT_PLANTILLAS`, y el contenido está en `ACT_GENERICAS`. |

Cualquiera de esas 17 se puede convertir en tablero propio más adelante: se
copia la forma de las tres que ya lo tienen.

> **El tema de los ejemplos es Fracciones equivalentes**, el mismo que la
> docente está preparando en el simulador, para que todo cuente la misma
> historia. Si se cambia el tema en `SIM_TEMA` hay que cambiar también las
> palabras y las pistas de `js/actividades.js`, porque no se generan solas.

### Cómo darle pantalla de estudiante a otra modalidad

Hoy solo **Afianzamiento** abre la pantalla de Wiwi Quest. Lo que la activa es
el campo `wiwiQuest` dentro de esa modalidad:

```javascript
wiwiQuest: {
  modo: "Refuerzo - Ganar examen",
  tema: "Fraccionarios",
  subtema: "Fracciones equivalentes",
  principio: "Rigor Conceptual",
  pregunta: "Dos fracciones equivalentes son aquellas que:",
  puntos: "$200",
  totalPreguntas: 6,
  segundosTotales: 126,
  segundosRestantes: 114,
  opciones: [
    { letra: "a", texto: "...", correcta: true },
    { letra: "b", texto: "...", correcta: false }
  ],
  retroalimentacion: {
    erradaDemo: "b",              // cuál escoge mal el recorrido, a propósito
    titulo: "¡Eso es!",           // si acierta
    tituloFallo: "Casi. Mira por qué:",
    texto: "...",                 // por qué la correcta es la correcta
    porQue: "...",                // por qué la otra no sirve
    puntos: "+200"
  }
}
```

Para que otra modalidad también abra su pantalla, se copia ese bloque completo
dentro de ella y se cambian los textos. Solo una opción debe llevar
`correcta: true`. Si una modalidad **no** tiene `wiwiQuest`, al hacerle clic
sigue mostrando su lista de recursos, como antes.

Los datos del niño que aparece en la barra negra están más arriba, en
`SIM_ESTUDIANTE`.

> **Importante:** los recursos que están ahí ahora son **datos de prueba**,
> escritos para que el simulador se vea completo. Hay que reemplazarlos por
> los recursos reales de la plataforma antes de publicar.

### El recorrido narrado

El botón **"Ver el recorrido narrado"**, abajo del simulador, hace que la
pantalla se maneje sola durante minuto y medio: abre modalidades, entra a las
actividades y va contando lo que muestra, con subtítulo abajo y con voz.

El guion está en **`js/recorrido.js`**, en la lista `RECORRIDO`. Cada paso
tiene dos cosas:

```javascript
{ hacer: ["actividad", ACTIVIDADES, "Crucigrama"],
  texto: "Un crucigrama, armado con sus propias definiciones." },
```

- **`texto`** es lo que se lee abajo y se dice en voz alta.
- **`hacer`** es qué se abre en la pantalla mientras tanto.

Para cambiar lo que dice, se edita el texto y ya. Para cambiar el orden, se
mueven los bloques de sitio.

**Lo que puede ir en `hacer`:**

| Orden | Qué abre |
|---|---|
| `["modalidades"]` | La cuadrícula de las 16 |
| `["modalidad", "taller"]` | Esa modalidad |
| `["estudiante", "afianzamiento"]` | La pantalla del estudiante |
| `["catalogo", ACTIVIDADES]` | El catálogo de las 20 actividades |
| `["actividad", ACTIVIDADES, "Sopa de Letras"]` | Esa actividad |
| `null` | No cambia la pantalla, solo sigue hablando |

Los nombres de las modalidades y de las actividades están en
`js/simulador.js`. Deben escribirse igual.

**Cuánto dura cada paso.** Por defecto se calcula solo, según el largo del
texto y a ritmo de lectura tranquila —entre 2,8 y 9 segundos—. Si un paso
necesita otro tiempo, se le pone `segundos: 5` y manda ese.

Con el sonido activado, además, el paso espera a que la voz termine de hablar:
así el subtítulo nunca desaparece antes de tiempo ni se queda pegado después.

**El visitante manda.** En cuanto toca cualquier cosa —una modalidad, una
actividad, el botón de volver— el recorrido se detiene solo y lo deja
explorar. No hay que pararlo a mano.

### ⚠ Dos cosas que conviene saber

**El simulador no sabe nada del guion, y el guion no sabe nada del simulador.**
`js/recorrido.js` solo pide *"muéstrame las modalidades"*, *"abre esta
actividad"*. Todo lo que puede pedir está en una lista corta al final de
`js/simulador.js` (`window.simuladorGuia`), y nada más. Si mañana el simulador
cambia por dentro, el guion sigue sirviendo igual.

**La voz es la misma de la frase de la apertura.** Se la presta
`js/presentacion.js`, así que respeta lo mismo: habla con voz de hombre, y se
calla si el visitante silenció el video. Vale lo dicho en la sección 8 sobre
grabar el audio de verdad.

### Sobre los pasos del recorrido

Arriba del archivo está esto:

```javascript
var SIM_PASO = { actual: 1, total: 4 };
```

Eso es lo que pinta el rótulo "Paso 1 de 4". **Falta construir las vistas 2, 3 y 4.**
El botón "Continuar" todavía no lleva a la vista siguiente: por ahora baja a la
sección que sigue de la página. En `js/simulador.js`, al final, hay un comentario
que marca el lugar exacto donde se conecta la Vista 2 cuando exista.

---

## 8. La apertura: videos, frase y los tres caminos

Todo esto pasa **dentro del mismo contenedor**, uno detrás de otro, como una
sola secuencia. No son secciones distintas: es un solo marco que va cambiando.

**Hay un solo marco, y no cambia de tamaño nunca.** Los cuatro pasos viven
adentro y se van turnando: no se apilan, no empujan la página, no crecen ni
encogen el recuadro. Lo que no quepa —la app es más alta— se desplaza por
dentro del marco.

El tamaño del marco se cambia en `css/presentacion.css`:

```css
.escenario {
  aspect-ratio: 16 / 11;   /* mismo ancho, más alto que el video */
}
```

El ancho lo fija `max-width: 880px`. La proporción solo cambia el **alto**:
con `16 / 13` queda más alto todavía, con `16 / 9` queda del alto exacto del
video.

Como el marco es más alto que el video, el video se recorta un poco a los
lados para llenarlo (`object-fit: cover`). La presentadora va centrada, así
que ella nunca se pierde. Si prefieres verlo completo con franjas negras
arriba y abajo, cambia esa línea por `object-fit: contain`.

**El contenido se estira para llenar el marco**: la fila de controles arriba,
el pie abajo y la ventana ocupando todo lo que sobra en el medio. Así no queda
una franja vacía debajo cuando el marco es más alto que la ventana.

**Todas las pantallas caben dentro del marco sin barra de desplazamiento.**
Para lograrlo, cuando el simulador va dentro del marco se le aplica un *modo
compacto*: iconos y letras más pequeños, menos espacios, y la cuadrícula de
modalidades en 8 columnas en vez de 6. Está al final de `css/simulador.css`,
todo bajo `.pres__app`, y **no afecta al simulador fuera del marco**.

Dos cosas se reacomodaron para que cupieran:

- **La lista de recursos reemplaza a la cuadrícula** en vez de aparecer debajo.
  Trae su botón **"← Volver a las modalidades"**, en magenta y arriba a la izquierda. Ese botón aparece igual en las tres pantallas —lista de recursos, catálogo de actividades y pantalla del estudiante— y siempre devuelve a la cuadrícula.
- **Los controles van arriba, en un solo renglón**: el paso, la instrucción y
  el botón de ver la presentación otra vez.

**El corte está en 720 px de ancho.** Por encima de eso —computadores y
portátiles— el marco es fijo. Por debajo —teléfonos— se adapta. Si alguien sube
ese número, las ventanas de portátil de 800 a 980 px pierden el marco fijo y la
página pega un brinco al pasar de una pantalla a otra. Está anotado en el CSS.

El marco también tiene un `min-height: 580px`, para que en ventanas de
computador angostas no quede tan bajo que el simulador no quepa.

> **En teléfono el marco no es fijo.** Tendría que caber un simulador completo
> en 250 píxeles de alto, y sería inservible. Ahí el marco se adapta a cada
> pantalla — pero sigue sin haber barra de desplazamiento, que es lo que
> importa: todo se ve completo. En computador el marco sí es fijo.

| Paso | Qué se ve | Cuánto dura |
|---|---|---|
| 1 | **Video 1** (`presentacion-apertura.mp4`) — la presentadora, el salón y los colegios | 30 s |
| 2 | **La frase** *"En cambio, esto debería ser así."*, y una voz la dice en alto | 4 s |
| 3 | **Video 2** (`presentacion-3.mp4`) — WiTeacher y Wiwi Quest, entra solo al terminar la frase | 10 s |
| 4 | **Las tres tarjetas** — de aquí en adelante manda el visitante | no se va sola |

Del paso 1 al 4 nadie tiene que hacer clic: la secuencia corre sola. En las
tarjetas se detiene, y ahí el visitante escoge por dónde sigue.

**La página nunca se mueve sola.** Al cambiar de una pantalla a otra, la barra
de desplazamiento se queda donde el visitante la dejó. Si alguien agrega un
`scrollIntoView` al cambiar de paso, vuelve el salto: no hace falta, porque
todas las pantallas están dentro del mismo marco fijo.

Los controles (el rótulo del paso, la instrucción y los botones) van **debajo**
de cada ventana, no encima, para que lo primero que se vea sea la pantalla.

En el paso de la app hay un botón **"↺ Ver la presentación otra vez"** que
vuelve al comienzo de la secuencia.

La idea es que el visitante entre sabiendo cuál es el problema, y que cuando
llegue a la app ya entienda qué está mirando.

### Cambiar el orden de la apertura

**Todo el orden está en una sola lista**, arriba de `js/presentacion.js`, y se
llama `PRES_SECUENCIA`. Para mover una frase, agregar un video o quitar un paso
se edita esa lista y ya: no hay que tocar nada más.

Hay tres clases de paso:

| `tipo` | Qué es |
|---|---|
| `"video"` | Un video con sus subtítulos |
| `"frase"` | Una frase a pantalla completa |
| `"app"` | El simulador — **siempre va de último** |

```javascript
var PRES_SECUENCIA = [
  { tipo: "video", archivo: "assets/video/presentacion-apertura.mp4", fin: 29.7,
    pendiente: true, lineas: [ ... ] },

  { tipo: "frase", arriba: "", grande: "En cambio, esto debería ser así.",
    segundos: 4, voz: "hombre", vozArchivo: "", vozTexto: "" },

  { tipo: "video", archivo: "assets/video/presentacion-3.mp4", fin: 10.0,
    pendiente: false, lineas: [ ... ] },

  { tipo: "app" }
];
```

Para cambiar el orden se mueven los bloques de sitio. Para agregar un paso se
copia un bloque completo y se le cambian los datos.

**Qué hace cada campo de una frase:**

| Campo | Para qué sirve |
|---|---|
| `arriba` | Renglón pequeño encima de la frase. Si se deja vacío, no sale. |
| `grande` | La frase, en letra grande. |
| `segundos` | Cuánto se queda antes de pasar al siguiente paso. |
| `voz` | `"hombre"`, `"mujer"` o vacío (ver abajo). |
| `vozArchivo` | Grabación que dice la frase (ver abajo). |
| `vozTexto` | Vacío = dice lo mismo que `grande`. |

### Los pasos guardados

El primer video de la versión anterior (`presentacion-1.mp4`) **salió de la
secuencia, pero el archivo sigue en la carpeta** por si más adelante se quiere
usar. Junto con la frase *"Presenta tus propios contenidos"*, quedó anotado en
un comentario debajo de `PRES_SECUENCIA`, con sus subtítulos completos: para
volver a usar cualquiera de los dos, se copia su bloque dentro de la lista, en
la posición que se quiera.

### Las tres tarjetas del final

Cuando termina el video de la profesora aparecen tres tarjetas. Cada una lleva
a una pantalla distinta, **dentro del mismo marco**, y de todas se puede volver
a las tarjetas con el botón **"← Volver"**.

| Tarjeta | A dónde lleva |
|---|---|
| Interactuar con la app web | La rueda del ecosistema, y de ahí a cada app |
| Interactuar con las actividades | El simulador: modalidades y actividades |
| Contactar para recibir visita | Los tres botones de contacto |

El botón **"↺ Ver la presentación otra vez"** vive en esta pantalla, y vuelve
al primer video.

### El botón "Presentación", al lado del marco

Hay un segundo atajo para volver a ver la presentación, y este va **por fuera
del marco**, pegado a su borde derecho.

**Solo aparece cuando la presentación ya terminó** —de las tarjetas en
adelante— y se queda ahí mientras el visitante explora. Mientras corren los
videos y la frase no sale: la presentación ya se está viendo.

En pantallas donde no cabe al lado (por debajo de 1230 px de ancho) **se pasa
debajo del marco, centrado**. Si no se hiciera, se saldría de la pantalla y
aparecería barra horizontal.

Quién lo muestra y lo esconde es `js/presentacion.js`, en la lista `CON_ATAJO`.
Para que salga en otra pantalla se agrega ahí. Antes estaba también dentro del simulador, pero ahí la fila de
arriba quedaba con cuatro cosas y se atropellaban: la instrucción se cortaba.
Ahora desde el simulador se sale con "← Volver" y el botón queda a un clic.

### Las ilustraciones de las tarjetas

**Cada tarjeta es una sola ilustración.** La foto, el marco de neón, las
esquinas mordidas y las rayitas del pie vienen dibujadas en el archivo. Lo
único que pone el código encima es el texto, que cae sobre la franja lisa que
la ilustración deja libre abajo a propósito.

| Archivo | Tarjeta | Pesa |
|---|---|---|
| `tarjeta-app-web.webp` | Interactuar con la app web (azul) | 115 KB |
| `tarjeta-actividades.webp` | Interactuar con las actividades (morada) | 75 KB |
| `tarjeta-contacto.webp` | Contactar para recibir visita (verde) | 102 KB |

Venían en PNG y pesaban 5,6 MB entre las tres. Quedaron en 292 KB.

Dos cosas hubo que arreglarles antes de usarlas:

- **La morada venía sin transparencia**, con un fondo blanco sólido que sobre
  la página se veía como un recuadro. Se le quitó por contagio desde los
  bordes, no por color a secas: si hubiera sido por color, los blancos de
  adentro —los papeles, la camisa, el cuaderno— también habrían desaparecido.
- **Las tres traían el cuerpo de distinto tamaño** dentro de su lienzo, así que
  las tarjetas salían desparejas. Se midió el cuerpo de cada una y se llevó al
  mismo recuadro, con el mismo aire alrededor para el resplandor. La azul era
  un 4,5% más ancha de la cuenta y se ajustó; las otras dos se estiraron un 3%.
  Son diferencias que no se notan a simple vista, y a cambio las tres quedan
  exactamente del mismo tamaño.

### Cómo reemplazar una ilustración

Se pone el archivo nuevo en `assets/img/` con el mismo nombre. Debe cumplir
tres cosas:

1. **Fondo transparente.** El fondo de esa pantalla es blanco; si la imagen
   trae fondo propio, se ve el recuadro.
2. **Dejar libre la parte de abajo.** Ahí va el texto, sobre un color liso.
   Hoy la franja empieza entre el 55 % y el 58,5 % del alto según la tarjeta,
   y el texto arranca en el 63 % para caer siempre dentro de la franja, sea
   cual sea la de las tres.
3. **La misma proporción que las otras dos.** Las tres imágenes están
   igualadas a 1180 × 1250, con el cuerpo de la tarjeta en el mismo sitio, para
   que midan lo mismo y sus franjas de texto queden a la misma altura. Esa
   proporción está escrita en `css/presentacion.css`, en
   `.menu .tarjeta { aspect-ratio }`. Si la nueva imagen tiene otra, o se
   ajusta ese número o la tarjeta recorta o deja aire.

Si las tres cambian de proporción a la vez, basta con cambiar el
`aspect-ratio` una sola vez.

### ⚠ Ojo con el nombre "tarjeta"

La clase `.tarjeta` la usan **dos** partes distintas de la página: estas tres
tarjetas y las de la sección "Miremos esto de frente". Por eso todas las
reglas de estas van acotadas con `.menu` adelante, en `css/presentacion.css`.
Si alguien le quita ese `.menu` a una regla, se la monta a las otras tarjetas
y les impone esta proporción y este fondo.

### La rueda del ecosistema y las cuatro apps

Es la pantalla de la primera tarjeta: los cuatro módulos en una rueda. **Al
hacer clic en uno se entra a la pantalla de esa app**, dentro del mismo marco.
El centro también se puede pinchar, y lleva a I'Witown.

| Módulo | Lleva a |
|---|---|
| I'Witown (arriba, morado) | La app del estudiante |
| I'Witutor (derecha, naranja) | Un recorrido por la app de los papás |
| I'Witeacher (abajo, azul) | La app de la profesora |
| AdmonWitown (izquierda, verde) | La app de quien dirige el colegio |

**La rueda va sobre fondo blanco y se ve en volumen.** Ese volumen no es una
imagen: está hecho con tres capas por cada gajo, y todas viven dentro del
`<svg>` de `index.html`.

| Capa | Qué hace |
|---|---|
| El degradado del relleno | Va de claro arriba-izquierda a oscuro abajo-derecha |
| El brillo de encima | Blanco que se desvanece, como la luz sobre algo abombado |
| La sombra de debajo | Un filtro SVG (`eco-sombra`), que despega el gajo del fondo |

Los cuatro degradados usan **las mismas coordenadas**, para que la luz venga
toda del mismo lado. Si se cambia el color de un módulo hay que cambiar sus
tres paradas de color (clara, media y oscura) en el bloque `<defs>` del SVG, no
solo la variable `--eco-morado` y sus tres hermanas: esas ahora solo pintan los
arquitos de afuera.

El disco blanco del centro lleva su propio degradado y su propia sombra, más
suave.

### I'Witutor va aparte: es un recorrido, no una maqueta

Los otros tres módulos muestran una maqueta hecha con código. **I'Witutor no:**
muestra seis capturas de la app de verdad, pasando solas dentro de una tablet,
cada una con su frase.

| Se ve | Dice |
|---|---|
| Agenda | Mensajes del colegio, en tiempo real. |
| Tareas | Revisa sus tareas, estés donde estés. |
| Informes | Conoce sus habilidades cognitivas al instante. |
| Teachers | Conoce a sus profes y su perfil. |
| Lectura | Fortalece su lectura y comprensión. |
| Pagos | Controla tus pagos al colegio. |

### Cómo suena este recorrido

Hay **dos maneras**, y la página escoge sola:

**1. Con una narración seguida (lo que hay hoy).** Un solo archivo de audio
para todo el recorrido —`assets/audio/witutor/narracion.mp3`, de 1 minuto
50— y las imágenes cambiando en los segundos que diga `marcas`, en
`js/witutor.js`:

```javascript
var WITUTOR_NARRACION = {
  archivo: "assets/audio/witutor/narracion.mp3",
  /*        Agenda  Tareas  Informes  Teachers  Lectura  Pagos  */
  marcas: [    0,    37.4,    47.0,     58.2,     66.4,   83.2  ]
};
```

Aquí **manda el audio**: las imágenes lo siguen a él, no al revés. Los puntos
de abajo saltan el audio a esa marca, para que lo que se oye siga yendo con lo
que se ve. Al acabarse vuelve a empezar.

**2. Con una grabación por pantalla, o con la voz del computador.** Si no hay
narración —o si el archivo falta, o el navegador no la deja sonar— cada
pantalla usa su propio `audio`, y si tampoco lo hay, la dice la voz sintética.
Ahí sí manda el tiempo: **4,2 segundos por pantalla como mínimo**, y si la voz
se demora más, la imagen la espera.

> **La narración solo arranca si el visitante tiene el sonido activado.** Si lo
> silenció, el recorrido pasa solo, en silencio, con los tiempos fijos.

### El fondo musical

Debajo de la voz suena un colchón muy suave, en los dos recorridos narrados:
el de I'Witutor y el del simulador. Entra y sale de a poquitos, se repite solo
y se calla cuando el recorrido termina o cuando el visitante pone el mouse
encima para mirar con calma.

**Para subirlo, bajarlo o quitarlo** hay un solo número, en
`js/presentacion.js`:

```javascript
var AMBIENTE_VOL = 0.22;     // de 0 a 1. Con 0 se quita del todo.
```

Con 0,22 se oye el fondo sin tapar la voz. Por encima de 0,35 empieza a
estorbar.

**La música es generada, no es de nadie.** Está hecha con tonos, así que no
tiene derechos de autor ni hay que pagar licencia. Son cuatro acordes —do, fa,
la menor, sol— de dos minutos, y al repetirse el último cae en el primero, que
es el remate natural: por eso el bucle no se siente como un corte.

**Por qué se entiende la voz encima.** Todas las notas están por debajo de
270 Hz. La voz humana vive entre 300 y 3000 Hz, así que las dos cosas caben sin
pisarse. No es que esté bajita nada más: es que ocupa otro sitio.

Si algún día se consigue una música de verdad, se reemplaza
`assets/audio/ambiente.mp3` y listo.

### ⚠ Las marcas hay que comprobarlas de oído

Los seis números salieron de **medir las pausas del audio**, no de escucharlo:
se buscaron las cinco pausas más largas —de 1,0 a 1,7 segundos— y ahí se
partió. Encaja con que sean seis secciones, pero **nadie ha comprobado que lo
que se oye en cada tramo corresponda con la imagen que se muestra**.

Hay que oírlo una vez de corrido. Si alguna imagen no va con lo que se está
diciendo, se corre su número en `marcas` y listo: no hay que tocar el audio ni
nada más.

Para afinarlos: abre la página con la consola del navegador (tecla **F12**) y
mira el segundo que va sonando cuando empieza cada tema.

Con el mouse encima se detiene, para poder mirar con calma; al quitarlo sigue,
pero no repite la frase —repetirla cada vez que el mouse pasa por encima sería
insoportable—. Los puntos de abajo sirven para saltar a una pantalla, y esa sí
se dice desde el principio.

> Como en toda la página, **solo habla si el visitante tiene el sonido
> activado**. Si silenció el video de la apertura, el recorrido se ve pero no
> se oye.

Todo está en **`js/witutor.js`**: las frases, el orden y los segundos. Para
cambiar un texto se edita y ya.

### Las seis capturas

Están en **`assets/img/witutor/`**:

| Archivo | Qué muestra | Pesa |
|---|---|---|
| `agenda.webp` | Los mensajes del colegio | 20 KB |
| `tareas.webp` | Las tareas de la semana | 27 KB |
| `informes.webp` | El progreso y las asignaturas flojas | 48 KB |
| `teachers.webp` | La lista de docentes | 33 KB |
| `lectura.webp` | El tablero de lectura | 41 KB |
| `pagos.webp` | El estado de pagos | 29 KB |

Venían en PNG y pesaban 795 KB entre las seis. En WebP quedaron en **197 KB**.

**Para cambiar una captura** se reemplaza el archivo, con el mismo nombre.
Mientras un archivo no esté, esa pantalla muestra un recuadro rayado con el
nombre de la sección: no se ve rota ni queda un hueco blanco.

**Sobre la forma de las capturas.** La pantalla de la tablet está calculada
para una proporción de **2,25** (ancho ÷ alto), que es la mediana de las seis
que hay: van de 2,217 a 2,302, o sea casi iguales, y con ese número ninguna
pierde más del 2% por el recorte. Si un día se reemplazan por capturas de otra
forma —de celular, por ejemplo— se cambia `--wt-forma` en `css/apps.css`, en el
bloque `.wt`, y todo lo demás se acomoda solo.

### ⚠ Los datos que se ven en las capturas

Son pantallas de una familia real. Se alcanzan a leer el nombre del acudiente y
de la estudiante, los nombres de las seis docentes, el porcentaje de aciertos y
el estado de los pagos.

**Antes de publicar la página conviene reemplazarlas por capturas con datos de
ejemplo**, como se hizo con las maquetas de las otras tres apps. A la
resolución en que se ven —dentro de una tablet de unos 650 píxeles— el texto
pequeño no se lee, pero los nombres de arriba y los de la lista de docentes sí.

### ⚠ Las cuatro apps son maquetas

Lo que se ve al entrar **está copiado de las pantallas reales de i'Witown, pero
no está conectado a nada**. Los nombres, las cifras, las notificaciones y las
frases del pie son de ejemplo. Sirven para que el rector o el papá vean cómo se
ve por dentro, no para usarlas.

Todo lo que dicen se cambia en `js/ecosistema.js`, en la lista `ECO_APPS`.
Cada app tiene su bloque:

```javascript
teacher: {
  tipo:  "panel",                 // "panel" o "estudiante"
  tema:  "witeacher",             // el juego de colores (ver css/apps.css)
  marca: "WITEACHER",
  usuario: "Diana Carolina Bustamante Miranda",
  colegio: "Colegio Santa María",
  saludo:  "Good Morning Diana Carolina Bustamante Miranda",
  subsaludo: "No tienes notificaciones pendientes",
  tarjetas: [ { nombre: "Estudiantes", emoji: "…" }, … ],
  boton: "Ingresa a tu Comunidad",
  frase: "…"                      // lo que dice la franja de abajo
}
```

Hay dos formas de pantalla:

- **`"estudiante"`** — solo la usa I'Witown. Es la de los tres módulos
  (WiwiQuest, WORK, WiPLAN), los accesos, la cuenta y el paisaje del pie.
- **`"panel"`** — la usan las otras tres. Es la del saludo, las tres tarjetas
  y el botón.

**Los colores de cada app** están en `css/apps.css`, arriba, en cuatro bloques
cortos (`--ap-barra`, `--ap-acento`, `--ap-riel`). Son cuatro líneas por app.

> **Los iconos de las tarjetas son emoji.** No son archivos: son caracteres,
> así que no pesan nada y se ven en cualquier computador. Eso sí, **cada
> sistema los dibuja a su manera**: en Windows se ven como los de la app real,
> en Mac y en Android cambian un poco. Si alguno se ve partido en dos, es que
> ese sistema no conoce esa combinación: se cambia por uno más común.

### El pie de la rueda

Debajo de la rueda hay un renglón que dice de quién es cada módulo cuando el
visitante pasa por encima. Los textos están en `ECO_PIE`, en el mismo archivo.

### La pantalla de contacto

Es la pantalla de la tercera tarjeta: tres botones, uno por canal.

| Botón | De dónde saca el enlace |
|---|---|
| Reunión virtual (Teams) | `TEAMS` en `js/script.js` |
| WhatsApp | `WHATSAPP` en `js/script.js` |
| Correo | `CORREO` en `js/script.js` |

**`TEAMS` está vacío.** Mientras lo esté, ese botón sale apagado y no se puede
pinchar: es preferible a que alguien haga clic y no pase nada. Sirve cualquier
enlace donde la persona agende: Microsoft Bookings, un calendario de citas o
una reunión fija de Teams.

### La voz que dice la frase

La frase no solo se lee: **se dice en voz alta**. Hay dos maneras, y conviene
la primera:

**1. Con una grabación (lo recomendable).** Se graba la frase con una voz de
verdad, se guarda el archivo en `assets/audio/` y se pone su ruta:

```javascript
vozArchivo: "assets/audio/frase-en-cambio.mp3",
```

Suena natural. Es un archivo de dos segundos.

**2. Con la voz del navegador (lo que hay ahora).** Si `vozArchivo` queda
vacío, la frase la lee el sintetizador de voz del computador, en español.
No necesita grabación, pero **suena robótica**. Sirve para salir del paso,
no para la versión final.

### Voz de hombre o de mujer

El campo `voz` del paso de la frase decide de quién es esa voz sintética:

```javascript
voz: "hombre",     // "hombre", "mujer", o vacío para la que haya
```

**Hoy está en `"hombre"`.**

Cómo funciona, porque tiene truco: **los navegadores no dicen si una voz es
masculina o femenina**. Solo dan su nombre. Así que la página las reconoce por
ahí, con una lista de nombres que está en `js/presentacion.js`
(`VOCES_HOMBRE` y `VOCES_MUJER`). Cubre las que traen Windows, Mac, Android y
los iPhone.

En Windows, por ejemplo, las voces en español son **Helena**, **Laura** y
**Pablo**: las dos primeras de mujer, la última de hombre. Con `voz: "hombre"`
la página escoge a Pablo; antes tomaba la primera de la lista, que era Helena.

Si en algún computador aparece una voz que no está en la lista, se agrega al
grupo que corresponda y listo.

> **Si el computador no tiene ninguna voz del sexo pedido**, la página le baja
> el tono a la que haya. No queda igual, pero al menos no suena al contrario de
> lo que se pidió. Esto es otra razón para grabar el audio de verdad: con una
> grabación no depende de qué voces tenga instaladas cada visitante.

> **La voz solo habla si el visitante tiene el sonido activado.** Si silenció
> el video, no se le habla: sería molesto, y además los navegadores lo
> bloquearían igual.

### Poner los audios grabados

**Toda la voz de la página acepta grabaciones.** Donde haya una, suena esa;
donde no, la dice el computador. Se pueden ir poniendo **de a una**: las que
falten siguen saliendo con la voz sintética y nada se rompe.

Los archivos van en `assets/audio/`, repartidos así:

| Qué | Cuántos | Dónde |
|---|---|---|
| La frase de la apertura | 1 | `assets/audio/frase-en-cambio.mp3` |
| El recorrido de I'Witutor | 1 (ya está) | `assets/audio/witutor/narracion.mp3` |
| …o seis sueltas, si se prefiere | 6 | `assets/audio/witutor/agenda.mp3`, `tareas.mp3`, … |
| El recorrido narrado del simulador | 16 | `assets/audio/recorrido/01.mp3` … `16.mp3` |

**En la carpeta `assets/audio/` hay un archivo llamado
`GUION PARA GRABAR.txt`** con las 23 frases, cada una con el nombre exacto del
archivo que le corresponde. Está sacado del propio código, así que dice
exactamente lo que la página dice hoy.

Cómo deben venir:

- **En MP3**, que lo entienden todos los navegadores.
- **Una frase por archivo.** No sirve un solo audio largo: cada pantalla espera
  a que termine el suyo para pasar a la siguiente.
- **Sin silencio al principio ni al final.** Ese silencio se nota, porque la
  página cronometra el paso con lo que dura el archivo.

Los nombres ya están escritos en el código, en el campo `audio` de cada paso.
Al dejar el archivo en su sitio, suena solo: no hay que tocar nada.

> **Mientras falten**, la consola del navegador (tecla F12) muestra un error
> 404 por cada archivo que no está. Es normal: es la página preguntando si ya
> llegaron, y por eso mismo puede usar la voz sintética entre tanto. **El
> visitante no ve nada de eso**, y esos errores desaparecen a medida que se van
> poniendo las grabaciones.

### Por qué conviene grabarlos

La voz del computador saca del paso, pero tiene tres problemas que una
grabación no tiene:

1. **Suena robótica**, y se nota en una página que quiere transmitir lo
   humano frente a lo industrial.
2. **Cambia de un computador a otro.** No todos tienen las mismas voces
   instaladas; en algunos no hay ninguna masculina en español.
3. **Los navegadores la cortan** si no se le hacen los tres cuidados de abajo.
   Con un archivo de audio nada de eso aplica.

### ⚠ Tres cuidados que parecen raros y no sobran

Toda la voz de la página pasa por una sola función, `presDecir`, en
`js/presentacion.js`. Ahí hay tres cosas que parecen innecesarias y **no lo
son**: el sintetizador de los navegadores tiene tres fallas viejas y conocidas,
y si se quita cualquiera de las tres, **la voz se corta a media frase**.

| Qué hace | Por qué |
|---|---|
| Guarda la frase en una variable de afuera | Si la frase solo vive dentro de la función, el navegador la da por basura y la recoge mientras todavía está sonando |
| Un latido que lo despierta cada 7 segundos | Pasados unos 15 segundos hablando, el sintetizador se duerme solo |
| Una pausa mínima entre cancelar y hablar | Llamados uno detrás del otro se atropellan y se traga el principio de la frase, o la frase entera |

Está todo explicado en el propio archivo, en un recuadro justo encima de la
función. Es la clase de código que uno borra por parecer de más.

Esta es, otra vez, la razón de fondo para **grabar los audios de verdad**: una
grabación no depende de nada de esto.

### Los campos de un video

| Campo | Para qué sirve |
|---|---|
| `archivo` | Ruta del `.mp4` dentro de `assets/video/`. |
| `fin` | Segundo en que la presentadora termina de hablar. |
| `pendiente` | `true` = los subtítulos todavía son de relleno. |
| `controles` | `true` = le salen encima los botones de pausa y detener. |
| `lineas` | Los subtítulos con su tiempo (ver más abajo). |

### Pausa y detener

Los dos botones salen **arriba a la izquierda del video**, solo en los videos
que traigan `controles: true`. Hoy los lleva el **segundo**; el primero no,
a propósito: ahí el visitante apenas está entrando y no conviene distraerlo
con botones.

| Botón | Qué hace |
|---|---|
| **Pausa** | Para el video. El mismo botón cambia a **Seguir** para reanudarlo. |
| **Detener** | Salta al final del recorrido: las tres tarjetas. |

**"Detener" no congela el video a propósito.** Un video quieto dejaría al
visitante mirando una imagen fija sin manera de seguir; así, quien ya vio
suficiente pasa de una a escoger por dónde sigue.

Para que los lleve también el primer video, se le agrega `controles: true` a
su bloque en `js/presentacion.js`. Para quitárselos al segundo, se le borra.

> En teléfono los botones se quedan **sin texto, solo con el icono**: con las
> palabras no caben junto al botón de sonido.

### Los subtítulos

Lo que la presentadora va diciendo sale **encima del video**, abajo y centrado,
sobre un banner **café oscuro al 50% de transparencia**, igual que los
subtítulos de YouTube. Si la frase es larga se parte en varios renglones y cada
uno lleva su propio banner ajustado al texto.

Para cambiar ese color, en `css/presentacion.css`, arriba del archivo:

```css
--pres-cc-fondo: rgba(59, 36, 23, .5);   /* café oscuro, 50% transparente */
--pres-cc-texto: #FFFFFF;
```

Los tres primeros números son el color (rojo, verde, azul) y el último la
transparencia: `0` invisible, `1` totalmente sólido.

**Cómo se comporta:**

- **Arranca solo apenas carga la página.** Eso sí, arranca **en silencio**:
  Chrome, Safari y Firefox bloquean cualquier video que suene sin que la
  persona haya tocado algo antes. No es algo que se pueda configurar ni
  saltar — es una regla del navegador.
- **El sonido se activa solo en el primer clic o tecla del visitante**, que es
  el primer momento en que el navegador lo permite. O sea: entra, el video ya
  está corriendo, y apenas hace cualquier cosa empieza a oírse.
- El botón **"Activar sonido" / "Desactivar sonido"** está sobre el video,
  arriba a la derecha. Si el visitante lo toca, manda él: ya no se le vuelve
  a activar el sonido solo.
- Por todo esto la transcripción importa tanto: el mensaje se entiende
  completo aunque el video nunca llegue a sonar.
- Se pausa solo si el visitante se va scrolleando para abajo o se cambia de
  pestaña, y sigue cuando vuelve. Así no queda sonando algo que ya nadie está
  viendo. Eso sí, no se pausa de inmediato: algunos navegadores marcan la
  pestaña como oculta por instantes al repintar, y si se le hiciera caso el
  video quedaría arrancando y frenando todo el tiempo.

### El texto y sus tiempos

Dentro de cada video, en `lineas`:

```javascript
lineas: [
  { t: 0.0, texto: "Tu colegio enseña con la identidad de editorial" },
  { t: 2.4, texto: "No te parezcas a otros" },
  { t: 3.8, texto: "Te entregan el tema ya resuelto" },
  { t: 5.6, texto: "Es igual para todos" },
  { t: 6.8, texto: "No compites, compites enseñando lo mismo que todos" },
  { t: 9.1, texto: "Decide y compite" }
]
```

- `t` es **el segundo** en que empieza esa frase, contado desde que arranca
  **ese** video (cada video empieza en 0 otra vez).
- Los tiempos están repartidos según el largo de cada frase. Si al verlo con
  sonido alguna entra antes o después, se corrige ahí mismo.

Para afinarlos: abre la página, dale play, y mira el reloj de la esquina del
panel, que muestra el segundo exacto. Tocando una frase el video salta a ese
punto para comprobarlo.

Si cambias las frases, acuérdate de ajustar también `fin`.

### El texto que tiene hoy cada video

Los tiempos no están puestos al azar: cada renglón entra justo cuando el video
cambia de escena, así el texto acompaña lo que se está viendo.

> **⚠ Falta un tramo.** Todos los subtítulos están listos menos los del tramo
> del medio del primer video —el del salón y la profesora agobiada—, que hoy
> tiene cuatro frases de relleno entre paréntesis. Cuando llegue lo que se dice
> ahí, se reemplazan y se pone `pendiente: false`. Mientras tanto la consola
> del navegador lo avisa; el visitante no ve nada raro.

**Video 1 — `presentacion-apertura.mp4`:**

Son **tres videos pegados en un solo archivo**, uno detrás del otro:

| Desde | Hasta | Qué se ve |
|---|---|---|
| 0,0 s | 9,7 s | La presentadora |
| 9,7 s | 19,7 s | El salón, los papás y la profesora agobiada |
| 19,7 s | 29,7 s | Los colegios y la plataforma de la editorial |

Por eso el guion va de corrido: los tiempos de cada tramo **ya vienen sumados**,
no empiezan de cero en cada uno. Si el tramo 2 empieza en el 9,7 y su primera
frase cae a los 0,2 segundos de arrancar, en la lista se escribe 9,9.

```javascript
lineas: [
  /* --- tramo 1: la presentadora --- */
  { t:  0.0, texto: "Tu colegio enseña con la identidad de editorial" },
  { t:  2.4, texto: "No te parezcas a otros" },
  { t:  3.8, texto: "Te entregan el tema ya resuelto" },
  { t:  5.6, texto: "Es igual para todos" },
  { t:  6.8, texto: "No compites enseñando lo mismo que todos" },
  { t:  8.8, texto: "Decide y compite" },

  /* --- tramo 2: el video nuevo (arranca en el 9,7) --- */
  { t:  9.9, texto: "(Primera frase del video nuevo)" },
  …

  /* --- tramo 3: los colegios (arranca en el 19,7) --- */
  { t: 19.7, texto: "Haces parte de una lista de colegios" },
  { t: 23.1, texto: "Los contenidos de tu institución son iguales a los de otra institución que tiene la misma editorial" }
]
```

### El tropiezo que se le quitó a la presentadora

En la grabación original ella se repetía: decía *"No compites, **compites**
enseñando lo mismo que todos"*. Se le borró la segunda vez que dice esa
palabra.

El pedazo que salió va **del segundo 7,05 al 7,40** del video original. Esos
dos puntos caen dentro de una pausa entre sílabas —se buscaron midiendo el
volumen del audio, no a ojo—, así que el empalme no corta ninguna palabra por
la mitad. El video quedó 0,32 segundos más corto, y por eso *"Decide y
compite"* pasó del segundo 9,1 al 8,8.

**Si hay que rehacerlo con otros números**, el comando es este, cambiando el
`7.05` y el `7.40`:

```bash
ffmpeg -i entrada.mp4 -filter_complex "[0:v]trim=0:7.05,setpts=PTS-STARTPTS[v0];[0:a]atrim=0:7.05,asetpts=PTS-STARTPTS[a0];[0:v]trim=7.40,setpts=PTS-STARTPTS[v1];[0:a]atrim=7.40,asetpts=PTS-STARTPTS[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" salida.mp4
```

**Video 2 — `presentacion-3.mp4`, el de la profesora:**

```javascript
lineas: [
  { t: 0.0, texto: "La profesora elige la actividad" },
  { t: 4.0, texto: "El estudiante recibe el contenido ajustado a su habilidad cognitiva" },
  { t: 8.0, texto: "Esto es contenido propio" }
]
```

En el segundo 4,0 el video pasa de la profesora al estudiante. La última frase
—la que cierra el argumento— entra en el 8,0 y se queda hasta el final.

> **Si algún guion no cabe en su video**, la página se arregla sola: repite ese
> video, deja correr la transcripción a ritmo de lectura y avisa por la consola
> del navegador (tecla **F12**). Ese aviso es para quien esté armando la
> landing: **el visitante no lo ve**. Hoy el primer video dura 20 segundos y el
> segundo 10, y los dos guiones caben, así que no aparece.

### Cambiar un video

Se reemplaza el archivo dentro de `assets/video/` por el nuevo, con el mismo
nombre. Conviene que sea `.mp4` (H.264), que es el formato que entienden todos
los navegadores.

| Archivo | Dura | Pesa | Tamaño | Qué trae |
|---|---|---|---|---|
| `presentacion-apertura.mp4` | 30 s | 2,7 MB | 1280×720 | Tres videos pegados: la presentadora, el salón y los colegios |
| `presentacion-3.mp4` | 10 s | 889 KB | 1280×720 | WiTeacher y Wiwi Quest |

Los videos sueltos que había antes ya no están en la carpeta: su contenido es
justamente lo que quedó dentro de `presentacion-apertura.mp4`. Tenerlos aparte
eran megas repetidos.

**Cómo se unieron**, por si hay que rehacerlo con otros videos:

```bash
ffmpeg -f concat -safe 0 -i lista.txt -c copy salida.mp4
```

donde `lista.txt` tiene una línea por video: `file 'presentacion-1.mp4'`. El
`-c copy` los pega **sin volver a comprimir**, así que no pierden nada de
calidad. Eso sí, solo funciona si los dos traen el mismo formato: mismo
tamaño, mismos cuadros por segundo y mismo audio.

Si el video nuevo dura distinto, hay que ajustar sus `lineas` y su `fin` para
que la transcripción le siga el paso.

### ⚠ Comprimir los videos antes de subirlos

Los videos que están en la carpeta **ya vienen comprimidos**: los tres
originales pesaban 1,9 MB, 3,3 MB y 2,4 MB, y quedaron en 677 KB, 1,1 MB y
889 KB. Se ven igual — se comparó fotograma a fotograma, incluida la cara de
la presentadora y el texto de pantalla. Los dos primeros son los que después
se pegaron en un solo archivo.

**Cualquier video nuevo hay que comprimirlo igual antes de subirlo.** Un MP4
recién exportado de un editor suele pesar tres veces más de lo necesario.

Con [ffmpeg](https://ffmpeg.org) instalado, el comando es:

```bash
ffmpeg -i entrada.mp4 -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k salida.mp4
```

Qué hace cada parte, por si hay que ajustarla:

- `-crf 26` es la calidad. Más bajo = mejor y más pesado. 23 es casi
  indistinguible del original; 29 ya empieza a notarse en caras.
- `-movflags +faststart` pone el índice del archivo al principio, para que
  el video empiece a verse mientras todavía se está descargando.
- `-b:a 96k` es el audio. Para una voz hablada es de sobra.

Se probó también WebM (el equivalente de WebP para video). Sirvió para el
video de la presentadora, pero pesó **más** en el de la grabación de pantalla,
así que no se usó: no compensaba manejar dos formatos.

---

Cualquier duda del montaje, con este documento debería alcanzar.
Si algo no cuadra, lo que más ayuda es decir **en qué paso exacto** se quedó.
