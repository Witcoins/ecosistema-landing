/* ============================================================
   i'Witown — El visor de apps
   ============================================================

   Es la maquinaria que hace que I'Witutor y I'Witeacher se vean
   y se manejen como la app de verdad: el marco de color de
   arriba, el menú lateral con sus iconos y, por dentro, las
   capturas reales ya recortadas.

   ┌──────────────────────────────────────────────────────────┐
   │  AQUÍ NO HAY NADA QUE EDITAR PARA CAMBIAR TEXTOS.        │
   │                                                          │
   │  Lo que dice cada app está en su propio archivo:          │
   │     js/witutor.js     la app de los papás                 │
   │     js/witeacher.js   la app de la profesora              │
   │                                                          │
   │  Este archivo solo sabe dibujar y moverse; no sabe nada  │
   │  de agendas ni de tareas.                                │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  CÓMO SE USA                                             │
   │                                                          │
   │  window.miApp = crearVisorDeApp({                        │
   │    clase:  "witeacher",       el juego de colores        │
   │    marca:  "WITEACHER",       lo que dice arriba a la    │
   │                               derecha                     │
   │    quien:  { usuario: "...", colegio: "..." },           │
   │    riel:   ["casa", "agenda", ...],  el menú lateral     │
   │    pasos:  [ ... ],           las pantallas              │
   │    segundos: 4.2,             lo que dura cada una       │
   │    dibujos: WITUTOR_PANTALLAS  (opcional)                │
   │  });                                                     │
   │                                                          │
   │  Devuelve tres cosas: html(), arrancar() y detener().    │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

/* ============================================================
   LOS ICONOS DEL MENÚ LATERAL

   Son los mismos trazos para las dos apps. Cada app dice, en su
   lista "riel", cuáles usa y en qué orden.
   ============================================================ */

var VISOR_ICONOS = {
  casa:        '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.6V20.5h13V9.6"/>',

  agenda:      '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/>' +
               '<path d="M8 3v4M16 3v4M3.5 10.2h17"/>',

  informes:    '<path d="M6 2.8h7.6L18 7.2v14H6z"/><path d="M13.4 2.8v4.6H18"/>' +
               '<path d="M8.8 12h6.4M8.8 15.4h6.4M8.8 18.2h4"/>',

  tareas:      '<rect x="5.2" y="4.2" width="13.6" height="16.6" rx="2.2"/>' +
               '<path d="M9 4.2V3h6v1.2"/><path d="M8.8 12.6l1.9 1.9 3.9-3.9"/>',

  teachers:    '<path d="M2.4 8.8 12 4.2l9.6 4.6L12 13.4z"/>' +
               '<path d="M6.6 10.9v4.7c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.7"/>',

  lectura:     '<path d="M12 7.4C10.6 5.9 8.6 5.2 3.6 5.2v12.4c5 0 7 .7 8.4 2.2"/>' +
               '<path d="M12 7.4c1.4-1.5 3.4-2.2 8.4-2.2v12.4c-5 0-7 .7-8.4 2.2z"/>',

  portal:      '<path d="M2.2 12S5.8 5.8 12 5.8 21.8 12 21.8 12 18.2 18.2 12 18.2 2.2 12 2.2 12z"/>' +
               '<circle cx="12" cy="12" r="3.1"/>',

  colegio:     '<path d="M4 20.6V9.4l8-5 8 5v11.2"/><path d="M2.4 20.6h19.2"/>' +
               '<path d="M9.6 20.6v-5.2h4.8v5.2"/><circle cx="12" cy="10.6" r="1.4"/>',

  enlace:      '<path d="M10.2 13.8a3.6 3.6 0 0 0 5.2 0l2.6-2.6a3.7 3.7 0 0 0-5.2-5.2l-1.3 1.3"/>' +
               '<path d="M13.8 10.2a3.6 3.6 0 0 0-5.2 0L6 12.8a3.7 3.7 0 0 0 5.2 5.2l1.3-1.3"/>',

  pagos:       '<circle cx="12" cy="12" r="8.6"/><path d="M12 6.8v10.4"/>' +
               '<path d="M14.6 9.4c0-1.1-1.1-1.8-2.6-1.8s-2.6.7-2.6 1.8c0 2.6 5.2 1.3 5.2 3.9 0 1.1-1.1 1.8-2.6 1.8s-2.6-.7-2.6-1.8"/>',

  regalo:      '<path d="M3.2 9.2h17.6v3.6H3.2z"/><path d="M4.6 12.8v8h14.8v-8"/>' +
               '<path d="M12 9.2v11.6"/>' +
               '<path d="M12 9.2C9.4 9.2 7.8 8.3 7.8 6.9A2.2 2.2 0 0 1 12 9.2z"/>' +
               '<path d="M12 9.2c2.6 0 4.2-.9 4.2-2.3A2.2 2.2 0 0 0 12 9.2z"/>',

  banco:       '<path d="M2.6 9.4 12 4.2l9.4 5.2"/>' +
               '<path d="M5.2 11.4v7.2M9.4 11.4v7.2M14.6 11.4v7.2M18.8 11.4v7.2"/>' +
               '<path d="M3 20.6h18"/>',

  persona:     '<circle cx="12" cy="8" r="3.4"/>' +
               '<path d="M5.4 20.4c0-3.7 2.9-5.8 6.6-5.8s6.6 2.1 6.6 5.8"/>',

  grupo:       '<circle cx="9" cy="8.6" r="3"/>' +
               '<path d="M3 20c0-3.3 2.6-5.2 6-5.2s6 1.9 6 5.2"/>' +
               '<path d="M16.4 6.2a3 3 0 0 1 0 5.8M17.6 14.6c2.2.5 3.8 2 3.8 4.4"/>'
};

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

