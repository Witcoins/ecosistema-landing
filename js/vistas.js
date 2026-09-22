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

/* La descripción de cada vista: es el texto que sale debajo del título en los
   resultados de búsqueda. Si dos vistas comparten descripción, para Google son
   la misma página. */
var DESCRIPCIONES = {
  "inicio":     "i'Witown es la plataforma EdTech colombiana que personaliza el aprendizaje de cada estudiante de primaria. Un ecosistema para rectores, docentes, padres y estudiantes.",
  "marca":      "La marca i'Witown: por qué el colegio muestra su propia identidad y no la de un proveedor.",
  "problema":   "Un boletín dice que a un estudiante le fue mal en Ciencias, pero no dice qué fue lo que no entendió. Ese es el problema.",
  "solucion":   "Cómo i'Witown convierte cada tarea en información útil para el docente, sin trabajo extra.",
  "ecosistema": "Las cuatro aplicaciones de i'Witown: estudiantes, docentes, acudientes y el colegio, conectadas entre sí.",
  "acp":        "La Arquitectura Cognitiva Personalizada: cómo se construye comprensión en vez de solo evaluar.",
  "consultoria":"Acompañamos al colegio para que la innovación tenga sentido dentro de su proyecto educativo.",
  "contacto":   "Habla con i'Witown: reunión por Teams, WhatsApp o déjanos un mensaje.",
  "conversemos":"Déjanos tu mensaje y te contactamos para conocer i'Witown en tu colegio."
};

/* El título de cada vista. Lo ve quien comparte el enlace o lo guarda en
   favoritos, y es el nombre con el que la vista aparece en cualquier informe de
   analítica. Sin esto, las nueve rutas saldrían con el mismo nombre y el
   informe no se podría leer. */
