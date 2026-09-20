/* ============================================================
   i'Witown — La red neuronal del fondo de la A.C.P.
   ============================================================

   El rectángulo morado de la A.C.P. tiene detrás una red que se
   mueve: unos puntos que flotan despacio y los hilos que los unen,
   que se estiran y se encogen con ellos. Es solo decoración.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ ABAJO                         │
   │                                                          │
   │    RED_NODOS     cuántos puntos hay                      │
   │    RED_PASO      qué tan rápido flotan (píxeles por      │
   │                  segundo; con 8 ya se nota)              │
   │    RED_ALCANCE   a qué distancia dos puntos se unen      │
   │    RED_GROSOR    qué tan gruesos son los hilos           │
   └──────────────────────────────────────────────────────────┘

   Qué tan transparente se ve toda la red se cambia en el CSS,
   en ".acp-red { opacity }".
   ============================================================ */

var RED_NODOS   = 26;
var RED_PASO    = 9;
var RED_ALCANCE = 190;
var RED_GROSOR  = 1.1;

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {

  var lienzo = document.getElementById("acpRed");
  if (!lienzo || !lienzo.getContext) return;

  var pincel = lienzo.getContext("2d");
  var escena = lienzo.parentNode;
  var quieto = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ancho = 0, alto = 0, lupa = 1;
  var puntos = [];
  var antes = 0;
  var turno = null;

  /* ---- El tamaño, en píxeles de verdad ---- */
  function medir() {
    var caja = escena.getBoundingClientRect();
    if (!caja.width || !caja.height) return false;

    lupa = Math.min(window.devicePixelRatio || 1, 2);
    ancho = caja.width;
    alto = caja.height;
    lienzo.width  = Math.round(ancho * lupa);
    lienzo.height = Math.round(alto * lupa);
    pincel.setTransform(lupa, 0, 0, lupa, 0, 0);
    return true;
  }

  /* ---- Los puntos, repartidos al azar ---- */
  function sembrar() {
    puntos = [];
    for (var i = 0; i < RED_NODOS; i++) {
      var vuelta = Math.random() * Math.PI * 2;
      puntos.push({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        dx: Math.cos(vuelta) * RED_PASO,
        dy: Math.sin(vuelta) * RED_PASO,
        r: 1.6 + Math.random() * 2.4,
        /* cada uno respira a su ritmo */
        fase: Math.random() * Math.PI * 2,
        ritmo: 0.5 + Math.random() * 0.7
      });
    }
  }

  /* ---- Un paso de tiempo ---- */
  function mover(segundos) {
    for (var i = 0; i < puntos.length; i++) {
      var p = puntos[i];
      p.x += p.dx * segundos;
      p.y += p.dy * segundos;

      /* Al llegar al borde se devuelven, para que nunca se vacíe */
      if (p.x < 0)      { p.x = 0;     p.dx = -p.dx; }
      if (p.x > ancho)  { p.x = ancho; p.dx = -p.dx; }
      if (p.y < 0)      { p.y = 0;     p.dy = -p.dy; }
      if (p.y > alto)   { p.y = alto;  p.dy = -p.dy; }
    }
  }

  /* ---- Dibujar ---- */
  function pintar(reloj) {
    pincel.clearRect(0, 0, ancho, alto);

    /* Primero los hilos: mientras más cerca estén dos puntos,
       más se ve el hilo que los une. */
    pincel.lineWidth = RED_GROSOR;
    for (var i = 0; i < puntos.length; i++) {
      for (var j = i + 1; j < puntos.length; j++) {
        var a = puntos[i], b = puntos[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var lejos = Math.sqrt(dx * dx + dy * dy);
        if (lejos > RED_ALCANCE) continue;

        var fuerza = 1 - lejos / RED_ALCANCE;
        pincel.strokeStyle = "rgba(255,255,255," + (fuerza * 0.55).toFixed(3) + ")";
        pincel.beginPath();
        pincel.moveTo(a.x, a.y);
        pincel.lineTo(b.x, b.y);
        pincel.stroke();
      }
    }

    /* Y encima los puntos, que además laten */
    for (var k = 0; k < puntos.length; k++) {
      var p = puntos[k];
      var latido = 0.6 + 0.4 * Math.sin(reloj * p.ritmo + p.fase);
      pincel.fillStyle = "rgba(255,255,255," + latido.toFixed(3) + ")";
      pincel.beginPath();
      pincel.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pincel.fill();
    }
  }

  /* ---- La vuelta de siempre ---- */
  function vuelta(ahora) {
    turno = window.requestAnimationFrame(vuelta);

    if (!antes) antes = ahora;
    var segundos = (ahora - antes) / 1000;
    antes = ahora;
    /* Si la pestaña estuvo dormida, no se da un salto enorme */
    if (segundos > 0.1) segundos = 0.1;

    mover(segundos);
    pintar(ahora / 1000);
  }

  function arrancar() {
    if (turno !== null) return;
    if (!medir()) return;
    if (!puntos.length) sembrar();
    antes = 0;
    if (quieto) { pintar(0); return; }
    turno = window.requestAnimationFrame(vuelta);
  }

  function parar() {
    if (turno === null) return;
    window.cancelAnimationFrame(turno);
    turno = null;
  }

  /* Solo corre cuando la sección está a la vista: si está en otra
     pestaña del menú, no tiene sentido gastar batería. */
  function revisar() {
    var seccion = document.getElementById("acp");
    if (seccion && seccion.hidden) parar();
    else arrancar();
  }

  function reacomodar() {
    var antesAncho = ancho, antesAlto = alto;
    if (!medir()) return;
    if (!puntos.length) { sembrar(); return; }
    /* Los puntos se corren con el marco, para que no se amontonen */
    if (antesAncho && antesAlto) {
      for (var i = 0; i < puntos.length; i++) {
        puntos[i].x = puntos[i].x / antesAncho * ancho;
        puntos[i].y = puntos[i].y / antesAlto * alto;
      }
    }
  }

  window.addEventListener("resize", reacomodar);
  window.addEventListener("hashchange", function () {
    window.setTimeout(revisar, 0);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar(); else revisar();
  });

  var seccion = document.getElementById("acp");
  if (seccion && window.MutationObserver) {
    new MutationObserver(function () { window.setTimeout(revisar, 0); })
      .observe(seccion, { attributes: true, attributeFilter: ["hidden"] });
  }

  revisar();
})();
