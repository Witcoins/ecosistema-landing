/* ============================================================
   i'Witown — Las vistas de la página
   ============================================================

   La página no es un rollo largo por el que se baja: cada pestaña
   del menú REEMPLAZA lo que hay en pantalla. Se toca "El problema"
   y esa sección ocupa el lugar del inicio; se toca el logo y vuelve
   el inicio, con su celular y todo.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE VE EN CADA PESTAÑA: "VISTAS", AQUÍ ABAJO.        │
   │                                                          │
   │  Cada línea es una pestaña, y la lista de al lado son    │
   │  las secciones que se muestran juntas en esa pestaña.    │
   │  Los nombres son los "id" de cada <section> del HTML.    │
   │                                                          │
   │  Para mover una sección de pestaña, se cambia de lista.  │
   │  Para agregar una pestaña nueva, se agrega una línea     │
   │  aquí y un enlace en el menú del index.html.             │
   └──────────────────────────────────────────────────────────┘

   El pie de página no entra en ninguna: se ve siempre.
   ============================================================ */

var VISTAS = {
  "inicio":     ["inicio", "presentacion"],
  "marca":      ["marca"],
  "problema":   ["problema"],
  "solucion":   ["solucion"],
  "ecosistema": ["ecosistema"],
  "acp":        ["acp"],
  "consultoria":["consultoria"],
  "contacto":   ["contacto"],
  "conversemos":["conversemos"]
};

/* La pestaña con la que abre la página */
var VISTA_INICIAL = "inicio";

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {

  /* De qué vista es cada sección. Se arma al revés de la lista de
     arriba, para poder preguntar "¿a qué pestaña pertenece esto?"
     cuando alguien llega con un enlace directo. */
  var deQueVista = {};
  var todas = [];
  for (var v in VISTAS) {
    for (var i = 0; i < VISTAS[v].length; i++) {
      deQueVista[VISTAS[v][i]] = v;
      todas.push(VISTAS[v][i]);
    }
  }

  var actual = null;

  function seccion(id) { return document.getElementById(id); }

  /* ---- Mostrar una vista ---- */
  function mostrar(vista, haciaDonde) {
    if (!VISTAS[vista]) vista = VISTA_INICIAL;

    for (var i = 0; i < todas.length; i++) {
      var el = seccion(todas[i]);
      if (el) el.hidden = (deQueVista[todas[i]] !== vista);
    }

    /* La pestaña del menú se pinta como la que está abierta */
    var enlaces = document.querySelectorAll(".nav__links a");
    for (var e = 0; e < enlaces.length; e++) {
      var destino = (enlaces[e].getAttribute("href") || "").replace("#", "");
      enlaces[e].classList.toggle("es-actual", deQueVista[destino] === vista);
    }

    /* En el teléfono, el desplegable se cierra solo al escoger */
    var menu = document.getElementById("menu");
    var burger = document.getElementById("burger");
    if (menu) menu.classList.remove("is-abierto");
    if (burger) {
      burger.classList.remove("is-abierto");
      burger.setAttribute("aria-expanded", "false");
    }

    actual = vista;

    /* Si el enlace apuntaba a una sección de más abajo dentro de la
       misma vista, se baja hasta ella; si no, se sube al principio. */
    var destinoEl = haciaDonde ? seccion(haciaDonde) : null;
    if (destinoEl && VISTAS[vista][0] !== haciaDonde) {
      destinoEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ---- Qué vista pide la dirección ---- */
  function laDeLaDireccion() {
    var id = (window.location.hash || "").replace("#", "");
    if (!id) return { vista: VISTA_INICIAL, seccion: null };
    if (deQueVista[id]) return { vista: deQueVista[id], seccion: id };
    return { vista: VISTA_INICIAL, seccion: null };
  }

  function alCambiarLaDireccion() {
    var q = laDeLaDireccion();
    mostrar(q.vista, q.seccion);
  }

  /* ---- Los clics ----

     Cualquier enlace que apunte a una sección conocida cambia de
     vista en vez de desplazar la página. El logo lleva al inicio. */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!a) return;

    var id = (a.getAttribute("href") || "").replace("#", "");
    if (!id || !deQueVista[id]) return;      // "#" a secas, o algo de adentro

    ev.preventDefault();

    var vista = deQueVista[id];
    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", "#" + id);
    } else {
      window.location.hash = id;
    }
    mostrar(vista, id);
  });

  window.addEventListener("hashchange", alCambiarLaDireccion);
  window.addEventListener("popstate", alCambiarLaDireccion);

  /* Lo usa js/presentacion.js: el botón "Ver simulador" tiene que
     asegurarse de que la vista del inicio esté a la vista antes de
     arrancar la presentación. */
  window.vistaAlInicio = function () {
    if (actual !== "inicio") mostrar("inicio", null);
  };

  alCambiarLaDireccion();
})();
