/* ============================================================
   i'Witown — Agendar la reunión, con calendario propio
   ============================================================

   El botón "Reunión por Teams" ya NO abre la sala: abre un recuadro
   con nuestro calendario. El visitante escoge un día, luego una hora,
   deja cuatro datos y queda agendado, sin salir de la página.

   No se usa la página de citas de Google (la cobran) ni un iframe de
   nadie: los cupos los da nuestra Cloud Function.

   ┌──────────────────────────────────────────────────────────┐
   │  CÓMO FUNCIONA                                           │
   │                                                          │
   │  1. Al abrir, se piden los cupos libres a /api/horas.    │
   │  2. La persona toca un día y luego una hora.             │
   │  3. Llena nombre, correo, celular y colegio.             │
   │  4. /api/agendar reserva el cupo y manda la invitación   │
   │     por correo, a ella y a nosotros.                     │
   │                                                          │
   │  Las horas libres NO se deciden acá: están en AGENDA,    │
   │  en functions/src/handlers/landingAgenda.js del repo     │
   │  witown-cloud-functions.                                 │
   │                                                          │
   │  Si el calendario no responde, el recuadro ofrece        │
   │  WhatsApp en vez de dejar a la persona mirando un hueco. │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

(function () {
  var caja = document.getElementById("teamsCaja");
  if (!caja) return;

  var cerrar = document.getElementById("teamsCerrar");
  var aviso  = document.getElementById("teamsAviso");
  var hueco  = document.getElementById("teamsAgenda");

  var deDonde  = null;
  var cargado  = false;
  var dias     = [];
  var diaAbierto = null;
  var cupoElegido = null;

  /* Lo que la persona ya escribio. Se guarda porque si el cupo se lo lleva
     otro mientras llenaba, hay que volver a pintar el calendario y seria
     inaceptable que perdiera los cuatro campos. */
  var escrito = {};

  /* ---- Hablar con el servidor ---- */

  function pedirHoras(avisoFinal) {
    if (aviso) { aviso.textContent = "Buscando horas libres…"; aviso.className = "teams__aviso"; }

    fetch("/api/horas", { headers: { "Accept": "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok || !d.dias || !d.dias.length) {
          sinCalendario("Por ahora no tenemos horas libres. Escríbenos por WhatsApp y buscamos un espacio.");
          return;
        }
        dias = d.dias;
        cargado = true;
        pintarDias();
        /* El aviso se repone al final: si se pierde un cupo, el mensaje que
           explica por que cambio la pantalla tiene que seguir ahi. */
        if (aviso) {
          aviso.textContent = avisoFinal || "";
          aviso.className = "teams__aviso" + (avisoFinal ? " es-error" : "");
        }
      })
      .catch(function () {
        sinCalendario("No pudimos cargar el calendario. Escríbenos por WhatsApp y acordamos la hora.");
      });
  }

  function agendar(datos, boton) {
    if (boton) { boton.disabled = true; boton.textContent = "Agendando…"; }

    fetch("/api/agendar", {
      method: "POST",
      body: new URLSearchParams(datos)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          pintarListo(d.mensaje);
          return;
        }
        if (boton) { boton.disabled = false; boton.textContent = "Agendar la reunión"; }
        var mensaje = (d && d.mensaje) || "No pudimos agendar. Intenta de nuevo.";
        if (aviso) {
          aviso.textContent = mensaje;
          aviso.className = "teams__aviso es-error";
        }
        /* Si el cupo se lo llevó otro, se vuelven a pedir las horas, pero el
           mensaje se conserva y los datos escritos también. */
        if (d && d.recargar) { cargado = false; pedirHoras(mensaje); }
      })
      .catch(function () {
        if (boton) { boton.disabled = false; boton.textContent = "Agendar la reunión"; }
        if (aviso) {
          aviso.textContent = "No pudimos agendar. Escríbenos por WhatsApp y lo cerramos ahí mismo.";
          aviso.className = "teams__aviso es-error";
        }
      });
  }

  /* ---- Lo que se ve ---- */

  function sinCalendario(texto) {
    if (aviso) aviso.textContent = "";
    hueco.innerHTML = "";

    var p = document.createElement("p");
    p.className = "teams__sinagenda";
    p.textContent = texto;
    hueco.appendChild(p);

    var wa = document.createElement("a");
    wa.className = "btn btn--wa btn--bloque";
    wa.textContent = "Agendar por WhatsApp";
    wa.href = "#";
    if (typeof window.WHATSAPP === "string" && window.WHATSAPP) {
      wa.href = "https://wa.me/" + window.WHATSAPP + "?text=" +
        encodeURIComponent("Hola, quiero agendar una reunión para conocer i'Witown.");
      wa.target = "_blank";
      wa.rel = "noopener";
    }
    hueco.appendChild(wa);
  }

  function pintarDias() {
    hueco.innerHTML = "";
    cupoElegido = null;

    var titulo = document.createElement("p");
    titulo.className = "agenda__paso";
    titulo.textContent = "1. Escoge el día";
    hueco.appendChild(titulo);

    var lista = document.createElement("div");
    lista.className = "agenda__dias";

    dias.forEach(function (dia) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "agenda__dia" + (diaAbierto === dia.fecha ? " es-elegido" : "");
      b.innerHTML = '<span class="agenda__diaRotulo">' + dia.rotulo + "</span>" +
                    '<span class="agenda__diaCupos">' + dia.horas.length +
                    (dia.horas.length === 1 ? " hora" : " horas") + "</span>";
      b.addEventListener("click", function () {
        diaAbierto = (diaAbierto === dia.fecha) ? null : dia.fecha;
        pintarDias();
      });
      lista.appendChild(b);
    });

    hueco.appendChild(lista);

    if (diaAbierto) {
      var dia = dias.filter(function (d) { return d.fecha === diaAbierto; })[0];
      if (dia) pintarHoras(dia);
    }
  }

  function pintarHoras(dia) {
    var paso = document.createElement("p");
    paso.className = "agenda__paso";
    paso.textContent = "2. Escoge la hora — " + dia.rotulo;
    hueco.appendChild(paso);

    var lista = document.createElement("div");
    lista.className = "agenda__horas";

    dia.horas.forEach(function (hora) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "agenda__hora";
      b.textContent = hora.rotulo;
      b.addEventListener("click", function () {
        cupoElegido = hora;
        pintarFormulario(dia, hora);
      });
      lista.appendChild(b);
    });

    hueco.appendChild(lista);
  }

  /* Guarda lo que haya en el formulario, para reponerlo si hay que repintar. */
  function recordar(forma) {
    ["nombre", "celular", "correo", "colegio"].forEach(function (campo) {
      var input = forma.querySelector("input[name=" + campo + "]");
      if (input) escrito[campo] = String(input.value || "").trim();
    });
  }

  function pintarFormulario(dia, hora) {
    hueco.innerHTML = "";

    var paso = document.createElement("p");
    paso.className = "agenda__paso";
    paso.textContent = "3. Tus datos";
    hueco.appendChild(paso);

    var elegido = document.createElement("p");
    elegido.className = "agenda__elegido";
    elegido.innerHTML = "Reunión el <strong>" + dia.rotulo + "</strong> a las <strong>" +
                        hora.rotulo + "</strong> (hora de Colombia). " +
                        '<button type="button" class="agenda__cambiar">Cambiar</button>';
    hueco.appendChild(elegido);

    elegido.querySelector(".agenda__cambiar").addEventListener("click", function () {
      /* Se guarda lo escrito ANTES de repintar: si no, quien cambia la hora a
         mitad de camino pierde los cuatro campos que acababa de llenar. */
      recordar(forma);
      if (aviso) { aviso.textContent = ""; aviso.className = "teams__aviso"; }
      pintarDias();
    });

    var forma = document.createElement("form");
    forma.className = "agenda__forma";
    forma.noValidate = true;
    forma.innerHTML =
      '<div class="miel" aria-hidden="true">' +
      '<label>No llenar este campo <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
      "</div>" +
      '<div class="agenda__campos">' +
      '<label class="agenda__campo"><span>Nombre</span>' +
      '<input type="text" name="nombre" maxlength="120" autocomplete="name" required></label>' +
      '<label class="agenda__campo"><span>Celular</span>' +
      '<input type="tel" name="celular" maxlength="30" autocomplete="tel" required></label>' +
      '<label class="agenda__campo agenda__campo--ancho"><span>Correo</span>' +
      '<input type="email" name="correo" maxlength="150" autocomplete="email" required></label>' +
      '<label class="agenda__campo agenda__campo--ancho"><span>Colegio</span>' +
      '<input type="text" name="colegio" maxlength="150" autocomplete="organization" required></label>' +
      "</div>" +
      '<button type="submit" class="btn btn--morado btn--bloque">Agendar la reunión</button>';

    hueco.appendChild(forma);

    /* Se repone lo que ya habia escrito, si vuelve por acá. */
    ["nombre", "celular", "correo", "colegio"].forEach(function (campo) {
      if (escrito[campo]) {
        var input = forma.querySelector("input[name=" + campo + "]");
        if (input) input.value = escrito[campo];
      }
    });

    var primero = forma.querySelector("input[name=nombre]");
    if (primero) window.setTimeout(function () { primero.focus(); }, 60);

    forma.addEventListener("submit", function (e) {
      e.preventDefault();

      var datos = new FormData(forma);
      recordar(forma);

      var falta = [];
      if (!String(datos.get("nombre") || "").trim())  falta.push("tu nombre");
      if (!String(datos.get("celular") || "").trim()) falta.push("tu celular");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(datos.get("correo") || ""))) falta.push("un correo válido");
      if (!String(datos.get("colegio") || "").trim()) falta.push("el colegio");

      if (falta.length) {
        if (aviso) {
          aviso.textContent = "Falta " + falta.join(", ") + ".";
          aviso.className = "teams__aviso es-error";
        }
        return;
      }

      if (aviso) { aviso.textContent = ""; aviso.className = "teams__aviso"; }

      datos.set("cupo", cupoElegido ? cupoElegido.llave : "");
      agendar(datos, forma.querySelector("button[type=submit]"));
    });
  }

  function pintarListo(mensaje) {
    hueco.innerHTML = "";
    if (aviso) { aviso.textContent = ""; aviso.className = "teams__aviso"; }

    var p = document.createElement("p");
    p.className = "agenda__listo";
    p.textContent = mensaje || "Listo, quedaste agendado. Te mandamos la invitación al correo.";
    hueco.appendChild(p);

    var nota = document.createElement("p");
    nota.className = "teams__sinagenda";
    nota.textContent = "En el correo va la invitación: al aceptarla, la reunión queda en tu calendario con el enlace adentro.";
    hueco.appendChild(nota);

    var listo = document.createElement("button");
    listo.type = "button";
    listo.className = "btn btn--morado btn--bloque";
    listo.textContent = "Cerrar";
    listo.addEventListener("click", cerrarla);
    hueco.appendChild(listo);

    /* Ya no se puede volver a agendar sin recargar los cupos, y lo escrito
       deja de hacer falta. */
    cargado = false;
    escrito = {};
    cupoElegido = null;
    diaAbierto = null;
  }

  /* ---- Abrir y cerrar ---- */

  function abrir(desde) {
    deDonde = desde || null;
    caja.hidden = false;
    document.body.classList.add("con-lupa");     // la misma llave que usa el visor

    /* Un aviso del intento anterior no puede seguir ahi al reabrir. */
    if (aviso) { aviso.textContent = ""; aviso.className = "teams__aviso"; }

    if (!cargado) {
      hueco.innerHTML = "";
      pedirHoras();
    }

    if (cerrar) window.setTimeout(function () { cerrar.focus(); }, 60);
  }

  function cerrarla() {
    caja.hidden = true;
    document.body.classList.remove("con-lupa");
    if (deDonde) { deDonde.focus(); deDonde = null; }
  }

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
    if (caja.hidden) return;

    if (e.key === "Escape") { cerrarla(); return; }

    /* El recuadro es un diálogo y ahora tiene un formulario adentro: el
       tabulador tiene que dar vueltas dentro y no irse a la página de
       detrás, que sigue ahí y no se ve. */
    if (e.key !== "Tab") return;

    var tarjeta = caja.querySelector(".teams__tarjeta");
    if (!tarjeta) return;

    var focales = tarjeta.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focales.length) return;

    var primero = focales[0];
    var ultimo  = focales[focales.length - 1];

    var dentro = tarjeta.contains(document.activeElement);

    if (!dentro) {
      /* El foco venia de fuera (o del body, en los milisegundos de apertura):
         el primer Tab entra al recuadro en vez de irse a la pagina de detras. */
      e.preventDefault();
      (e.shiftKey ? ultimo : primero).focus();
      return;
    }

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });
})();
