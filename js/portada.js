/* ============================================================
   i'Witown — El celular de la portada
   ============================================================

   El video vertical que va dentro del celular, arriba del todo.
   Arranca solo, se repite y trae dos botones: uno para pausarlo y
   otro para el sonido.

   ┌──────────────────────────────────────────────────────────┐
   │  POR QUÉ HAY UN BOTÓN DE SONIDO                          │
   │                                                          │
   │  Chrome, Safari y Firefox NO dejan que un video empiece  │
   │  a sonar solo. Es una regla del navegador, no algo que   │
   │  se pueda programar distinto: si la persona no ha tocado │
   │  nada todavía, el video se bloquea.                      │
   │                                                          │
   │  Lo que hace esta página:                                │
   │                                                          │
   │  1. Arranca MUDO. Eso el navegador siempre lo deja, así  │
   │     que el video se ve moverse pase lo que pase.         │
   │  2. Enseguida intenta quitarle el silencio. A veces el   │
   │     navegador lo permite —si la persona ya estuvo antes  │
   │     en el sitio, por ejemplo— y entonces entra hablando. │
   │  3. Si no lo permite, se prende el aviso "Toca para oír" │
   │     y el botón de sonido late.                           │
   │  4. En cuanto la persona toca cualquier parte de la      │
   │     página, el sonido se activa solo.                    │
   │                                                          │
   │  O sea: entra hablando siempre que el navegador lo       │
   │  permita, y con un toque en todos los demás casos.       │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  DOS VIDEOS NO HABLAN A LA VEZ                           │
   │                                                          │
   │  Más abajo está el simulador, que también tiene voz.     │
   │  Mientras el celular se ve, él manda; en cuanto sale de  │
   │  la pantalla se calla y se pausa, y de ahí en adelante   │
   │  el sonido es del simulador.                             │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

(function () {
  var video  = document.getElementById("celVideo");
  var pausa  = document.getElementById("celPausa");
  var sonido = document.getElementById("celSonido");
  if (!video) return;

  /* Se vuelve true en cuanto la persona toca los botones: de ahí en
     adelante manda ella y la página no le cambia nada por su cuenta. */
  var mandaElUsuario = false;

  /* ---- Los botones ---- */

  function pintar() {
    if (pausa) {
      pausa.classList.toggle("esta-andando", !video.paused);
      pausa.setAttribute("aria-label", video.paused ? "Reproducir" : "Pausar");
      pausa.setAttribute("aria-pressed", video.paused ? "true" : "false");
    }
    var aviso = document.getElementById("celAviso");
    if (aviso) aviso.hidden = !video.muted;

    if (sonido) {
      sonido.classList.toggle("esta-sonando", !video.muted);
      sonido.setAttribute("aria-label", video.muted ? "Activar sonido" : "Quitar sonido");
      sonido.setAttribute("aria-pressed", video.muted ? "false" : "true");
    }
  }

  if (pausa) {
    pausa.addEventListener("click", function () {
      mandaElUsuario = true;
      if (video.paused) video.play().catch(function () {});
      else video.pause();
      pintar();
    });
  }

  if (sonido) {
    sonido.addEventListener("click", function () {
      mandaElUsuario = true;
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play().catch(function () {});
      pintar();
    });
  }

  video.addEventListener("play",  pintar);
  video.addEventListener("pause", pintar);

  /* ---- Arrancar ----

     El video arranca MUDO, con el atributo puesto en la etiqueta: así
     ningún navegador lo bloquea y siempre se ve moverse. Enseguida se
     intenta quitarle el silencio; si el navegador no deja, sigue
     andando sin voz y se prende el aviso. */
  function arrancar() {
    var r = video.play();
    if (r && r.catch) r.catch(function () {});

    intentarSonido();
    ponerEscuchaDeGestos();
    pintar();
  }

  function intentarSonido() {
    if (mandaElUsuario) return;

    video.muted = false;
    var r = video.play();
    if (r && r.catch) {
      r.catch(function () {
        /* No dejó: se vuelve al silencio, pero el video sigue */
        video.muted = true;
        video.play().catch(function () {});
        pintar();
      });
    }

    /* Algunos navegadores no rechazan la promesa: simplemente vuelven
       a poner el silencio por su cuenta. Se revisa un instante después. */
    window.setTimeout(pintar, 120);
  }

  /* El primer toque en cualquier parte de la página sirve de permiso */
  function alPrimerGesto(e) {
    if (mandaElUsuario) return;

    /* Si el toque fue en los botones del celular, se deja que ellos
       manden: si no, quedarían peleando. */
    if (e && e.target &&
        ((sonido && sonido.contains(e.target)) || (pausa && pausa.contains(e.target)))) {
      mandaElUsuario = true;
      quitarEscuchaDeGestos();
      return;
    }

    quitarEscuchaDeGestos();
    if (!seVe()) return;              // si ya se fue de la pantalla, no
    video.muted = false;
    video.play().catch(function () { video.muted = true; });
    pintar();
  }

  function ponerEscuchaDeGestos() {
    document.addEventListener("pointerdown", alPrimerGesto);
    document.addEventListener("keydown", alPrimerGesto);
    document.addEventListener("touchstart", alPrimerGesto);
  }

  function quitarEscuchaDeGestos() {
    document.removeEventListener("pointerdown", alPrimerGesto);
    document.removeEventListener("keydown", alPrimerGesto);
    document.removeEventListener("touchstart", alPrimerGesto);
  }

  /* ---- Mientras se vea ----

     Al salir de la pantalla se calla y se pausa: nadie quiere una voz
     saliendo de un video que ya no está viendo. Al volver, sigue,
     salvo que la persona lo haya pausado ella misma. */

  var aLaVista = true;

  function seVe() { return aLaVista; }

  /* Lo usa js/presentacion.js: mientras el celular esté hablando, el
     video del simulador no se activa solo. */
  window.portadaHablando = function () {
    return aLaVista && !video.paused && !video.muted;
  };

  if (window.IntersectionObserver) {
    var vigia = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        aLaVista = entradas[i].isIntersecting;

        if (!aLaVista) {
          video.pause();
          quitarEscuchaDeGestos();
        } else if (!mandaElUsuario) {
          video.play().catch(function () {});
        }
      }
      pintar();
    }, { threshold: 0.25 });
    vigia.observe(video);
  }

  /* Si la pestaña se va a segundo plano, el video se calla */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) video.pause();
    else if (aLaVista && !mandaElUsuario) video.play().catch(function () {});
    pintar();
  });

  arrancar();
})();
