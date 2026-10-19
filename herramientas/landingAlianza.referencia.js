/* ============================================================
   REFERENCIA — landingAlianza (NO se despliega desde este repo)

   Este archivo NO corre aquí: firebase.json ignora herramientas/**.
   Es un punto de partida para quien cree la función en el repo
   witown-cloud-functions, junto a landingContacto. Allá conviene
   reutilizar lo que ya tiene landingContacto (los topes por IP,
   `ipDe`, la plantilla de los correos) en vez de copiar esto tal
   cual. El contrato completo está en ALIANZAS.md.

   Qué hace:
     POST /api/alianza  (application/x-www-form-urlencoded)
     → valida, descarta robots (campo "website") y aplica topes
       (20 por IP a la hora, 200 al día; colección LandingTopes),
     → guarda en Firestore, colección LandingAlianzas,
     → avisa a contacto@iwitown.com y witownnetwork@gmail.com,
     → le manda al visitante el correo de confirmación,
     → responde JSON { ok: true } o { ok: false, mensaje } con 422.

   Los correos salen como en landingContacto: escribiendo un
   documento en la colección `mail` (extensión Trigger Email).
   ============================================================ */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const AVISAR_A = ["contacto@iwitown.com", "witownnetwork@gmail.com"];

/* Los valores que manda el formulario. Si se cambian en el index.html,
   se cambian aquí también. */
const PAISES = { MX: "México", PE: "Perú", otro: "Otro" };
const TIPOS = {
  "asociacion": "Asociación de colegios privados",
  "red-federacion": "Red o federación de instituciones",
  "directivos": "Organización de directivos o promotores",
  "grupo-educativo": "Grupo educativo con varias sedes",
  "otra": "Otra entidad"
};
const COLEGIOS = { "1-20": "1–20", "21-50": "21–50", "51-100": "51–100", "100+": "Más de 100", "por-definir": "Por definir" };
const INTERESES = {
  conocer: "Conocer el ecosistema",
  demostracion: "Organizar una demostración para los afiliados",
  piloto: "Evaluar un piloto institucional",
  convenio: "Explorar un convenio de colaboración",
  otra: "Otra posibilidad"
};

/* ---- Topes de envío ----
   Mismos números que landingContacto: 20 por IP a la hora y 200 al día en
   total, con el día cortado a medianoche de Bogotá. Si allá ya existe un
   helper de topes, usar ese en vez de este. */
const TOPE_IP_HORA = 20;
const TOPE_DIA = 200;

/* Como en landing.js (`ipDe`): el penúltimo valor de x-forwarded-for es el
   del visitante; el último lo pone el borde de Google. Comprobarlo con
   `firebase functions:log` antes de confiar en él (ver DESPLIEGUE.md). */
