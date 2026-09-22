# Cómo se publica este sitio y cómo se modifica

Esta es la regla. Si hay que cambiar un texto, una imagen o un correo, se hace
siguiendo lo de acá.

- Repositorio: `https://github.com/Witcoins/ecosistema-landing.git`
- Copia local: `C:\Users\ASUS\StudioProjects\ecosistema-landing`
- **Firebase Hosting**, sitio `ecosistema-iwitown`, proyecto `witcoins-network`
- URL por omisión: <https://ecosistema-iwitown.web.app>
- Subdominio propio: **www.ecosistema.iwitown.com** (con el `www.`: el enlace solo funciona asi). Pendiente de conectar
- Comprobado contra el repo el **2026-09-22**

Este archivo no repite lo que ya está escrito en otra parte: lo que falta y el
número del `?v=` viven en [`PENDIENTES.md`](PENDIENTES.md).

---

## 0. Lo que bloquea la publicación

**Los videos `assets/video/solucion-1.mp4`, `-2` y `-3` son grabaciones de
pantalla con datos de personas reales** — nombres de acudientes, de una docente
y el estado de pagos de un estudiante ([`PENDIENTES.md`](PENDIENTES.md) §4).

- `-1` y `-3` se muestran en la página (`index.html`:855 y 944).
- **`-2` no lo muestra ninguna pantalla, pero se publica igual** porque viaja
  dentro de `assets/`. Hay que regrabarlo o borrarlo; no basta con que no se vea.

Publicarlos sería servir datos personales de usuarios reales en una página que
enlaza una política de Habeas Data donde Gain Money Group SAS figura como
responsable. **Se regraban con datos de ejemplo antes del primer `deploy`.**

## 1. Cómo se publica

```bash
cd C:\Users\ASUS\StudioProjects\ecosistema-landing
firebase deploy --only hosting
```

Eso es todo: no hay FTP, ni certificado que instalar, ni `.htaccess`. Firebase da
HTTPS, compresión y caché por su cuenta.

**Qué se publica y qué no** lo decide la lista `ignore` de `firebase.json`, no la
memoria de quien sube. Hoy quedan fuera: los `.md`, `herramientas/`, los `.txt`
de trabajo, y todo lo que empieza por punto — incluida la carpeta `.git`. Si se
agrega un archivo que no debe ser público, va a esa lista.

Para ver el sitio antes de publicarlo de verdad:

```bash
firebase hosting:channel:deploy prueba   # URL temporal, no toca el sitio real
firebase serve --only hosting            # o en local, en el navegador
```

## 2. El contacto y el agendamiento

El formulario y el calendario pasan **dentro de la pagina**: no le abren al
visitante su programa de correo ni lo mandan a llenar nada afuera. Lo unico que
sale del sitio es la sala de Teams, cuando el visitante escoge entrar ahora.
Firebase Hosting no ejecuta PHP, asi que todo lo atienden cuatro Cloud Functions
del repositorio `witown-cloud-functions`:

| La pagina llama a | Lo atiende | Que hace |
|---|---|---|
| `POST /api/contacto` | `landingContacto` | guarda el lead en `LandingLeads`, avisa a `contacto@iwitown.com` y a `witownnetwork@gmail.com`, y le manda al visitante un correo de "gracias por contactarnos" |
| `GET /api/horas` | `landingHoras` | devuelve los cupos libres de las proximas 3 semanas |
| `POST /api/agendar` | `landingAgendar` | reserva el cupo y manda la invitacion por correo a las dos partes |
| `POST /api/sala` | `landingSala` | avisa de que **hay alguien esperando en la sala AHORA**: no reserva nada |

Las rutas `/api/*` son **rewrites** declarados en `firebase.json`: la pagina y
las funciones quedan en el mismo dominio, asi que no hay CORS de por medio.

### El recuadro tiene dos caminos

El boton "Reunion por Teams" abre un recuadro que pregunta primero que quiere
hacer el visitante, y cada paso resuelto se encoge a un renglon con su boton de
"Cambiar", para que vea donde va y pueda devolverse:

- **Entrar a la reunion ahora.** Se le avisa de que lo mandamos a la sala en este
  momento, deja nombre, celular y correo, y al confirmar se abre Teams en otra
  pestaña. Por detras, `/api/sala` **nos avisa de que esta esperando**.
- **Agendar para despues.** Dia, hora y sus datos (nombre, celular, correo y
  colegio). Es el calendario de mas abajo.

