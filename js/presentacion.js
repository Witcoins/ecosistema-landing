/* ============================================================
   i'Witown — Presentación inicial
   ============================================================

   Es lo primero que ve el visitante. Todo pasa dentro del mismo
   marco: los pasos se van turnando ahí adentro, uno tras otro,
   sin que nadie tenga que hacer clic.

   ┌──────────────────────────────────────────────────────────┐
   │  EL ORDEN DE LA APERTURA ESTÁ EN "PRES_SECUENCIA".       │
   │                                                          │
   │  Para cambiarlo —agregar un video, mover una frase,      │
   │  quitar un paso— se edita esa lista y ya. No hay que     │
   │  tocar nada más.                                         │
   │                                                          │
   │  A un paso de video se le puede poner                    │
   │  "controles: true" y le salen encima los botones de      │
   │  pausa y detener. Hoy los tienen los dos videos.         │
   │                                                          │
   │  Hay cuatro clases de paso:                              │
   │    tipo: "video"     → un video con sus subtítulos       │
   │    tipo: "frase"     → una frase a pantalla completa     │
   │    tipo: "remate"    → el botón "Recorre la app"         │
   │    tipo: "app"       → el simulador, entrando de una     │
   │                        sin pasar por las tarjetas        │
   │                                                          │
   │  El recorrido automático termina en "remate": de ahí     │
   │  en adelante manda el visitante.                         │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var PRES_SECUENCIA = [

  /* ---------- EL REMATE ----------
     Hoy la presentación no tiene videos: el marco abre directo en
     esta pantalla, la del botón "Recorre la app". */
  { tipo: "remate" }
];

/* ============================================================
   CUANDO LLEGUE EL VIDEO NUEVO

   La maquinaria de los videos sigue entera; lo único que se vació
   fue la lista de arriba. Para volver a poner un video, se deja el
   archivo en assets/video/ y se agrega su bloque ANTES del remate:

     var PRES_SECUENCIA = [
       {
         tipo: "video",
         archivo: "assets/video/como-se-llame.mp4",
         fin: 29.7,        // segundo en que termina de hablar
         pendiente: false, // true mientras los subtítulos sean de relleno
         controles: true,  // le salen los botones de pausa y detener
         lineas: [
           { t:  0.0, texto: "Lo que se dice al principio" },
           { t:  4.2, texto: "Lo que sigue" }
         ]
       },
       { tipo: "remate" }
     ];

   Y si entre dos videos se quiere una frase suelta a pantalla
   completa, va un bloque así en medio:

       {
         tipo: "frase",
         arriba: "",                          // renglón chico de arriba
         grande: "En cambio, esto debería ser así.",
         segundos: 4,
         voz: "hombre",                       // "hombre", "mujer" o ""
         vozArchivo: "",                      // una grabación, si la hay
         vozTexto: ""                         // vacío = dice la frase grande
       }

   ┌──────────────────────────────────────────────────────────┐
   │  LOS SUBTÍTULOS                                          │
   │                                                          │
   │  "lineas" es el guion: cada renglón dice en qué segundo  │
   │  entra ("t") y qué se lee ("texto"). El renglón se queda │
   │  hasta que entre el siguiente.                           │
   │                                                          │
   │  "fin" es el segundo en que la persona termina de        │
   │  hablar; de ahí en adelante no se muestra subtítulo.     │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

/* ============================================================
   GUARDADO, POR SI SE VUELVE A NECESITAR

   Esta frase salió de la secuencia pero queda aquí. Para volver a
   usarla, se copia el bloque dentro de PRES_SECUENCIA, en la
   posición que se quiera.
   ============================================================

  {
    tipo: "frase",
    arriba: "Lo que debes esperar de una app escolar",
    grande: "Presenta tus propios contenidos.",
    segundos: 4.5,
    vozArchivo: "",
    vozTexto: ""
  },

   ============================================================ */

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA

   Nota: si el guion de un video no cabe en su duración, esto se
   arregla solo — repite el video y deja correr los subtítulos a
   ritmo de lectura, avisando por la consola del navegador.
   ============================================================ */

