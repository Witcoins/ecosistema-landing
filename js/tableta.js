/* ============================================================
   i'Witown — La tableta de "El problema"
   ============================================================

   La pantalla de la tableta no se queda quieta: va corriendo hacia
   arriba, en este orden y volviendo a empezar.

     1. Las tres tarjetas.
     2. La tarjeta 01 arriba y su imagen debajo.
     3. La tarjeta 02 arriba y su imagen debajo.
     4. La tarjeta 03 arriba y su imagen debajo.
     5. Otra vez las tres.

   Cada escena entra DESDE ABAJO y empuja hacia arriba a la anterior,
   como una cinta. Por eso todas están puestas una debajo de la otra
   en un "riel", y lo único que se mueve es el riel entero.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ ABAJO                         │
   │                                                          │
   │  TAB_SEGUNDOS_TRES  cuánto se quedan las tres tarjetas.  │
   │  TAB_SEGUNDOS_UNA   cuánto se queda cada tarjeta sola.   │
   │                                                          │
   │  El texto de las tarjetas NO se toca aquí: está en el    │
   │  index.html, dentro de la tableta. Este archivo las      │
   │  clona, así que se escribe una sola vez.                 │
   │                                                          │
   │  La imagen de cada escena es la misma que ya tiene la    │
   │  tarjeta en su atributo "data-foto".                     │
   └──────────────────────────────────────────────────────────┘

   Se detiene solo mientras el mouse está encima, para que nadie
   pierda de vista lo que estaba leyendo.
   ============================================================ */

var TAB_SEGUNDOS_TRES = 3.6;
var TAB_SEGUNDOS_UNA  = 3.2;

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {
  var riel = document.getElementById("tabRiel");
  if (!riel) return;

  var primera = riel.querySelector(".tableta__escena--todas");
  if (!primera) return;

  var tarjetas = primera.querySelectorAll(".tarjeta");
  if (!tarjetas.length) return;

  /* ---- Armar las escenas ----

     Las de una sola tarjeta se arman clonando la original y poniéndole
     debajo su imagen. Al final se repite la escena de las tres: cuando
     el riel llega a esa copia, se devuelve al principio de un salto,
     sin transición, y nadie nota el corte. Es lo que hace que el
     movimiento siempre vaya hacia arriba y nunca retroceda. */

  for (var i = 0; i < tarjetas.length; i++) {
    riel.appendChild(escenaDeUna(tarjetas[i]));
  }

  var copia = primera.cloneNode(true);
  apagarParaLectores(copia);
  riel.appendChild(copia);

  function escenaDeUna(tarjeta) {
    var escena = document.createElement("div");
    escena.className = "tableta__escena tableta__escena--una";

    var clon = tarjeta.cloneNode(true);
    clon.classList.add("tarjeta--sola");
    escena.appendChild(clon);

    var ruta = tarjeta.getAttribute("data-foto");
    if (ruta) {
      var marco = document.createElement("div");
      marco.className = "tableta__foto";

      var img = document.createElement("img");
      img.src = ruta;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.loading = "lazy";

      marco.appendChild(img);
      escena.appendChild(marco);
    }

    apagarParaLectores(escena);
    return escena;
  }

  /* Las copias no deben sonar dos veces en un lector de pantalla ni
     robar paradas del tabulador: el original ya está ahí. */
  function apagarParaLectores(escena) {
    escena.setAttribute("aria-hidden", "true");
    var focos = escena.querySelectorAll("[tabindex]");
    for (var k = 0; k < focos.length; k++) focos[k].setAttribute("tabindex", "-1");
  }

  /* ---- Mover el riel ---- */

  var total = riel.children.length;          // 3 + las de una + la copia
  var donde = 0;
  var reloj = null;
  var quieto = false;

  /* Si en el sistema está pedido "menos movimiento", el riel cambia de
     escena de un corte, sin deslizarse. */
  var sinMovimiento = window.matchMedia &&
                      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sinMovimiento) riel.style.transition = "none";

  function pintar(conDeslizada) {
    riel.style.transition = (conDeslizada && !sinMovimiento) ? "" : "none";
    riel.style.transform = "translateY(-" + (donde * 100) + "%)";
  }

  function cuantoDura() {
    /* La escena 0 —y su copia del final— son las tres tarjetas */
    var esDeTres = (donde === 0 || donde === total - 1);
    return (esDeTres ? TAB_SEGUNDOS_TRES : TAB_SEGUNDOS_UNA) * 1000;
  }

  function seguir() {
    parar();
    reloj = window.setTimeout(function () {
      if (quieto) { seguir(); return; }
      avanzar();
    }, cuantoDura());
  }

  function parar() {
    if (reloj) { window.clearTimeout(reloj); reloj = null; }
  }

  function avanzar() {
    donde++;

    if (donde >= total) {
      /* Ya se está viendo la copia de las tres: se salta al original
         sin deslizar y se sigue desde ahí. */
      donde = 0;
      pintar(false);
      /* Un respiro antes de volver a empezar, si no el salto y el
         siguiente movimiento se pisan. */
      window.setTimeout(seguir, 40);
      return;
    }

    pintar(true);
    seguir();
  }

  /* ---- Cuándo anda ----

     Solo mientras la tableta se ve en pantalla: no tiene sentido que
     vaya corriendo escenas en una sección que está escondida. */

  var tableta = riel.closest ? riel.closest(".tableta") : null;

  function encender()  { quieto = false; seguir(); }
  function apagar()    { parar(); }

  if (tableta) {
    tableta.addEventListener("mouseenter", function () { quieto = true; });
    tableta.addEventListener("mouseleave", function () { quieto = false; });
  }

  if (window.IntersectionObserver && tableta) {
    var vigia = new IntersectionObserver(function (entradas) {
      for (var e = 0; e < entradas.length; e++) {
        if (entradas[e].isIntersecting) encender();
        else apagar();
      }
    }, { threshold: 0.25 });
    vigia.observe(tableta);
  } else {
    encender();
  }

  /* En segundo plano la pestaña no gasta nada */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) apagar();
    else encender();
  });

  pintar(false);
})();
