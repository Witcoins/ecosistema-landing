/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — la "fiesta" que comparten los cuatro instructivos   │
   │ (estudiantes, familias, docentes y administrativos). Va ANTES de     │
   │ adultos.js o ninos.js, que la usan con window.Feria.                 │
   │                                                                      │
   │  1. La luz del fondo sigue el cursor (solo donde hay cursor).        │
   │  2. Serpentinas que explotan ....... Feria.serpentinas(x, y, n)      │
   │  3. Sonido de caja registradora .... Feria.caja()                    │
   │     No es un archivo de audio: se fabrica aquí mismo (así no hay     │
   │     nada que descargar ni licencias). Solo suena cuando la persona   │
   │     toca algo, y el botón [data-sonido] lo apaga y lo recuerda.      │
   │  4. Los textos con data-texto aparecen palabra por palabra.          │
   │                                                                      │
   │ Con "reducir movimiento" no hay serpentinas ni textos animados.      │
   │ Sin JavaScript no pasa nada de esto y la página se lee completa.     │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  var Feria = window.Feria = {};
  var raiz = document.documentElement;
  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Feria.reducir = reducir;

  /* ---------- 1. La luz sigue el cursor ---------- */
  var conCursor = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (conCursor && !reducir) {
    var luzPendiente = false, px = 0, py = 0;
    window.addEventListener("pointermove", function (e) {
      px = e.clientX; py = e.clientY;
      if (luzPendiente) return;
      luzPendiente = true;
      requestAnimationFrame(function () {
        raiz.style.setProperty("--x", px + "px");
        raiz.style.setProperty("--y", py + "px");
        luzPendiente = false;
      });
    }, { passive: true });
  }

  /* ---------- 2. Serpentinas ---------- */
  // Solo los colores de la feria: amarillo, crema y morado claro.
  var COLORES = ["#FFC93A", "#FFC93A", "#FFF7EA", "#D692CE"];
  var capa = null, vivas = 0;
  Feria.serpentinas = function (x, y, cantidad) {
    if (reducir || !document.body || !document.body.animate) return;
    if (document.hidden || vivas > 160) return;   // nunca se acumulan
    if (!capa) {
      capa = document.createElement("div");
      capa.className = "fx-capa";
      capa.setAttribute("aria-hidden", "true");
      document.body.appendChild(capa);
    }
    cantidad = cantidad || 28;
    for (var i = 0; i < cantidad; i++) {
      (function () {
        var p = document.createElement("i");
        var tipo = Math.random();
        // Tres formas: tira larga (serpentina), papelito y círculo.
        p.className = "fx-pieza" + (tipo < .45 ? " fx-tira" : tipo < .8 ? "" : " fx-punto");
        p.style.background = COLORES[Math.floor(Math.random() * COLORES.length)];
        p.style.left = x + "px";
        p.style.top = y + "px";
        var ang = Math.random() * Math.PI * 2;
        var fuerza = 90 + Math.random() * 230;
        var dx = Math.cos(ang) * fuerza;
        var dy = Math.sin(ang) * fuerza - 90;          // salen un poco hacia arriba
        var giro = (Math.random() * 900 - 450) + "deg";
        var dur = 1100 + Math.random() * 900;
        capa.appendChild(p);
        vivas++;
        var anim = p.animate([
          { transform: "translate(0,0) rotate(0deg) scale(.4)", opacity: 1 },
          { transform: "translate(" + dx + "px," + dy + "px) rotate(" + giro + ") scale(1)", opacity: 1, offset: .35 },
          { transform: "translate(" + (dx * 1.25) + "px," + (dy + 260 + Math.random() * 160) + "px) rotate(" + giro + ") scale(.9)", opacity: 0 }
        ], { duration: dur, easing: "cubic-bezier(.15,.7,.3,1)", fill: "forwards" });
        var quitar = function () { vivas--; if (p.parentNode) p.parentNode.removeChild(p); };
        anim.onfinish = quitar;
        anim.oncancel = quitar;
      })();
    }
  };
  // Desde el centro de un elemento (un botón, una tarjeta).
  Feria.serpentinasEn = function (el, cantidad) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    Feria.serpentinas(r.left + r.width / 2, r.top + r.height / 2, cantidad);
  };

  /* ---------- 3. Caja registradora ---------- */
  var CLAVE = "feria-sonido";
  var conSonido = true;
  try { conSonido = localStorage.getItem(CLAVE) !== "no"; } catch (e) { /* sin almacenamiento: suena */ }
  var audio = null;
  function contexto() {
    if (audio) return audio;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { audio = new C(); } catch (e) { audio = null; }
    return audio;
  }
  function campana(ctx, cuando, tono, volumen, dura) {
    // Una campanita: dos ondas (la nota y un brillo) que se apagan rápido.
    [1, 2.76].forEach(function (mult, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i ? "sine" : "triangle";
      o.frequency.value = tono * mult;
      g.gain.setValueAtTime(0.0001, cuando);
      g.gain.exponentialRampToValueAtTime(volumen / (i ? 3 : 1), cuando + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, cuando + dura);
      o.connect(g); g.connect(ctx.destination);
      o.start(cuando); o.stop(cuando + dura + 0.05);
    });
  }
  function golpe(ctx, cuando) {
    // El "ca" de la caja: un golpecito seco de ruido (el cajón que se abre).
    var n = Math.floor(ctx.sampleRate * 0.05);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = "bandpass"; f.frequency.value = 1800; g.gain.value = 0.22;
    s.connect(f); f.connect(g); g.connect(ctx.destination);
    s.start(cuando);
  }
  // "¡Ca-chin!". Solo se llama desde un toque o clic: los navegadores no
  // dejan sonar nada antes de que la persona toque la página.
  Feria.caja = function () {
    if (!conSonido) return;
    var ctx = contexto();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + 0.01;
      golpe(ctx, t);
      campana(ctx, t + 0.07, 2093, 0.16, 0.5);    // do agudo
      campana(ctx, t + 0.16, 2637, 0.2, 0.9);     // mi: el "chin"
    } catch (e) { /* si el audio falla, la página sigue igual */ }
  };

  var botones = document.querySelectorAll("[data-sonido]");
  function pintarSonido() {
    botones.forEach(function (b) {
      b.setAttribute("aria-pressed", conSonido ? "true" : "false");
      var t = b.querySelector("[data-sonido-txt]");
      if (t) t.textContent = conSonido ? "Sonido" : "Sin sonido";
    });
  }
  botones.forEach(function (b) {
    b.hidden = false;   // el botón solo sirve con JavaScript: por eso llega oculto
    b.addEventListener("click", function () {
      conSonido = !conSonido;
      try { localStorage.setItem(CLAVE, conSonido ? "si" : "no"); } catch (e) { /* sin almacenamiento */ }
      pintarSonido();
      if (conSonido) Feria.caja();
    });
  });
  pintarSonido();

  /* ---------- 4. Textos que aparecen palabra por palabra ---------- */
  // Se parte cada texto en palabras (respetando las negritas y demás etiquetas
  // de adentro) y cada palabra sube con un pequeño retraso.
  function partir(el) {
    var n = 0;
    // En los títulos, el lector de pantalla lee la frase entera (aria-label) y
    // no palabra por palabra.
    var esTitulo = /^H[1-6]$/.test(el.tagName);
    if (esTitulo) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    var textos = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) textos.push(w.currentNode);
    textos.forEach(function (nodo) {
      var partes = nodo.nodeValue.split(/(\s+)/);
      if (partes.length < 2 && !partes[0]) return;
      var frag = document.createDocumentFragment();
      partes.forEach(function (parte) {
        if (!parte) return;
        if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span");
        s.className = "fx-palabra";
        if (esTitulo) s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", n++);
        s.textContent = parte;
        frag.appendChild(s);
      });
      nodo.parentNode.replaceChild(frag, nodo);
    });
  }
  var conTexto = document.querySelectorAll("[data-texto]");
  if (!reducir && "IntersectionObserver" in window && conTexto.length) {
    raiz.classList.add("fx-textos");
    var obsTexto = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("fx-leido"); obsTexto.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    conTexto.forEach(function (el) { partir(el); obsTexto.observe(el); });
    // Al imprimir se ve todo.
    window.addEventListener("beforeprint", function () {
      conTexto.forEach(function (el) { el.classList.add("fx-leido"); });
    });
  }

  /* ---------- Bienvenida: serpentinas al entrar ---------- */
  // Dos explosiones desde arriba, una a cada lado. Sin sonido: todavía nadie
  // ha tocado la página.
  window.addEventListener("load", function () {
    setTimeout(function () {
      var ancho = window.innerWidth;
      Feria.serpentinas(ancho * 0.18, 150, 26);
      Feria.serpentinas(ancho * 0.82, 150, 26);
    }, 350);
  });
})();
