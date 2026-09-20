/* ============================================================
   i'Witown — El celular de "Solución"
   ============================================================

   La lista de aspectos del panel de rectoría no es solo texto: cada
   uno tiene su pantalla, y el celular de al lado la va mostrando.
   Va sola, y también se puede tocar un aspecto para ir directo a él.

   ┌──────────────────────────────────────────────────────────┐
   │  CÓMO SE LE PONE PANTALLA A UN ASPECTO                   │
   │                                                          │
   │  En el index.html, al <li> del aspecto se le agregan dos │
   │  atributos:                                              │
   │                                                          │
   │    <li data-sol="assets/video/solucion-1.mp4"            │
   │        data-sol-nombre="Trazabilidad real de uso">       │
   │                                                          │
   │  Sirve un video (.mp4) o una imagen (.webp, .png, .jpg). │
   │  Se distingue por la terminación del archivo, nada más.  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  SI TODAVÍA NO ESTÁ EL ARCHIVO                           │
   │                                                          │
   │  El aspecto no se cae ni deja un cuadro roto: mientras   │
   │  no exista, el celular muestra el nombre del aspecto     │
   │  sobre un fondo morado. En cuanto se suba el archivo con │
   │  ese nombre, aparece solo.                               │
   └──────────────────────────────────────────────────────────┘

   Los aspectos con video se quedan lo que dure el video; los que
   muestran una imagen, SOL_SEGUNDOS.
   ============================================================ */

var SOL_A_LA_VISTA = 5;    /* cuántas tarjetas se ven sin hacer scroll */
var SOL_SEGUNDOS = 4;      /* los aspectos que muestran una imagen */
var SOL_MAXIMO   = 30;     /* tope para un video largo, en segundos */

/* Los videos van un poco acelerados: son demostraciones, no hay nada
   que escuchar, y así el recorrido no se hace largo. */
var SOL_VELOCIDAD = 1.6;

/* Y arrancan pasados unos segundos, para saltarse la pantalla de
   carga. La tarjeta que no deba saltar nada lleva en el index.html
   el atributo data-sol-desde="0".

   OJO: para saltar a un punto del video, el servidor tiene que saber
   entregar el archivo por partes (las peticiones "Range"). Cualquier
   hosting normal lo hace; algunos servidores de prueba caseros no, y
   ahí los videos arrancarán desde el principio. No es un error de la
   página. */
var SOL_EMPIEZA_EN = 3;

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

/* Hay un celular por panel —el de rectoría y el de papás—, y cada uno
   anda por su cuenta con las tarjetas de SU panel. */
(function () {
  var celulares = document.querySelectorAll(".celsol");
  for (var c = 0; c < celulares.length; c++) armar(celulares[c]);
})();