window.crearVisorDeApp = function (cfg) {

  var PASOS = cfg.pasos;
  var SEGUNDOS = cfg.segundos || 4.2;

  var reloj = null;
  var actual = 0;
  var raiz = null;

  /* Se vuelve true en cuanto el visitante toca algo. De ahí en
     adelante la app no se mueve sola: manda él. */
  var manual = false;

  var narracion = null;
  var enNarracion = false;

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function icono(nombre, clase) {
    return '<svg class="' + clase + '" viewBox="0 0 24 24" aria-hidden="true">' +
             (VISOR_ICONOS[nombre] || "") +
           '</svg>';
  }

  /* A qué pantalla lleva cada icono del menú. La primera que use
     ese icono manda: por eso una pantalla que comparte icono con
     otra —como Tareas con Agenda— no sale dos veces en la columna. */
  function pasoDelIcono(nombre) {
    for (var i = 0; i < PASOS.length; i++) {
      if (PASOS[i].enElRiel && PASOS[i].icono === nombre) return i;
    }
    return -1;
  }

  /* ---- El armazón: la app entera ---- */
  function html() {
    var laminas = "";
    var puntos = "";

    for (var i = 0; i < PASOS.length; i++) {
      var p = PASOS[i];

      /* Las zonas de la captura en las que se puede hacer clic */
      var toques = "";
      if (p.toques) {
        for (var t = 0; t < p.toques.length; t++) {
          var z = p.toques[t];
          toques +=
            '<button type="button" class="wt__toque" data-va="' + z.a + '"' +
              ' style="left:' + z.x + '%;top:' + z.y + '%;' +
                      'width:' + z.ancho + '%;height:' + z.alto + '%"' +
              ' aria-label="Ir a ' + esc(z.rotulo) + '"></button>';
        }
      }

      /* Una pantalla se muestra de una de dos maneras: con la
         captura recortada ("imagen") o dibujada con HTML
         ("dibujo"). Las dos caben en el mismo hueco. */
      var dentro;
      if (p.dibujo && cfg.dibujos && cfg.dibujos[p.dibujo]) {
        dentro = '<div class="wt__dibujo">' + cfg.dibujos[p.dibujo]() + '</div>';
      } else {
        /* El respaldo va debajo de la foto: si el archivo no está,
           es lo que se ve, y así nunca queda un hueco blanco. */
        dentro =
          '<span class="wt__respaldo">' + esc(p.seccion) + '</span>' +
          '<img class="wt__foto" src="' + p.imagen + '" alt="' + esc(p.seccion) +
               ' en ' + esc(cfg.nombre || cfg.marca) + '"' +
               (i === 0 ? '' : ' loading="lazy"') + '>';
      }

      laminas +=
        '<figure class="wt__lamina' + (i === 0 ? " es-activa" : "") + '" data-i="' + i + '">' +
          dentro + toques +
        '</figure>';

      puntos +=
        '<button type="button" class="wt__punto' + (i === 0 ? " es-activo" : "") + '"' +
          ' data-i="' + i + '" aria-label="' + esc(p.seccion) + '"></button>';
    }

    /* La columna de iconos */
    var riel = "";
    for (var r = 0; r < cfg.riel.length; r++) {
      var destino = pasoDelIcono(cfg.riel[r]);
      if (destino >= 0) {
        riel +=
          '<button type="button" class="wt__riel-bt" data-i="' + destino + '"' +
            ' data-icono="' + cfg.riel[r] + '" title="' + esc(PASOS[destino].seccion) + '"' +
            ' aria-label="' + esc(PASOS[destino].seccion) + '">' +
            icono(cfg.riel[r], "wt__riel-ico") +
          '</button>';
      } else {
        riel += '<span class="wt__riel-bt es-adorno" aria-hidden="true">' +
                  icono(cfg.riel[r], "wt__riel-ico") +
                '</span>';
      }
    }

    return '' +
      '<div class="wt wt--' + esc(cfg.clase) + '" id="wtRaiz">' +

        '<div class="wt__escena">' +
        '<div class="wt__app">' +

          '<div class="wt__barra">' +
            '<span class="wt__menu" aria-hidden="true">' +
              '<span class="wt__hamburguesa"><i></i><i></i><i></i></span>' +
              '<em>Menú</em>' +
            '</span>' +
            '<div class="wt__quien">' +
              '<p class="wt__usuario">' + esc(cfg.quien.usuario) + '</p>' +
              '<p class="wt__colegio">' + esc(cfg.quien.colegio) + '</p>' +
            '</div>' +
            '<span class="wt__pastilla" id="wtPastilla"' +
              (PASOS[0].pastilla ? '' : ' hidden') + '>' +
              esc(PASOS[0].pastilla) +
            '</span>' +
            '<div class="wt__fin" aria-hidden="true">' +
              '<svg class="wt__ico-barra" viewBox="0 0 24 24">' +
                '<path d="M6 9.6a6 6 0 0 1 12 0c0 4.4 1.6 5.6 1.6 5.6H4.4S6 14 6 9.6z"/>' +
                '<path d="M10.2 18.4a2 2 0 0 0 3.6 0"/>' +
              '</svg>' +
              '<svg class="wt__ico-barra" viewBox="0 0 24 24">' +
                '<circle cx="12" cy="12" r="8.6"/>' +
                '<path d="M9.7 9.6a2.4 2.4 0 0 1 4.6.8c0 1.7-2.3 1.9-2.3 3.4"/>' +
                '<path d="M12 17.2h.01"/>' +
              '</svg>' +
              '<span class="wt__marca">' + esc(cfg.marca) + '</span>' +
              '<svg class="wt__ico-barra" viewBox="0 0 24 24">' +
                '<path d="M14.4 4.4H5.6v15.2h8.8"/><path d="M11.2 12h8.4"/>' +
                '<path d="M16.6 8.8 19.8 12l-3.2 3.2"/>' +
              '</svg>' +
            '</div>' +
          '</div>' +

          '<div class="wt__cuerpo">' +
            '<div class="wt__riel">' + riel + '</div>' +
            '<div class="wt__lienzo">' + laminas + '</div>' +
          '</div>' +

        '</div>' +
        '</div>' +

        '<div class="wt__pie">' +
          '<p class="wt__texto" id="wtTexto">' + esc(PASOS[0].texto) + '</p>' +
          '<p class="wt__pista">Toca un icono del menú (izquierda) para navegar por el simulador</p>' +
          '<div class="wt__puntos" id="wtPuntos">' + puntos + '</div>' +
        '</div>' +

      '</div>';
  }

  /* ---- Pasar a una pantalla ---- */
  function mostrar(i) {
    if (!raiz) return;
    actual = (i + PASOS.length) % PASOS.length;
    var p = PASOS[actual];

    var laminas = raiz.querySelectorAll(".wt__lamina");
    for (var a = 0; a < laminas.length; a++) {
      laminas[a].classList.toggle("es-activa", a === actual);
    }

    var puntos = raiz.querySelectorAll(".wt__punto");
    for (var b = 0; b < puntos.length; b++) {
      puntos[b].classList.toggle("es-activo", b === actual);
    }

    /* El icono que se prende en la columna es el de la pantalla, y
       las que comparten icono se prenden igual: así el menú siempre
       señala dónde está parado el visitante. */
    var botones = raiz.querySelectorAll(".wt__riel-bt");
    for (var c = 0; c < botones.length; c++) {
      var suyo = botones[c].getAttribute("data-icono");
      botones[c].classList.toggle("es-actual", !!suyo && suyo === p.icono);
    }

    /* El teléfono necesita saber si lo de turno es una captura o un
       dibujo: la captura tiene una forma fija y el dibujo mide lo
       que midan sus cajas. */
    raiz.classList.toggle("es-dibujo", !!p.dibujo);

    /* Hay pantallas donde la app de verdad no muestra pastilla —el
       inicio, por ejemplo—. Ahí se esconde, en vez de inventarle un
       nombre. */
    var pastilla = raiz.querySelector("#wtPastilla");
    if (pastilla) {
      pastilla.textContent = p.pastilla || "";
      pastilla.hidden = !p.pastilla;
    }

    /* El texto se reinicia para que la animación de entrada vuelva a
       correr: sin esto solo se anima la primera vez. */
    var texto = raiz.querySelector("#wtTexto");
    if (texto) {
      texto.textContent = p.texto;
      texto.classList.remove("entra");
      void texto.offsetWidth;
      texto.classList.add("entra");
    }
  }

  /* ---- Ir a una pantalla y programar la siguiente ----

     Yendo callada, cada pantalla dura los segundos de la app y ya.

     Con voz, dura lo que dure la frase, o esos segundos si la voz
     termina antes: así la pantalla nunca cambia a media frase. */
  function ir(i, conVoz) {
    mostrar(i);
    if (manual) return;

    var minimo = SEGUNDOS * 1000;

    if (conVoz && cfg.voz && typeof window.presDecir === "function") {
      var arranco = Date.now();
      var yaSiguio = false;

      var seguir = function () {
        if (yaSiguio) return;
        yaSiguio = true;
        programar(Math.max(700, minimo - (Date.now() - arranco)));
      };

      var paso = PASOS[actual];
      var frase = paso.vozTexto || (paso.seccion + ". " + paso.texto);
      if (window.presDecir(frase, "hombre", seguir, paso.audio)) return;
    }

    programar(minimo);
  }

  /* ---- El visitante toma el mando ----

     Pasa con el primer clic. De ahí en adelante la app se queda
     quieta donde él la deje: nada de seguir cambiando de pantalla
     mientras la está mirando. */
  function tomaElMando(i) {
    manual = true;
    pararReloj();
    if (typeof window.presCallar === "function") window.presCallar();
    if (narracion) { try { narracion.pause(); } catch (e) {} narracion = null; }
    if (raiz) raiz.classList.add("es-manual");
    mostrar(i);
  }

  function tic() {
    /* Si el visitante ya se fue de esta pantalla, el recorrido se
       apaga solo: no tiene sentido seguir contando en el vacío. */
    var pantalla = document.getElementById("pasoApps");
    if (!raiz || !document.body.contains(raiz) || (pantalla && pantalla.hidden)) {
      detener();
      return;
    }

    if (manual) return;

    /* Con narración andando, el reloj no manda: manda el audio. Solo
       actúa si el audio no está sonando. */
    if (enNarracion) {
      if (narracion && !narracion.paused) { programar(2000); return; }
      tocarCallado();
      return;
    }

    ir(actual + 1, true);
  }

  /* ============================================================
     EL MODO NARRACIÓN

     Solo entra si la app configuró una grabación seguida. Manda el
     audio: las pantallas lo siguen a él, no al revés.

     Si el audio no puede sonar —porque el visitante silenció el
     video, o porque el navegador no lo deja— las pantallas pasan
     igual, calladas, con los mismos tiempos. Lo que no hace es
     ponerse a leer las frases con la voz del computador.
     ============================================================ */

  function hayNarracion() {
    return !!(cfg.narracion && cfg.narracion.archivo);
  }

  function cualToca(segundo) {
    var m = cfg.narracion.marcas;
    var cual = 0;
    for (var i = 0; i < m.length && i < PASOS.length; i++) {
      if (segundo >= m[i]) cual = i;
    }
    return cual;
  }

  /* Cuánto dura una pantalla según las marcas del audio. Sirve para
     que, aunque el audio no suene, las pantallas pasen con el mismo
     ritmo que tendrían con él. */
  function duracionDeMarca(i) {
    var m = cfg.narracion.marcas;
    var desde = m[i] || 0;
    var hasta;
    if (i + 1 < m.length) hasta = m[i + 1];
    else if (narracion && narracion.duration) hasta = narracion.duration;
    else hasta = desde + 8;
    return Math.max(2500, (hasta - desde) * 1000);
  }

  function pasarCallado() { programar(duracionDeMarca(actual)); }

  function tocarCallado() {
    if (!enNarracion || manual) return;
    mostrar((actual + 1) % PASOS.length);
    pasarCallado();
  }

  function arrancarNarrado() {
    if (!hayNarracion()) return false;

    enNarracion = true;
    mostrar(0);

    /* Si el visitante pidió silencio, ni se intenta: las pantallas
       pasan solas con los tiempos del audio. */
    if (typeof window.presHaySonido === "function" && !window.presHaySonido()) {
      programar(duracionDeMarca(0));
      return true;
    }

    try {
      narracion = new Audio();
      narracion.preload = "auto";
      narracion.src = cfg.narracion.archivo;
    } catch (e) {
      narracion = null;
      programar(duracionDeMarca(0));
      return true;
    }

    /* Se guarda cuál es este audio: si mientras se estaba bajando el
       visitante se fue y volvió a entrar, el aviso de "ya está listo"
       del audio viejo llegaría tarde y pondría dos a sonar a la vez. */
    var esta = narracion;

    narracion.addEventListener("timeupdate", function () {
      if (narracion !== esta) return;
      if (!raiz || !document.body.contains(raiz)) { detener(); return; }
      if (manual) return;
      var toca = cualToca(esta.currentTime);
      if (toca !== actual) mostrar(toca);
    });

    narracion.addEventListener("ended", function () {
      if (narracion !== esta) return;
      esta.currentTime = 0;
      esta.play().catch(function () {});
    });

    var sinSonido = function () {
      if (narracion !== esta) return;
      try { esta.pause(); } catch (e) {}
      narracion = null;
      if (typeof window.presAmbienteDetener === "function") window.presAmbienteDetener();
      pasarCallado();
    };

    /* Tocarlo apenas esté listo, no antes. Pedirle que suene mientras
       todavía se está bajando es lo que lo hacía abortar. */
    var intentar = function () {
      if (narracion !== esta) return;
      var r = esta.play();
      if (r && r.catch) r.catch(sinSonido);
      if (typeof window.presAmbienteArrancar === "function") window.presAmbienteArrancar();
    };

    narracion.addEventListener("error", sinSonido);

    if (narracion.readyState >= 3) intentar();
    else narracion.addEventListener("canplay", intentar, { once: true });

    /* Red de seguridad: si en tres segundos no arrancó, se sigue sin
       sonido en vez de quedarse la primera pantalla congelada. */
    programar(3000);
    return true;
  }

  function arrancar() {
    detener();
    raiz = document.getElementById("wtRaiz");
    if (!raiz) return;

    actual = 0;
    manual = false;

    /* La foto empieza invisible y solo se muestra cuando el archivo
       cargó de verdad. Si no está, lo que queda a la vista es el
       respaldo con el nombre de la pantalla, y no el texto
       alternativo con el icono de imagen rota. */
    var fotos = raiz.querySelectorAll(".wt__foto");
    for (var f = 0; f < fotos.length; f++) {
      (function (img) {
        if (img.complete && img.naturalWidth > 0) {
          img.classList.add("es-buena");
        } else {
          img.addEventListener("load", function () { img.classList.add("es-buena"); });
        }
      })(fotos[f]);
    }

    /* ---- Todo lo que se puede tocar ----

       El menú lateral, los puntos de abajo y las zonas marcadas
       encima de la captura. Cualquiera de los tres para el recorrido
       automático y le pasa el mando al visitante. */
    raiz.addEventListener("click", function (e) {
      var t = e.target;
      var b = t.closest ? t.closest(".wt__riel-bt, .wt__punto, .wt__toque") : null;
      if (!b || b.classList.contains("es-adorno")) return;

      var i = b.hasAttribute("data-va")
        ? +b.getAttribute("data-va")
        : +b.getAttribute("data-i");
      if (isNaN(i)) return;

      /* Con narración seguida, el audio se corre a la marca de esa
         pantalla en vez de callarse, para que lo que se oye siga
         yendo con lo que se ve. */
      if (narracion && !manual) {
        var marca = cfg.narracion.marcas[i];
        if (typeof marca === "number") narracion.currentTime = marca;
        narracion.play().catch(function () {});
        mostrar(i);
        return;
      }

      tomaElMando(i);
    });

    /* Con el mouse encima se detiene el recorrido automático, para
       poder mirar con calma. Al quitarlo sigue, pero NO vuelve a
       decir la frase: repetirla cada vez que el mouse pasa por
       encima sería insoportable. */
    raiz.addEventListener("mouseenter", function () {
      pararReloj();
      if (narracion) { try { narracion.pause(); } catch (e) {} }
      if (typeof window.presAmbienteDetener === "function") window.presAmbienteDetener();
      if (typeof window.presCallar === "function") window.presCallar();
    });
    raiz.addEventListener("mouseleave", function () {
      /* Al quitar el mouse vuelve la música, con narración o sin
         ella. Sin esto, basta con pasar el cursor una vez por encima
         para que el fondo se apague y ya no regrese. */
      if (typeof window.presAmbienteArrancar === "function") window.presAmbienteArrancar();

      if (manual) return;
      if (narracion) { narracion.play().catch(function () {}); return; }
      programar(1400);
    });

    /* Primero se intenta la narración seguida; si no hay, el
       recorrido va por tiempo hasta que el visitante toque algo. */
    if (arrancarNarrado()) return;

    /* La música de fondo se queda aunque la app vaya callada: sin
       ella se siente muerta. Solo si el visitante no pidió silencio. */
    var haySonido = typeof window.presHaySonido !== "function" || window.presHaySonido();
    if (haySonido && typeof window.presAmbienteArrancar === "function") {
      window.presAmbienteArrancar();
    }

    ir(0, true);
  }

  function programar(ms) {
    pararReloj();
    if (manual) return;
    reloj = window.setTimeout(tic, ms);
  }

  function pararReloj() {
    if (reloj) { window.clearTimeout(reloj); reloj = null; }
  }

  function detener() {
    pararReloj();
    enNarracion = false;
    manual = false;
    if (typeof window.presAmbienteDetener === "function") window.presAmbienteDetener();
    if (narracion) {
      try { narracion.pause(); } catch (e) {}
      narracion = null;
    }
    if (raiz && typeof window.presCallar === "function") window.presCallar();
    raiz = null;
  }

  return { html: html, arrancar: arrancar, detener: detener };
};