var TITULOS = {
  "inicio":     "i'Witown — Que el colegio muestre su propia identidad",
  "marca":      "La marca — i'Witown",
  "problema":   "El problema — i'Witown",
  "solucion":   "La solución — i'Witown",
  "ecosistema": "El ecosistema — i'Witown",
  "acp":        "La A.C.P. — i'Witown",
  "consultoria":"Consultoría — i'Witown",
  "contacto":   "Contacto — i'Witown",
  "conversemos":"Conversemos — i'Witown"
};

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

  /* Cada vista tiene su ruta: /solucion, /acp… y el inicio es la raíz. Lo que
     antes era "#solucion" ahora es una dirección de verdad, que se puede
     compartir, guardar en favoritos e indexar. El `#` se sigue entendiendo
     —abajo— por los enlaces viejos que alguien haya mandado por correo. */
  var vistaDeRuta = {};
  for (var v2 in VISTAS) {
    vistaDeRuta[v2 === VISTA_INICIAL ? "" : v2] = v2;
  }

  function rutaDe(vista) {
    return vista === VISTA_INICIAL ? "/" : "/" + vista;
  }

  /* El primer tramo de una ruta: "/solucion" -> "solucion", "/" -> "". */
  function tramoDe(ruta) {
    var t = String(ruta || "").split("#")[0].split("/")[1] || "";
    return t === "index.html" ? "" : t;
  }

  /* Qué vista pide un enlace, sea de los nuevos ("/acp") o de los viejos
     ("#acp"). Devuelve null si el enlace no es de los nuestros. */
  function vistaDeEnlace(href) {
    href = String(href || "");
    if (href.charAt(0) === "/") {
      /* "//otrositio.com" es una direccion de otro sitio escrita sin protocolo,
         no una ruta nuestra: si no se descarta aqui, el router se la traga y
         devuelve al visitante a la portada sin explicacion. */
      if (href.charAt(1) === "/") return null;
      var tramo = tramoDe(href);
      return vistaDeRuta.hasOwnProperty(tramo) ? vistaDeRuta[tramo] : null;
    }
    if (href.charAt(0) === "#") {
      var id = href.replace("#", "");
      return id && deQueVista[id] ? deQueVista[id] : null;
    }
    return null;
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
      enlaces[e].classList.toggle("es-actual",
        vistaDeEnlace(enlaces[e].getAttribute("href")) === vista);
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

    ponerLosDatosDeLaVista(vista);

    /* Si el enlace apuntaba a una sección de más abajo dentro de la
       misma vista, se baja hasta ella; si no, se sube al principio. */
    var destinoEl = haciaDonde ? seccion(haciaDonde) : null;
    if (destinoEl && VISTAS[vista][0] !== haciaDonde) {
      destinoEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* Los tres datos que cambian con la vista: el título que se ve en la pestaña
     del navegador, la descripción que sale en los resultados de búsqueda, y la
     dirección "buena" de lo que se está viendo.

     OJO con lo que esto NO resuelve: las nueve rutas sirven el MISMO html, y
     estos tres datos los pone el JavaScript después. A un visitante le llegan
     bien siempre; a Google le llegan solo cuando ejecuta el JavaScript, que lo
     hace en una segunda pasada y sin garantías. Y a WhatsApp, que arma la vista
     previa sin ejecutar nada, no le llegan nunca: ahí sigue viendo el título y
     la imagen del inicio. Para que eso cambie hay que servir un html distinto
     por ruta, y eso ya es otro trabajo. */
  function ponerLosDatosDeLaVista(vista) {
    if (TITULOS[vista]) document.title = TITULOS[vista];

    var desc = document.querySelector('meta[name="description"]');
    if (desc && DESCRIPCIONES[vista]) {
      desc.setAttribute("content", DESCRIPCIONES[vista]);
    }

    /* La canónica se crea aquí y no se deja escrita en el html a propósito.
       Una etiqueta estática diría `/` en las nueve rutas, y un rastreador que no
       ejecute JavaScript leería que las ocho rutas nuevas son duplicados del
       inicio: peor que no poner ninguna, y justo lo contrario de lo que se
       busca. Sin etiqueta, Google escoge por su cuenta, que es el camino
       honesto mientras el html servido sea el mismo para todas. */
    var canonica = document.querySelector('link[rel="canonical"]');
    if (!canonica) {
      canonica = document.createElement("link");
      canonica.setAttribute("rel", "canonical");
      document.head.appendChild(canonica);
    }
    canonica.setAttribute("href", window.location.origin + rutaDe(vista));
  }

  /* ---- Qué vista pide la dirección ----

     La vista la manda la RUTA; el `#`, si viene, es una sección de más abajo
     dentro de esa misma vista (por ejemplo /#presentacion).

     Los enlaces viejos del tipo iwitown.com/#acp se siguen entendiendo: si la
     ruta es la raíz y el `#` nombra una vista, se abre esa vista. Es lo que
     evita romper un enlace que alguien ya mandó por correo. */
  function laDeLaDireccion() {
    var tramo = tramoDe(window.location.pathname);
    var ancla = (window.location.hash || "").replace("#", "");

    if (tramo === "" && ancla && deQueVista[ancla]) {
      return { vista: deQueVista[ancla], seccion: ancla };
    }

    var vista = vistaDeRuta.hasOwnProperty(tramo) ? vistaDeRuta[tramo] : VISTA_INICIAL;
    var dentro = ancla && deQueVista[ancla] === vista ? ancla : null;
    return { vista: vista, seccion: dentro };
  }

  function alCambiarLaDireccion() {
    var q = laDeLaDireccion();
    mostrar(q.vista, q.seccion);
  }

  /* ---- Los clics ----

     Cualquier enlace que apunte a una sección conocida cambia de
     vista en vez de desplazar la página. El logo lleva al inicio. */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest
      ? ev.target.closest('a[href^="/"], a[href^="#"]')
      : null;
    if (!a) return;

    /* Un clic con Ctrl, con el medio o con una tecla puesta abre en otra
       pestaña: eso es del navegador y no se toca. */
    if (ev.defaultPrevented || ev.button !== 0 ||
        ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (a.target === "_blank") return;

    var href = a.getAttribute("href") || "";
    var vista = vistaDeEnlace(href);
    if (!vista) return;                      // "#" a secas, o algo de adentro

    ev.preventDefault();

    /* La sección de adentro a la que hay que bajar, si el enlace la nombra. */
    var ancla = href.split("#")[1] || "";
    var dentro = ancla && deQueVista[ancla] === vista ? ancla : null;

    var direccion = rutaDe(vista) + (dentro && dentro !== vista ? "#" + dentro : "");

    /* Primero se pinta (y con ello el título y la descripción), después se
       cambia la dirección. El orden importa para el día que entre una
       herramienta de analítica: esas escuchan el cambio de dirección y leen el
       título en ese mismo instante, así que al revés registrarían la ruta nueva
       con el nombre de la vista anterior. */
    mostrar(vista, dentro || vista);

    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", direccion);
    } else {
      window.location.href = direccion;
    }
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