function armar(celular) {
  var pantalla = celular.querySelector(".celsol__pantalla");
  if (!pantalla) return;

  /* El celular acompaña a las tarjetas que estén en su mismo panel */
  var panel = celular.closest ? celular.closest(".panel") : null;
  var puntos = panel ? panel.querySelectorAll("[data-sol]") : [];
  if (!puntos.length) { celular.hidden = true; return; }

  /* ---- Armar una lámina por aspecto ---- */

  var laminas = [];
  var peliculas = [];      // solo las láminas que traen video

  for (var i = 0; i < puntos.length; i++) {
    laminas.push(lamina(puntos[i], i));
    marcarComoBoton(puntos[i], i);
  }

  function lamina(punto, i) {
    var hoja = document.createElement("div");
    hoja.className = "celsol__lamina";
    if (i === 0) hoja.classList.add("es-actual");

    var nombre = punto.getAttribute("data-sol-nombre") || "";

    /* El texto va primero: es lo que se ve mientras la imagen no
       exista o todavía esté bajando. */
    var rotulo = document.createElement("p");
    rotulo.className = "celsol__rotulo";
    rotulo.textContent = nombre;
    hoja.appendChild(rotulo);

    var ruta = punto.getAttribute("data-sol");
    if (ruta) {
      if (/\.(mp4|webm|mov)(\?|$)/i.test(ruta)) hoja.appendChild(pelicula(hoja, ruta, i, punto));
      else hoja.appendChild(foto(hoja, ruta, nombre));
    }

    pantalla.appendChild(hoja);
    return hoja;
  }

  function foto(hoja, ruta, nombre) {
    var img = document.createElement("img");
    img.alt = nombre;
    img.loading = "lazy";
    img.addEventListener("load", function () { hoja.classList.add("con-foto"); });
    img.addEventListener("error", function () { img.remove(); });
    img.src = ruta;
    return img;
  }

  /* Los videos van MUDOS: son una demostración de lo que se ve en la
     app, no una narración. Así ningún navegador los bloquea y, sobre
     todo, no le pisan la voz al celular de la portada.

     Solo anda el del aspecto que se está viendo: los demás quedan
     detenidos en su primer cuadro. */
  function pelicula(hoja, ruta, i, punto) {
    var v = document.createElement("video");
    v.src = ruta;
    v.muted = true;
    v.loop = true;
    v.playbackRate = SOL_VELOCIDAD;

    /* Desde dónde empieza este. Por defecto, SOL_EMPIEZA_EN. */
    var desde = punto.getAttribute("data-sol-desde");
    v.dataset.desde = (desde === null ? SOL_EMPIEZA_EN : parseFloat(desde) || 0);
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.setAttribute("aria-hidden", "true");
    v.preload = (i === 0) ? "auto" : "metadata";

    v.addEventListener("loadeddata", function () {
      hoja.classList.add("con-foto");
      alPrincipio(v);
      v.playbackRate = SOL_VELOCIDAD;      // algunos navegadores lo reponen
      if (hoja.classList.contains("es-actual")) v.play().catch(function () {});
    });

    /* En cuanto se sabe cuánto dura ya se puede saltar al punto de
       arranque, sin esperar a que baje el video entero. */
    v.addEventListener("loadedmetadata", function () { alPrincipio(v); });
    v.addEventListener("seeked", function () { v.playbackRate = SOL_VELOCIDAD; });

    /* Al repetirse, vuelve a su punto de arranque y no al cero. Se
       nota porque el tiempo retrocede de golpe; no sirve comparar
       contra el punto de arranque a secas, porque mientras el video
       está bajando el tiempo se queda en cero y lo estaríamos
       mandando a saltar una y otra vez. */
    var ultimo = 0;
    v.addEventListener("timeupdate", function () {
      if (v.currentTime + 0.5 < ultimo) alPrincipio(v);
      ultimo = v.currentTime;
    });
    v.addEventListener("error", function () { v.remove(); });

    peliculas[i] = v;
    return v;
  }

  /* ---- Tocar un aspecto ---- */

  function marcarComoBoton(punto, i) {
    punto.classList.add("es-tocable");
    punto.setAttribute("role", "button");
    punto.setAttribute("tabindex", "0");

    punto.addEventListener("click", function () { ir(i); reiniciarReloj(); });
    punto.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        ir(i);
        reiniciarReloj();
      }
    });
    punto.addEventListener("mouseenter", function () { ir(i); quieto = true; });
    punto.addEventListener("mouseleave", function () { quieto = false; });
  }

  /* ---- Cambiar de aspecto ---- */

  var donde = 0;
  var reloj = null;
  var quieto = false;

  function ir(i) {
    if (i === donde) return;
    laminas[donde].classList.remove("es-actual");
    puntos[donde].classList.remove("es-actual");
    if (peliculas[donde]) peliculas[donde].pause();

    donde = i;

    laminas[donde].classList.add("es-actual");
    puntos[donde].classList.add("es-actual");
    asomar(puntos[donde]);

    var v = peliculas[donde];
    if (v) {
      alPrincipio(v);             // cada aspecto empieza por su punto
      arrancar(v, i);
    }
  }

  /* El punto de arranque de un video, cuidando de no pasarse de largo
     si el archivo resulta más corto que el salto. */
  function alPrincipio(v) {
    var desde = Number(v.dataset.desde) || 0;
    if (v.duration && isFinite(v.duration) && desde > v.duration - 1) desde = 0;
    try { v.currentTime = desde; } catch (e) {}
  }

  /* Si el video todavía no tiene cuadros cargados, el navegador rechaza
     el play. No se pierde: se vuelve a intentar en cuanto haya con qué,
     y solo si para entonces sigue siendo el aspecto que se está viendo. */
  function arrancar(v, i) {
    var r = v.play();
    if (!r || !r.catch) return;

    r.catch(function () {
      v.addEventListener("canplay", function reintento() {
        v.removeEventListener("canplay", reintento);
        if (donde === i) v.play().catch(function () {});
      });
    });
  }

  function reiniciarReloj() {
    apagarReloj();
    encender();
  }

  /* Cuánto se queda el aspecto que está puesto. Si trae video, lo que
     dure el video: no tendría sentido cortarlo a la mitad. Si es una
     imagen, los segundos de arriba. */
  function cuantoDura() {
    var v = peliculas[donde];
    if (v && v.duration && isFinite(v.duration)) {
      /* Lo que queda de video desde su punto de arranque, y contando
         que va acelerado. */
      var queda = (v.duration - (Number(v.dataset.desde) || 0)) / SOL_VELOCIDAD;
      return Math.max(Math.min(queda, SOL_MAXIMO), 2.5) * 1000;
    }
    return SOL_SEGUNDOS * 1000;
  }

  function encender() {
    var v = peliculas[donde];
    if (v && v.paused) arrancar(v, donde);
    if (reloj) return;
    programar();
  }

  function programar() {
    reloj = window.setTimeout(function () {
      reloj = null;
      if (quieto) { programar(); return; }
      ir((donde + 1) % laminas.length);
      programar();
    }, cuantoDura());
  }

  function apagarReloj() {
    if (reloj) { window.clearTimeout(reloj); reloj = null; }
  }

  function apagar() {
    apagarReloj();
    if (peliculas[donde]) peliculas[donde].pause();
  }

  /* El primero queda marcado desde el principio */
  puntos[0].classList.add("es-actual");

  /* ---- Solo se ven las tres primeras ----

     La lista se recorta a la altura exacta de la tercera tarjeta y el
     resto se alcanza con el scroll de adentro. Se mide en vez de poner
     una altura fija porque no todas las tarjetas miden lo mismo: unas
     llevan dos renglones de texto y otras uno. */
  var lista = panel.querySelector(".aspectos");

  function recortarATres() {
    if (!lista || puntos.length <= SOL_A_LA_VISTA) return;

    var ultima = puntos[SOL_A_LA_VISTA - 1];
    var alto = ultima.offsetTop + ultima.offsetHeight;
    if (!alto) return;                 // el panel está escondido: se mide después

    lista.classList.add("es-scroll");
    lista.style.maxHeight = alto + "px";
  }

  recortarATres();

  /* Un panel escondido no tiene medidas. Se vuelve a medir cuando
     aparece y cuando cambia el ancho de la ventana, que es cuando las
     tarjetas cambian de alto. */
  if (window.ResizeObserver && lista) {
    new ResizeObserver(function () { recortarATres(); }).observe(lista);
  }
  window.addEventListener("resize", recortarATres);

  /* Si el recorrido pasa a una tarjeta que quedó fuera de vista, la
     lista se corre sola hasta ella. Se mueve solo la lista, nunca la
     página entera. */
  function asomar(el) {
    if (!lista || !lista.classList.contains("es-scroll")) return;

    var arriba = el.offsetTop;
    var abajo = arriba + el.offsetHeight;

    if (arriba < lista.scrollTop) {
      lista.scrollTo({ top: arriba, behavior: "smooth" });
    } else if (abajo > lista.scrollTop + lista.clientHeight) {
      lista.scrollTo({ top: abajo - lista.clientHeight, behavior: "smooth" });
    }
  }

  /* Solo anda mientras la sección se ve */
  if (window.IntersectionObserver) {
    var vigia = new IntersectionObserver(function (entradas) {
      for (var e = 0; e < entradas.length; e++) {
        if (entradas[e].isIntersecting) encender();
        else apagar();
      }
    }, { threshold: 0.2 });
    vigia.observe(celular);
  } else {
    encender();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) apagar();
    else encender();
  });
}
