/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — instructivos para adultos (familias, docentes y     │
   │ administrativos).                                                    │
   │                                                                      │
   │  1. La raya amarilla de arriba se llena a medida que se baja.        │
   │  2. Las secciones aparecen al llegar a la pantalla.                  │
   │  3. Abrir una pregunta suena a caja registradora y lanza             │
   │     serpentinas (las dos cosas son de fiesta.js, que va antes).      │
   │  4. Un link con #tema (por ejemplo ...#cobrar) abre esa pregunta.    │
   │  5. Imprimir / Guardar PDF: imprime todo, con las preguntas y los    │
   │     detalles abiertos, y después los deja como estaban.              │
   │                                                                      │
   │ La luz que sigue el cursor, las serpentinas, el sonido y los textos  │
   │ animados están en fiesta.js.                                         │
   │                                                                      │
   │ Las preguntas se abren solas (son <details>): sin JavaScript la      │
   │ página funciona completa.                                            │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  // La clase "js" la pone ESTE archivo y no un script en la página: es la que
  // esconde las secciones para animarlas. Si este archivo no llega a cargar,
  // nadie las esconde y la página se ve completa.
  document.documentElement.classList.add("js");

  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Avance ---------- */
  var avance = document.querySelector(".fa-avance span");
  if (avance) {
    var pendiente = false;
    var medir = function () {
      pendiente = false;
      var d = document.documentElement;
      var total = d.scrollHeight - window.innerHeight;
      var y = window.pageYOffset || d.scrollTop || 0;
      avance.style.width = (total > 0 ? Math.min(100, Math.max(0, y / total * 100)) : 0) + "%";
    };
    var pedir = function () { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    medir();
  }

  /* ---------- 2. Aparecer al llegar ---------- */
  var animados = document.querySelectorAll(".fa-anim");
  function verTodo() { animados.forEach(function (el) { el.classList.add("visible"); }); }
  if (reducir || !("IntersectionObserver" in window)) {
    verTodo();
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    animados.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- 3. Abrir una pregunta: caja registradora y serpentinas ---------- */
  // Se escucha el toque en la pregunta (y no el evento "toggle") para que no
  // suene cuando la abre un link o la impresión.
  var Feria = window.Feria;
  document.querySelectorAll(".fa-faq > summary").forEach(function (s) {
    s.addEventListener("click", function () {
      if (!Feria || s.parentNode.open) return;   // se está cerrando: en silencio
      Feria.caja();
      Feria.serpentinasEn(s.querySelector(".fa-faq-mas") || s, 14);
    });
  });

  /* ---------- 4. Un link con #tema abre esa pregunta ---------- */
  function abrirDesdeDireccion() {
    var h = location.hash.slice(1);
    if (!h) return;
    try { h = decodeURIComponent(h); } catch (e) { /* link mal formado: se usa tal cual */ }
    var el = document.getElementById(h);
    if (!el || !el.classList.contains("fa-faq")) return;
    el.open = true;
    el.classList.add("visible");
    el.scrollIntoView({ block: "start" });
  }
  window.addEventListener("hashchange", abrirDesdeDireccion);
  abrirDesdeDireccion();

  /* ---------- 5. Imprimir: todo abierto ---------- */
  var cerrados = [];
  function abrirTodo() {
    verTodo();
    document.querySelectorAll("details.fa-faq, details.fa-det").forEach(function (d) {
      if (!d.open) { cerrados.push(d); d.open = true; }
    });
  }
  function restaurar() { cerrados.forEach(function (d) { d.open = false; }); cerrados = []; }
  window.addEventListener("beforeprint", abrirTodo);
  window.addEventListener("afterprint", restaurar);
  var imprimir = document.querySelector(".fa-imprimir");
  if (imprimir) {
    imprimir.hidden = false;   // el botón solo sirve con JavaScript: por eso llega oculto
    imprimir.addEventListener("click", function () { abrirTodo(); window.print(); });
  }
})();