La sala se abre **antes** de que responda el servidor, a proposito: los
navegadores solo dejan abrir una pestaña mientras la persona esta tocando algo,
asi que si se esperara la respuesta la pestaña saldria bloqueada. Si el aviso
falla, la persona igual entra, que es lo que vino a hacer.

### El aviso de "hay alguien en la sala"

Sale por **correo** a `contacto@iwitown.com` y a `witownnetwork@gmail.com`, con
asunto `AHORA: <nombre> esta esperando en la sala de Teams` y con el celular y el
correo que dejo, por si nadie alcanza a entrar y hay que devolverle el contacto.
La visita queda tambien en la coleccion `LandingSala`.

**Se descarto avisar por WhatsApp** (decision del 2026-09-21). Desde un servidor
no se puede: exige la API de WhatsApp Business de Meta, con cuenta aparte, la
empresa verificada y una plantilla aprobada por cada mensaje que inicia el
negocio. Si algun dia se quiere un aviso al celular sin ese costo, el camino
corto es un bot de Telegram.

### El calendario es nuestro

No se usa la pagina de citas de Google —la cobran— ni un iframe de nadie. Lo
pinta `js/teams.js` con los cupos que da `/api/horas`.

Cuatro cosas que hay que saber para no romperlo:

- **Las horas libres se definen en el codigo**, en la constante `AGENDA` de
  `functions/src/handlers/landingAgenda.js`. Hoy: lunes a viernes, 8:30 a 12:30
  y 2:00 a 4:00 de la tarde, citas de 30 minutos (12 cupos por dia), hora de
  Colombia, hasta 3 semanas adelante, y no se ofrece un cupo que empiece dentro
  de menos de 3 horas. Cambiarlas es cambiar `AGENDA` y volver a desplegar.
- **El id del documento de la reserva ES la hora** (`2026-09-22T09-30`), en
  `LandingReuniones`. Eso es lo que impide que dos personas tomen el mismo cupo:
  la reserva se hace en una transaccion sobre ese documento. Si se cambia el
  formato de esa llave, se rompe la proteccion.
- **La reunion llega a los calendarios como invitacion `.ics` adjunta** al
  correo, no por la API de Calendar. Gmail la reconoce y la ofrece para aceptar,
  tanto en la bandeja nuestra como en la del visitante. Por eso no hay que
  compartir ningun calendario con una cuenta de servicio.
- **La sala de Teams es fija**, y su enlace vive en **tres** sitios: `SALA_TEAMS`
  en `js/teams.js` (porque la pestaña la abre el navegador) y `ENLACE_TEAMS` en
  `landingAgenda.js` y `landingSala.js` (porque es el que va en la invitacion y
  en el aviso). Si se cambia la sala, se cambia en los tres. Todas las reuniones
  caen en la misma sala, asi que dos citas a la misma hora se pisarian; para eso
  esta la transaccion del cupo.

Quien quiere hablar **ya** tiene dos caminos: el de "entrar ahora" del recuadro,
o el boton de WhatsApp.

El correo no sale por SMTP: la función escribe un documento en la colección
`mail` y lo despacha la extensión *Trigger Email from Firestore*, la misma vía
que usa el backend Flask. **No hay credenciales que llenar en este repositorio.**

Las funciones se despliegan desde el repo de funciones y, por la regla del
ecosistema, **siempre desde `main`**:

```bash
cd C:\Users\ASUS\StudioProjects\witown-cloud-functions
firebase deploy --only functions:landingContacto,functions:landingHoras,functions:landingAgendar,functions:landingSala
```

> El sitio y las funciones se despliegan por separado, y el orden importa: **las
> funciones primero**. Si se publica el Hosting antes, los formularios devuelven
> 404 hasta que las funciones esten arriba.

> Estado al 2026-09-20: el Hosting y las **tres funciones estan desplegados**, y
> el formulario del sitio en vivo responde (un `POST` a `/api/contacto` sin datos
> devuelve 422 con el mensaje de la funcion, no un 404 de Hosting). La funcion
> vieja `landingAgendarTeams` **no esta desplegada, asi que no hay que borrarla**.
>
> Como comprobar el estado en cualquier momento, sin desplegar nada:
>
> ```bash
> firebase functions:list --project witcoins-network
> curl -s -X POST https://ecosistema-iwitown.web.app/api/contacto -d "x=1"
> ```
>
> Un 404 ahi significa que falta el deploy de las funciones; un 422 significa que
> estan arriba y validando.

