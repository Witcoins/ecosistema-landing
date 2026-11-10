/* Feria I'witown — instructivo para estudiantes.
   Cada tarjeta aparece con una animación suave cuando llega a la pantalla.
   Sin soporte (o con "reducir movimiento"), todo se ve desde el inicio. */
(function () {
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
