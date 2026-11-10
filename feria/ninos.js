/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — instructivo para estudiantes.                       │
   │                                                                      │
   │  1. El carrusel: la tarjeta del centro queda al frente; las de los   │
   │     lados, giradas y atrás. Se pasa con el dedo, con las flechas     │
   │     (las de la pantalla o las del teclado), con los puntos o         │
   │     tocando una tarjeta de lado. NO avanza solo: cada niño lee a     │
   │     su ritmo.                                                        │
   │  2. Cada tarjeta nueva suena a caja registradora y lanza             │
   │     serpentinas; en la última, muchas (son de fiesta.js, que va      │
   │     antes).                                                          │
   │  3. La raya amarilla de arriba muestra cuántas tarjetas van.         │
   │  4. Lo de abajo ("¡Recuerda!") aparece al llegar a la pantalla.      │
   │                                                                      │
   │ Sin JavaScript las tarjetas se ven una debajo de otra, completas.    │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  // La clase "js" la pone ESTE archivo y no un script en la página: es la que
  // esconde lo que se anima. Si este archivo no carga, la página se ve completa.
  document.documentElement.classList.add("js");

  var Feria = window.Feria;
  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Carrusel ---------- */
  var carrusel = document.querySelector(".nf-carrusel");
  var pista = carrusel && carrusel.querySelector(".nf-pista");
  var tarjetas = pista ? Array.prototype.slice.call(pista.querySelectorAll(".nf-paso")) : [];
  var controles = carrusel && carrusel.querySelector(".nf-controles");
  var cuenta = carrusel && carrusel.querySelector(".nf-cuenta");
  var avance = document.querySelector(".nf-avance span");

  if (tarjetas.length > 1 && controles) {
    var actual = 0;
    var total = tarjetas.length;
    var antBtn = controles.querySelector('[data-ir="-1"]');
    var sigBtn = controles.querySelector('[data-ir="1"]');
    var cajaPuntos = controles.querySelector(".nf-puntos");
    var puntos = [];

    tarjetas.forEach(function (t, i) {
      var titulo = t.querySelector("h3");
      t.setAttribute("role", "group");
      t.setAttribute("aria-roledescription", "tarjeta");
      t.setAttribute("aria-label", (i + 1) + " de " + total + (titulo ? ": " + titulo.textContent : ""));
      var p = document.createElement("button");
      p.type = "button";
      p.className = "nf-punto";
      p.setAttribute("aria-label", "Ir a la tarjeta " + (i + 1));
      p.addEventListener("click", function () { ir(i, p); });
      cajaPuntos.appendChild(p);
      puntos.push(p);
    });

    function medir() {
      // 60 = el aire de arriba y de abajo, para que no se corte la sombra.
      pista.style.height = (tarjetas[actual].offsetHeight + 60) + "px";
    }
    function pintar() {
      tarjetas.forEach(function (t, i) {
        var pos = i - actual;
        if (Math.abs(pos) <= 2) t.setAttribute("data-pos", pos); else t.removeAttribute("data-pos");
        // Solo la del frente se puede leer y recorrer con el teclado.
        if (pos === 0) { t.removeAttribute("inert"); t.removeAttribute("aria-hidden"); }
        else { t.setAttribute("inert", ""); t.setAttribute("aria-hidden", "true"); }
        // Las imágenes de las tarjetas cercanas se piden ya, para que no lleguen en blanco.
        if (Math.abs(pos) <= 2) t.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = "eager"; });
      });
      puntos.forEach(function (p, i) { if (i === actual) p.setAttribute("aria-current", "true"); else p.removeAttribute("aria-current"); });
      antBtn.disabled = actual === 0;
      sigBtn.disabled = actual === total - 1;
      if (cuenta) cuenta.innerHTML = "<b>" + (actual + 1) + "</b> de " + total;
      if (avance) avance.style.width = ((actual + 1) / total * 100) + "%";
      pista.classList.toggle("lados", total > 1);
      medir();
    }
    // "desde" es lo que la persona tocó: de ahí salen las serpentinas.
    function ir(i, desde) {
      i = Math.max(0, Math.min(total - 1, i));
      if (i === actual) return;
      // Se anota quién tenía el foco ANTES de pintar: al apagarse un botón, el
      // navegador le quita el foco y ya no se sabría de quién era.
      var conFoco = document.activeElement;
      actual = i;
      pintar();
      if (Feria) {
        Feria.caja();
        if (actual === total - 1) {
          // La última tarjeta: ¡fiesta completa!
          var r = pista.getBoundingClientRect();
          Feria.serpentinas(r.left + r.width * 0.25, r.top + 120, 34);
          Feria.serpentinas(r.left + r.width * 0.75, r.top + 120, 34);
        } else {
          Feria.serpentinasEn(desde || tarjetas[actual], 12);
        }
      }
      // Si el botón que tenía el foco se apagó (primera o última tarjeta), el
      // foco pasa al otro: si no, se pierde y el teclado deja de responder.
      if (conFoco === antBtn && antBtn.disabled) sigBtn.focus({ preventScroll: true });
      else if (conFoco === sigBtn && sigBtn.disabled) antBtn.focus({ preventScroll: true });
      // Solo si el inicio de la tarjeta nueva quedó por encima de la pantalla
      // se sube hasta ella. Las flechas no se pierden: van pegadas abajo.
      if (pista.getBoundingClientRect().top < 0) {
        pista.scrollIntoView({ block: "start", behavior: reducir ? "auto" : "smooth" });
      }
    }

    antBtn.addEventListener("click", function () { ir(actual - 1, antBtn); });
    sigBtn.addEventListener("click", function () { ir(actual + 1, sigBtn); });

    // Tocar una tarjeta de lado la trae al frente. Las de lado no reciben
    // toques (están "inert"), así que el toque llega a la pista: se mira de
    // qué lado del centro cayó.
    pista.addEventListener("click", function (e) {
      if (e.target !== pista) return;
      var r = pista.getBoundingClientRect();
      ir(actual + (e.clientX < r.left + r.width / 2 ? -1 : 1));
    });

    // Con el dedo: deslizar a los lados. Hacia arriba o abajo sigue siendo
    // bajar por la página (touch-action: pan-y en el CSS).
    var x0 = null, y0 = 0;
    pista.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    pista.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) ir(actual + (dx < 0 ? 1 : -1));
    }, { passive: true });

    // Con el teclado: flechas, cuando se está dentro del carrusel.
    carrusel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { ir(actual + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { ir(actual - 1); e.preventDefault(); }
    });

    carrusel.classList.add("activo");
    controles.hidden = false;
    if (cuenta) cuenta.hidden = false;
    pintar();

    // La altura se vuelve a medir si cambia el tamaño (girar el celular, la
    // letra que termina de cargar, una imagen que llega).
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(medir);
      tarjetas.forEach(function (t) { ro.observe(t); });
    } else {
      window.addEventListener("resize", medir);
      window.addEventListener("load", medir);
    }
  }

  /* ---------- 4. Aparecer al llegar ---------- */
  var animados = document.querySelectorAll(".nf-anim");
  function verTodo() { animados.forEach(function (t) { t.classList.add("visible"); }); }
  if (reducir || !("IntersectionObserver" in window)) {
    verTodo();
    return;
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  animados.forEach(function (t) { obs.observe(t); });
  // Al imprimir se muestra todo.
  window.addEventListener("beforeprint", verTodo);
})();
