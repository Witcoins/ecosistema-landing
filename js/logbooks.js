/* ============================================================
   i'Witown — Logbooks: diarios de aprendizaje a la medida
   ============================================================

   El mismo video sale en dos lugares:

   - La página /logbooks: el video vertical dentro de un celular
     y, al lado, las tarjetas, que se van resaltando solas, una
     cada 15 segundos.
   - La pestaña "Logbooks" de "Así se ve por dentro": solo el
     video y una línea (esa línea está en el index.html).

   ┌──────────────────────────────────────────────────────────┐
   │  TODO LO QUE SE CAMBIA ESTÁ AQUÍ ARRIBA                  │
   │                                                          │
   │  LOG_VIDEO     los dos videos. El vertical va en la      │
   │                página, dentro del celular, y en la       │
   │                pestaña cuando se ve desde un teléfono;   │
   │                el normal (horizontal), en la pestaña     │
   │                desde computador. Cada uno puede          │
   │                ser un archivo ("assets/video/...mp4")    │
   │                o un enlace de YouTube. En la pestaña,    │
   │                si falta uno se usa el otro. En el        │
   │                celular de la página solo va el vertical. │
   │                Sin video, se ven las cuatro portadas.    │
   │                                                          │
   │  Al lado de cada video va su "portada": la imagen que    │
   │  se ve antes de darle play.                              │
   │                                                          │
   │  LOG_SEGUNDOS  cada cuánto pasa a la siguiente tarjeta.  │
   │                                                          │
   │  LOG_TARJETAS  las tarjetas, en orden. "quien" es la     │
   │                etiqueta de abajo: a quién le sirve.      │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var LOG_VIDEO = {
  horizontal: "assets/video/logbooks.mp4?v=320",
  vertical:   "assets/video/logbooks-vertical.mp4?v=320",

  /* La imagen que se ve antes de darle play (un cuadro del video).
     Sin ella se vería el primer cuadro, que es solo fondo morado. */
  portadaHorizontal: "assets/img/logbooks-portada.webp?v=320",
  portadaVertical:   "assets/img/logbooks-portada-vertical.webp?v=320"
};

var LOG_SEGUNDOS = 15;

var LOG_TARJETAS = [
  { titulo: "Con tu metodología, no con la de una editorial",
    texto:  "Cada logbook se diseña con el esquema metodológico de tu colegio. " +
            "El docente enseña como ya enseña, sin acomodarse a un libro ajeno.",
    quien:  "Coordinación académica" },

  { titulo: "Con la identidad de tu colegio",
    texto:  "Su lenguaje, su marca y sus valores en cada página. El estudiante " +
            "reconoce que el material es de su colegio.",
    quien:  "Rectoría" },

  { titulo: "Menos gasto en textos de editorial",
    texto:  "Un diario propio por área en lugar de textos genéricos: el presupuesto " +
            "se queda en material hecho para tu colegio.",
    quien:  "Rectoría · Familias" },

  { titulo: "El docente ve el avance de cada estudiante",
    texto:  "Como el logbook está integrado a la plataforma, el docente sigue el " +
            "avance de cada estudiante página por página, sin recoger cuadernos.",
    quien:  "Docentes" },

  { titulo: "Las cuatro áreas básicas",
    texto:  "Un diario de aprendizaje para cada una:",
    areas:  ["Ciencias Naturales", "Ciencias Sociales", "Matemáticas", "Lengua Castellana"],
    quien:  "Todo el colegio" },

  { titulo: "Las familias verifican el uso real",
    texto:  "El colegio y los papás comprueban desde la plataforma que el logbook " +
            "sí se usa, y acompañan el proceso de aprendizaje del estudiante.",
    quien:  "Familias · Rectoría" }
];


