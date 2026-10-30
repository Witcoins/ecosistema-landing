/* ============================================================
   i'Witown — La demo para directivos (página /demo-directivos)
   ============================================================

   Para rectores y coordinadores. A un lado juegan como un
   estudiante (3 preguntas reales de WiwiQuest) y al otro ven el
   panel admin REAL, embebido, con los informes del colegio de
   prueba. Al terminar la partida, se le avisa al panel para que
   se refresque y muestre lo que se acaba de responder.

   Las preguntas las da /api/demo-jugar (función landingDemoJugar,
   repo witown-cloud-functions). El contrato:

     POST { accion: "empezar" }
       200 { ok, partida, estudiante:{uid,nombre,curso,avatar},
             asignatura, tema, subtema, preguntas:[...] }   (sin respuesta)
       429 / 503 { ok:false, mensaje }
     POST { accion: "responder", partida, pregunta_id, opcion, segundos }
       200 { ok, correcta, correctAnswer, retroalimentacion, fin }
       409 si esa pregunta ya se respondió

   La correcta la decide el servidor: aquí nunca se sabe antes de
   responder.

   ┌──────────────────────────────────────────────────────────┐
   │  LO QUE SE CAMBIA ESTÁ AQUÍ ARRIBA                       │
   │                                                          │
   │  DEMO_PANEL   la dirección del panel admin de la demo.   │
   │               El iframe, los dos botones y "Pantalla     │
   │               completa" salen de aquí.                   │
   │  DEMO_LECTURA lo que se le dice al directivo según       │
   │               cuántas acertó.                            │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  LA MEDICIÓN RESPETA EL PERMISO DE COOKIES               │
   │                                                          │
   │  Igual que js/alianzas.js: solo si js/analitica.js creó  │
   │  window.gtag (la persona aceptó) y no está apagada.      │
   │    demo_directivos_abierta  al entrar a la vista         │
   │    demo_jugada { aciertos }  al terminar una partida     │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var DEMO_PANEL = "https://directivos-iwitown.web.app";

/* De menos a más aciertos: se usa la primera cuyo "hasta" alcance. */
var DEMO_LECTURA = [
  { hasta: 1, texto: "En el panel verá en qué principio exacto se trabó, no solo la nota." },
  { hasta: 2, texto: "En el panel verá qué parte del tema domina y cuál todavía no." },
  { hasta: 3, texto: "En el panel verá el tema como dominado y qué le toca después." }
];

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {
  var seccion = document.getElementById("demo-directivos");
  if (!seccion) return;

  var API = "/api/demo-jugar";
  var VISTAS_PANEL = { reportes: "/demo", uso: "/demo?ver=informe" };

  function $(id) { return document.getElementById(id); }

  var pasos = { inicio: $("demoDirInicio"), cargando: $("demoDirCargando"),
                pregunta: $("demoDirPregunta"), final: $("demoDirFinal"),
                error: $("demoDirError") };

  var marco = $("demoDirMarco");
  var completa = $("demoDirCompleta");

  /* ---------- Estado ----------
     "partida" es lo que devolvió "empezar"; "n" la pregunta en pantalla
     (desde 0); "aciertos" cuántas lleva bien. "turno" descarta respuestas
     que llegan tarde (se volvió a empezar mientras tanto). */
  var partida = null;
  var n = 0;
  var aciertos = 0;
  var desde = 0;
  var turno = 0;
  var esLaUltima = false;

  /* ---------- Medición ---------- */

  function medir(evento, datos) {
    try {
      if (typeof window.gtag !== "function") return;
      if (typeof MEDICION === "string" && window["ga-disable-" + MEDICION]) return;
      window.gtag("event", evento, datos || {});
    } catch (e) {}
  }

  /* ---------- El servidor ----------
     Se lee como texto y luego JSON: si la función no está desplegada o el
     hosting responde una página de error, r.json() revienta con un mensaje
     que nadie entiende. Aquí se vuelve un mensaje amable. */

  var FALLA = "No pudimos conectarnos en este momento. Intente de nuevo en un rato.";

  function llamar(cuerpo, msMax) {
    var control = typeof AbortController === "function" ? new AbortController() : null;
    var corte = control ? window.setTimeout(function () { control.abort(); }, msMax) : null;

    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: control ? control.signal : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null;
        try { d = JSON.parse(t); } catch (e) {}
        return { estado: r.status, datos: d || {} };
      });
    }).then(function (res) {
      if (corte) window.clearTimeout(corte);
      return res;
    }, function () {
      if (corte) window.clearTimeout(corte);
      return { estado: 0, datos: {} };
    });
  }

  /* ---------- Pasos ---------- */

  function mostrarPaso(cual) {
    for (var k in pasos) if (pasos[k]) pasos[k].hidden = k !== cual;
  }

  /* ---------- El panel (iframe) ----------
     El iframe no se carga con la página: se carga la primera vez que se
     abre esta vista. Si no, cualquiera que entre al inicio se bajaría el
     panel entero sin verlo. */

  var vistaPanel = "reportes";

  function ponerPanel(cual, forzar) {
    vistaPanel = VISTAS_PANEL[cual] ? cual : "reportes";
    var url = DEMO_PANEL + VISTAS_PANEL[vistaPanel];
    /* Desde una pestaña se reasigna siempre: si adentro del panel se navegó
       a otra página, tocar la pestaña ya marcada también lo devuelve. */
    if (forzar || marco.getAttribute("src") !== url) marco.setAttribute("src", url);
    completa.href = url;
    var bs = seccion.querySelectorAll("[data-demo-panel]");
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed",
        bs[i].getAttribute("data-demo-panel") === vistaPanel ? "true" : "false");
    }
  }

  completa.href = DEMO_PANEL + VISTAS_PANEL.reportes;

  seccion.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("[data-demo-panel]") : null;
    if (b) ponerPanel(b.getAttribute("data-demo-panel"), true);
  });

  /* Al terminar la partida: el panel escucha este mensaje y se refresca. */
  function avisarAlPanel(uid) {
    try {
      if (marco.contentWindow) {
        marco.contentWindow.postMessage({ tipo: "demo-jugada", uid: uid }, DEMO_PANEL);
      }
    } catch (e) {}
  }

  /* ---------- Empezar ---------- */

  function empezar() {
    var mio = ++turno;
    partida = null;
    n = 0;
    aciertos = 0;
    $("demoDirEstado").textContent = "Preparando…";
    mostrarPaso("cargando");

    llamar({ accion: "empezar" }, 65000).then(function (res) {
      if (mio !== turno) return;
      var d = res.datos;
      if (res.estado !== 200 || !d.ok || !d.preguntas || !d.preguntas.length) {
        mostrarError(d.mensaje || FALLA);
        return;
      }
      partida = d;
      pintarEstudiante();
      pintarPregunta();
    });
  }

  function mostrarError(texto) {
    $("demoDirErrorTxt").textContent = texto;
    mostrarPaso("error");
  }

  function pintarEstudiante() {
    var e = partida.estudiante || {};
    $("demoDirNombre").textContent = e.nombre || "Estudiante";
    $("demoDirCurso").textContent = e.curso || "";
    $("demoDirTema").textContent = [partida.asignatura, partida.tema, partida.subtema]
      .filter(function (x) { return x; }).join(" · ");

    var foto = $("demoDirAvatar");
    var src = String(e.avatar || "");
    if (/^https:\/\//.test(src)) {
      foto.src = src;
      foto.hidden = false;
    } else {
      foto.removeAttribute("src");
      foto.hidden = true;
    }

    /* El aviso del panel nombra al estudiante: así el directivo sabe a
       quién buscar en el reporte. */
    $("demoDirBuscaNombre").textContent = e.nombre || "quien juegue";
    $("demoDirBuscaCurso").textContent = e.curso || "Cuarto A";
  }

  /* ---------- La pregunta ---------- */

  function premio(p) {
    var v = String(p.witkisPrize || "").trim();
    if (!v) return "";
    return v.charAt(0) === "§" ? v : "§" + v;
  }

  function pintarPregunta() {
    var p = partida.preguntas[n];
    var total = partida.preguntas.length;

    $("demoDirNumero").textContent = (n + 1) + "/" + total;
    var valor = premio(p);
    $("demoDirValor").textContent = valor;
    $("demoDirValor").hidden = !valor;
    $("demoDirTexto").textContent = p.question || "";

    /* LaTeX: no se mete una librería para esto. Se muestra el texto tal
       cual, en monoespaciado, debajo del enunciado. */
    var latex = p.visualKind === "latex" && p.visualData && p.visualData.latex
      ? String(p.visualData.latex) : "";
    $("demoDirLatex").textContent = latex;
    $("demoDirLatex").hidden = !latex;

    var img = $("demoDirImagen");
    if (p.imageUrl && /^https:\/\//.test(String(p.imageUrl))) {
      img.src = p.imageUrl;
      img.hidden = false;
    } else {
      img.removeAttribute("src");
      img.hidden = true;
    }

    var caja = $("demoDirOpciones");
    caja.textContent = "";
    (p.options || []).forEach(function (texto, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "demo-dir-opcion";
      var letra = document.createElement("span");
      letra.className = "demo-dir-opcion__letra";
      letra.textContent = "abcdefgh".charAt(i);
      var t = document.createElement("span");
      t.className = "demo-dir-opcion__txt";
      t.textContent = texto;
      b.appendChild(letra);
      b.appendChild(t);
      b.addEventListener("click", function () { responder(i); });
      caja.appendChild(b);
    });

    $("demoDirRetro").hidden = true;
    $("demoDirAviso").textContent = "";
    $("demoDirSiguiente").hidden = true;
    pintarAciertos();

    mostrarPaso("pregunta");
    $("demoDirTexto").focus();
    desde = Date.now();
  }

  function pintarAciertos() {
    $("demoDirAciertos").textContent = aciertos + (aciertos === 1 ? " correcta" : " correctas");
  }

  function botones() { return $("demoDirOpciones").querySelectorAll(".demo-dir-opcion"); }

  function bloquear(si) {
    var bs = botones();
    for (var i = 0; i < bs.length; i++) bs[i].disabled = si;
  }

  /* ---------- Responder ----------
     Un solo intento: al primer clic se bloquean todas (el servidor
     responde 409 a la segunda). Si falla la red, se desbloquean para que
     pueda intentarlo otra vez. */

  function responder(i) {
    var p = partida.preguntas[n];
    var mio = turno;
    bloquear(true);
    botones()[i].classList.add("es-elegida");
    $("demoDirAviso").textContent = "Revisando…";

    var segundos = Math.max(0, Math.min(3600, Math.round((Date.now() - desde) / 1000)));

    llamar({ accion: "responder", partida: partida.partida, pregunta_id: p.id,
             opcion: i, segundos: segundos }, 30000).then(function (res) {
      if (mio !== turno) return;
      var d = res.datos;
      var total = partida.preguntas.length;

      if (res.estado === 409) {
        $("demoDirAviso").textContent = d.mensaje || "Esta pregunta ya se respondió.";
        if (n + 1 >= total) terminar();
        cerrarPregunta(n + 1 >= total);
        return;
      }
      if (res.estado !== 200 || !d.ok) {
        botones()[i].classList.remove("es-elegida");
        bloquear(false);
        $("demoDirAviso").textContent = d.mensaje || FALLA;
        return;
      }

      $("demoDirAviso").textContent = "";
      var bs = botones();
      var buena = parseInt(d.correctAnswer, 10);
      for (var k = 0; k < bs.length; k++) {
        bs[k].classList.remove("es-elegida");
        if (k === buena) bs[k].classList.add("es-correcta");
        else if (k === i) bs[k].classList.add("es-errada");
        else bs[k].classList.add("es-gris");
      }
      if (d.correcta) aciertos++;
      pintarAciertos();

      if (d.retroalimentacion) {
        $("demoDirRetroTxt").textContent = d.retroalimentacion;
        $("demoDirRetroTitulo").textContent = d.correcta ? "¡Correcto!" : "No era esa";
        $("demoDirRetro").classList.toggle("es-bien", !!d.correcta);
        $("demoDirRetro").hidden = false;
      }

      var fin = !!d.fin || n + 1 >= total;
      if (fin) terminar();
      cerrarPregunta(fin);
    });
  }

  function cerrarPregunta(fin) {
    esLaUltima = fin;
    $("demoDirSiguiente").textContent = fin ? "Ver resultado" : "Siguiente";
    $("demoDirSiguiente").hidden = false;
  }

  $("demoDirSiguiente").addEventListener("click", function () {
    if (esLaUltima) {
      pintarFinal();
      return;
    }
    n++;
    pintarPregunta();
  });

  /* ---------- Fin ----------
     Se avisa al panel en cuanto llega la última respuesta, no al tocar
     "Ver resultado": así se va refrescando mientras se lee el resumen. */

  var avisada = null;

  function terminar() {
    if (avisada === partida) return;
    avisada = partida;
    var uid = partida.estudiante && partida.estudiante.uid;
    avisarAlPanel(uid);
    medir("demo_jugada", { aciertos: aciertos });
  }

  function pintarFinal() {
    var total = partida.preguntas.length;
    $("demoDirResultado").textContent = aciertos + "/" + total;
    var lectura = DEMO_LECTURA.filter(function (l) { return aciertos <= l.hasta; })[0] ||
                  DEMO_LECTURA[DEMO_LECTURA.length - 1];
    $("demoDirLectura").textContent = lectura.texto;
    mostrarPaso("final");
    $("demoDirResultado").focus();
  }

  $("demoDirEmpezar").addEventListener("click", empezar);
  $("demoDirOtraVez").addEventListener("click", empezar);
  $("demoDirReintentar").addEventListener("click", empezar);

  /* ---------- Entrar y salir de la vista ----------
     js/vistas.js avisa con "vista-cambio" cada vez que pinta una vista.
     La primera vez puede haber pasado antes de cargar este archivo (se
     entró directo a /demo-directivos), así que también se mira al cargar. */

  var abierta = false;

  function alCambiar(vista) {
    var ahora = vista === "demo-directivos";
    if (ahora && !abierta) {
      if (!marco.getAttribute("src")) ponerPanel(vistaPanel);
      medir("demo_directivos_abierta");
    }
    abierta = ahora;
  }

  document.addEventListener("vista-cambio", function (ev) {
    alCambiar(ev.detail && ev.detail.vista);
  });

  if (!seccion.hidden) alCambiar("demo-directivos");
})();
