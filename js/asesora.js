/* ============================================================
   i'Witown — Los videos con foto al final
   ============================================================

   Hay dos en la página: el de la pestaña de contacto y el que
   acompaña al formulario. Los dos se portan igual, así que este
   archivo se encarga de todos los bloques "ctc-video" que
   encuentre, sin importar cuántos sean.

   Arrancan solos cuando su sección se ve, traen sus dos botones
   —pausa y sonido— y, al terminar, dejan en su lugar la foto.

   No se repiten solos: para verlos otra vez se toca la foto, o el
   botón de reproducir. Y si alguien se va de la sección y vuelve,
   la encuentra otra vez con el video, no con la foto.

   ┌──────────────────────────────────────────────────────────┐
   │  POR QUÉ EMPIEZA SIN SONIDO                              │
   │                                                          │
   │  Ningún navegador deja que un video empiece a sonar solo │
   │  si la persona todavía no ha tocado nada. Es una regla   │
   │  del navegador, no algo que se pueda programar distinto. │
   │                                                          │
   │  Entonces: arranca mudo —eso siempre lo dejan—, intenta  │
   │  enseguida quitarle el silencio y, si no lo consigue,    │
   │  prende el aviso "Toca para oír". En cuanto la persona   │
   │  toca cualquier parte de la página, el sonido se activa. │
   └──────────────────────────────────────────────────────────┘

   El archivo del video y el de la foto se cambian en el index.html,
   dentro de cada bloque "ctc-video".
   ============================================================ */

(function () {
  var cajas = document.querySelectorAll(".ctc-video");
  for (var c = 0; c < cajas.length; c++) armarVideo(cajas[c]);
})();

function armarVideo(caja) {
  var video  = caja.querySelector("video");
  var pausa  = caja.querySelector("[data-pausa]");
  var sonido = caja.querySelector("[data-sonido]");
  var aviso  = caja.querySelector(".ctc-video__aviso");
  if (!video) return;

  /* Se vuelve true en cuanto la persona toca los botones: de ahí en
     adelante manda ella y la página no le cambia nada por su cuenta. */
  var mandaElUsuario = false;
  var termino = false;

  /* ---- Los botones ---- */

  function pintar() {
    if (pausa) {
      pausa.classList.toggle("esta-andando", !video.paused);
      pausa.setAttribute("aria-label", video.paused ? "Reproducir" : "Pausar");
    }
    if (aviso) aviso.hidden = !video.muted || termino;
    if (sonido) {
      sonido.classList.toggle("esta-sonando", !video.muted);
      sonido.setAttribute("aria-label", video.muted ? "Activar sonido" : "Quitar sonido");
      sonido.setAttribute("aria-pressed", video.muted ? "false" : "true");
    }
  }

  if (pausa) {
    pausa.addEventListener("click", function () {
      mandaElUsuario = true;
      if (video.paused) {
        if (termino) volverAlVideo();
        video.play().catch(function () {});
      } else {
        video.pause();
      }
      pintar();
    });
  }

  if (sonido) {
    sonido.addEventListener("click", function () {
      mandaElUsuario = true;
      video.muted = !video.muted;
      if (!video.muted && video.paused && !termino) video.play().catch(function () {});
      pintar();
    });
  }

  video.addEventListener("play",  pintar);
  video.addEventListener("pause", pintar);

  /* ---- Al terminar, la foto ---- */
  video.addEventListener("ended", function () {
    termino = true;
    caja.classList.add("es-final");
    pintar();
  });

  /* Y al tocar la foto, vuelve el video desde el principio. Los
     botones de abajo no cuentan: esos hacen lo suyo. */
  caja.addEventListener("click", function (e) {
    if (!termino) return;
    if (e.target.closest && e.target.closest(".ctc-video__mandos")) return;
    volverAlVideo();
    video.play().catch(function () {});
    pintar();
  });

  function volverAlVideo() {
    termino = false;
    caja.classList.remove("es-final");
    try { video.currentTime = 0; } catch (err) {}
  }

  /* ---- Arrancar ---- */

  function intentarSonido() {
    if (mandaElUsuario) return;
    video.muted = false;
    var r = video.play();
    if (r && r.catch) {
      r.catch(function () {
        video.muted = true;               // no dejó: sigue, pero callado
        video.play().catch(function () {});
        pintar();
      });
    }
    window.setTimeout(pintar, 120);
  }

  /* El primer toque en cualquier parte de la página sirve de permiso */
  function alPrimerGesto(e) {
    if (mandaElUsuario) return;
    if (e && e.target && caja.contains(e.target)) { mandaElUsuario = true; quitarGestos(); return; }
    quitarGestos();
    if (!aLaVista || termino) return;
    video.muted = false;
    video.play().catch(function () { video.muted = true; });
    pintar();
  }

  function ponerGestos() {
    document.addEventListener("pointerdown", alPrimerGesto);
    document.addEventListener("keydown", alPrimerGesto);
    document.addEventListener("touchstart", alPrimerGesto);
  }
  function quitarGestos() {
    document.removeEventListener("pointerdown", alPrimerGesto);
    document.removeEventListener("keydown", alPrimerGesto);
    document.removeEventListener("touchstart", alPrimerGesto);
  }

  /* ---- Solo mientras la sección se vea ----

     La sección de contacto es una pestaña: mientras no esté abierta,
     el video no existe en pantalla y no tiene por qué estar hablando. */

  var aLaVista = false;
  var arrancado = false;

  function encender() {
    aLaVista = true;
    if (termino || mandaElUsuario) return;
    video.play().catch(function () {});
    if (!arrancado) {
      arrancado = true;
      intentarSonido();
      ponerGestos();
    }
    pintar();
  }

  function apagar() {
    aLaVista = false;
    video.pause();
    quitarGestos();

    /* Si ya había terminado, se deja listo para la próxima vez: la
       sección tiene que abrir con el video, nunca con la foto. */
    if (termino) volverAlVideo();
    pintar();
  }

  if (window.IntersectionObserver) {
    var vigia = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].isIntersecting) encender();
        else apagar();
      }
    }, { threshold: 0.3 });
    vigia.observe(caja);
  } else {
    encender();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) video.pause();
    else if (aLaVista && !termino && !mandaElUsuario) video.play().catch(function () {});
    pintar();
  });

  pintar();
}
