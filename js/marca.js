/* ============================================================
   i'Witown — La animación de la marca
   ============================================================

   Se toca el sello redondo del menú y se abre una pantalla sola,
   con el video de la marca. No tiene controles: corre y ya.
   Cuando termina, del centro sale un círculo que se va volando
   hasta el sello del menú, y ahí mismo se abre el inicio.

   El nombre de al lado del sello NO pasa por aquí: ese lleva
   derecho al inicio, como siempre.

   ┌──────────────────────────────────────────────────────────┐
   │  LOS TIEMPOS, AQUÍ ABAJO                                 │
   │                                                          │
   │    VUELO_MS    lo que tarda el círculo en llegar         │
   │    ESPERA_MS   lo que se queda quieto al final del       │
   │                video, antes de soltar el círculo         │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var MARCA_VUELO_MS  = 950;
var MARCA_ESPERA_MS = 180;

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {

  var seccion = document.getElementById("marca");
  var escena  = document.getElementById("marcaEscena");
  var video   = document.getElementById("marcaVideo");
  var sello   = document.getElementById("navSello");
  if (!seccion || !escena || !video || !sello) return;

  var quieto = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var corriendo = false;
  var yaSalio = false;

  /* ---- Arrancar ---- */
  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    yaSalio = false;
    escena.classList.remove("es-va");
    /* Mientras corre la marca, el pie de página estorba */
    document.body.classList.add("con-marca");

    try { video.currentTime = 0; } catch (e) {}
    video.muted = true;

    var promesa = video.play();
    if (promesa && promesa.then) {
      promesa.then(function () {
        /* Se intenta con sonido; si el navegador no deja, se queda
           callado y el video sigue igual. */
        video.muted = false;
        var otra = video.play();
        if (otra && otra["catch"]) {
          otra["catch"](function () { video.muted = true; video.play(); });
        }
      })["catch"](function () { salir(); });
    }
  }

  /* ---- Parar, sin más ---- */
  function apagar() {
    corriendo = false;
    document.body.classList.remove("con-marca");
    video.pause();
    try { video.currentTime = 0; } catch (e) {}
    escena.classList.remove("es-va");
    var v = document.querySelector(".marca-vuelo");
    if (v) v.parentNode.removeChild(v);
  }

  /* ---- El círculo que se va hasta el sello ---- */
  function volar(cuandoLlegue) {
    var deVideo = video.getBoundingClientRect();
    var deSello = sello.querySelector("img").getBoundingClientRect();

    /* Del centro del video al centro del sello: sale del tamaño
       de los círculos con que termina el video y llega del tamaño
       del sello. Se dibuja grande y se achica, para que no se vea
       pixelado por el camino. */
    var destino = Math.max(deSello.width, 20);
    var salida  = Math.min(Math.max(deVideo.height * 0.085, 46), 78);

    var bola = document.createElement("span");
    bola.className = "marca-vuelo";
    bola.style.width  = salida + "px";
    bola.style.height = salida + "px";

    /* Se copia el dibujo del sello del menú: así ya está
       cargado y aparece sin esperar nada. */
    var dibujo = sello.querySelector("img").cloneNode(true);
    dibujo.removeAttribute("class");
    dibujo.alt = "";
    bola.appendChild(dibujo);

    var x0 = deVideo.left + deVideo.width  / 2 - salida / 2;
    var y0 = deVideo.top  + deVideo.height / 2 - salida / 2;
    var x1 = deSello.left + deSello.width  / 2 - salida / 2;
    var y1 = deSello.top  + deSello.height / 2 - salida / 2;
    var escala = destino / salida;

    bola.style.transform = "translate3d(" + x0 + "px," + y0 + "px,0) scale(1)";
    document.body.appendChild(bola);

    /* El video se va apagando mientras el círculo cruza */
    escena.classList.add("es-va");

    /* Se obliga al navegador a tomar nota de dónde empieza, para
       que el cambio de abajo se vea como un recorrido. */
    /* jshint expr:true */
    bola.offsetWidth;

    bola.style.transition =
      "transform " + MARCA_VUELO_MS + "ms cubic-bezier(.62,.02,.2,1)," +
      " opacity 220ms ease " + (MARCA_VUELO_MS - 180) + "ms";
    bola.style.transform = "translate3d(" + x1 + "px," + y1 + "px,0) scale(" +
                           escala.toFixed(3) + ")";
    bola.style.opacity = "0";

    window.setTimeout(function () {
      if (bola.parentNode) bola.parentNode.removeChild(bola);
      sello.classList.add("es-llega");
      window.setTimeout(function () { sello.classList.remove("es-llega"); }, 620);
      cuandoLlegue();
    }, MARCA_VUELO_MS);
  }

  /* ---- Terminó: el círculo y enseguida el inicio ---- */
  function salir() {
    if (yaSalio) return;
    yaSalio = true;

    function alInicio() {
      apagar();
      /* La direccion del inicio es "/", no "#inicio": cada vista tiene su
         ruta desde que se hizo el cambio de rutas. Dejar el "#" aqui hacia que
         la barra de direcciones dijera una cosa y la pantalla mostrara otra. */
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "/");
      }
      if (typeof window.vistaAlInicio === "function") window.vistaAlInicio();
      else window.location.href = "/";
    }

    if (quieto) { alInicio(); return; }

    window.setTimeout(function () { volar(alInicio); }, MARCA_ESPERA_MS);
  }

  video.addEventListener("ended", salir);

  /* Si algo sale mal con el video, no se deja al visitante varado */
  video.addEventListener("error", function () { salir(); });

  /* Tocar la pantalla se la salta */
  escena.addEventListener("click", function () { if (corriendo) salir(); });
  document.addEventListener("keydown", function (ev) {
    if (corriendo && (ev.key === "Escape" || ev.key === "Enter")) salir();
  });

  /* ---- Se enciende cuando la sección queda a la vista ----

     Las vistas se prenden y se apagan con el atributo "hidden"
     (ver js/vistas.js), así que basta con estar pendiente de él. */
  function revisar() {
    if (!seccion.hidden) arrancar();
    else if (corriendo) apagar();
  }

  if (window.MutationObserver) {
    new MutationObserver(revisar).observe(seccion, {
      attributes: true, attributeFilter: ["hidden"]
    });
  }
  window.addEventListener("hashchange", function () {
    window.setTimeout(revisar, 0);
  });

  revisar();
})();
