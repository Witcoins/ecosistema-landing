/* ============================================================
   i'Witown — El paso previo a la reunión de Teams
   ============================================================

   Antes de entrar a la reunión se piden cuatro datos. Al enviarlos,
   la reunión se abre DE UNA VEZ en otra pestaña y, por detrás,
   agendar-teams.php manda dos correos: uno a nosotros y otro a la
   persona, con el enlace.

   ┌──────────────────────────────────────────────────────────┐
   │  POR QUÉ LA REUNIÓN SE ABRE ANTES DE SABER SI EL CORREO  │
   │  SALIÓ                                                   │
   │                                                          │
   │  Los navegadores solo dejan abrir una pestaña nueva      │
   │  mientras la persona está tocando algo. Si esperáramos   │
   │  la respuesta del servidor, ese permiso ya se habría     │
   │  vencido y la pestaña saldría bloqueada.                 │
   │                                                          │
   │  Así que se abre primero y el correo va por detrás. Si   │
   │  el correo falla, la persona igual entra a la reunión,   │
   │  que es lo que vino a hacer; el error queda en el log    │
   │  del servidor.                                           │
   └──────────────────────────────────────────────────────────┘

   A dónde se mandan los datos: agendar-teams.php, en la raíz.
   El enlace de la reunión está arriba de js/script.js (TEAMS) y
   también dentro de ese PHP, para el correo.
   ============================================================ */

(function () {
  var caja   = document.getElementById("teamsCaja");
  var forma  = document.getElementById("teamsForma");
  if (!caja || !forma) return;

  var cerrar = document.getElementById("teamsCerrar");
  var aviso  = document.getElementById("teamsAviso");
  var boton  = document.getElementById("teamsEnviar");

  var deDonde = null;

  /* ---- Abrir y cerrar ---- */

  function abrir(desde) {
    deDonde = desde || null;
    caja.hidden = false;
    document.body.classList.add("con-lupa");     // la misma llave que usa el visor

    if (aviso) { aviso.textContent = ""; aviso.className = "teams__aviso"; }

    var primero = forma.querySelector("input");
    if (primero) window.setTimeout(function () { primero.focus(); }, 60);
  }

  function cerrarla() {
    caja.hidden = true;
    document.body.classList.remove("con-lupa");
    if (deDonde) { deDonde.focus(); deDonde = null; }
  }

  /* El botón de Teams ya no lleva directo a la reunión: abre esto */
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-teams]") : null;
    if (b && !b.classList.contains("esta-apagado")) {
      e.preventDefault();
      abrir(b);
      return;
    }
    if (!caja.hidden && (e.target === caja || (cerrar && cerrar.contains(e.target)))) cerrarla();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !caja.hidden) cerrarla();
  });

  /* ---- La hora: de aquí en adelante, y por defecto mañana ---- */

  var cuando = document.getElementById("teamsCuando");
  if (cuando) {
    var ahora = new Date();
    var manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    manana.setHours(9, 0, 0, 0);

    cuando.min = comoTexto(ahora);
    cuando.value = comoTexto(manana);
  }

  function comoTexto(d) {
    function dos(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()) +
           "T" + dos(d.getHours()) + ":" + dos(d.getMinutes());
  }

  /* ---- Enviar ---- */

  forma.addEventListener("submit", function (e) {
    e.preventDefault();

    var datos = new FormData(forma);
    var falta = [];
    if (!String(datos.get("nombre") || "").trim())  falta.push("tu nombre");
    if (!String(datos.get("celular") || "").trim()) falta.push("tu celular");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(datos.get("correo") || ""))) falta.push("un correo válido");
    if (!String(datos.get("cuando") || "").trim()) falta.push("el día y la hora");

    if (falta.length) {
      if (aviso) {
        aviso.textContent = "Falta " + falta.join(", ") + ".";
        aviso.className = "teams__aviso es-error";
      }
      return;
    }

    /* La reunión se abre ya, mientras todavía vale el toque de la
       persona. Si no, el navegador bloquearía la pestaña. */
    var destino = (typeof window.TEAMS === "string" && window.TEAMS) ? window.TEAMS : "";
    if (destino) window.open(destino, "_blank", "noopener");

    if (boton) { boton.disabled = true; boton.textContent = "Entrando…"; }
    if (aviso) {
      aviso.textContent = "Listo. Se abrió la reunión en otra pestaña.";
      aviso.className = "teams__aviso es-bien";
    }

    fetch("agendar-teams.php", { method: "POST", body: datos })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (aviso && d && d.mensaje) {
          aviso.textContent = "Listo. " + d.mensaje;
          aviso.className = "teams__aviso " + (d.ok ? "es-bien" : "es-error");
        }
      })
      .catch(function () {
        /* Sin correo, pero la reunión ya está abierta: no hay por qué
           asustar a nadie con un error técnico. */
      })
      .then(function () {
        window.setTimeout(function () {
          if (boton) { boton.disabled = false; boton.textContent = "Ingresar a Teams"; }
          cerrarla();
          forma.reset();
          if (cuando) cuando.value = comoTexto(new Date(Date.now() + 24 * 60 * 60 * 1000));
        }, 2200);
      });
  });
})();
