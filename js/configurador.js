/* ============================================================
   i'Witown — /demo-directivos: el Configurador, privado
   ============================================================

   La página solo se abre con el enlace que crea la asesora desde
   founders (/demo-directivos?e=<token>). El <script> del inicio de
   index.html ya quitó el token de la barra (antes de la medición) y
   lo dejó en memoria. Aquí:
     - con token: se va al Configurador como página principal (no
       en un iframe: dentro de otro sitio, el navegador puede negarle
       el almacenamiento y sus vistas previas no arrancarían). El
       configurador vuelve a quitar el token de su propia barra;
     - sin token: el aviso "Esta demo es privada".

   ┌──────────────────────────────────────────────────────────┐
   │  CONFIGURADOR  la dirección del sitio del configurador.   │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var CONFIGURADOR = "https://directivos-iwitown.web.app/";

(function () {
  var seccion = document.getElementById("demo-directivos");
  if (!seccion) return;

  var sinEnlace = document.getElementById("configuradorSinEnlace");
  var listo = false;

  function abrir() {
    if (listo) return;
    listo = true;
    var e = window.__configuradorE || "";
    if (!/^[A-Za-z0-9_-]{20,40}$/.test(e)) {
      sinEnlace.hidden = false;
      return;
    }
    // Igual que js/alianzas.js: solo si la persona aceptó la medición.
    if (typeof window.gtag === "function") {
      try { window.gtag("event", "configurador_abierto"); } catch (err) {}
    }
    // replace: "atrás" no vuelve a esta página vacía.
    location.replace(CONFIGURADOR + "?e=" + encodeURIComponent(e));
  }

  // La vista se muestra cuando el router la abre (js/vistas.js quita `hidden`).
  new MutationObserver(function () { if (!seccion.hidden) abrir(); })
    .observe(seccion, { attributes: true, attributeFilter: ["hidden"] });
  if (!seccion.hidden) abrir();
})();
