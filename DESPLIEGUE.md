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

## 2. Los formularios son una Cloud Function

Firebase Hosting **no ejecuta PHP**. Los dos formularios que antes eran
`enviar.php` y `agendar-teams.php` los atiende ahora una Cloud Function que vive
en el repositorio `witown-cloud-functions`, en
`functions/src/handlers/landing.js`:

| La página llama a | Lo atiende | Qué hace |
|---|---|---|
| `POST /api/contacto` | `landingContacto` | guarda el lead en `LandingLeads` y encola el correo |
| `POST /api/agendar-teams` | `landingAgendarTeams` | guarda en `LandingReuniones` y encola dos correos |

Las dos rutas `/api/*` son **rewrites** declarados en `firebase.json`: la página
y la función quedan en el mismo dominio, así que no hay CORS de por medio.

El correo no sale por SMTP: la función escribe un documento en la colección
`mail` y lo despacha la extensión *Trigger Email from Firestore*, la misma vía
que usa el backend Flask. **No hay credenciales que llenar en este repositorio.**

Las funciones se despliegan desde el repo de funciones y, por la regla del
ecosistema, **siempre desde `main`**:

```bash
cd C:\Users\ASUS\StudioProjects\witown-cloud-functions
firebase deploy --only functions:landingContacto,functions:landingAgendarTeams
```

> El sitio y las funciones se despliegan por separado. Si se publica el Hosting
> antes que las funciones, los formularios devuelven 404 hasta que las funciones
> estén arriba.

## 3. Se prueba en dos tiempos

**Primero la página.** Que se vea igual que en local. Pero **no todo lo que falte
es un problema de publicación**: hay archivos que la página busca y que nunca
existieron (el og-image, las tipografías, los audios del recorrido). La lista
completa está en [`PENDIENTES.md`](PENDIENTES.md) §3 — **compárala antes de dar
por hecho que algo se subió mal.**

**Después los formularios**, y de verdad: se manda uno y se revisa la bandeja de
`contacto@iwitown.com`, **incluida la carpeta de spam**. El botón dice "enviado"
aunque el correo no haya salido.

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
  guardas son la trampa anti-spam del campo oculto, un tope de 20 envíos por IP
  **y por formulario** por hora (o sea hasta 40 entre los dos) y un tope global de
  200 al día, que rota a medianoche de Bogotá. El global es el que importa: el
  agendamiento le escribe a la dirección que teclee el visitante, y sale por la
  misma extensión de correo que usan los colegios.
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

## Checklist de publicación

En este orden.

- [ ] **Videos `solucion-1/2/3.mp4` regrabados sin datos reales** (§0) — bloqueante
- [ ] Las dos Cloud Functions desplegadas desde `main` del repo de funciones (§2)
- [ ] `firebase deploy --only hosting` desde este repositorio (§1)
- [ ] La página se ve igual que en local, descontando lo de [`PENDIENTES.md`](PENDIENTES.md) §3
- [ ] `firebase hosting:sites:list --project witcoins-network` muestra `ecosistema-iwitown` — si el sitio y las funciones no están en el mismo proyecto, los formularios dan 404
- [ ] Formulario de contacto probado de verdad; correo recibido (revisada la carpeta de spam) y lead visible en `LandingLeads`
- [ ] Al darle **Responder** a ese correo, la respuesta va al visitante y no a un no-reply
- [ ] En `firebase functions:log` se miró el `x-forwarded-for` de ese envío y el penúltimo valor es la IP pública propia, no una IP de borde de Google (si no, el tope por IP confundiría visitantes distintos — ver `landing.js`, `ipDe`)
- [ ] Agendamiento probado de verdad; llegan los dos correos y queda el registro en `LandingReuniones`
- [ ] Los seis enlaces de redes del pie abren donde deben
- [ ] Abierta en un celular con datos móviles
- [ ] Subdominio propio decidido y conectado, si se va a usar
