/* ============================================================
   i'Witown — El mapa de iconos
   ============================================================

   La mecánica que usan dos secciones: la A.C.P. y el ecosistema.
   Es siempre la misma idea: arriba unos iconos, y lo que cada uno
   significa aparece solo cuando alguien lo toca. Así la sección se
   ve limpia sin dejar de contar todo.

   ┌──────────────────────────────────────────────────────────┐
   │  DÓNDE SE CAMBIAN LOS TEXTOS                             │
   │                                                          │
   │  Aquí no. Este archivo solo mueve las piezas.            │
   │                                                          │
   │    js/acp.js          la A.C.P.                          │
   │    js/plataformas.js  el ecosistema                      │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  CÓMO SE ARMA UNO NUEVO                                  │
   │                                                          │
   │    window.crearMapa({                                    │
   │      caja: "idDelDiv",     el <div> vacío del HTML       │
   │      pasos: MIS_PASOS,     la lista de bloques           │
   │      numerado: true,       con números y flechas         │
   │      aLado: true,          los iconos a un lado y la     │
   │                           foto de la app abajo           │
   │      pista: "Toca cada icono para saber qué es"          │
   │    });                                                   │
   │                                                          │
   │  "numerado" en true se ve como una progresión —primero   │
   │  uno, después el otro—; en false, como cuatro cosas que  │
   │  conviven, sin orden.                                    │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var MAPA_ICONOS = {
  ojo:        '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  cerebro:    '<path d="M9 4.5A3 3 0 0 0 6 7.5a2.6 2.6 0 0 0-1.5 4.7A2.7 2.7 0 0 0 6 17a3 3 0 0 0 3 2.5V4.5z"/><path d="M15 4.5a3 3 0 0 1 3 3 2.6 2.6 0 0 1 1.5 4.7A2.7 2.7 0 0 1 18 17a3 3 0 0 1-3 2.5V4.5z"/>',
  bombillo:   '<path d="M9 17.5h6"/><path d="M10 20.5h4"/><path d="M12 3.5a5.5 5.5 0 0 1 3.4 9.8c-.6.5-.9 1.2-.9 1.9v.3h-5v-.3c0-.7-.3-1.4-.9-1.9A5.5 5.5 0 0 1 12 3.5z"/>',
  diana:      '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  nodos:      '<circle cx="12" cy="5.5" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M10.5 7.5 7.2 15.9M13.5 7.5l3.3 8.4M8.2 18h7.6"/>',
  brujula:    '<circle cx="12" cy="12" r="8.5"/><path d="m15 9-2 5-5 2 2-5z"/>',
  cuadros:    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  ramas:      '<path d="M12 4v5"/><path d="M6 20v-3.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2V20"/><circle cx="12" cy="3.5" r="1.8"/><circle cx="6" cy="20.5" r="1.8"/><circle cx="18" cy="20.5" r="1.8"/>',
  balanza:    '<path d="M12 4.5v15"/><path d="M5 8h14"/><path d="M5 8 2.5 14h5z"/><path d="M19 8l-2.5 6h5z"/>',
  union:      '<circle cx="8.5" cy="12" r="5"/><circle cx="15.5" cy="12" r="5"/>',
  puntos:     '<circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/>',
  persona:    '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/>',
  hoja:       '<path d="M20 4c0 8-5 12-11 12H5c0-8 5-12 11-12z"/><path d="M5 20c2-5 5-8 9-9.5"/>',
  capas:      '<path d="m12 3.5 8.5 4.3-8.5 4.3-8.5-4.3z"/><path d="m3.5 12.5 8.5 4.3 8.5-4.3"/><path d="m3.5 16.8 8.5 4.3 8.5-4.3"/>',

  colegio:    '<path d="M3.5 20.5h17"/><path d="M5.5 20.5V9.5L12 5l6.5 4.5v11"/><path d="M10 20.5v-5h4v5"/>',
  teachers:   '<rect x="3.5" y="4" width="17" height="11" rx="1.8"/><path d="M8 19.5h8"/><path d="M12 15v4.5"/>',
  familia:    '<circle cx="8" cy="8.5" r="2.6"/><circle cx="16" cy="9.5" r="2.1"/><path d="M3 19c0-2.8 2.2-4.4 5-4.4s5 1.6 5 4.4"/><path d="M14 19c0-2.3 1.5-3.6 3.5-3.6S21 16.7 21 19"/>',
  juego:      '<rect x="2.5" y="7.5" width="19" height="9" rx="4.5"/><path d="M7 10.5v3M5.5 12h3"/><circle cx="16.3" cy="11" r="1"/><circle cx="18.3" cy="13" r="1"/>',
  megafono:   '<path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H8l6 4V4.5l-6 4H5.5A1.5 1.5 0 0 0 4 10z"/><path d="M17.5 9.5a4 4 0 0 1 0 5"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  grafico:    '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 17v-5M12.5 17V8M17 17v-7"/>',
  lista:      '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r="1.3"/><circle cx="5" cy="12" r="1.3"/><circle cx="5" cy="17" r="1.3"/>',
  tareas:     '<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="m8.5 11 2.2 2.2L15.5 8.5"/>',
  agenda:     '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M7.5 10h9M7.5 14h6"/><path d="M8 3v4M16 3v4"/>'
};

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

window.crearMapa = function (cfg) {
  var caja = document.getElementById(cfg.caja);
  if (!caja || !cfg.pasos || !cfg.pasos.length) return;

  var pasos = cfg.pasos;
  var numerado = (cfg.numerado !== false);
  var pistaInicial = cfg.pista || "Toca cada icono para saber qué es";
  var id = cfg.caja;

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function dibujo(nombre) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (MAPA_ICONOS[nombre] || "") + "</svg>";
  }

  /* ---- Los botones de arriba ---- */

  var h = '<div class="mapa__fila" role="tablist">';
  for (var i = 0; i < pasos.length; i++) {
    var p = pasos[i];
    if (i && numerado) h += '<span class="mapa__flecha" aria-hidden="true"></span>';
    h += '<button type="button" class="mapa__paso" role="tab" data-paso="' + i + '"' +
           ' id="' + id + 'Paso' + i + '" aria-controls="' + id + 'Detalle" aria-selected="false">' +
           (numerado ? '<span class="mapa__num">' + (i + 1) + "</span>" : "") +
           '<span class="mapa__ico">' + dibujo(p.icono) + "</span>" +
           '<span class="mapa__nombre">' + esc(p.nombre) + "</span>" +
           (p.para ? '<span class="mapa__para">' + esc(p.para) + "</span>" : "") +
         "</button>";
  }
  h += '</div><div class="mapa__detalle" id="' + id + 'Detalle" role="tabpanel" tabindex="-1"></div>';

  caja.className += (caja.className ? " " : "") + "mapa" +
                    (numerado ? " mapa--ruta" : "") +
                    (cfg.aLado ? " mapa--lado" : "");
  caja.innerHTML = h;

  var panel = document.getElementById(id + "Detalle");
  var botones = caja.querySelectorAll(".mapa__paso");
  var abierto = -1;

  /* ---- Abrir uno ---- */

  function abrir(i) {
    if (i === abierto) return;
    abierto = i;
    var p = pasos[i];

    for (var b = 0; b < botones.length; b++) {
      var esta = (b === i);
      botones[b].classList.toggle("es-actual", esta);
      botones[b].setAttribute("aria-selected", esta ? "true" : "false");
      /* En una progresión, lo ya recorrido queda marcado */
      botones[b].classList.toggle("es-hecho", numerado && b < i);
    }

    var d = '<p class="mapa__frase">' + esc(p.frase) + "</p>";
    if (p.detalle) d += '<p class="mapa__texto">' + p.detalle + "</p>";
    d += '<div class="mapa__piezas">';

    for (var k = 0; k < p.piezas.length; k++) {
      var z = p.piezas[k];
      d += '<button type="button" class="mapa__pieza" data-pieza="' + k + '">' +
             '<span class="mapa__pieza-ico">' + dibujo(z.icono) + "</span>" +
             '<span class="mapa__pieza-nombre">' + esc(z.nombre) + "</span>" +
           "</button>";
    }

    d += '</div><p class="mapa__pista" id="' + id + 'Pista">' + esc(pistaInicial) + "</p>";

    if (p.imagen) {
      d += '<button type="button" class="mapa__ver" data-ver aria-label="Ver la imagen de ' +
             esc(p.nombre) + '">' +
             '<svg viewBox="0 0 24 24" aria-hidden="true">' +
               '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>' +
               '<path d="M11 8.5v5M8.5 11h5"/>' +
             "</svg></button>";
    }
    panel.innerHTML = d;
    panel.setAttribute("aria-labelledby", id + "Paso" + i);

    /* La foto de esa app va de fondo de la tarjeta, y se abre grande
       al tocarla. El CSS la toma de la variable "--mapa-foto". */
    if (p.imagen) {
      /* La ruta se manda completa a propósito: una ruta relativa
         dentro de una variable de CSS se cuenta desde la carpeta del
         archivo .css, no desde la página, y la foto no aparecería. */
      var donde = p.imagen;
      /* Contra document.baseURI y no contra location.href: la pagina se sirve
         tambien en /ecosistema/ (con barra final), y ahi location.href haria
         buscar la foto en /ecosistema/assets/... La foto entra por una variable
         de CSS, asi que un 404 no daria error: las tarjetas saldrian sin foto y
         nadie se enteraria. */
      try { donde = new URL(p.imagen, document.baseURI).href; } catch (e) {}
      panel.style.setProperty("--mapa-foto", "url('" + donde + "')");
      panel.classList.add("con-foto");
    } else {
      panel.style.removeProperty("--mapa-foto");
      panel.classList.remove("con-foto");
    }
  }

  /* ---- Los clics ---- */

  caja.addEventListener("click", function (e) {
    var paso = e.target.closest ? e.target.closest(".mapa__paso") : null;
    if (paso) { abrir(parseInt(paso.getAttribute("data-paso"), 10)); return; }

    /* Tocar la tarjeta —o su lupita— abre la foto grande. Tocar una
       pieza no: esa cuenta lo suyo ahí mismo. */
    var enTarjeta = e.target.closest ? e.target.closest(".mapa__detalle") : null;
    var pieza = e.target.closest ? e.target.closest(".mapa__pieza") : null;

    if (enTarjeta && !pieza && pasos[abierto] && pasos[abierto].imagen &&
        typeof window.abrirLupa === "function") {
      window.abrirLupa(pasos[abierto].imagen, pasos[abierto].nombre);
      return;
    }

    if (!pieza) return;

    var z = pasos[abierto].piezas[parseInt(pieza.getAttribute("data-pieza"), 10)];
    var todas = panel.querySelectorAll(".mapa__pieza");
    for (var t = 0; t < todas.length; t++) todas[t].classList.toggle("es-actual", todas[t] === pieza);

    var pista = document.getElementById(id + "Pista");
    if (pista) {
      pista.innerHTML = "<strong>" + esc(z.nombre) + ".</strong> " + esc(z.texto);
      pista.classList.add("es-respuesta");
    }
  });

  /* Con las flechas del teclado se recorren los de arriba */
  caja.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = abierto + (e.key === "ArrowRight" ? 1 : -1);
    if (i < 0) i = pasos.length - 1;
    if (i >= pasos.length) i = 0;
    abrir(i);
    botones[i].focus();
    e.preventDefault();
  });

  abrir(0);
};