## 2 bis. Una ruta por vista

El sitio es un solo `index.html` con nueve vistas que `js/vistas.js` intercambia,
pero **cada vista tiene su propia direccion**: `/`, `/marca`, `/problema`,
`/solucion`, `/ecosistema`, `/acp`, `/consultoria`, `/contacto` y `/conversemos`.
Se pueden compartir, guardar en favoritos e indexar.

Cinco cosas que hay que saber para no romperlo:

- **Las ocho rutas estan listadas una por una en los `rewrites` de
  `firebase.json`**, no con un comodin `/**`. Es a proposito: el comodin taparia
  los 404 y una imagen que falte devolveria la pagina entera con codigo 200,
  dejando a quien depura a ciegas.
- **Agregar una vista son CUATRO sitios, no uno**: `VISTAS`, `TITULOS` y
  `DESCRIPCIONES` en `js/vistas.js`, y los **dos** `rewrites` de `firebase.json`
  (el de la ruta y el de la ruta con barra final). Si falta el rewrite, la
  direccion da 404 al entrar directo aunque funcione al navegar por dentro; si
  falta el titulo o la descripcion, la ruta hereda los de la vista anterior.
- **Un `<a href="#">` vivo ya no es inofensivo.** Con el `<base href="/">`, ese
  enlace resuelve a la raiz, o sea a OTRO documento: recargaria la pagina entera
  hasta la portada. Los cuatro que quedan los reescribe `js/script.js` al cargar,
  pero si alguna de sus constantes (`WHATSAPP`, `INGRESAR`, `WIWI`) se deja
  vacia, el `href="#"` sobrevive y el boton apagado se lleva al visitante a la
  portada.
- **El `<base href="/">` del `<head>` no se puede quitar.** Los css, los js y los
  assets se piden con rutas relativas; sin esa base, una direccion con barra
  final (`/solucion/`) los buscaria en `/solucion/css/` y la pagina saldria sin
  estilos.
- **Los enlaces viejos con `#` siguen funcionando.** Si alguien mando por correo
  `.../#acp`, el router lo entiende y abre esa vista. El `#` se usa ahora solo
  para las secciones de adentro de una vista, como `/#presentacion`.

**El titulo, la descripcion y la etiqueta canonica cambian con la vista**, y los
pone `js/vistas.js` (`TITULOS`, `DESCRIPCIONES` y `ponerLosDatosDeLaVista`). La
canonica se **crea** desde el JavaScript en vez de venir escrita en el html: una
etiqueta estatica diria `/` en las nueve rutas, y un rastreador que no ejecute
JavaScript leeria que las ocho rutas nuevas son duplicados del inicio, que es
peor que no poner ninguna.

Lo que **falta** para que esto rinda en buscadores: las nueve rutas sirven el
**mismo html**, con todas las secciones dentro. A un visitante le llega todo bien
siempre. A Google le llega solo cuando ejecuta el JavaScript, que lo hace en una
segunda pasada y sin garantias. Y a WhatsApp, que arma la vista previa sin
ejecutar nada, no le llega nunca: ahi seguira viendo el titulo y la imagen del
inicio para cualquier ruta. Para cambiar eso hay que servir un html distinto por
ruta, y eso ya es otro trabajo.

## 2 ter. La medicion de visitas

La miden **Google Analytics 4** y nada mas: no hay mapa de calor ni grabacion de
sesiones. El identificador esta en `MEDICION`, arriba de `js/analitica.js`, y
sale de la consola de Analytics (Administrar -> Flujos de datos).

**No se mide a nadie sin permiso.** El script de Google ni siquiera se descarga
hasta que la persona acepta el aviso de cookies: la Ley 1581 pide permiso antes,
no despues. Rechazar no carga nada, y si alguien acepta y luego se arrepiente,
el boton "Cookies" del pie vuelve a preguntar y rechazar **apaga los envios y
borra las cookies en el acto** (el script sigue en memoria, pero con la bandera
`ga-disable-<ID>` puesta no manda nada: sin eso, la medicion mejorada disparaba
sola su primer evento y volvia a escribir las cookies).

Si `MEDICION` se deja vacio, no hay medicion **ni aviso de cookies**: seria
absurdo pedir permiso para algo que no va a pasar.

Tres cosas que conviene saber antes de mirar los informes:

- **Las nueve rutas se cuentan solas.** Por eso `js/analitica.js` NO manda
  eventos de pagina a mano: la "medicion mejorada" de GA4 ya los dispara con
  cada cambio de direccion, y mandarlos tambien contaria cada visita dos veces.
- **Entre el 20 % y el 30 % de los visitantes no apareceran**, porque los
  bloqueadores frenan a Google. Los numeros son un piso, no la verdad.
- **Las horas del dia no vienen en ningun informe estandar**: hay que armar una
  exploracion con la dimension Hora. Se hace una vez y queda guardada.

Queda una cosa que no es tecnica y sin la cual el aviso promete algo que no
esta respaldado: la politica de politicasprivacidadwitcoins.com tiene que
nombrar a **Google como encargado del tratamiento**. Esta anotado en
[`PENDIENTES.md`](PENDIENTES.md) §3 bis, junto con los dos ajustes de consola.

## 3. Se prueba en dos tiempos

**Primero la página.** Que se vea igual que en local. Pero **no todo lo que falte
es un problema de publicación**: hay archivos que la página busca y que nunca
existieron (el og-image, las tipografías, los audios del recorrido). La lista
completa está en [`PENDIENTES.md`](PENDIENTES.md) §3 — **compárala antes de dar
por hecho que algo se subió mal.**

**Despues el formulario**, y de verdad: se manda uno y se revisan las dos bandejas
(`contacto@iwitown.com` y `witownnetwork@gmail.com`), **incluida la carpeta de
spam**, y que al visitante le llegue el correo de gracias. El boton dice
"enviado" aunque el correo no haya salido.

**Y el agendamiento**: abrir el recuadro de "Reunion por Teams", reservar una
hora de prueba y comprobar tres cosas: que llega la invitacion a las dos partes,
que al aceptarla el evento queda en el calendario con el enlace de la sala, y que
ese cupo **ya no aparece** al volver a abrir el recuadro. Despues se borra el
documento de `LandingReuniones` para liberarlo.

Si el correo no llega, el lead **no se pierde**: queda en Firestore
(`LandingLeads`), y el fallo queda en los registros de la función:

```bash
firebase functions:log --only landingContacto
```

## 4. Datos personales de quien llena el formulario

Los leads quedan en Firestore con nombre, perfil, correo, teléfono, ciudad y
mensaje. (El formulario **no** pide colegio ni número de estudiantes, aunque la
función deja el campo listo por si algún día se agregan.) Tres cosas que hay que
tener presentes:

- La función es **pública a propósito** (la llena un visitante sin cuenta). Las
  guardas son la trampa anti-spam del campo oculto y unos topes que rotan a
  medianoche de Bogota: el contacto admite 20 envios por IP a la hora y 200 al
  dia en total; el agendamiento, 10 y 60; el aviso de la sala, 5 y 40. En la sala
  el tope frena **el aviso, no la captura**: la visita se guarda igual, para no
  perder el celular de quien quedo esperando. El agendamiento
  los necesita igual que el contacto: que un cupo tomado no se pueda volver a
  tomar no es un limite, porque **llenar la agenda entera es justamente el
  ataque**, y cada reserva dispara dos correos.
- **Cada envio manda mas de un correo.** El contacto manda dos (el aviso y el
  gracias) y el agendamiento otros dos, asi que el techo de correos al dia es el
  doble del numero de envios. Es lo que hay que mirar si se piensa en la
  reputacion del remitente, que es compartido con los colegios. El global es el que importa: el
  correo de gracias va a la direccion que teclee el visitante, y sale por la misma
  extension de correo que usan los colegios.
- Las reglas de Firestore del proyecto conceden lectura a cualquier usuario
  autenticado, así que **estas colecciones quedan legibles desde las apps**. Está
  anotado como pendiente. Hay datos personales de visitantes externos dentro de
  ese comodín; si se quiere cerrar, va una regla explícita para `LandingLeads`,
  `LandingReuniones` y `LandingSala` antes del comodín final.
- La colección `LandingIntentos` (la de los topes) crece un documento por IP y no
  tiene TTL. Sus documentos traen `ultimo_en`, así que se puede declarar una
  política TTL sobre ese campo cuando estorbe.

## 5. Dos reglas para cuando se toque un archivo

**Nombres en minúscula, sin tildes ni espacios.** Windows no distingue
`Foto.webp` de `foto.webp`; el servidor sí, y la imagen desaparece. Hoy ninguna
ruta del sitio tiene desajuste de mayúsculas — no romperlo al agregar una nueva.

