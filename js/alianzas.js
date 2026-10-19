/* ============================================================
   i'Witown — Alianzas educativas: el formulario y la medición
   ============================================================

   La página /alianzas-educativas tiene un solo objetivo: que una
   asociación o red de colegios pida una reunión institucional.
   Este archivo hace tres cosas:

   1. Envía el formulario #formAlianza a /api/alianza sin recargar
      la página (lo atiende la función landingAlianza del repo
      witown-cloud-functions; el contrato está en ALIANZAS.md).
   2. Guarda los utm_* con los que llegó la visita (los enlaces de
      los correos de la campaña los traen) y los manda con el
      formulario, para saber qué correo trajo cada solicitud.
   3. Mide en GA4 los clics en los botones y los envíos.

   ┌──────────────────────────────────────────────────────────┐
   │  LA MEDICIÓN RESPETA EL PERMISO DE COOKIES               │
   │                                                          │
   │  Solo se mide si la persona aceptó: js/analitica.js crea │
   │  window.gtag únicamente en ese caso. Si no existe, aquí  │
   │  no se mide nada. Las visitas a /alianzas-educativas las │
   │  cuenta GA4 solo, por la ruta: no se mandan a mano.      │
   │                                                          │
   │  Eventos que se mandan:                                  │
   │    ali_cta_clic   { boton: "portada" | "final" | ... }   │
   │    generate_lead  { origen: "alianzas-educativas", pais, │
   │                     tipo_organizacion, colegios }        │
   │    (con "Otro", pais es el país que escribió)            │
   │  Para verlos como conversión: GA4 → Administrar →        │
   │  Eventos → marcar generate_lead como evento clave.       │
   └──────────────────────────────────────────────────────────┘

   Los textos que ve la persona están aquí arriba.
   ============================================================ */

var ALI_GRACIAS = "Gracias por su interés en i’Witown. Hemos recibido su solicitud y nos " +
  "pondremos en contacto para explorar los siguientes pasos.";
var ALI_REVISAR = "Revise los campos marcados en rojo.";
var ALI_FALLA = "No pudimos enviar la solicitud. Escríbanos a contacto@iwitown.com o por " +
  "WhatsApp y la atendemos de inmediato.";

