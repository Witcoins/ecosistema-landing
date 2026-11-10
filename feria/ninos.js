/* Feria I'witown — instructivo para estudiantes.
   Cada tarjeta aparece con una animación suave cuando llega a la pantalla.
   Sin soporte (o con "reducir movimiento"), todo se ve desde el inicio.
   La raya amarilla de arriba se llena a medida que se baja. */
(function () {
  // Avance: cuánto de la aventura se ha bajado.
  var avance = document.querySelector(".nf-avance span");
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

  var tarjetas = document.querySelectorAll(".nf-anim");
  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducir || !("IntersectionObserver" in window)) {
    tarjetas.forEach(function (t) { t.classList.add("visible"); });
    return;
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  tarjetas.forEach(function (t) { obs.observe(t); });
  // Al imprimir se muestra todo.
  window.addEventListener("beforeprint", function () {
    tarjetas.forEach(function (t) { t.classList.add("visible"); });
  });
})();
