/* ============================================================
   i'Witown — El recuadro de la reunión
   ============================================================

   El botón "Reunión por Teams" abre un recuadro con dos caminos:

     ENTRAR AHORA  → se le avisa de que lo mandamos a la sala en
                     este momento, deja nombre, celular y correo, y
                     al confirmar se abre Teams en otra pestaña.
                     Por detrás, /api/sala nos avisa de que hay
                     alguien esperando.

     CALENDARIO    → escoge día, escoge hora y deja sus datos.
                     /api/horas da los cupos y /api/agendar reserva.
                     Cada paso se encoge cuando se resuelve, para que
                     se vea dónde va y pueda devolverse.

   ┌──────────────────────────────────────────────────────────┐
   │  POR QUÉ LA SALA SE ABRE ANTES DE AVISAR                 │
   │                                                          │
   │  Los navegadores solo dejan abrir una pestaña mientras   │
   │  la persona está tocando algo. Si esperáramos la         │
   │  respuesta del servidor, ese permiso ya se habría        │
   │  vencido y la pestaña saldría bloqueada. Por eso se      │
   │  abre primero y el aviso va por detrás: si el aviso      │
   │  falla, la persona igual entra, que es lo que vino a     │
   │  hacer.                                                  │
   └──────────────────────────────────────────────────────────┘

   El enlace de la sala está acá y también en ENLACE_TEAMS de
   landingAgenda.js y landingSala.js (witown-cloud-functions): acá
   porque la pestaña se abre desde el navegador, allá porque es el
   que va en la invitación y en el aviso. Si se cambia la sala, se
   cambia en los tres.
   ============================================================ */

var SALA_TEAMS = "https://teams.microsoft.com/meet/2171674064633?p=43SvylWLRpzrCnfPHb";