function ipDe(req) {
  const xff = String(req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  return xff.length >= 2 ? xff[xff.length - 2] : (xff[0] || req.ip || "desconocida");
}

async function cabeEnElTope(ip) {
  const bogota = new Date(Date.now() - 5 * 3600 * 1000).toISOString();   // UTC-5, sin horario de verano
  const dia = bogota.slice(0, 10);
  const hora = bogota.slice(0, 13);
  const llaveIp = require("crypto").createHash("sha256").update(ip).digest("hex").slice(0, 24);

  const refIp = db.collection("LandingTopes").doc(`alianza_ip_${llaveIp}_${hora}`);
  const refDia = db.collection("LandingTopes").doc(`alianza_dia_${dia}`);

  return db.runTransaction(async (t) => {
    const [sIp, sDia] = await Promise.all([t.get(refIp), t.get(refDia)]);
    const nIp = (sIp.exists && sIp.data().n) || 0;
    const nDia = (sDia.exists && sDia.data().n) || 0;
    if (nIp >= TOPE_IP_HORA || nDia >= TOPE_DIA) return false;
    t.set(refIp, { n: nIp + 1, hora }, { merge: true });
    t.set(refDia, { n: nDia + 1, dia }, { merge: true });
    return true;
  });
}

function texto(v, max) { return String(v || "").trim().slice(0, max); }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

exports.landingAlianza = onRequest({ region: "us-central1" }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, mensaje: "Método no permitido." });

  const b = req.body || {};

  /* Robot: se responde ok para no darle pistas, y no se guarda nada. */
  if (texto(b.website, 200)) return res.json({ ok: true });

  /* `interes` llega repetido (una vez por casilla marcada). */
  const intereses = [].concat(b.interes || []).map(String).filter((k) => INTERESES[k]);

  const d = {
    nombre: texto(b.nombre, 120),
    cargo: texto(b.cargo, 120),
    organizacion: texto(b.organizacion, 160),
    tipo_organizacion: texto(b.tipo_organizacion, 30),
    pais: texto(b.pais, 10),
    pais_otro: texto(b.pais_otro, 60),
    correo: texto(b.correo, 150).toLowerCase(),
    telefono: texto(b.telefono, 30),
    colegios: texto(b.colegios, 20),
    intereses,
    mensaje: texto(b.mensaje, 1000),
    autoriza: b.autoriza === "si",
    origen: "alianzas-educativas",
    utm_source: texto(b.utm_source, 100),
    utm_medium: texto(b.utm_medium, 100),
    utm_campaign: texto(b.utm_campaign, 100)
  };

  const faltan =
    !d.nombre || !d.cargo || !d.organizacion ||
    !TIPOS[d.tipo_organizacion] || !PAISES[d.pais] || (d.pais === "otro" && !d.pais_otro) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo) ||
    d.telefono.replace(/\D/g, "").length < 8 ||
    !COLEGIOS[d.colegios] || !intereses.length || !d.autoriza;

  if (faltan) return res.status(422).json({ ok: false, mensaje: "Revise los campos obligatorios." });

  /* Topes: sin ellos, cualquiera puede usar el correo de confirmación para
     mandar mensajes a direcciones ajenas desde el remitente de i'Witown. */
  if (!(await cabeEnElTope(ipDe(req)))) {
    return res.status(429).json({ ok: false, mensaje: "Recibimos demasiadas solicitudes. Intente más tarde o escríbanos a contacto@iwitown.com." });
  }

  const ref = await db.collection("LandingAlianzas").add({
    ...d,
    /* Estado comercial, para medir "reuniones efectivamente agendadas":
       nuevo → contactado → reunion-agendada → reunion-hecha → piloto / descartado.
       Lo actualiza el equipo comercial a mano (o desde el CRM). */
    estado: "nuevo",
    creado: admin.firestore.FieldValue.serverTimestamp(),
    autoriza_en: admin.firestore.FieldValue.serverTimestamp()
  });

  const paisTxt = d.pais === "otro" ? d.pais_otro : PAISES[d.pais];
  const filas = [
    ["Nombre", d.nombre], ["Cargo", d.cargo], ["Organización", d.organizacion],
    ["Tipo", TIPOS[d.tipo_organizacion]], ["País", paisTxt], ["Correo", d.correo],
    ["WhatsApp / teléfono", d.telefono], ["Colegios afiliados", COLEGIOS[d.colegios]],
    ["Quiere explorar", intereses.map((k) => INTERESES[k]).join(", ")],
    ["Mensaje", d.mensaje || "—"],
    ["Campaña", [d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(" / ") || "—"]
  ];

  const lote = db.batch();
  lote.set(db.collection("mail").doc(), {
    to: AVISAR_A,
    replyTo: d.correo,
    message: {
      subject: `Alianza educativa (${paisTxt}): ${d.organizacion}`,
      html: "<h2>Nueva solicitud de reunión institucional</h2><table>" +
        filas.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join("") +
        `</table><p>Id: ${ref.id}</p>`
    }
  });
  lote.set(db.collection("mail").doc(), {
    to: d.correo,
    message: {
      subject: "Recibimos su solicitud — i’Witown",
      html: `<p>Hola, ${esc(d.nombre)}:</p>` +
        "<p>Gracias por su interés en i’Witown. Hemos recibido su solicitud y nos pondremos en " +
        "contacto para explorar los siguientes pasos.</p><p>Equipo i’Witown · GMG-LATAM</p>"
    }
  });
  await lote.commit();

  return res.json({ ok: true });
});
