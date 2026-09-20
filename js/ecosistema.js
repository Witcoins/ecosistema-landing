/* ============================================================
   i'Witown — El recorrido por las apps
   ============================================================

   Es lo que pasa al tocar "Recorre la app". Ya no hay selector ni
   tarjetas de por medio: se entra derecho y las apps van pasando
   una tras otra, solas.

   ┌──────────────────────────────────────────────────────────┐
   │  EL ORDEN ESTÁ EN "ECO_RECORRIDO", AQUÍ ABAJO.           │
   │                                                          │
   │  Para cambiar el orden, se mueven los nombres. Para      │
   │  sacar una app del recorrido, se borra su nombre —la app │
   │  sigue existiendo, solo deja de salir sola—.             │
   │                                                          │
   │  Una app que no tenga con qué mostrarse se salta sin     │
   │  romper nada, y avisa por la consola.                    │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  CUÁNTO DURA CADA APP                                    │
   │                                                          │
   │  ECO_SEGUNDOS. Mientras una app está a la vista, sus     │
   │  propias pantallas van pasando por dentro; al cumplirse  │
   │  esos segundos, salta a la siguiente app.                │
   │                                                          │
   │  Con 3,25 segundos el recorrido va rápido: de cada app   │
   │  se alcanza a ver una pantalla antes de pasar a la       │
   │  siguiente. Subiendo el número se ve más de cada una.    │
   │                                                          │
   │  En cuanto el visitante toca algo, el salto automático   │
   │  se detiene y la app se queda donde él la dejó.          │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var ECO_RECORRIDO = ["teacher", "iwitown", "tutor", "admon"];

var ECO_SEGUNDOS = 3.25;

/* ┌──────────────────────────────────────────────────────────┐
   │  LOS BOTONES DE ARRIBA                                   │
   │                                                          │
   │  ECO_NOMBRES es lo que dice el botón: corto, por quién   │
   │  usa la app. ECO_APELLIDOS es el nombre del producto, y  │
   │  sale en el globito al pasar el mouse por encima.        │
   └──────────────────────────────────────────────────────────┘ */

var ECO_NOMBRES = {
  wiwiquest: "Quest",
  teacher:   "Teacher",
  iwitown:   "Student",
  tutor:     "Partners",
  admon:     "Admin"
};

var ECO_APELLIDOS = {
  wiwiquest: "Wiwi Quest",
  teacher:   "I'Witeacher",
  iwitown:   "I'Witown",
  tutor:     "I'Witutor",
  admon:     "AdmonWitown"
};