(function () {

  /* ---- Medición ---- */

  function medir(evento, datos) {
    if (typeof window.gtag !== "function") return;
    try { window.gtag("event", evento, datos || {}); } catch (e) {}
  }

  /* ---- Los utm_* de la visita ----

     Se leen al cargar, porque al navegar por dentro de la página
     js/vistas.js cambia la dirección y la consulta (?utm_...) se
     pierde. Se guardan en sessionStorage por si la persona da una
     vuelta por otras vistas y vuelve. */

  var UTM = ["utm_source", "utm_medium", "utm_campaign"];
  var LLAVE_UTM = "iwitown-ali-utm";
  var utm = {};

  try { utm = JSON.parse(window.sessionStorage.getItem(LLAVE_UTM) || "{}") || {}; } catch (e) { utm = {}; }

  try {
    var consulta = new URLSearchParams(window.location.search);
    var hayNuevos = false;
    UTM.forEach(function (k) {
      var v = consulta.get(k);
      if (v) { utm[k] = v.slice(0, 100); hayNuevos = true; }
    });
    if (hayNuevos) window.sessionStorage.setItem(LLAVE_UTM, JSON.stringify(utm));
  } catch (e) {}

  /* ---- Los clics en los botones ----

     Cualquier elemento con data-ali-cta cuenta como clic. Si además
     tiene data-ali-interes, deja marcada esa opción del formulario
     (por ejemplo, "Solicitar una demostración" marca "demostración").
     No se detiene el clic: la navegación la sigue haciendo vistas.js. */

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("[data-ali-cta]") : null;
    if (!b) return;

    medir("ali_cta_clic", { boton: b.getAttribute("data-ali-cta") });

    var interes = b.getAttribute("data-ali-interes");
    if (interes) {
      var casilla = document.querySelector('#formAlianza input[name="interes"][value="' + interes + '"]');
      if (casilla) casilla.checked = true;
    }
  });

  /* ---- El formulario ---- */

  var form = document.getElementById("formAlianza");
  if (!form) return;

  var msg = document.getElementById("aliMsg");
  var btn = document.getElementById("aliEnviar");
  var textoBtn = btn.textContent;
  var pais = document.getElementById("aliPais");
  var paisOtroCampo = document.getElementById("aliPaisOtroCampo");
  var paisOtro = document.getElementById("aliPaisOtro");
  var intereses = document.getElementById("aliIntereses");

  function rellenarUtm() {
    UTM.forEach(function (k) {
      var campo = form.querySelector('input[name="' + k + '"]');
      if (campo) campo.value = utm[k] || "";
    });
  }
  rellenarUtm();

  /* "¿Cuál país?" solo aparece, y solo es obligatorio, con "Otro" */
  function alCambiarPais() {
    var esOtro = pais.value === "otro";
    paisOtroCampo.hidden = !esOtro;
    paisOtro.required = esOtro;
    if (!esOtro) { paisOtro.value = ""; paisOtro.classList.remove("error"); }
  }
  pais.addEventListener("change", alCambiarPais);
  alCambiarPais();

  function mostrar(texto, clase) {
    msg.textContent = texto;
    msg.className = "form-msg " + clase;
  }

  function validar() {
    var ok = true;
    var requeridos = form.querySelectorAll("[required]");

    for (var i = 0; i < requeridos.length; i++) {
      var campo = requeridos[i];
      var vacio = campo.type === "checkbox" ? !campo.checked : !campo.value.trim();
      var malCorreo = campo.type === "email" && campo.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim());
      /* Con código de país: al menos 8 dígitos en total */
      var malTel = campo.type === "tel" && campo.value &&
        campo.value.replace(/\D/g, "").length < 8;

      if (vacio || malCorreo || malTel) {
        campo.classList.add("error");
        ok = false;
      } else {
        campo.classList.remove("error");
      }
    }

    /* Al menos una opción de "¿Qué le gustaría explorar?" */
    var alguno = form.querySelector('input[name="interes"]:checked');
    intereses.classList.toggle("error", !alguno);
    if (!alguno) ok = false;

    return ok;
  }

  form.addEventListener("input", function (e) {
    if (e.target.classList) e.target.classList.remove("error");
    if (e.target.name === "interes") intereses.classList.remove("error");
  });
  form.addEventListener("change", function (e) {
    if (e.target.name === "interes") intereses.classList.remove("error");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validar()) {
      mostrar(ALI_REVISAR, "falla");
      var primerError = form.querySelector(".error input, input.error, select.error");
      if (primerError) primerError.focus();
      return;
    }

    rellenarUtm();
    btn.disabled = true;
    btn.textContent = "Enviando…";
    mostrar("", "");

    var datos = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: new URLSearchParams(datos),
      headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" }
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      })
      .then(function (data) {
        if (data && data.ok) {
          medir("generate_lead", {
            origen: "alianzas-educativas",
            /* Con "Otro", el país que escribió: si no, en GA4 todos
               los de fuera de México y Perú saldrían como "otro". */
            pais: datos.get("pais") === "otro"
              ? (datos.get("pais_otro") || "otro").trim().slice(0, 60)
              : datos.get("pais"),
            tipo_organizacion: datos.get("tipo_organizacion"),
            colegios: datos.get("colegios")
          });
          form.reset();
          alCambiarPais();
          form.classList.add("is-enviado");     // esconde los campos (css/alianzas.css)
          mostrar(ALI_GRACIAS, "ok ali-gracias");
          msg.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          mostrar((data && data.mensaje) || ALI_FALLA, "falla");
        }
      })
      .catch(function () {
        mostrar(ALI_FALLA, "falla");
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = textoBtn;
      });
  });
})();