/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ¿Está escondido? (él o alguna caja de afuera con display: none) */
  function escondido(el) {
    return !el.getClientRects().length;
  }

  /* ============================================================
     EL VIDEO

     Cada lugar donde sale el video tiene su propio reproductor.
     No se carga con la página: se arma la primera vez que ese
     lugar se ve. Así el visitante que nunca llega no baja el
     video, y YouTube no entra a la página sin que nadie lo pida.
     ============================================================ */

  var telefono = window.matchMedia ? window.matchMedia("(max-width: 720px)") : null;

  function idDeYouTube(url) {
    var m = String(url).match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  /* Cuál toca: el vertical en el teléfono, el normal en computador.
     Si el que toca no está, sirve el otro. "soloVertical" es para la
     página, donde el video va dentro del celular: ahí siempre va el
     vertical, también en computador. */
  function laFuente(soloVertical) {
    /* En el celular de la página un video horizontal perdería casi
       dos tercios del ancho: sin vertical, se quedan las portadas. */
    if (soloVertical) {
      return LOG_VIDEO.vertical
        ? { url: LOG_VIDEO.vertical, vertical: true, portada: LOG_VIDEO.portadaVertical }
        : null;
    }
    var enTelefono = soloVertical || (telefono && telefono.matches);
    var primero = enTelefono ? LOG_VIDEO.vertical : LOG_VIDEO.horizontal;
    var segundo = enTelefono ? LOG_VIDEO.horizontal : LOG_VIDEO.vertical;
    var v = !!enTelefono;
    if (primero) return { url: primero, vertical: v,  portada: v ? LOG_VIDEO.portadaVertical : LOG_VIDEO.portadaHorizontal };
    if (segundo) return { url: segundo, vertical: !v, portada: v ? LOG_VIDEO.portadaHorizontal : LOG_VIDEO.portadaVertical };
    return null;
  }

  function reproductor(pantalla, soloVertical) {
    var video = null;      // el <video>, si es un archivo
    var marcoYT = null;    // el <iframe>, si es de YouTube
    var puesto = null;     // la fuente que está puesta ahora
    var armado = false;
    var nosotros = false;  // true si la próxima pausa la pedimos nosotros
    var pausoElVisitante = false;

    /* Las cuatro portadas: lo que se ve mientras no haya video, o
       si el archivo falla. Cuenta lo mismo que el video, sin él. */
    function ponerPortadas() {
      var areas = ["Ciencias Naturales", "Ciencias Sociales", "Matemáticas", "Lengua Castellana"];
      var h = '<div class="logb__portadas" aria-hidden="true">';
      for (var i = 0; i < areas.length; i++) {
        h += '<span class="logb__libro logb__libro--' + (i + 1) + '">' +
               '<em>Logbook</em><b>' + areas[i] + '</b>' +
             '</span>';
      }
      pantalla.innerHTML = h + '</div>';
      pantalla.classList.remove("logb__pantalla--vertical");
      video = null;
      marcoYT = null;
    }

    function poner() {
      var f = laFuente(soloVertical);
      var clave = f ? f.url : "";
      if (puesto === clave && pantalla.firstChild) return;
      puesto = clave;

      if (!f) { ponerPortadas(); return; }

      pantalla.innerHTML = "";
      if (!soloVertical) pantalla.classList.toggle("logb__pantalla--vertical", f.vertical);
      video = null;
      marcoYT = null;

      var yt = idDeYouTube(f.url);
      if (yt) {
        /* youtube-nocookie: no deja cookies hasta que le dan play */
        marcoYT = document.createElement("iframe");
        marcoYT.className = "logb__video";
        /* autoplay + mute + loop: para que el loop funcione, YouTube pide
           repetir el mismo video como lista ("playlist"). */
        marcoYT.src = "https://www.youtube-nocookie.com/embed/" + yt +
                      "?rel=0&modestbranding=1&playsinline=1&enablejsapi=1" +
                      "&autoplay=1&mute=1&loop=1&playlist=" + yt;
        marcoYT.title = "Video de los logbooks";
        marcoYT.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        marcoYT.setAttribute("allowfullscreen", "");
        pantalla.appendChild(marcoYT);
        return;
      }

      video = document.createElement("video");
      video.className = "logb__video";
      video.src = f.url;
      if (f.portada) video.poster = f.portada;
      /* Arranca solo y se repite. Va en silencio porque los navegadores
         no dejan arrancar solo un video con sonido; los controles quedan
         a la vista para que quien quiera le suba el volumen. */
      video.muted = true;
      video.setAttribute("muted", "");
      video.loop = true;
      video.controls = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      /* Si el archivo no está, salen las portadas en vez de un
         reproductor roto. */
      video.addEventListener("error", ponerPortadas);
      /* Si el visitante lo pausó con los controles, se respeta: no se
         vuelve a arrancar solo cuando la caja reaparece. */
      /* El aviso de "pause" llega después, no en el momento de pedir la
         pausa: por eso la marca se gasta aquí y no se apaga allá. */
      video.addEventListener("pause", function () {
        if (nosotros) { nosotros = false; return; }
        if (!video.ended) pausoElVisitante = true;
      });
      video.addEventListener("play", function () { pausoElVisitante = false; });
      pantalla.appendChild(video);
    }

    function reproducir() {
      if (pausoElVisitante) return;
      if (video) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
      if (marcoYT && marcoYT.contentWindow) {
        marcoYT.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}', "*");
      }
    }

    /* Si el teléfono se gira o la ventana cambia de tamaño, se cambia
       de video, salvo que el visitante le haya subido el volumen: ahí
       lo está viendo de verdad, y cortárselo sería peor que dejarlo en
       la forma que no es. */
    if (telefono) {
      var alCambiar = function () {
        if (!armado || marcoYT) return;
        if (video && !video.muted && !video.paused) return;
        var andaba = video && !video.paused;
        poner();
        if (andaba) reproducir();
      };
      if (telefono.addEventListener) telefono.addEventListener("change", alCambiar);
      else if (telefono.addListener) telefono.addListener(alCambiar);
    }

    return {
      armar: function () {
        if (!armado) { armado = true; poner(); }
      },
      /* Lo arma si hace falta y lo pone a andar */
      reproducir: function () {
        if (!armado) { armado = true; poner(); }
        reproducir();
      },
      pausar: function () {
        if (video && !video.paused) {
          nosotros = true;
          video.pause();
        }
        if (marcoYT && marcoYT.contentWindow) {
          marcoYT.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}', "*");
        }
      }
    };
  }

  /* Vigila una caja. "alVerse" cuando entra a la vista;
     "alEsconderse" cuando la esconden de verdad (display: none: el
     menú de arriba cambió de página, o se cambió de pestaña);
     "alSalirDeVista" cuando solo se fue de la vista bajando. Bajar NO
     cuenta como esconder: quien baja a leer las tarjetas puede seguir
     oyendo el video. */
  function vigilar(caja, alVerse, alEsconderse, alSalirDeVista) {
    if (!("IntersectionObserver" in window)) { alVerse(); return; }
    new IntersectionObserver(function (entradas) {
      for (var k = 0; k < entradas.length; k++) {
        if (entradas[k].isIntersecting) { alVerse(); continue; }
        if (alSalirDeVista) alSalirDeVista();
        if (escondido(caja)) alEsconderse();
      }
    }).observe(caja);
  }

  /* ============================================================
     LA PESTAÑA DE "ASÍ SE VE POR DENTRO": SOLO EL VIDEO

     La prende y la apaga js/ecosistema.js al cambiar de pestaña,
     y js/presentacion.js la apaga al salir de la pantalla.
     ============================================================ */

  var apxCaja = document.getElementById("apxLogbooks");
  var apxPantalla = document.getElementById("apxLogPantalla");
  var apxVideo = apxPantalla ? reproductor(apxPantalla) : null;

  window.logbooksArrancar = function () {
    if (apxVideo) apxVideo.reproducir();
  };
  window.logbooksDetener = function () {
    if (apxVideo) apxVideo.pausar();
  };

  if (apxCaja && apxVideo) {
    /* Si vuelve a verse (por ejemplo, regresó de otra página del menú
       con la pestaña abierta), el video sigue andando. */
    vigilar(apxCaja, apxVideo.reproducir, apxVideo.pausar);
  }

  /* ============================================================
     LA PÁGINA /logbooks: EL VIDEO Y LAS TARJETAS
     ============================================================ */

  var caja     = document.getElementById("logbooks");
  var pantalla = document.getElementById("logPantalla");
  var lista    = document.getElementById("logTarjetas");
  if (!caja || !pantalla || !lista) return;

  var paginaVideo = reproductor(pantalla, true);
  var bloque = lista.closest ? lista.closest(".logb") : null;

  var h = "";
  for (var i = 0; i < LOG_TARJETAS.length; i++) {
    var t = LOG_TARJETAS[i];
    var areas = "";
    if (t.areas) {
      areas = '<span class="logb__areas">';
      for (var a = 0; a < t.areas.length; a++) {
        areas += '<i class="logb__area logb__area--' + (a + 1) + '">' + esc(t.areas[a]) + '</i>';
      }
      areas += '</span>';
    }
    h += '<li class="logb__tarjeta">' +
           '<button type="button" class="logb__boton" data-tarjeta="' + i + '">' +
             '<span class="logb__num">' + (i + 1) + '</span>' +
             '<span class="logb__cuerpo">' +
               '<span class="logb__nombre">' + esc(t.titulo) + '</span>' +
               '<span class="logb__mas"><span class="logb__mas-dentro">' +
                 '<span class="logb__texto">' + esc(t.texto) + areas + '</span>' +
                 '<span class="logb__quien">' + esc(t.quien) + '</span>' +
               '</span></span>' +
             '</span>' +
           '</button>' +
           '<span class="logb__barra" aria-hidden="true"><i></i></span>' +
         '</li>';
  }
  lista.innerHTML = h;

  var tarjetas = lista.querySelectorAll(".logb__tarjeta");
  var botones  = lista.querySelectorAll(".logb__boton");
  var barras   = lista.querySelectorAll(".logb__barra i");

  var activa = 0;

  function resaltar(n) {
    activa = n;
    for (var j = 0; j < tarjetas.length; j++) {
      var esta = j === n;
      tarjetas[j].classList.toggle("es-activa", esta);
      if (esta) botones[j].setAttribute("aria-current", "true");
      else botones[j].removeAttribute("aria-current");
      barras[j].style.transform = "scaleX(0)";
    }
  }

  /* ---- El reloj de las tarjetas ----

     Cuenta solo mientras las tarjetas se ven y nadie tiene el mouse
     encima: si un rector se detiene a leer una, no se le cambia en
     la cara. Si toca una, el reloj se apaga del todo: de ahí en
     adelante manda él. Al volver a la página, arranca otra vez desde
     la primera. */

  var manual = false;
  var encima = false;
  var andando = false;
  var llevado = 0;       // milisegundos que lleva la tarjeta activa
  var antes = 0;
  var cuadro = null;

  function paso(ahora) {
    if (!andando) return;
    if (antes && !encima) llevado += ahora - antes;
    antes = ahora;

    var total = LOG_SEGUNDOS * 1000;
    if (llevado >= total) {
      llevado = 0;
      resaltar((activa + 1) % tarjetas.length);
    }
    barras[activa].style.transform = "scaleX(" + Math.min(llevado / total, 1) + ")";
    cuadro = window.requestAnimationFrame(paso);
  }

  function arrancarReloj() {
    if (manual || andando) return;
    andando = true;
    antes = 0;
    cuadro = window.requestAnimationFrame(paso);
  }

  function pararReloj() {
    andando = false;
    if (cuadro) { window.cancelAnimationFrame(cuadro); cuadro = null; }
  }

  lista.addEventListener("mouseenter", function () { encima = true; });
  lista.addEventListener("mouseleave", function () { encima = false; });

  lista.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-tarjeta]") : null;
    if (!b) return;
    manual = true;
    pararReloj();
    if (bloque) bloque.classList.add("es-manual");
    resaltar(+b.getAttribute("data-tarjeta"));
  });

  resaltar(0);

  /* El video arranca solo (en silencio y en loop) cuando la página
     se ve, y se para si el visitante se va a otra página del menú.
     Al volver, las tarjetas arrancan de nuevo desde la primera. */
  vigilar(caja, paginaVideo.reproducir, function () {
    paginaVideo.pausar();
    manual = false;
    llevado = 0;
    if (bloque) bloque.classList.remove("es-manual");
    resaltar(0);
  });

  /* El reloj se para apenas las tarjetas salen de la vista, y sigue
     donde iba cuando vuelven. */
  vigilar(lista, arrancarReloj, function () {}, pararReloj);
})();