(function () {
  var caja = document.getElementById("teamsCaja");
  if (!caja) return;

  var cerrar = document.getElementById("teamsCerrar");
  var aviso  = document.getElementById("teamsAviso");
  var hueco  = document.getElementById("teamsAgenda");
  var titulo = document.getElementById("teamsTitulo");
  var bajada = document.getElementById("teamsBajada");

  var deDonde = null;
  var cargado = false;
  var dias    = [];

  var diaElegido  = null;   // { fecha, rotulo, horas }
  var horaElegida = null;   // { llave, rotulo }

  /* Lo que ya escribió. Se guarda para no hacérselo teclear otra vez si
     cambia de hora, o si el cupo se lo lleva otro mientras llenaba. */
  var escrito = {};

  var CAMPOS_AGENDA = ["nombre", "celular", "correo", "colegio"];
  var CAMPOS_SALA   = ["nombre", "celular", "correo"];

  /* ---- Cositas de siempre ---- */

  function decir(texto, clase) {
    if (!aviso) return;
    aviso.textContent = texto || "";
    aviso.className = "teams__aviso" + (clase ? " " + clase : "");
  }

  function vaciar() {
    hueco.innerHTML = "";
  }

  /* El encabezado cambia con el paso. Importa por accesibilidad: el recuadro es
     `aria-labelledby="teamsTitulo"`, asi que un lector de pantalla anuncia ese
     texto, y dejarlo en "¿Hablamos ahora o lo agendamos?" mientras la persona
     llena un formulario no le dice nada de donde esta. */
  function encabezado(queDice, subtexto) {
    if (titulo) titulo.textContent = queDice;
    if (bajada) bajada.textContent = subtexto;
  }

  function nuevo(etiqueta, clase, texto) {
    var e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto) e.textContent = texto;
    return e;
  }

  function recordar(forma) {
    CAMPOS_AGENDA.forEach(function (campo) {
      var input = forma.querySelector("input[name=" + campo + "]");
      if (input) escrito[campo] = String(input.value || "").trim();
    });
  }

  /* El renglón de un paso ya resuelto: se encoge y deja el botón de volver. */
  function pasoHecho(rotulo, valor, alVolver) {
    var fila = nuevo("div", "agenda__hecho");

    var texto = nuevo("span", "agenda__hechoTexto");
    texto.innerHTML = "<strong>" + rotulo + "</strong> " + valor;
    fila.appendChild(texto);

    var volver = nuevo("button", "agenda__cambiar", "Cambiar");
    volver.type = "button";
    volver.addEventListener("click", alVolver);
    fila.appendChild(volver);

    return fila;
  }

  function armarCampos(forma, campos) {
    var rejilla = nuevo("div", "agenda__campos");

    var rotulos = {
      nombre:  ["Nombre", "text", "name"],
      celular: ["Celular / WhatsApp", "tel", "tel"],
      correo:  ["Correo", "email", "email"],
      colegio: ["Colegio", "text", "organization"]
    };

    campos.forEach(function (campo) {
      var d = rotulos[campo];
      var label = nuevo("label", "agenda__campo" + (campo === "correo" || campo === "colegio" ? " agenda__campo--ancho" : ""));
      label.innerHTML = "<span>" + d[0] + "</span>" +
        '<input type="' + d[1] + '" name="' + campo + '" maxlength="150" autocomplete="' + d[2] + '" required>';
      rejilla.appendChild(label);
    });

    forma.appendChild(rejilla);

    campos.forEach(function (campo) {
      if (!escrito[campo]) return;
      var input = forma.querySelector("input[name=" + campo + "]");
      if (input) input.value = escrito[campo];
    });
  }

  function armarMiel(forma) {
    var miel = nuevo("div", "miel");
    miel.setAttribute("aria-hidden", "true");
    miel.innerHTML = '<label>No llenar este campo ' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
    forma.appendChild(miel);
  }

  function faltantes(datos, campos) {
    var falta = [];
    campos.forEach(function (campo) {
      var v = String(datos.get(campo) || "").trim();
      if (campo === "correo") {
        /* El mismo patrón que el servidor: si el cliente fuera más permisivo,
           la persona pasaría de aquí y el servidor la rechazaría con un 422
           cuando ya se le abrió la sala de Teams. */
        if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(v)) falta.push("un correo válido");
      } else if (v === "") {
        falta.push(campo === "nombre" ? "tu nombre" :
                   campo === "celular" ? "tu celular" : "el " + campo);
      }
    });
    return falta;
  }

  /* ---- Paso 0: los dos caminos ---- */

  function pintarCaminos() {
    vaciar();
    decir("");
    mesVisible = 0;
    encabezado("¿Hablamos ahora o lo agendamos?",
      "Si entras ahora, te avisamos a nosotros y alguien se conecta contigo en un " +
      "momento. Si prefieres, escoge el día y la hora que te sirva.");

    var lista = nuevo("div", "agenda__caminos");

    var ya = nuevo("button", "agenda__camino agenda__camino--ya");
    ya.type = "button";
    ya.innerHTML = '<strong>Entrar a la reunión ahora</strong>' +
      "<em>Te llevamos a la sala en este momento y avisamos que llegaste</em>";
    ya.addEventListener("click", pintarSala);
    lista.appendChild(ya);

    var luego = nuevo("button", "agenda__camino");
    luego.type = "button";
    luego.innerHTML = "<strong>Agendar para después</strong>" +
      "<em>Escoge el día y la hora que te sirva</em>";
    /* Envuelto a proposito: pasarle la funcion directa le entregaria el evento
       del clic como primer argumento, y ese argumento ahora es el mensaje de
       aviso. Saldria un "[object MouseEvent]" en rojo. */
    luego.addEventListener("click", function () { abrirCalendario(); });
    lista.appendChild(luego);

    hueco.appendChild(lista);
  }

  /* ---- Camino 1: entrar ahora ---- */

  function pintarSala() {
    vaciar();
    decir("");
    encabezado("Entras a la reunión ahora mismo",
      "Déjanos tu nombre y cómo podemos contactarte. Te abrimos la sala.");

    hueco.appendChild(pasoHecho("Vas a entrar:", "ahora mismo", pintarCaminos));

    var caja2 = nuevo("div", "agenda__sala");
    caja2.innerHTML =
      "<p><strong>Al confirmar se abre la sala de Teams en otra pestaña</strong>, y " +
      "nos llega un aviso de que estás esperando. Alguien se conecta contigo en un momento.</p>" +
      "<p class=\"agenda__salaNota\">Estaremos atentos. Si la conexión falla, te " +
      "contactamos por WhatsApp o el correo que dejes aquí.</p>";
    hueco.appendChild(caja2);

    var forma = nuevo("form", "agenda__forma");
    forma.noValidate = true;
    armarMiel(forma);
    armarCampos(forma, CAMPOS_SALA);

    var boton = nuevo("button", "btn btn--morado btn--bloque", "Entrar a la reunión ahora");
    boton.type = "submit";
    forma.appendChild(boton);
    hueco.appendChild(forma);

    var primero = forma.querySelector("input[name=nombre]");
    if (primero) window.setTimeout(function () { primero.focus(); }, 60);

    forma.addEventListener("submit", function (e) {
      e.preventDefault();

      var datos = new FormData(forma);
      recordar(forma);

      var falta = faltantes(datos, CAMPOS_SALA);
      if (falta.length) {
        decir("Falta " + falta.join(", ") + ".", "es-error");
        return;
      }

      /* La sala se abre YA, mientras todavía vale el toque de la persona:
         si esperáramos la respuesta, el navegador bloquearía la pestaña.

         Se mira lo que devuelve: si el bloqueador de ventanas la frenó (en el
         iPhone viene activo de fábrica), `pestana` es null y hay que dejarle un
         enlace en pantalla. Sin eso, nosotros recibimos el aviso de que alguien
         espera, entramos, y no hay nadie: el peor final posible. */
      var pestana = window.open(SALA_TEAMS, "_blank", "noopener");

      boton.disabled = true;
      boton.textContent = "Avisando…";

      fetch("/api/sala", { method: "POST", body: new URLSearchParams(datos) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) {
            pintarListo(d.mensaje || "Listo, ya estás en la sala.",
              pestana ? "Se abrió la reunión en otra pestaña."
                      : "Abre la sala con el botón de abajo.",
              !pestana);
            return;
          }
          /* Respondió que algo falta: la sala ya se abrió, pero NADIE fue
             avisado. Decírselo, y dejarle WhatsApp como salida. */
          pintarListo("Estás en la sala, pero no pudimos avisar que llegaste.",
            ((d && d.mensaje) ? d.mensaje + " " : "") +
            "Escríbenos por WhatsApp para que alguien entre de una.",
            true, true);
        })
        .catch(function () {
          /* La sala ya está abierta: no se le muestra un error técnico, pero
             tampoco se le promete un aviso que no sabemos si salió. */
          pintarListo("Estás en la sala.",
            "Si en un par de minutos no ves a nadie, escríbenos por WhatsApp y te " +
            "atendemos de una.",
            !pestana, true);
        });
    });
  }

  /* ---- Camino 2: el calendario ---- */

  /* `avisoFinal` es el mensaje que tiene que quedar en pie DESPUÉS de pintar:
     cuando un cupo se lo lleva otro, la pantalla salta sola a la lista de días y
     sin esto la explicación se borraría y la persona no sabría qué pasó. */
  function abrirCalendario(avisoFinal) {
    diaElegido = null;
    horaElegida = null;

    if (cargado) {
      pintarDias();
      if (avisoFinal) decir(avisoFinal, "es-error");
      return;
    }

    vaciar();
    decir("Buscando horas libres…");

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
        decir(avisoFinal || "", avisoFinal ? "es-error" : "");
      })
      .catch(function () {
        sinCalendario("No pudimos cargar el calendario. Escríbenos por WhatsApp y acordamos la hora.");
      });
  }

  function sinCalendario(texto) {
    vaciar();
    decir("");

    hueco.appendChild(pasoHecho("Agendar:", "para después", pintarCaminos));
    hueco.appendChild(nuevo("p", "teams__sinagenda", texto));

    var wa = nuevo("a", "btn btn--wa btn--bloque", "Agendar por WhatsApp");
    wa.href = "#";
    if (typeof window.WHATSAPP === "string" && window.WHATSAPP) {
      wa.href = "https://wa.me/" + window.WHATSAPP + "?text=" +
        encodeURIComponent("Hola, quiero agendar una reunión para conocer i'Witown.");
      wa.target = "_blank";
      wa.rel = "noopener";
    }
    hueco.appendChild(wa);
  }

  /* Paso 1: el día, en rejilla de calendario.

     Se pinta como un calendario de verdad —semanas en filas, días en columnas—
     y no como la lista de botones del camino de Teams, para que se vean
     distintos de un golpe: uno es "entro ya", el otro es "escojo cuándo".

     Se muestran DOS meses: el que corre y el siguiente, uno a la vez, y se pasa
     de uno a otro con las flechas. Cada mes sale completo, con sus días sin
     cupo apagados, porque un mes al que le faltan días no se lee como un mes.

     Los cupos los pone el servidor y hoy alcanzan tres semanas: el mes
     siguiente casi siempre tendrá pocos días disponibles, o ninguno, y por eso
     su flecha se apaga cuando no hay nada que mirar allá. */

  var DIAS_CORTOS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  /* Qué mes se está mirando: 0 = el del primer cupo, 1 = el siguiente. */
  var mesVisible = 0;

  /* Las fechas llegan como "2026-09-22". Se parten a mano en vez de usar
     new Date("2026-09-22"): eso se interpreta como medianoche UTC y en Colombia
     (UTC-5) devolvería el día anterior. */
  function comoUtc(fecha) {
    var p = String(fecha).split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }

  function comoTexto(d) {
    function dos(n) { return (n < 10 ? "0" : "") + n; }
    return d.getUTCFullYear() + "-" + dos(d.getUTCMonth() + 1) + "-" + dos(d.getUTCDate());
  }

  /* Lunes = 0 … domingo = 6, que es como se leen los calendarios de por acá. */
  function columnaDe(d) {
    return (d.getUTCDay() + 6) % 7;
  }

  /* Los dos meses que se pueden mirar, a partir del primer cupo que haya. */
  function mesesDelCalendario() {
    var base = comoUtc(dias[0].fecha);
    return [
      { anio: base.getUTCFullYear(), mes: base.getUTCMonth() },
      { anio: base.getUTCMonth() === 11 ? base.getUTCFullYear() + 1 : base.getUTCFullYear(),
        mes: (base.getUTCMonth() + 1) % 12 }
    ];
  }

  function pintarDias() {
    vaciar();
    horaElegida = null;
    encabezado("Escoge el día", "Los días en morado son los que tienen horas libres.");

    hueco.appendChild(pasoHecho("Agendar:", "para después", pintarCaminos));
    hueco.appendChild(nuevo("p", "agenda__paso", "1. Escoge el día"));
    hueco.appendChild(armarCalendario());
  }

  /* Tras cambiar de mes se repinta todo y el foco se caeria al body. Se pone en
     la flecha que quedo habilitada —la contraria, porque la que se pulso queda
     apagada al llegar— para poder ir y volver entre los dos meses sin tabular
     el dialogo entero. */
  function enfocarFlecha() {
    var f = hueco.querySelector(".agenda__calFlecha:not([disabled])");
    if (f) f.focus();
  }

  function armarCalendario() {
    var porFecha = {};
    dias.forEach(function (dia) { porFecha[dia.fecha] = dia; });

    var meses = mesesDelCalendario();
    var cual = meses[mesVisible];

    var primeroDelMes = new Date(Date.UTC(cual.anio, cual.mes, 1));
    var ultimoDelMes  = new Date(Date.UTC(cual.anio, cual.mes + 1, 0));

    /* La rejilla siempre arranca en lunes y termina en domingo, o las columnas
       no cuadrarían con la cabecera. */
    var desde = new Date(primeroDelMes.getTime() - columnaDe(primeroDelMes) * 86400000);
    var hasta = new Date(ultimoDelMes.getTime() + (6 - columnaDe(ultimoDelMes)) * 86400000);

    var cal = nuevo("div", "agenda__cal");

    /* ---- La cabecera: flecha, mes, flecha ---- */

    var barra = nuevo("div", "agenda__calBarra");

    var atras = nuevo("button", "agenda__calFlecha", "‹");
    atras.type = "button";
    atras.setAttribute("aria-label", "Mes anterior");
    atras.disabled = mesVisible === 0;
    atras.addEventListener("click", function () {
      mesVisible = 0;
      pintarDias();
      enfocarFlecha();
    });
    barra.appendChild(atras);

    barra.appendChild(nuevo("p", "agenda__calMes", MESES[cual.mes] + " de " + cual.anio));

    /* Si el mes siguiente no tiene ni un cupo, la flecha se apaga: mandar a
       alguien a un mes vacío es hacerle perder el viaje. */
    var haySiguiente = dias.some(function (dia) {
      var d = comoUtc(dia.fecha);
      return d.getUTCFullYear() === meses[1].anio && d.getUTCMonth() === meses[1].mes;
    });

    var adelante = nuevo("button", "agenda__calFlecha", "›");
    adelante.type = "button";
    adelante.setAttribute("aria-label", "Mes siguiente");
    adelante.disabled = mesVisible === 1 || !haySiguiente;
    adelante.addEventListener("click", function () {
      mesVisible = 1;
      pintarDias();
      enfocarFlecha();
    });
    barra.appendChild(adelante);

    cal.appendChild(barra);

    /* ---- La rejilla ---- */

    var rejilla = nuevo("div", "agenda__calRejilla");

    DIAS_CORTOS.forEach(function (d) {
      var c = nuevo("span", "agenda__calCabecera", d);
      c.setAttribute("aria-hidden", "true");
      rejilla.appendChild(c);
    });

    for (var t = desde.getTime(); t <= hasta.getTime(); t += 86400000) {
      var d = new Date(t);
      var delMes = d.getUTCMonth() === cual.mes && d.getUTCFullYear() === cual.anio;
      var dia = delMes ? porFecha[comoTexto(d)] : null;

      /* Los días de relleno —los del mes de al lado que completan la primera y
         la última semana— van en blanco: si llevaran número se leerían como
         días de este mes. */
      if (!delMes) {
        var relleno = nuevo("span", "agenda__calDia es-relleno");
        relleno.setAttribute("aria-hidden", "true");
        rejilla.appendChild(relleno);
        continue;
      }

      if (!dia) {
        var vacio = nuevo("span", "agenda__calDia es-vacio", String(d.getUTCDate()));
        vacio.setAttribute("aria-hidden", "true");
        rejilla.appendChild(vacio);
        continue;
      }

      var b = nuevo("button", "agenda__calDia", String(d.getUTCDate()));
      b.type = "button";
      b.setAttribute("aria-label", dia.rotulo);
      b.addEventListener("click", (function (elDia) {
        return function () {
          diaElegido = elDia;
          pintarHoras();
        };
      })(dia));
      rejilla.appendChild(b);
    }

    cal.appendChild(rejilla);

    if (!dias.some(function (dia) {
      var d = comoUtc(dia.fecha);
      return d.getUTCFullYear() === cual.anio && d.getUTCMonth() === cual.mes;
    })) {
      cal.appendChild(nuevo("p", "agenda__calNada",
        "Este mes ya no tiene horas libres. Mira el mes anterior con la flecha."));
    }

    return cal;
  }

  /* Paso 2: la hora. El día ya elegido queda encogido arriba. */
  function pintarHoras() {
    vaciar();
    encabezado("Escoge la hora", "Las horas son de Colombia, y cada reunión dura media hora.");

    hueco.appendChild(pasoHecho("Agendar:", "para después", pintarCaminos));
    hueco.appendChild(pasoHecho("Día:", diaElegido.rotulo, pintarDias));
    hueco.appendChild(nuevo("p", "agenda__paso", "2. Escoge la hora"));

    var lista = nuevo("div", "agenda__horas");

    diaElegido.horas.forEach(function (hora) {
      var b = nuevo("button", "agenda__hora", hora.rotulo);
      b.type = "button";
      b.addEventListener("click", function () {
        horaElegida = hora;
        pintarFormulario();
      });
      lista.appendChild(b);
    });

    hueco.appendChild(lista);
  }

  /* Paso 3: los datos. Arriba quedan el día y la hora, encogidos. */
  function pintarFormulario() {
    vaciar();
    encabezado("Tus datos", "Te mandamos la invitación al correo, con el enlace de la reunión.");

    hueco.appendChild(pasoHecho("Día:", diaElegido.rotulo, pintarDias));
    hueco.appendChild(pasoHecho("Hora:", horaElegida.rotulo + " (hora de Colombia)", pintarHoras));
    hueco.appendChild(nuevo("p", "agenda__paso", "3. Tus datos"));

    var forma = nuevo("form", "agenda__forma");
    forma.noValidate = true;
    armarMiel(forma);
    armarCampos(forma, CAMPOS_AGENDA);

    var boton = nuevo("button", "btn btn--morado btn--bloque", "Agendar la reunión");
    boton.type = "submit";
    forma.appendChild(boton);
    hueco.appendChild(forma);

    var primero = forma.querySelector("input[name=nombre]");
    if (primero) window.setTimeout(function () { primero.focus(); }, 60);

    forma.addEventListener("submit", function (e) {
      e.preventDefault();

      var datos = new FormData(forma);
      recordar(forma);

      var falta = faltantes(datos, CAMPOS_AGENDA);
      if (falta.length) {
        decir("Falta " + falta.join(", ") + ".", "es-error");
        return;
      }

      decir("");
      datos.set("cupo", horaElegida.llave);

      boton.disabled = true;
      boton.textContent = "Agendando…";

      fetch("/api/agendar", { method: "POST", body: new URLSearchParams(datos) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) {
            pintarListo(d.mensaje,
              "En el correo va la invitación: al aceptarla, la reunión queda en tu " +
              "calendario con el enlace adentro.");
            return;
          }
          boton.disabled = false;
          boton.textContent = "Agendar la reunión";

          var mensaje = (d && d.mensaje) || "No pudimos agendar. Intenta de nuevo.";
          decir(mensaje, "es-error");

          /* Si el cupo se lo llevó otro, se vuelven a pedir las horas. El
             mensaje se conserva y lo escrito también. */
          if (d && d.recargar) {
            cargado = false;
            abrirCalendario(mensaje);
          }
        })
        .catch(function () {
          boton.disabled = false;
          boton.textContent = "Agendar la reunión";
          decir("No pudimos agendar. Escríbenos por WhatsApp y lo cerramos ahí mismo.", "es-error");
        });
    });
  }

  /* ---- El final, para los dos caminos ---- */

  function pintarListo(mensaje, nota, conEnlaceSala, conWhatsApp) {
    vaciar();
    decir("");
    encabezado("Listo", "");

    hueco.appendChild(nuevo("p", "agenda__listo", mensaje || "Listo."));
    if (nota) hueco.appendChild(nuevo("p", "teams__sinagenda", nota));

    if (conEnlaceSala) {
      var sala = nuevo("a", "btn btn--morado btn--bloque", "Abrir la sala de Teams");
      sala.href = SALA_TEAMS;
      sala.target = "_blank";
      sala.rel = "noopener";
      hueco.appendChild(sala);
    }

    if (conWhatsApp && typeof window.WHATSAPP === "string" && window.WHATSAPP) {
      var wa = nuevo("a", "btn btn--wa btn--bloque", "Escribir por WhatsApp");
      wa.href = "https://wa.me/" + window.WHATSAPP + "?text=" +
        encodeURIComponent("Hola, estoy esperando en la sala de Teams de i'Witown.");
      wa.target = "_blank";
      wa.rel = "noopener";
      hueco.appendChild(wa);
    }

    var listo = nuevo("button", "btn btn--morado btn--bloque", "Cerrar");
    listo.type = "button";
    listo.addEventListener("click", cerrarla);
    hueco.appendChild(listo);

    /* Se empieza de cero la próxima vez que se abra. */
    cargado = false;
    escrito = {};
    diaElegido = null;
    horaElegida = null;
  }

  /* ---- Abrir y cerrar ---- */

  function abrir(desde, destino) {
    deDonde = desde || null;
    caja.hidden = false;

    /* El calendario siempre se abre en el primer mes. Va aqui y no dentro de
       `abrirCalendario()` a proposito: cuando un cupo se lo lleva otro, esa
       funcion se vuelve a llamar para recargar y ahi hay que dejar a la persona
       en el mes que estaba mirando, no devolverla al principio. */
    mesVisible = 0;
    document.body.classList.add("con-lupa");     // la misma llave que usa el visor

    /* El boton que dice "Calendario" entra directo al calendario: preguntarle
       "¿ahora o lo agendamos?" a quien ya escogio agendar es un paso de sobra.
       Se marca con data-teams="calendario" en el HTML. */
    if (destino === "calendario") abrirCalendario();
    else pintarCaminos();

    if (cerrar) window.setTimeout(function () { cerrar.focus(); }, 60);
  }

  function cerrarla() {
    caja.hidden = true;
    document.body.classList.remove("con-lupa");
    if (deDonde) { deDonde.focus(); deDonde = null; }

    /* Lo escrito no sobrevive al cierre: en un portátil compartido —una feria,
       la sala de profesores— el siguiente encontraría precargados el nombre, el
       celular y el correo del anterior, y podría agendar con datos ajenos. */
    escrito = {};
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-teams]") : null;
    if (b && !b.classList.contains("esta-apagado")) {
      e.preventDefault();
      abrir(b, b.getAttribute("data-teams"));
      return;
    }
    if (!caja.hidden && (e.target === caja || (cerrar && cerrar.contains(e.target)))) cerrarla();
  });

  document.addEventListener("keydown", function (e) {
    if (caja.hidden) return;

    if (e.key === "Escape") { cerrarla(); return; }

    /* El recuadro es un diálogo y tiene formularios adentro: el tabulador da
       vueltas dentro y no se va a la página de detrás, que sigue ahí. */
    if (e.key !== "Tab") return;

    var tarjeta = caja.querySelector(".teams__tarjeta");
    if (!tarjeta) return;

    var focales = tarjeta.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focales.length) return;

    var primero = focales[0];
    var ultimo  = focales[focales.length - 1];

    if (!tarjeta.contains(document.activeElement)) {
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