var ECO_APPS = {

  /* ---------- WIWI QUEST — el juego del estudiante ----------
     Todavía no tiene capturas. En cuanto se dejen en
     assets/img/wiwiquest/ y se arme su archivo js, entra sola
     al recorrido; mientras tanto se salta. */
  wiwiquest: {
    tipo: "app",
    visor: "wiwiquest",
    tema: "witown",
    marca: "WIWIQUEST",
    quien: "El estudiante"
  },

  /* ---------- I'WITOWN — la app del estudiante ----------
     Ya no es una maqueta: son las capturas de la app.
     Lo que dice cada pantalla está en js/iwitown.js. */
  iwitown: {
    tipo: "app",
    visor: "iwitown",
    tema: "witown",
    marca: "WITOWN",
    quien: "El estudiante"
  },

  /* ---------- I'WITEACHER — la app de la profesora ----------
     No es una maqueta: es la app, hecha con las capturas.
     Lo que dice está en js/witeacher.js. */
  teacher: {
    tipo: "app",
    visor: "witeacher",
    tema: "witeacher",
    marca: "WITEACHER",
    quien: "La profesora"
  },

  /* ---------- I'WITUTOR — la app de los papás ----------
     Está completa, con once pantallas (js/witutor.js), pero hoy no
     entra en el recorrido automático: no está en ECO_RECORRIDO.
     Para que vuelva a salir, se agrega "tutor" a esa lista. */
  tutor: {
    tipo: "app",
    visor: "witutor",
    tema: "witutor",
    marca: "WITUTOR",
    quien: "Los papás y acudientes"
  },

  /* ---------- ADMONWITOWN — la app de quien dirige ----------
     Ya no es una maqueta: son las capturas de la app.
     Lo que dice cada pantalla está en js/admon.js. */
  admon: {
    tipo: "app",
    visor: "admon",
    tema: "admonwitown",
    marca: "ADMONWITOWN",
    quien: "Quien dirige el colegio"
  }
};

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {
  var marco = document.getElementById("apxMarco");
  var pasos = document.getElementById("apxPasos");
  if (!marco) return;

  /* Qué app está abierta y en qué ficha */
  var abierta = null;
  var ficha = null;

  /* El salto automático de una app a la siguiente */
  var reloj = null;
  var manual = false;          // true en cuanto el visitante toca algo

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ============================================================
     QUÉ APPS PUEDEN SALIR

     Una app del recorrido solo entra si tiene con qué mostrarse:
     o es una maqueta, o su visor ya dejó sus funciones en el
     window. Las que no, se saltan y se avisa una sola vez.
     ============================================================ */

  var yaAvisado = {};

  function puedeSalir(clave) {
    var app = ECO_APPS[clave];
    if (!app) return false;
    if (app.tipo !== "app") return true;             // las maquetas siempre
    if (typeof window[app.visor + "HTML"] === "function") return true;

    if (!yaAvisado[clave]) {
      yaAvisado[clave] = true;
      if (window.console && console.warn) {
        console.warn("[i-Witown] " + clave + ": todavía no tiene pantallas, " +
                     "así que no sale en el recorrido. Ver js/ecosistema.js.");
      }
    }
    return false;
  }

  function laLista() {
    var r = [];
    for (var i = 0; i < ECO_RECORRIDO.length; i++) {
      if (puedeSalir(ECO_RECORRIDO[i])) r.push(ECO_RECORRIDO[i]);
    }
    return r;
  }

  /* ============================================================
     LOS ICONOS DE LA COLUMNA DE LAS MAQUETAS
     ============================================================ */

  var DIBUJOS = {
    casa:        '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.6V20.5h13V9.6"/>',
    juego:       '<rect x="2.6" y="7.4" width="18.8" height="11.2" rx="4"/>' +
                 '<path d="M7 11v3.4M5.3 12.7h3.4M15.4 12.2h.01M17.8 14.2h.01"/>',
    trabajo:     '<circle cx="12" cy="12" r="3.2"/>' +
                 '<path d="M12 2.8v2.6M12 18.6v2.6M4.5 12H2M22 12h-2.5' +
                 'M6.7 6.7 4.9 4.9M19.1 19.1l-1.8-1.8M17.3 6.7l1.8-1.8M4.9 19.1l1.8-1.8"/>',
    calendario:  '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/>' +
                 '<path d="M8 3v4M16 3v4M3.5 10.2h17"/>',
    herramienta: '<path d="M14.8 3.4a4.8 4.8 0 0 0-5.9 6.2L3.4 15a2 2 0 1 0 2.8 2.8l5.4-5.5a4.8 4.8 0 0 0 6.2-5.9l-2.8 2.8-2.4-.6-.6-2.4z"/>',
    persona:     '<circle cx="12" cy="8" r="3.4"/>' +
                 '<path d="M5.4 20.4c0-3.7 2.9-5.8 6.6-5.8s6.6 2.1 6.6 5.8"/>',
    grupo:       '<circle cx="9" cy="8.6" r="3"/>' +
                 '<path d="M3 20c0-3.3 2.6-5.2 6-5.2s6 1.9 6 5.2"/>' +
                 '<path d="M16.4 6.2a3 3 0 0 1 0 5.8M17.6 14.6c2.2.5 3.8 2 3.8 4.4"/>',
    dinero:      '<circle cx="12" cy="12" r="8.6"/><path d="M12 6.8v10.4"/>' +
                 '<path d="M14.6 9.4c0-1.1-1.1-1.8-2.6-1.8s-2.6.7-2.6 1.8c0 2.6 5.2 1.3 5.2 3.9 0 1.1-1.1 1.8-2.6 1.8s-2.6-.7-2.6-1.8"/>',
    tarea:       '<path d="M6 2.8h7.6L18 7.2v14H6z"/><path d="M13.4 2.8v4.6H18"/>' +
                 '<path d="M8.8 13.4l1.8 1.8 3.6-3.6"/>',
    punto:       '<circle cx="12" cy="12" r="3.4"/>'
  };

  function icono(nombre, clase) {
    return '<svg class="' + clase + '" viewBox="0 0 24 24" aria-hidden="true">' +
             (DIBUJOS[nombre] || DIBUJOS.punto) +
           '</svg>';
  }

  /* ---- A dónde se puede ir dentro de una maqueta ---- */
  function destinosDe(app) {
    var lista = [];
    var i;
    if (app.modulos) for (i = 0; i < app.modulos.length; i++) lista.push(app.modulos[i]);
    if (app.accesos) for (i = 0; i < app.accesos.length; i++) lista.push(app.accesos[i]);
    if (app.cuenta) {
      lista.push({ nombre: app.cuenta.titulo, emoji: "💳",
                   icono: app.cuenta.icono, detalle: app.cuenta.detalle });
    }
    if (app.tarjetas) for (i = 0; i < app.tarjetas.length; i++) lista.push(app.tarjetas[i]);
    return lista;
  }

  function riel(app) {
    var lista = destinosDe(app);
    var h = '<button type="button" class="apx__riel-bt' +
              (ficha === null ? " es-actual" : "") + '"' +
              ' data-va="inicio" title="Inicio" aria-label="Inicio">' +
              icono("casa", "apx__riel-ico") +
            '</button>';

    for (var i = 0; i < lista.length; i++) {
      h += '<button type="button" class="apx__riel-bt' +
             (ficha === i ? " es-actual" : "") + '"' +
             ' data-va="' + i + '" title="' + esc(lista[i].nombre) + '"' +
             ' aria-label="' + esc(lista[i].nombre) + '">' +
             icono(lista[i].icono, "apx__riel-ico") +
           '</button>';
    }
    for (var r = lista.length + 1; r < 9; r++) {
      h += '<span class="apx__riel-bt es-adorno" aria-hidden="true">' +
             icono("punto", "apx__riel-ico") +
           '</span>';
    }
    return h;
  }

  function barra(app) {
    return '' +
      '<div class="apx__barra">' +
        '<span class="apx__menu" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<div class="apx__quien">' +
          '<p class="apx__usuario">' + esc(app.usuario) + '</p>' +
          (app.colegio ? '<p class="apx__colegio">' + esc(app.colegio) + '</p>' : '') +
        '</div>' +
        '<div class="apx__barra-fin">' +
          '<span class="apx__campana" aria-hidden="true">🔔' +
            (app.avisos ? '<b class="apx__globo">' + esc(app.avisos) + '</b>' : '') +
          '</span>' +
          '<span class="apx__ayuda" aria-hidden="true">?</span>' +
          '<span class="apx__marca">' + esc(app.marca) + '<em>School</em></span>' +
          '<span class="apx__salir" aria-hidden="true">⇥</span>' +
        '</div>' +
      '</div>';
  }

  function pintarFicha(app, cual) {
    var d = destinosDe(app)[cual];
    if (!d) return pintarInicio(app);

    return barra(app) +
      '<div class="apx__cuerpo">' +
        '<div class="apx__riel">' + riel(app) + '</div>' +
        '<div class="apx__lienzo">' +
          '<button type="button" class="apx__volver" data-va="inicio">← Volver al inicio</button>' +
          '<div class="apx__ficha">' +
            '<b class="apx__ficha-ico">' + d.emoji + '</b>' +
            '<p class="apx__ficha-tit">' + esc(d.nombre) + '</p>' +
            '<p class="apx__ficha-txt">' + esc(d.detalle || "") + '</p>' +
            '<p class="apx__ficha-pie">' + esc(app.quien) + ' · ' + esc(app.marca) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="apx__pie"><span class="apx__interruptor"></span></div>';
  }

  /* ---- La pantalla de entrada del estudiante (I'Witown) ---- */
  function pintarEstudiante(app) {
    var mods = "";
    for (var i = 0; i < app.modulos.length; i++) {
      var m = app.modulos[i];
      mods += '<button type="button" class="apx__modulo apx__modulo--' + m.tono + '"' +
                ' data-va="' + i + '">' +
                '<b class="apx__modulo-ico">' + m.emoji + '</b>' + esc(m.nombre) +
              '</button>';
    }

    var accs = "";
    var desdeAcceso = app.modulos.length;
    for (var j = 0; j < app.accesos.length; j++) {
      accs += '<button type="button" class="apx__acceso" data-va="' + (desdeAcceso + j) + '">' +
                '<b class="apx__acceso-ico">' + app.accesos[j].emoji + '</b>' +
                esc(app.accesos[j].nombre) +
              '</button>';
    }

    var laCuenta = desdeAcceso + app.accesos.length;

    return barra(app) +
      '<div class="apx__cuerpo">' +
        '<div class="apx__riel">' + riel(app) + '</div>' +
        '<div class="apx__lienzo">' +

          '<div class="apx__fecha">' +
            '<p>' + esc(app.fecha) + '</p><p>' + esc(app.hora) + '</p>' +
            '<span class="apx__avatar">' + app.avatar + '</span>' +
          '</div>' +

          '<div class="apx__banda">' + mods + '</div>' +

          '<div class="apx__fila">' +
            '<div class="apx__caja apx__caja--accesos">' + accs + '</div>' +
            '<button type="button" class="apx__caja apx__caja--cuenta" data-va="' + laCuenta + '">' +
              '<p class="apx__cuenta-tit">' + esc(app.cuenta.titulo) + ' <b>›</b></p>' +
              '<p class="apx__cuenta-num">' + esc(app.cuenta.numero) + '</p>' +
              '<p class="apx__cuenta-eti">' + esc(app.cuenta.etiqueta) + '</p>' +
              '<p class="apx__cuenta-saldo">' + esc(app.cuenta.saldo) + '</p>' +
            '</button>' +
          '</div>' +

          '<svg class="apx__paisaje" viewBox="0 0 900 120" preserveAspectRatio="none" aria-hidden="true">' +
            '<path class="apx__loma" d="M640 120V78c0-26 44-42 116-42s144 14 144 40v44z"/>' +
            '<g class="apx__ciudad">' +
              '<rect x="20" y="52" width="34" height="68"/><rect x="62" y="30" width="26" height="90"/>' +
              '<rect x="96" y="66" width="40" height="54"/><rect x="144" y="44" width="28" height="76"/>' +
              '<rect x="180" y="74" width="46" height="46"/><rect x="234" y="36" width="30" height="84"/>' +
              '<rect x="272" y="62" width="38" height="58"/><rect x="318" y="48" width="26" height="72"/>' +
              '<rect x="352" y="70" width="44" height="50"/><rect x="404" y="40" width="28" height="80"/>' +
              '<rect x="440" y="66" width="36" height="54"/><rect x="484" y="52" width="30" height="68"/>' +
              '<rect x="522" y="76" width="42" height="44"/><rect x="572" y="34" width="26" height="86"/>' +
              '<rect x="606" y="60" width="34" height="60"/>' +
            '</g>' +
            '<g class="apx__cole">' +
              '<rect x="286" y="72" width="88" height="48"/>' +
              '<path d="M286 72l44-22 44 22z"/>' +
              '<rect x="322" y="94" width="16" height="26" class="apx__puerta"/>' +
            '</g>' +
            '<g class="apx__pinos">' +
              '<path d="M756 60l14 30h-28z"/><path d="M756 44l11 24h-22z"/>' +
              '<path d="M800 68l16 34h-32z"/><path d="M800 50l12 26h-24z"/>' +
              '<path d="M842 62l14 30h-28z"/><path d="M842 46l11 24h-22z"/>' +
            '</g>' +
          '</svg>' +

        '</div>' +
      '</div>' +
      '<div class="apx__pie"><span class="apx__interruptor"></span></div>';
  }

  /* ---- La pantalla de entrada de panel (rectoría) ---- */
  function pintarPanel(app) {
    var tarjetas = "";
    for (var i = 0; i < app.tarjetas.length; i++) {
      var t = app.tarjetas[i];
      tarjetas += '<button type="button" class="apx__tarjeta" data-va="' + i + '">' +
                    '<p class="apx__tarjeta-tit">' + esc(t.nombre) + '</p>' +
                    '<b class="apx__tarjeta-ico">' + t.emoji + '</b>' +
                  '</button>';
    }

    return barra(app) +
      '<div class="apx__cuerpo">' +
        '<div class="apx__riel">' + riel(app) + '</div>' +
        '<div class="apx__lienzo">' +
          '<p class="apx__fecha-simple">' + esc(app.fecha) +
            (app.hora ? '<br><span>' + esc(app.hora) + '</span>' : '') + '</p>' +
          '<div class="apx__saludo">' +
            '<div class="apx__saludo-txt">' +
              '<p class="apx__saludo-tit">' + esc(app.saludo) + '</p>' +
              '<p class="apx__saludo-sub">' + esc(app.subsaludo) + '</p>' +
            '</div>' +
            '<span class="apx__avatar apx__avatar--grande">' + app.avatar + '</span>' +
          '</div>' +
          '<div class="apx__tarjetas">' + tarjetas + '</div>' +
          (app.boton ? '<span class="apx__boton">' + esc(app.boton) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="apx__pie"><span class="apx__interruptor"></span>' +
        '<em class="apx__frase">' + esc(app.frase) + '</em></div>';
  }

  function pintarInicio(app) {
    if (app.tipo === "estudiante") return pintarEstudiante(app);
    return pintarPanel(app);
  }

  /* Las apps de verdad se dibujan solas: cada una dejó sus tres
     funciones en el window (por ejemplo witeacherHTML). */
  function visorDe(app, que) {
    if (!app || app.tipo !== "app" || !app.visor) return null;
    var f = window[app.visor + que];
    return (typeof f === "function") ? f : null;
  }

  function apagarVisores() {
    for (var clave in ECO_APPS) {
      var apagar = visorDe(ECO_APPS[clave], "Detener");
      if (apagar) apagar();
    }
  }

  function pintar() {
    var app = ECO_APPS[abierta];
    if (!app || !marco) return;

    marco.className = "apx__marco apx__marco--" + app.tema;

    var dibujar = visorDe(app, "HTML");
    if (dibujar) marco.innerHTML = dibujar();
    else marco.innerHTML = (ficha === null) ? pintarInicio(app) : pintarFicha(app, ficha);

    /* Un parpadeo corto al cambiar de app. Se quita y se vuelve a
       poner la clase para que la animación arranque de nuevo: si no,
       solo se vería la primera vez. */
    marco.classList.remove("entra");
    void marco.offsetWidth;
    marco.classList.add("entra");
  }

  /* ---- La fila de arriba, con las apps del recorrido ---- */
  /* Lo que dice el globito: el nombre corto y, entre paréntesis, el
     nombre del producto. Por ejemplo: "Teacher (I'Witeacher)". */
  function globito(clave) {
    var corto = ECO_NOMBRES[clave] || clave;
    var largo = ECO_APELLIDOS[clave];
    return largo ? (corto + " (" + largo + ")") : corto;
  }

  function pintarPasos() {
    if (!pasos) return;
    var lista = laLista();
    var h = "";
    for (var i = 0; i < lista.length; i++) {
      h += '<button type="button" class="apx__paso' +
             (lista[i] === abierta ? " es-actual" : "") + '"' +
             ' data-app="' + lista[i] + '"' +
             ' title="' + esc(globito(lista[i])) + '">' +
             esc(ECO_NOMBRES[lista[i]] || lista[i]) +
           '</button>';
    }
    pasos.innerHTML = h;
  }

  /* ---- Abrir una app ---- */
  function abrirApp(clave) {
    var app = ECO_APPS[clave];
    if (!app || !marco) return;

    apagarVisores();

    abierta = clave;
    ficha = null;
    pintar();
    pintarPasos();

    var arrancar = visorDe(app, "Arrancar");
    if (arrancar) arrancar();
  }

  /* ---- El salto de una app a la siguiente ---- */
  function programar() {
    pararReloj();
    if (manual) return;
    reloj = window.setTimeout(siguienteApp, ECO_SEGUNDOS * 1000);
  }

  function pararReloj() {
    if (reloj) { window.clearTimeout(reloj); reloj = null; }
  }

  function siguienteApp() {
    var pantalla = document.getElementById("pasoApps");
    if (!pantalla || pantalla.hidden) { pararReloj(); return; }

    var lista = laLista();
    if (!lista.length) return;

    var i = lista.indexOf(abierta);
    abrirApp(lista[(i + 1) % lista.length]);
    programar();
  }

  /* ---- Empezar el recorrido ----
     Lo llama js/presentacion.js cuando se entra a esta pantalla. */
  window.ecosistemaAlInicio = function () {
    apagarVisores();
    pararReloj();
    manual = false;

    var lista = laLista();
    if (!lista.length) return;

    abrirApp(lista[0]);
    programar();
  };

  /* ---- Moverse por dentro ----

     Un solo oyente para todo: los módulos, las tarjetas, la columna
     de iconos, el "volver" y los nombres de arriba. Cualquiera de
     ellos para el salto automático: de ahí en adelante manda el
     visitante. */
  marco.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-va]") : null;
    if (!b || !marco.contains(b)) return;

    /* Las apps de verdad se manejan solas, en js/app-visor.js */
    if (b.closest(".wt")) return;

    manual = true;
    pararReloj();

    var va = b.getAttribute("data-va");
    ficha = (va === "inicio") ? null : +va;
    pintar();
  });

  if (pasos) {
    pasos.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-app]") : null;
      if (!b) return;
      manual = true;
      pararReloj();
      abrirApp(b.getAttribute("data-app"));
    });
  }

  /* Tocar dentro de una app de verdad también para el salto */
  marco.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".wt")) {
      manual = true;
      pararReloj();
    }
  });
})();