**No editar nunca en el servidor.** Cambio en local → commit → `deploy`.

## 6. El `?v=` no es decoración

Al cambiar un `css`, un `js` o una imagen hay que subirle el número **a todos**
los `?v=` del `index.html`, o quien ya visitó la página sigue viendo la versión
vieja durante una semana (así está la caché en `firebase.json`). El número
vigente está en [`PENDIENTES.md`](PENDIENTES.md) §5.

```bash
# cambiar ACTUAL y NUEVO por los números que correspondan
sed -i 's/?v=ACTUAL/?v=NUEVO/g' index.html
grep -c '?v=NUEVO' index.html   # tiene que dar el mismo total que antes
```

## 7. Páginas legales y redes

`politica-datos.html` y `terminos.html` nunca existieron y el pie las enlazaba:
eran 404 visibles. Los tres enlaces apuntan ahora a las páginas vivas:

| Enlace | Destino |
|---|---|
| consentimiento del formulario | https://www.politicasprivacidadwitcoins.com/ |
| pie → Política de tratamiento de datos | https://www.politicasprivacidadwitcoins.com/ |
| pie → Términos y condiciones | https://www.politicasprivacidadwitcoins.com/terminos-y-condiciones |

Responsable de datos según esa política: **Gain Money Group SAS**, NIT
901.101.774-4, `contacto@iwitown.com` — es lo que exige la Ley 1581 de 2012 que
cita el formulario. Son páginas **externas**: si ese dominio cambia o se cae, el
consentimiento del formulario queda apuntando a la nada.

El pie enlaza también las redes: Instagram, Facebook, TikTok, X, YouTube y el
LinkedIn de Gain Money Group (ese último es la cuenta de la empresa, no de
i'Witown).

## 8. Probarlo en un celular antes de anunciarlo

El sitio pesa unos **12 MB**, casi todo video. En computador con buena conexión
no se nota; en datos móviles sí. El diseño está probado a 375 px.

---

## Checklist de la primera publicación

Se hizo el **2026-09-20**, en este orden. Queda como referencia para la proxima
vez (un subdominio nuevo, otro sitio), no como tareas pendientes: lo que sigue
abierto esta en [`PENDIENTES.md`](PENDIENTES.md).

- [ ] **Videos `solucion-1/2/3.mp4` regrabados sin datos reales** (§0) — bloqueante
- [ ] Las **cuatro** Cloud Functions desplegadas desde `main` del repo de funciones (§2) — `landingSala` es nueva y **no esta desplegada**
- [x] `firebase deploy --only hosting` desde este repositorio (§1)
- [ ] La página se ve igual que en local, descontando lo de [`PENDIENTES.md`](PENDIENTES.md) §3
- [ ] En un canal de vista previa (`firebase hosting:channel:deploy prueba`): las nueve rutas responden 200, `/acp/` también, y una imagen inexistente sigue dando 404
- [ ] `curl -I` a `/acp` en ese canal: comprobar que el html sale con `no-cache`. Las rutas no llevan extension, asi que podrian escaparse del patron `**/*.html` de los `headers` y quedar cacheadas
- [ ] `firebase hosting:sites:list --project witcoins-network` muestra `ecosistema-iwitown` — si el sitio y las funciones no están en el mismo proyecto, los formularios dan 404
- [ ] Formulario probado de verdad: el aviso llego a las DOS bandejas, al visitante le llego el correo de gracias, y el lead se ve en `LandingLeads`
- [ ] Al darle **Responder** a ese correo, la respuesta va al visitante y no a un no-reply
- [ ] En `firebase functions:log` se miró el `x-forwarded-for` de ese envío y el penúltimo valor es la IP pública propia, no una IP de borde de Google (si no, el tope por IP confundiría visitantes distintos — ver `landing.js`, `ipDe`)
- [ ] Agendamiento probado de verdad: llegan las invitaciones, el evento queda en el calendario al aceptarlo, y el cupo tomado desaparece del recuadro
- [ ] Los seis enlaces de redes del pie abren donde deben
- [ ] Probado "entrar a la reunion ahora": se abre la sala en otra pestaña y llega el correo de aviso a las dos bandejas
- [ ] Abierta en un celular con datos móviles
- [ ] Subdominio propio decidido y conectado, si se va a usar
