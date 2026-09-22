/* ============================================================
   i'Witown — Medición de visitas (Google Analytics 4)
   ============================================================

   Mide cuánta gente entra, cuándo, de dónde y en qué vista se
   queda. Como cada vista tiene su propia ruta (/acp, /solucion…),
   GA4 las cuenta solas: acá NO se manda ningún evento de página a
   mano, o cada visita se contaría dos veces.

   ┌──────────────────────────────────────────────────────────┐
   │  NO SE MIDE A NADIE SIN PERMISO                          │
   │                                                          │
   │  GA4 pone cookies y manda datos a Google. La Ley 1581    │
   │  de 2012 pide permiso ANTES, no después, así que el      │
   │  script de Google ni siquiera se descarga hasta que la   │
   │  persona acepta. Rechazar no carga nada: no es un        │
   │  "acepto que me midan menos", es que no se mide.         │
   │                                                          │
   │  La decisión se guarda en el navegador de cada quien     │
   │  para no volver a preguntar, y se puede cambiar desde    │
   │  el enlace "Cookies" del pie de página.                  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  SI SE CAMBIA EL IDENTIFICADOR                           │
   │                                                          │
   │  Está aquí abajo, en MEDICION. Sale de la consola de     │
   │  Google Analytics: Administrar → Flujos de datos.        │
   │                                                          │
   │  Si se deja vacío, no hay medición NI aviso de cookies:  │
   │  sería absurdo pedir permiso para algo que no va a pasar.│
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var MEDICION = "G-R4YCFT0JLP";

(function () {
  /* Sin identificador no hay nada que consentir. El botón del pie se esconde:
     dejarlo puesto sería un botón que no hace nada. */
  if (typeof MEDICION !== "string" || !MEDICION) {
    try {
      var sobra = document.querySelectorAll("[data-cookies]");
      for (var j = 0; j < sobra.length; j++) sobra[j].hidden = true;
    } catch (e) {}
    return;
  }

  var LLAVE = "iwitown-cookies";
  var POLITICA = "https://www.politicasprivacidadwitcoins.com/";

  var puesto = false;

  /* ---- La decisión guardada ----

     Envuelto en try/catch porque en una ventana de incógnito, o con el
     almacenamiento bloqueado, leer o escribir aquí lanza un error. Si no se
     puede guardar, se vuelve a preguntar en la siguiente visita: molesto, pero
     preferible a medir sin permiso. */

  function decision() {
    try { return window.localStorage.getItem(LLAVE); } catch (e) { return null; }
  }

  function guardar(valor) {
    try { window.localStorage.setItem(LLAVE, valor); } catch (e) {}
  }

  /* Borra las cookies que dejo GA4. Si alguien acepta y luego se arrepiente, no
     basta con dejar de medir de ahi en adelante: hay que quitarle lo que ya se
     le puso.

     Se prueban varios dominios porque GA las escribe en el dominio de mas
     arriba que puede (.iwitown.com), no en el del sitio. */
  function borrarCookiesDeMedicion() {
    var nombres = [];
    try {
      (document.cookie || "").split(";").forEach(function (trozo) {
        var nombre = trozo.split("=")[0].trim();
        if (nombre.indexOf("_ga") === 0) nombres.push(nombre);
      });
    } catch (e) { return; }

    var partes = window.location.hostname.split(".");
    var dominios = [""];
    for (var i = 0; i < partes.length - 1; i++) {
      dominios.push("; domain=." + partes.slice(i).join("."));
    }

    nombres.forEach(function (nombre) {
      dominios.forEach(function (d) {
        document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  /* ---- Encender y apagar la medición ----

     Un script ya descargado no se puede "descargar", pero sí se puede callar:
     gtag.js consulta esta bandera antes de cada envío. Sin ella, rechazar
     después de haber aceptado no servía de nada: la medición mejorada de GA4
     manda sola sus propios eventos (bajar al 90 %, tocar un enlace externo,
     empezar un video) y en el primero de ellos volvía a escribir las cookies
     que acabábamos de borrar, encima con un identificador nuevo. */

  function apagar() {
    window["ga-disable-" + MEDICION] = true;
  }

  function encender() {
    /* Puesto a false a propósito y no solo al aceptar la primera vez: quien
       rechaza y vuelve a aceptar sin recargar tiene la bandera en true, y la
       guarda de abajo haría que se quedara apagado para siempre. */
    window["ga-disable-" + MEDICION] = false;

    if (puesto) {
      /* El script ya estaba cargado (aceptó, rechazó y volvió a aceptar). Sin
         esto la vista en la que está no se cuenta: el siguiente envío llegaría
         solo cuando cambie de vista o baje al 90 %, y si cierra ahí mismo la
         sesión no queda registrada. */
      window.gtag("config", MEDICION);
      return;
    }
    puesto = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEDICION;
    document.head.appendChild(s);

    window.gtag("js", new Date());
    window.gtag("config", MEDICION);
  }

  /* ---- El aviso ---- */

  /* El boton flotante de WhatsApp vive abajo a la derecha y quedaria encima del
     aviso. Se sube lo que mida el aviso, medido de verdad y no a ojo: el texto
     envuelve distinto segun el ancho, asi que un numero fijo fallaria en algun
     telefono. */
  function medirAviso(caja) {
    try {
      document.documentElement.style.setProperty(
        "--alto-cookies", (caja.offsetHeight || 0) + "px");
    } catch (e) {}
  }

  function quitarAviso() {
    var viejo = document.getElementById("cookies");
    if (viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
    document.body.classList.remove("con-cookies");
    window.removeEventListener("resize", alCambiarDeTamano);

    /* El botón que estaba enfocado se acaba de borrar: sin esto el foco cae al
       <body> y quien navega con el teclado pierde el sitio. */
    cajaPuesta = null;

    if (quienAbrio) {
      try { quienAbrio.focus(); } catch (e) {}
      quienAbrio = null;
    }
  }

  var cajaPuesta = null;
  var quienAbrio = null;
  function alCambiarDeTamano() {
    if (cajaPuesta) medirAviso(cajaPuesta);
  }

  /* El abridor se recibe y se guarda DESPUES de quitarAviso(), que justamente
     limpia esa referencia: al revés se borraba sola. */
  function mostrarAviso(porPeticion, abridor) {
    quitarAviso();
    quienAbrio = abridor || null;

    var caja = document.createElement("section");
    caja.className = "cookies";
    caja.id = "cookies";
    caja.setAttribute("aria-label", "Aviso de cookies");
    /* Enfocable solo por JS: al reabrirlo desde el pie el foco va al aviso y el
       lector de pantalla lee de qué va antes de los botones. Enfocar "Aceptar"
       leería "Aceptar, botón" a secas, y encima dejaría la opción de decir sí
       justo debajo del dedo. */
    caja.setAttribute("tabindex", "-1");

    /* La fila lleva .contenedor para que el texto arranque justo donde arranca
       el contenido del resto de la pagina, y no pegado al borde. */
    var fila = document.createElement("div");
    fila.className = "cookies__inner contenedor";

    var texto = document.createElement("p");
    texto.className = "cookies__texto";
    /* Nombra a Google porque los datos salen para allá (transferencia
       internacional) y el Decreto 1377 de 2013 pide decir a quién se le
       entregan, no solo para qué. Y dice que la decisión se puede cambiar: el
       botón del pie existe, pero nadie lo busca si no se le anuncia.

       El tono es el del resto del sitio: afirma el hecho y deja decidir. Nada de
       pedir permiso dos veces en la misma frase. */
    texto.innerHTML = "Con tu permiso medimos las visitas de esta página con " +
      "Google Analytics. " +
      "Tu decisión se puede cambiar en cualquier momento desde «Cookies», en el " +
      'pie. Consulta la <a href="' + POLITICA + '" target="_blank" ' +
      'rel="noopener">política de tratamiento de datos</a>.';
    fila.appendChild(texto);

    var botones = document.createElement("div");
    botones.className = "cookies__botones";

    var no = document.createElement("button");
    no.type = "button";
    no.className = "cookies__boton";
    no.textContent = "Rechazar";
    no.addEventListener("click", function () {
      guardar("no");
      apagar();
      borrarCookiesDeMedicion();
      quitarAviso();
    });
    botones.appendChild(no);

    var si = document.createElement("button");
    si.type = "button";
    si.className = "cookies__boton cookies__boton--si";
    si.textContent = "Aceptar";
    si.addEventListener("click", function () {
      guardar("si");
      quitarAviso();
      encender();
    });
    botones.appendChild(si);

    fila.appendChild(botones);
    caja.appendChild(fila);

    /* Primero en el <body> y no al final: se pinta igual abajo (es fixed), pero
       quien navega con el teclado lo alcanza en dos tabuladas en vez de
       atravesar la navegación y las nueve secciones. */
    document.body.insertBefore(caja, document.body.firstChild);

    cajaPuesta = caja;
    document.body.classList.add("con-cookies");
    medirAviso(caja);
    window.addEventListener("resize", alCambiarDeTamano);

    /* El foco solo se mueve si la persona PIDIO ver el aviso desde el pie. Al
       cargar la página no se le roba: quien esté leyendo con un lector de
       pantalla se llevaría un salto al principio, y el aviso igual se alcanza
       con el tabulador. Tampoco se atrapa el foco: es un aviso, no un diálogo, y
       bloquear la página para pedir permiso de medir sería abusivo. */
    if (porPeticion) window.setTimeout(function () { caja.focus(); }, 120);
  }

  /* ---- Poder cambiar de opinión ----

     Retirar el permiso tiene que ser tan fácil como darlo. El botón del pie
     borra la decisión y vuelve a preguntar; si ya estaba encendido, rechazar lo
     apaga y borra las cookies en el acto. */

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("[data-cookies]") : null;
    if (!b) return;
    ev.preventDefault();
    guardar("");
    mostrarAviso(true, b);
  });

  /* ---- Al cargar ---- */

  var ya = decision();
  if (ya === "si") encender();
  else if (ya !== "no") mostrarAviso();
})();