(function () {
  var video = document.getElementById("presVideo");
  if (!video) return;

  var btnSonido  = document.getElementById("presSonido");
  var progreso   = document.getElementById("presProgreso");
  var capaPlay   = document.getElementById("presPlay");
  var cc         = document.getElementById("presCC");
  var ccTexto    = document.getElementById("presCCTxt");
  var mandos     = document.getElementById("presMandos");
  var btnPausa   = document.getElementById("presPausa");
  var btnStop    = document.getElementById("presStop");

  var pasoVideos   = document.getElementById("pasoVideos");
  var pasoFrase    = document.getElementById("pasoFrase");
  var pasoApp      = document.getElementById("pasoApp");

  var indice = -1;      // en qué paso de la secuencia vamos
  var actual = null;    // el paso que se está mostrando
  var activa = -1;      // qué subtítulo se está mostrando

  var relojPropio = false;   // el video es más corto que su guion
  var segundos    = 0;
  var ticker      = null;
  var temporizadorFrase = null;
  var seAcaboTodo = false;
  var yaAvisado   = "";      // de qué video ya se avisó por consola

  /* ---- Ayudas ---- */
  function texto(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  function duracionTotal() {
    return relojPropio ? actual.fin : (video.duration || actual.fin);
  }

  function tiempoActual() {
    return relojPropio ? segundos : video.currentTime;
  }

  function limpiarTemporizadores() {
    if (ticker) { window.clearInterval(ticker); ticker = null; }
    if (temporizadorFrase) { window.clearTimeout(temporizadorFrase); temporizadorFrase = null; }
  }

  /* ============================================================
     MOSTRAR UN PASO DE LA SECUENCIA
     ============================================================ */

  /* Todas las pantallas viven dentro del mismo marco y se van
     turnando: la que toca se muestra y las demás se esconden.
     Nunca hay dos a la vez, y el marco no cambia de tamaño. */
  var PANTALLAS = {
    video:    "pasoVideos",
    frase:    "pasoFrase",
    remate:   "pasoRemate",
    apps:     "pasoApps",
    app:      "pasoApp",
    contacto: "pasoContacto"
  };

  /* El atajo de al lado del marco solo sale cuando la presentación
     ya terminó, o sea de las tarjetas en adelante. Mientras corren
     los videos y la frase estorba: la presentación ya se está viendo. */
  var atajo = document.getElementById("presAtajo");
  var CON_ATAJO = { remate: 1, apps: 1, app: 1, contacto: 1 };

  function mostrarSolo(pantalla) {
    for (var clave in PANTALLAS) {
      var el = document.getElementById(PANTALLAS[clave]);
      if (el) el.hidden = clave !== pantalla;
    }
    if (atajo) atajo.hidden = !CON_ATAJO[pantalla];
  }

  /* ============================================================
     EL APAGADOR GENERAL

     La página tiene cuatro cosas que pueden sonar: el video, la
     voz, la narración de I'Witutor y el fondo musical. Cada una
     vive en su archivo y ninguna sabe de las otras.

     Por eso todo cambio de pantalla pasa primero por aquí: se
     apaga TODO y después se prende lo que toque. Sin esto, basta
     con tocar "Presentación" estando en I'Witutor para que el
     video arranque encima de la narración y se oigan los dos.
     ============================================================ */

  function callarTodo() {
    limpiarTemporizadores();
    callarFrase();
    video.pause();

    /* El recorrido de I'Witutor */
    if (typeof window.witutorDetener === "function") window.witutorDetener();

    /* El recorrido narrado del simulador. Se para por el simulador,
       no por el recorrido mismo, para que su botón vuelva a decir
       "Ver el recorrido narrado". */
    if (typeof window.simuladorPararRecorrido === "function") {
      window.simuladorPararRecorrido();
    } else if (window.recorridoNarrado) {
      window.recorridoNarrado.detener();
    }

    /* El fondo musical */
    if (typeof window.presAmbienteDetener === "function") window.presAmbienteDetener();
  }

  function irAlPaso(i) {
    callarTodo();

    indice = i;
    actual = PRES_SECUENCIA[i];
    if (!actual) return;

    if (actual.tipo === "video")       arrancarVideo();
    else if (actual.tipo === "frase")  arrancarFrase();
    else                               arrancarRemate();
  }

  function siguientePaso() {
    if (indice + 1 < PRES_SECUENCIA.length) irAlPaso(indice + 1);
  }

  /* ============================================================
     PASO DE VIDEO
     ============================================================ */

  function arrancarVideo() {
    activa = -1;
    segundos = 0;
    seAcaboTodo = false;
    mostrarSolo("video");

    if (cc) cc.hidden = true;

    /* Los botones solo salen en los videos que los pidan */
    if (mandos) mandos.hidden = !actual.controles;
    pintarPausa();

    video.classList.add("esta-cambiando");
    video.src = actual.archivo;
    video.load();

    /* Hay que esperar a que el archivo esté listo: si se llama play()
       de una, el load() que acaba de arrancar lo cancela y el video
       se queda quieto. */
    var arrancarCuandoPueda = function () {
      video.removeEventListener("loadeddata", arrancarCuandoPueda);
      video.removeEventListener("canplay", arrancarCuandoPueda);
      video.play().catch(pintarPlay);
    };
    video.addEventListener("loadeddata", arrancarCuandoPueda);
    video.addEventListener("canplay", arrancarCuandoPueda);
  }

  video.addEventListener("playing", function () {
    video.classList.remove("esta-cambiando");
  });

  /* ---- El subtítulo que corresponde al segundo actual ---- */
  function actualizar() {
    if (!actual || actual.tipo !== "video") return;
    var t = tiempoActual();

    var cualLinea = -1;
    for (var i = 0; i < actual.lineas.length; i++) {
      if (t >= actual.lineas[i].t) cualLinea = i;
    }

    if (cualLinea !== activa) {
      activa = cualLinea;
      if (cc && ccTexto) {
        if (activa >= 0) {
          ccTexto.textContent = actual.lineas[activa].texto;
          cc.hidden = false;
        } else {
          cc.hidden = true;
        }
      }
    }

    if (progreso) progreso.style.width = Math.min(100, t / duracionTotal() * 100) + "%";
  }

  /* ---- Reloj propio, si el video es más corto que su guion ---- */
  function arrancarTicker() {
    if (!relojPropio || ticker) return;
    ticker = window.setInterval(function () {
      if (video.paused) return;
      segundos += 0.1;
      if (segundos >= actual.fin) {
        segundos = actual.fin;
        window.clearInterval(ticker); ticker = null;
        siguientePaso();
        return;
      }
      actualizar();
    }, 100);
  }

  function decidirModo() {
    if (!video.duration || !actual || actual.tipo !== "video") return;

    relojPropio = (video.duration + 0.4) < actual.fin;
    video.loop  = relojPropio;

    /* El aviso va a la consola del navegador (F12), no a la página: es para
       quien esté trabajando en la landing, no para el visitante. Se da una
       sola vez por video, para no llenar la consola de repeticiones. */
    if (yaAvisado !== actual.archivo) {
      yaAvisado = actual.archivo;
      if (relojPropio) {
        console.warn("[i-Witown] " + actual.archivo + ": el guion dura ~" +
          Math.round(actual.fin) + " s y el video dura " + Math.round(video.duration) + " s.");
      } else if (actual.pendiente) {
        console.warn("[i-Witown] " + actual.archivo +
          ": los subtítulos son texto de relleno. Falta pegar lo que dice la presentadora.");
      }
    }

    if (relojPropio) arrancarTicker();
    actualizar();
  }

  video.addEventListener("loadedmetadata", decidirModo);
  video.addEventListener("durationchange", decidirModo);
  video.addEventListener("timeupdate", function () { if (!relojPropio) actualizar(); });
  video.addEventListener("ended", function () { if (!relojPropio) siguientePaso(); });

  /* ============================================================
     PASO DE FRASE
     ============================================================ */

  function arrancarFrase() {
    mostrarSolo("frase");

    var arriba = document.getElementById("fraseArriba");
    var grande = document.getElementById("fraseGrande");
    if (arriba) {
      arriba.textContent = actual.arriba || "";
      arriba.hidden = !actual.arriba;
    }
    if (grande) grande.textContent = actual.grande || "";

    decirFrase();
    temporizadorFrase = window.setTimeout(siguientePaso, (actual.segundos || 4) * 1000);
  }

  /* ---- La voz que dice la frase ----
     Solo habla si el visitante tiene el sonido activado. Si pidió
     silencio, no se le habla: sería molesto y además los navegadores
     lo bloquearían. */

  function decirFrase() {
    if (video.muted) return;

    /* Se dice con el mismo ayudante que usan los dos recorridos: él
       sabe poner la grabación si la hay, y si no, decirlo con la voz
       del computador. Así los cuidados contra los cortes de voz están
       en un solo sitio y no hay que acordarse de repetirlos aquí. */
    if (typeof window.presDecir === "function") {
      window.presDecir(actual.vozTexto || actual.grande, actual.voz,
                       null, actual.vozArchivo);
    }
  }

  /* ---- Buscar una voz de hombre o de mujer en español ----

     Los navegadores no dicen si una voz es masculina o femenina: solo
     dan el nombre. Toca reconocerlas por ahí. La lista cubre las que
     traen Windows, Mac, Android y los iPhone; si aparece una que no
     esté, se agrega al listado que corresponda.

     En Windows, por ejemplo, las de español son Helena, Laura y
     Pablo: las dos primeras de mujer, la última de hombre. */

  var VOCES_HOMBRE = ["pablo", "raul", "raúl", "alvaro", "álvaro", "jorge",
                      "diego", "juan", "carlos", "miguel", "enrique", "gonzalo",
                      "arnau", "dario", "darío", "lorenzo", "liam", "male"];

  var VOCES_MUJER  = ["helena", "laura", "sabina", "elvira", "dalia", "monica",
                      "mónica", "paulina", "marisol", "esperanza", "lucia",
                      "lucía", "camila", "female"];

  /* ============================================================
     LA VOZ, PRESTADA

     El recorrido narrado (js/recorrido.js) también habla, y debe
     sonar igual que la frase: misma voz, mismo idioma, y callarse
     cuando el visitante pide silencio. En vez de repetir todo eso
     allá, se le presta desde aquí.
     ============================================================ */

  /* ┌──────────────────────────────────────────────────────┐
     │  TRES CUIDADOS QUE PARECEN RAROS Y NO SOBRAN.        │
     │                                                      │
     │  El sintetizador de voz de los navegadores tiene tres │
     │  fallas viejas y conocidas. Si se quita cualquiera de │
     │  estas tres cosas, la voz se corta a media frase.     │
     └──────────────────────────────────────────────────────┘ */

  /* 1. LA FRASE HAY QUE GUARDARLA EN ALGÚN LADO.
        Si la frase que se está diciendo solo vive dentro de la
        función, el navegador la da por basura y la recoge mientras
        todavía está sonando: la voz se corta en seco. Guardándola
        aquí afuera, no la recoge hasta que se acabe. */
  var ultimaDicha = null;

  /* 2. HAY QUE DESPERTARLO CADA TANTO.
        Pasados unos 15 segundos hablando, el sintetizador se duerme
        solo. Este latido lo despierta mientras haya algo sonando. */
  var latido = null;

  /* La grabación que esté sonando. Se guarda por lo mismo que la
     frase: para que el navegador no la recoja a media reproducción. */
  var ultimoAudio = null;

  function pararLatido() {
    if (latido) { window.clearInterval(latido); latido = null; }
  }

  function pararAudio() {
    if (!ultimoAudio) return;
    try { ultimoAudio.pause(); } catch (e) {}
    ultimoAudio = null;
  }

  /* ┌──────────────────────────────────────────────────────┐
     │  CÓMO SE DECIDE CON QUÉ SUENA CADA FRASE.            │
     │                                                      │
     │  1. Si el paso trae un archivo grabado, suena ese.    │
     │  2. Si el archivo no está o no se puede reproducir,   │
     │     lo dice la voz del computador.                    │
     │  3. Si el visitante silenció el video, no suena nada. │
     │                                                      │
     │  O sea: se pueden ir poniendo las grabaciones de a    │
     │  una. Las que falten siguen saliendo con la voz       │
     │  sintética, sin que nada se rompa.                    │
     └──────────────────────────────────────────────────────┘ */

  window.presDecir = function (frase, quien, alTerminar, archivo) {
    /* Devuelve true solo si se va a hablar Y va a avisar cuando
       termine. Si devuelve false, quien llamó se encarga de medir el
       tiempo por su cuenta.

       Ojo con no llamar a "alTerminar" aquí: el recorrido narrado
       pone su propio temporizador cuando esto devuelve false, y si
       además se le avisara, quedarían dos contando a la vez y los
       pasos se atropellarían. */
    if (video.muted) return false;

    /* ---- 1. La grabación, si la hay ---- */
    if (archivo) {
      pararLatido();
      pararAudio();
      try {
        var son = new Audio(archivo);
        ultimoAudio = son;

        var yaCerro = false;
        var cerrar = function () {
          if (yaCerro) return;
          yaCerro = true;
          if (alTerminar) alTerminar();
        };

        /* Si el archivo no está, no se queda callado: lo dice la voz
           del computador, y el recorrido sigue igual. */
        var alFallar = function () {
          if (yaCerro) return;
          yaCerro = true;
          window.presDecir(frase, quien, alTerminar);
        };

        son.onended = cerrar;
        son.onerror = alFallar;
        son.play().catch(alFallar);
        return true;
      } catch (e) {
        /* sigue de largo y lo dice la voz del computador */
      }
    }

    /* ---- 2. La voz del computador ---- */
    if (!("speechSynthesis" in window)) return false;

    var voz = window.speechSynthesis;

    try {
      voz.cancel();
      pararLatido();
      pararAudio();

      var dicha = new SpeechSynthesisUtterance(frase);
      dicha.lang = "es-CO";
      dicha.rate = 0.98;

      var escogida = escogerVoz(quien || "hombre");
      if (escogida) dicha.voice = escogida;
      else if (quien !== "mujer") dicha.pitch = 0.7;

      var yaAcabo = false;
      function acabo() {
        if (yaAcabo) return;
        yaAcabo = true;
        pararLatido();
        if (alTerminar) alTerminar();
      }
      dicha.onend = acabo;
      dicha.onerror = acabo;

      ultimaDicha = dicha;

      /* 3. ENTRE CANCELAR Y HABLAR TIENE QUE PASAR UN INSTANTE.
            Llamados uno detrás del otro se atropellan y el
            sintetizador se traga el principio de la frase, o la
            frase entera. Con esta pausa mínima no pasa. */
      window.setTimeout(function () {
        voz.speak(dicha);
        latido = window.setInterval(function () {
          if (!voz.speaking) { pararLatido(); return; }
          voz.resume();
        }, 7000);
      }, 80);

      return true;
    } catch (e) {
      pararLatido();
      return false;
    }
  };

  /* ============================================================
     EL FONDO MUSICAL

     Un colchón muy suave que suena debajo de la voz mientras
     corre un recorrido narrado. Lo prenden y lo apagan los
     recorridos; aquí solo vive el cómo.

     ┌──────────────────────────────────────────────────────┐
     │  PARA SUBIRLO O BAJARLO: el número de AMBIENTE_VOL.  │
     │  Va de 0 a 1. Con 0.22 se oye el fondo sin tapar la   │
     │  voz. Por encima de 0.35 empieza a estorbar.          │
     │                                                      │
     │  Para quitarlo del todo: AMBIENTE_VOL = 0.            │
     └──────────────────────────────────────────────────────┘

     La música está hecha con tonos graves, todos por debajo de
     270 Hz. La voz humana vive entre 300 y 3000 Hz, así que las
     dos cosas caben sin pisarse: por eso se entiende lo que se
     dice aunque suenen a la vez.
     ============================================================ */

  var AMBIENTE_ARCHIVO = "assets/audio/ambiente.mp3";
  var AMBIENTE_VOL = 0.22;

  var ambiente = null;

  window.presAmbienteArrancar = function () {
    if (!AMBIENTE_VOL || video.muted) return;
    if (ambiente) { ambiente.play().catch(function () {}); return; }

    try {
      ambiente = new Audio(AMBIENTE_ARCHIVO);
      ambiente.loop = true;
      ambiente.volume = 0;
      ambiente.play().catch(function () { ambiente = null; });
      subirDespacio();
    } catch (e) {
      ambiente = null;
    }
  };

  /* Entra y sale de a poquitos. Un fondo que aparece de golpe se
     nota más que el fondo mismo. */
  function subirDespacio() {
    var paso = window.setInterval(function () {
      if (!ambiente) { window.clearInterval(paso); return; }
      ambiente.volume = Math.min(AMBIENTE_VOL, ambiente.volume + 0.02);
      if (ambiente.volume >= AMBIENTE_VOL) window.clearInterval(paso);
    }, 120);
  }

  window.presAmbienteDetener = function () {
    if (!ambiente) return;
    var son = ambiente;
    ambiente = null;

    var paso = window.setInterval(function () {
      son.volume = Math.max(0, son.volume - 0.03);
      if (son.volume <= 0.001) {
        window.clearInterval(paso);
        try { son.pause(); } catch (e) {}
      }
    }, 90);
  };

  window.presCallar = function () {
    pararLatido();
    pararAudio();
    callarFrase();
  };

  /* ¿El visitante tiene el sonido activado? */
  window.presHaySonido = function () { return !video.muted; };

  function escogerVoz(quien) {
    if (!quien) return null;

    var voces = [];
    try { voces = window.speechSynthesis.getVoices() || []; } catch (e) { return null; }

    var lista = (quien === "hombre") ? VOCES_HOMBRE : VOCES_MUJER;
    var enEspanol = [];

    for (var i = 0; i < voces.length; i++) {
      if (/^es/i.test(voces[i].lang)) enEspanol.push(voces[i]);
    }

    for (var j = 0; j < enEspanol.length; j++) {
      var nombre = (enEspanol[j].name || "").toLowerCase();
      for (var k = 0; k < lista.length; k++) {
        if (nombre.indexOf(lista[k]) !== -1) return enEspanol[j];
      }
    }
    return null;
  }

  function callarFrase() {
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  if ("speechSynthesis" in window) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
  }

  /* ============================================================
     PASO DE LA APP
     ============================================================ */

  function arrancarApp() {
    seAcaboTodo = true;
    video.pause();
    mostrarSolo("app");

    /* Que la app se vea siempre desde el principio: la cuadrícula de
       modalidades, no lo último que el visitante hubiera abierto. */
    if (typeof window.simuladorAlInicio === "function") window.simuladorAlInicio();
  }

  /* ============================================================
     PAUSA Y DETENER

     "Detener" no congela el video: salta al final del recorrido,
     a las tarjetas. Un video congelado dejaría al visitante
     mirando una imagen quieta sin manera de seguir; así, quien ya
     vio suficiente pasa de una a escoger por dónde sigue.
     ============================================================ */

  function pintarPausa() {
    if (!btnPausa) return;
    var quieto = video.paused;
    btnPausa.classList.toggle("esta-pausado", quieto);
    btnPausa.setAttribute("aria-pressed", quieto ? "true" : "false");
    var txt = btnPausa.querySelector(".pres__mando-txt");
    if (txt) txt.textContent = quieto ? "Seguir" : "Pausa";
  }

  if (btnPausa) {
    btnPausa.addEventListener("click", function () {
      if (video.paused) video.play().catch(function () {});
      else video.pause();
      pintarPausa();
    });
  }

  if (btnStop) {
    btnStop.addEventListener("click", function () {
      video.pause();
      irAlPaso(PRES_SECUENCIA.length - 1);
    });
  }

  /* El video se puede pausar solo —si el visitante se va a otra
     pestaña, por ejemplo—, así que el botón se pinta escuchando al
     video, no solo cuando le hacen clic. */
  video.addEventListener("play",  pintarPausa);
  video.addEventListener("pause", pintarPausa);

  /* ============================================================
     PASO DE TARJETAS

     Es el final del recorrido automático: de aquí en adelante
     manda el visitante. Las tres tarjetas llevan a la rueda del
     ecosistema, a la app o a los datos de contacto, y desde
     cualquiera de esas pantallas se puede volver acá.
     ============================================================ */

  /* El remate: la pantalla con el botón "Recorre la app". Es lo que
     sale cuando se acaban los videos, en vez de saltar derecho a las
     tarjetas: el visitante decide cuándo entrar. */
  function arrancarRemate() {
    seAcaboTodo = true;
    video.pause();
    mostrarSolo("remate");
  }

  /* ---- Moverse entre las pantallas del final ---- */
  function irAPantalla(cual) {
    /* Llegar a cualquiera de estas pantallas quiere decir que la
       presentación ya terminó. Se apaga todo lo que quedara
       andando y además se da la secuencia por acabada: si no, el
       video escondido puede volver a arrancar solo y ponerse a
       sonar encima de lo que el visitante esté viendo. */
    callarTodo();
    seAcaboTodo = true;

    if (cual === "app") { arrancarApp(); return; }

    mostrarSolo(cual);

    /* El recorrido por las apps empieza siempre desde la primera */
    if (cual === "apps" && typeof window.ecosistemaAlInicio === "function") {
      window.ecosistemaAlInicio();
    }
  }

  /* js/ecosistema.js la usa para entrar a la app de un módulo */
  window.presIrAPantalla = irAPantalla;

  /* Un solo escucha para todos los botones que cambian de pantalla,
     vengan de donde vengan: las tarjetas, los "← Volver" o el
     botón de ver la presentación otra vez. */
  document.addEventListener("click", function (e) {
    var destino = e.target.closest ? e.target.closest("[data-lleva]") : null;
    if (destino) {
      irAPantalla(destino.getAttribute("data-lleva"));
      return;
    }
    var reinicia = e.target.closest ? e.target.closest("[data-reinicia]") : null;
    if (reinicia) irAlPaso(0);
  });

  /* ============================================================
     SONIDO
     ============================================================ */

  function pintarBotonSonido() {
    if (!btnSonido) return;
    btnSonido.classList.toggle("esta-sonando", !video.muted);
    btnSonido.querySelector(".pres__sonido-txt").textContent =
      video.muted ? "Activar sonido" : "Desactivar sonido";
    btnSonido.setAttribute("aria-pressed", video.muted ? "false" : "true");
  }

  var mandaElUsuario = false;   // si toca el botón, manda él

  if (btnSonido) {
    btnSonido.addEventListener("click", function () {
      mandaElUsuario = true;
      quitarEscuchaDeGestos();
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play();
      pintarBotonSonido();
    });
    pintarBotonSonido();
  }

  /* El video arranca solo pero SIN sonido: Chrome, Safari y Firefox
     bloquean cualquier video que suene sin que la persona haya tocado
     algo antes. Lo que sí se puede es activarlo en su primer clic. */
  function activarSonidoEnPrimerGesto(e) {
    if (mandaElUsuario) return;

    /* Si el celular de la portada está hablando, este video se queda
       callado: uno solo a la vez. El visitante lo prende con el botón
       de sonido cuando llegue hasta acá. */
    if (typeof window.portadaHablando === "function" && window.portadaHablando()) return;

    // Si el gesto fue sobre el botón de sonido, no nos metemos:
    // si no, quedarían peleando (uno activa y el otro apaga).
    if (e && e.target && btnSonido && btnSonido.contains(e.target)) {
      mandaElUsuario = true;
      quitarEscuchaDeGestos();
      return;
    }

    quitarEscuchaDeGestos();
    video.muted = false;
    video.play().catch(function () {
      video.muted = true;
      pintarBotonSonido();
    });
    pintarBotonSonido();
  }

  function ponerEscuchaDeGestos() {
    document.addEventListener("pointerdown", activarSonidoEnPrimerGesto);
    document.addEventListener("keydown", activarSonidoEnPrimerGesto);
    document.addEventListener("touchstart", activarSonidoEnPrimerGesto);
  }

  function quitarEscuchaDeGestos() {
    document.removeEventListener("pointerdown", activarSonidoEnPrimerGesto);
    document.removeEventListener("keydown", activarSonidoEnPrimerGesto);
    document.removeEventListener("touchstart", activarSonidoEnPrimerGesto);
  }

  /* ============================================================
     BOTÓN DE PLAY DE RESPALDO
     Algunos navegadores no dejan arrancar un video solo, ni en
     silencio. En ese caso aparece este botón encima del video.
     ============================================================ */

  function pintarPlay() {
    if (!capaPlay) return;
    capaPlay.hidden = !video.paused || seAcaboTodo;
  }
  video.addEventListener("play",  pintarPlay);
  video.addEventListener("pause", pintarPlay);
  video.addEventListener("ended", pintarPlay);

  if (capaPlay) {
    capaPlay.addEventListener("click", function () { video.play(); });
  }

  /* ============================================================
     PAUSAR CUANDO NADIE ESTÁ MIRANDO
     ============================================================ */

  var fueraDeVista = false;

  function deberiaReproducir() {
    var enPasoVideo = actual && actual.tipo === "video";
    return enPasoVideo && !seAcaboTodo && !fueraDeVista &&
           document.visibilityState === "visible";
  }

  function ajustarReproduccion() {
    if (deberiaReproducir()) video.play().catch(function () {});
    else video.pause();
  }

  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      if (document.hidden) return;   // lectura no confiable, se ignora
      fueraDeVista = !entradas[0].isIntersecting;
      ajustarReproduccion();
    }, { threshold: 0.35 });
    observador.observe(video);
  }

  /* No se pausa apenas la pestaña se marca como oculta: hay navegadores
     y ventanas incrustadas que la marcan así por instantes al repintar.
     Si se le hiciera caso de inmediato, el video quedaría arrancando y
     frenando todo el tiempo. */
  var esperaOculto = null;

  document.addEventListener("visibilitychange", function () {
    if (esperaOculto) { window.clearTimeout(esperaOculto); esperaOculto = null; }

    if (document.visibilityState === "visible") {
      ajustarReproduccion();
    } else {
      esperaOculto = window.setTimeout(function () {
        esperaOculto = null;
        if (document.visibilityState !== "visible") video.pause();
      }, 1200);
    }
  });

  /* ============================================================
     ARRANQUE
     ============================================================ */

  irAlPaso(0);
  ponerEscuchaDeGestos();
})();
