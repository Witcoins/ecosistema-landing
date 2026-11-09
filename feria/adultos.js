/* Feria I'witown — instructivos para adultos.
   - Barra lateral con botones: cada parte se despliega y muestra los botones de
     sus secciones. Al elegir uno se muestra SOLO esa sección, con
     "Anterior / Siguiente". La dirección cambia (#seccion): el botón atrás funciona.
   - En computador la barra se oculta / muestra y recuerda cómo la dejaron;
     en celular se abre con "Contenido" y se cierra al elegir.
   - Imprimir / Guardar PDF: imprime todo el instructivo con los detalles abiertos.
   Sin JavaScript se ven todas las secciones seguidas. */
(function () {
  var body = document.body;
  var esComputador = window.matchMedia("(min-width: 1024px)");
  var CLAVE = "feria-instructivo-barra";

  /* ---------- Barra lateral: abrir / ocultar ---------- */
  var botonesBarra = document.querySelectorAll("[data-barra]");
  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento */ } }
  function ponerBarra(abierta, recordar) {
    body.classList.toggle("fa-side-abierta", abierta);
    botonesBarra.forEach(function (b) { if (b.getAttribute("data-barra") === "alternar") b.setAttribute("aria-expanded", abierta ? "true" : "false"); });
    if (recordar && esComputador.matches) guardar(abierta ? "abierta" : "oculta");
  }
  ponerBarra(esComputador.matches && leer() !== "oculta", false);
  if (esComputador.addEventListener) {
    esComputador.addEventListener("change", function () { ponerBarra(esComputador.matches && leer() !== "oculta", false); });
  }
  botonesBarra.forEach(function (b) {
    b.addEventListener("click", function () {
      var accion = b.getAttribute("data-barra");
      var abrir = accion === "abrir" ? true : accion === "cerrar" ? false : !body.classList.contains("fa-side-abierta");
      ponerBarra(abrir, true);
    });
  });
  var velo = document.querySelector(".fa-velo");
  if (velo) velo.addEventListener("click", function () { ponerBarra(false, false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !esComputador.matches && body.classList.contains("fa-side-abierta")) ponerBarra(false, false);
  });

  /* ---------- Partes que se despliegan ---------- */
  document.querySelectorAll(".fa-grupo-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true");
    });
  });

  /* ---------- Una sección a la vez ---------- */
  var tarjetas = Array.prototype.slice.call(document.querySelectorAll(".fa-card[id]"));
  var botones = Array.prototype.slice.call(document.querySelectorAll(".fa-nav-btn"));
  var ant = document.querySelector(".fa-ant");
  var sig = document.querySelector(".fa-sig");
  var pos = document.querySelector(".fa-pos");
  if (!tarjetas.length) return;
  body.classList.add("fa-una");

  function indiceDe(id) {
    for (var i = 0; i < tarjetas.length; i++) if (tarjetas[i].id === id) return i;
    return -1;
  }
  function enlace(a, i) {
    if (i < 0 || i >= tarjetas.length) { a.setAttribute("aria-disabled", "true"); a.setAttribute("tabindex", "-1"); a.removeAttribute("href"); return; }
    a.removeAttribute("aria-disabled"); a.removeAttribute("tabindex"); a.setAttribute("href", "#" + tarjetas[i].id);
  }
  function mostrar(id, desplazar) {
    var i = indiceDe(id);
    if (i < 0) i = 0;
    var t = tarjetas[i];
    tarjetas.forEach(function (x) { x.classList.toggle("actual", x === t); });
    t.classList.add("visible");
    body.classList.toggle("fa-en-inicio", i === 0);
    botones.forEach(function (b) {
      var es = b.getAttribute("href") === "#" + t.id;
      b.classList.toggle("activo", es);
      if (es) {
        b.setAttribute("aria-current", "location");
        // Abre la parte donde está el botón elegido.
        var grupo = b.closest(".fa-grupo");
        var gb = grupo && grupo.querySelector(".fa-grupo-btn");
        if (gb) gb.setAttribute("aria-expanded", "true");
      } else {
        b.removeAttribute("aria-current");
      }
    });
    enlace(ant, i - 1);
    enlace(sig, i + 1);
    if (pos) pos.textContent = (i + 1) + " de " + tarjetas.length;
    if (desplazar) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function desdeDireccion(desplazar) {
    var h = location.hash.slice(1);
    try { h = decodeURIComponent(h); } catch (e) { /* link mal formado: se usa tal cual */ }
    mostrar(h, desplazar);
  }
  window.addEventListener("hashchange", function () { desdeDireccion(true); });
  desdeDireccion(false);

  // Elegir una sección en celular cierra la barra.
  botones.forEach(function (b) {
    b.addEventListener("click", function () { if (!esComputador.matches) ponerBarra(false, false); });
  });

  /* ---------- Imprimir: todo el instructivo, con los detalles abiertos ---------- */
  var cerrados = [];
  function abrirTodo() {
    document.querySelectorAll(".fa-anim").forEach(function (t) { t.classList.add("visible"); });
    document.querySelectorAll("details.fa-det").forEach(function (d) {
      if (!d.open) { cerrados.push(d); d.open = true; }
    });
  }
  function restaurar() { cerrados.forEach(function (d) { d.open = false; }); cerrados = []; }
  window.addEventListener("beforeprint", abrirTodo);
  window.addEventListener("afterprint", restaurar);
  var imprimir = document.querySelector(".fa-imprimir");
  if (imprimir) imprimir.addEventListener("click", function () { abrirTodo(); window.print(); });
})();
