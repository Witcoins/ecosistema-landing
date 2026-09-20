# Cómo se publica este sitio y cómo se modifica

Esta es la regla. Si hay que cambiar un texto, una imagen o un correo, se hace
siguiendo lo de acá.

- Repositorio: `https://github.com/Witcoins/ecosistema-landing.git`
- Copia local: `C:\Users\ASUS\StudioProjects\ecosistema-landing`
- **Firebase Hosting**, sitio `ecosistema-iwitown`, proyecto `witcoins-network`
- URL por omisión: <https://ecosistema-iwitown.web.app>
- Subdominio propio: `_______________` ← llenar cuando se decida
- Comprobado contra el repo el **2026-09-20**

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

Las dos cosas pasan **dentro de la pagina**: ninguna manda al visitante a un
sitio externo ni le abre su programa de correo. Firebase Hosting no ejecuta PHP,
asi que las atienden tres Cloud Functions del repositorio
`witown-cloud-functions`:

| La pagina llama a | Lo atiende | Que hace |
|---|---|---|
| `POST /api/contacto` | `landingContacto` | guarda el lead en `LandingLeads`, avisa a `contacto@iwitown.com` y a `witownnetwork@gmail.com`, y le manda al visitante un correo de "gracias por contactarnos" |
| `GET /api/horas` | `landingHoras` | devuelve los cupos libres de las proximas 3 semanas |
| `POST /api/agendar` | `landingAgendar` | reserva el cupo y manda la invitacion por correo a las dos partes |

Las rutas `/api/*` son **rewrites** declarados en `firebase.json`: la pagina y
las funciones quedan en el mismo dominio, asi que no hay CORS de por medio.

### El calendario es nuestro

No se usa la pagina de citas de Google —la cobran— ni un iframe de nadie. El
recuadro de "Reunion por Teams" pinta el calendario con `js/teams.js`: el
visitante escoge dia, luego hora, deja nombre, correo, celular y colegio, y
queda agendado.

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
- **La sala de Teams es fija**: `ENLACE_TEAMS`, en el mismo archivo. Todas las
  reuniones caen en la misma sala, asi que dos citas a la misma hora se
  pisarian; para eso esta la transaccion del cupo.

Quien quiere hablar **ya** no agenda: usa el boton de WhatsApp. El boton de
Teams ya no abre la sala directo, a proposito.

El correo no sale por SMTP: la función escribe un documento en la colección
`mail` y lo despacha la extensión *Trigger Email from Firestore*, la misma vía
que usa el backend Flask. **No hay credenciales que llenar en este repositorio.**

Las funciones se despliegan desde el repo de funciones y, por la regla del
ecosistema, **siempre desde `main`**:

```bash
cd C:\Users\ASUS\StudioProjects\witown-cloud-functions
firebase deploy --only functions:landingContacto,functions:landingHoras,functions:landingAgendar
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
  guardas son la trampa anti-spam del campo oculto y dos topes que rotan a
  medianoche de Bogota: el contacto admite 20 envios por IP a la hora y 200 al
  dia en total; el agendamiento, 10 por IP a la hora y 60 al dia. El agendamiento
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
  anotado como pendiente. A partir de este despliegue hay datos personales de
  visitantes externos dentro de ese comodín; si se quiere cerrar, va una regla
  explícita para `LandingLeads` y `LandingReuniones` antes del comodín final.
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
- [x] Las tres Cloud Functions desplegadas desde `main` del repo de funciones (§2)
- [x] `firebase deploy --only hosting` desde este repositorio (§1)
- [ ] La página se ve igual que en local, descontando lo de [`PENDIENTES.md`](PENDIENTES.md) §3
- [ ] `firebase hosting:sites:list --project witcoins-network` muestra `ecosistema-iwitown` — si el sitio y las funciones no están en el mismo proyecto, los formularios dan 404
- [ ] Formulario probado de verdad: el aviso llego a las DOS bandejas, al visitante le llego el correo de gracias, y el lead se ve en `LandingLeads`
- [ ] Al darle **Responder** a ese correo, la respuesta va al visitante y no a un no-reply
- [ ] En `firebase functions:log` se miró el `x-forwarded-for` de ese envío y el penúltimo valor es la IP pública propia, no una IP de borde de Google (si no, el tope por IP confundiría visitantes distintos — ver `landing.js`, `ipDe`)
- [ ] Agendamiento probado de verdad: llegan las invitaciones, el evento queda en el calendario al aceptarlo, y el cupo tomado desaparece del recuadro
- [ ] Los seis enlaces de redes del pie abren donde deben
- [ ] Abierta en un celular con datos móviles
- [ ] Subdominio propio decidido y conectado, si se va a usar
