/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — Portada (/feria).                                   │
   │                                                                      │
   │  1. Cuenta regresiva hasta la feria. La fecha NO está aquí: se lee   │
   │     de data-inicio y data-fin en portada.html (#cuenta).             │
   │       antes   → días, horas, minutos y segundos                      │
   │       durante → "¡La feria está en marcha!"                          │
   │       después → "¡Gracias por venir!" (los instructivos siguen)      │
   │  2. La luz del fondo sigue el cursor (solo donde hay cursor).        │
   │  3. Las secciones aparecen al llegar a la pantalla.                  │
   │  4. El video de YouTube se carga solo al tocar reproducir.           │
   │                                                                      │
   │ Sin JavaScript la página se ve completa: fecha, entradas y enlace    │
   │ al video.                                                            │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  // La clase "js" la pone ESTE archivo y no un script en la página: es la que
  // esconde las secciones para animarlas. Si este archivo no llega a cargar,
  // nadie las esconde y la página se ve completa.
  document.documentElement.classList.add("js");

  var reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Cuenta regresiva ---------- */
  var cuenta = document.getElementById("cuenta");
  if (cuenta) {
    var inicio = Date.parse(cuenta.getAttribute("data-inicio"));
    var fin = Date.parse(cuenta.getAttribute("data-fin"));
    var reloj = cuenta.querySelector(".fp-reloj");
    var estado = cuenta.querySelector(".fp-estado");
    var cifras = {};
    cuenta.querySelectorAll("[data-u]").forEach(function (b) { cifras[b.getAttribute("data-u")] = b; });
    var cierre = document.querySelector("[data-antes]");
    var reloj_id = null;

    function dos(n) { return n < 10 ? "0" + n : String(n); }
    function poner(u, v) { if (cifras[u] && cifras[u].textContent !== v) cifras[u].textContent = v; }
    function mensaje(texto, textoCierre) {
      if (estado.textContent === texto && !estado.hidden) return;   // ya está puesto
      reloj.hidden = true;
      estado.textContent = texto;
      estado.hidden = false;
      if (cierre) cierre.textContent = textoCierre;
    }
    function pintar() {
      var ahora = Date.now();
      if (ahora >= fin) {
        mensaje("¡Gracias por venir!", "¡Gracias por venir!");
        if (reloj_id) clearInterval(reloj_id);
        return;
      }
      if (ahora >= inicio) { mensaje("¡La feria está en marcha!", "¡Es hoy!"); return; }
      var s = Math.floor((inicio - ahora) / 1000);
      poner("d", dos(Math.floor(s / 86400)));
      poner("h", dos(Math.floor((s % 86400) / 3600)));
      poner("m", dos(Math.floor((s % 3600) / 60)));
      poner("s", dos(s % 60));
      estado.hidden = true;
      reloj.hidden = false;
    }
    // Una fecha mal escrita no debe mostrar "NaN": se deja solo el texto de la fecha.
    if (!isNaN(inicio) && !isNaN(fin) && reloj && estado) {
      pintar();
      reloj_id = setInterval(pintar, 1000);
    }
  }

  /* ---------- 2. La luz sigue el cursor ---------- */
  var hero = document.querySelector(".fp-hero");
  var luz = document.querySelector(".fp-luz");
  var conCursor = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && luz && conCursor && !reducir) {
    var pendiente = false, px = 0, py = 0;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () {
        luz.style.setProperty("--x", px + "px");
        luz.style.setProperty("--y", py + "px");
        pendiente = false;
      });
    });
  }

  /* ---------- 3. Aparecer al llegar ---------- */
  var animados = document.querySelectorAll(".fp-anim");
  function verTodo() { animados.forEach(function (el) { el.classList.add("visible"); }); }
  if (reducir || !("IntersectionObserver" in window)) {
    verTodo();
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    animados.forEach(function (el) { obs.observe(el); });
    window.addEventListener("beforeprint", verTodo);
  }

  /* ---------- 4. Video: se carga al tocar ---------- */
  var boton = document.querySelector(".fp-video-btn[data-video]");
  if (boton) {
    boton.addEventListener("click", function (e) {
      // Con Ctrl / clic del medio se respeta abrirlo en YouTube.
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      var id = boton.getAttribute("data-video");
      if (!/^[\w-]{6,20}$/.test(id)) return;
      e.preventDefault();
      var marco = document.createElement("iframe");
      marco.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      marco.title = "Video de la Feria I'witown 2026";
      marco.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      marco.allowFullscreen = true;
      marco.referrerPolicy = "strict-origin-when-cross-origin";
      boton.parentNode.replaceChild(marco, boton);
      marco.focus();
    });
  }
})();
