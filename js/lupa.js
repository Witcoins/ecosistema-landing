/* ============================================================
   i'Witown — El visor de imágenes
   ============================================================

   Abre la imagen de una tarjeta a pantalla grande. Hoy lo usan las
   tres tarjetas de "El problema".

   ┌──────────────────────────────────────────────────────────┐
   │  PARA QUE UNA TARJETA ABRA SU IMAGEN                     │
   │                                                          │
   │  Se le pone en el HTML el atributo "data-foto" con la    │
   │  ruta del archivo. Nada más:                             │
   │                                                          │
   │    <article class="tarjeta"                              │
   │             data-foto="assets/img/problema/01.webp">     │
   │                                                          │
   │  El pie que sale debajo de la imagen lo toma del título  │
   │  de la propia tarjeta.                                   │
   └──────────────────────────────────────────────────────────┘

   Se cierra de tres maneras: con la X, tocando el fondo, o con
   la tecla Escape.
   ============================================================ */

(function () {
  var lupa   = document.getElementById("lupa");
  var foto   = document.getElementById("lupaFoto");
  var pie    = document.getElementById("lupaPie");
  var cerrar = document.getElementById("lupaCerrar");
  if (!lupa || !foto) return;

  /* De dónde se venía, para devolverle el foco al cerrar */
  var deDonde = null;

  function abrir(tarjeta) {
    var ruta = tarjeta.getAttribute("data-foto");
    if (!ruta) return;

    var titulo = tarjeta.querySelector("h3");
    var texto = titulo ? titulo.textContent.trim() : "";

    foto.src = ruta;
    foto.alt = texto;
    if (pie) pie.textContent = texto;

    deDonde = tarjeta;
    lupa.hidden = false;
    document.body.classList.add("con-lupa");
    if (cerrar) cerrar.focus();
  }

  function cerrarla() {
    lupa.hidden = true;
    document.body.classList.remove("con-lupa");
    foto.removeAttribute("src");        // no se queda cargada de fondo
    if (deDonde) { deDonde.focus(); deDonde = null; }
  }

  /* Lo usa js/mapa.js: el ecosistema abre aquí la foto de la app que
     está puesta de fondo en su tarjeta. */
  window.abrirLupa = function (ruta, texto) {
    if (!ruta) return;
    foto.src = ruta;
    foto.alt = texto || "";
    if (pie) pie.textContent = texto || "";
    deDonde = document.activeElement;
    lupa.hidden = false;
    document.body.classList.add("con-lupa");
    if (cerrar) cerrar.focus();
  };

  /* ---- Abrir ---- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-foto]") : null;
    if (t) { abrir(t); return; }

    /* Tocar el fondo del visor lo cierra; tocar la imagen no. */
    if (!lupa.hidden) {
      if (e.target === lupa || (cerrar && cerrar.contains(e.target))) cerrarla();
    }
  });

  /* Con el teclado: Enter o espacio sobre la tarjeta */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lupa.hidden) { cerrarla(); return; }

    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      var t = document.activeElement;
      if (t && t.hasAttribute && t.hasAttribute("data-foto")) {
        e.preventDefault();
        abrir(t);
      }
    }
  });
})();
