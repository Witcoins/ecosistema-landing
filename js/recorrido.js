/* ============================================================
   i'Witown — El recorrido narrado
   ============================================================

   Es lo que pasa al tocar "Ver el recorrido narrado", abajo del
   simulador. La página se maneja sola: abre modalidades, entra a
   las actividades y va contando lo que muestra, con subtítulo y
   con voz.

   ┌──────────────────────────────────────────────────────────┐
   │  EL GUION ESTÁ EN "RECORRIDO", AQUÍ ABAJO.               │
   │                                                          │
   │  Cada paso tiene dos cosas:                              │
   │    texto → lo que se lee y se dice                       │
   │    hacer → qué se abre en la pantalla mientras tanto     │
   │                                                          │
   │  Para cambiar lo que dice, se edita el texto y ya. Para  │
   │  cambiar el orden, se mueven los bloques.                │
   │                                                          │
   │  Además, cada paso puede traer "audio": la ruta de una   │
   │  grabación. Si está, suena esa en vez de la voz del      │
   │  computador. Si falta, se oye la voz sintética, así que  │
   │  las grabaciones se pueden ir poniendo de a una.         │
   │                                                          │
   │  Lo que puede ir en "hacer":                             │
   │    ["modalidades"]              la cuadrícula de las 16  │
   │    ["modalidad", "taller"]      abre esa modalidad       │
   │    ["estudiante", "afianzamiento"]  pantalla del alumno  │
   │    ["catalogo", "actividades-interactivas"]  las 20      │
   │    ["actividad", "actividades-interactivas",             │
   │                  "Sopa de Letras"]   abre esa actividad  │
   │    null                        no cambia la pantalla     │
   │                                                          │
   │  Los nombres de las modalidades y de las actividades     │
   │  están en js/simulador.js.                               │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var ACTIVIDADES = "actividades-interactivas";

var RECORRIDO = [

  /* ---------- Por qué importa ---------- */
  { hacer: ["modalidades"],
    audio: "assets/audio/recorrido/01.mp3",
    texto: "Cuando una docente puede escoger sus propias actividades, el criterio humano vuelve al centro." },

  { hacer: null,
    audio: "assets/audio/recorrido/02.mp3",
    texto: "Estas son las modalidades y los cientos de actividades con las que arma su clase o asigna tareas." },

  /* ---------- Afianzamiento y la A.C.P. ---------- */
  { hacer: ["modalidad", "afianzamiento"],
    audio: "assets/audio/recorrido/03.mp3",
    texto: "Afianzamiento trabaja con la Arquitectura Cognitiva Personalizada." },

  { hacer: ["estudiante", "afianzamiento"],
    audio: "assets/audio/recorrido/04.mp3",
    texto: "El contenido llega ajustado a la manera en que ese estudiante aprende. No a la de un estudiante promedio que no existe." },

  /* ---------- Las actividades interactivas ---------- */
  { hacer: ["catalogo", ACTIVIDADES],
    audio: "assets/audio/recorrido/05.mp3",
    texto: "En Actividades interactivas escoge entre cientos de actividades, y las asigna a voluntad, con el tema que ella elija." },

  { hacer: ["actividad", ACTIVIDADES, "Sopa de Letras"],
    audio: "assets/audio/recorrido/06.mp3",
    texto: "Una sopa de letras, con las palabras del tema que ella puso." },

  { hacer: ["actividad", ACTIVIDADES, "Crucigrama"],
    audio: "assets/audio/recorrido/07.mp3",
    texto: "Un crucigrama, armado con sus propias definiciones." },

  { hacer: ["actividad", ACTIVIDADES, "Wiwi Jumps"],
    audio: "assets/audio/recorrido/08.mp3",
    texto: "Wiwi Jumps, para que el niño practique jugando." },

  { hacer: ["actividad", ACTIVIDADES, "Relacionar Columnas"],
    audio: "assets/audio/recorrido/09.mp3",
    texto: "Relacionar columnas, cuando lo que importa es conectar ideas." },

  { hacer: ["catalogo", ACTIVIDADES],
    audio: "assets/audio/recorrido/10.mp3",
    texto: "Y así, cientos de actividades distintas para el mismo contenido. Ella decide cuál le sirve a cada grupo." },

  /* ---------- El resto del ecosistema ---------- */
  { hacer: ["modalidades"],
    audio: "assets/audio/recorrido/11.mp3",
    texto: "Pero enseñar no es solo poner actividades." },

  { hacer: ["modalidad", "experimento"],
    audio: "assets/audio/recorrido/12.mp3",
    texto: "Está el experimento, para que comprueben con las manos." },

  { hacer: ["modalidad", "investigacion"],
    audio: "assets/audio/recorrido/13.mp3",
    texto: "La investigación, para que aprendan a buscar y a dudar." },

  { hacer: ["modalidad", "reflexion"],
    audio: "assets/audio/recorrido/14.mp3",
    texto: "Y la reflexión, que es donde el niño se mira por dentro." },

  /* ---------- El cierre ---------- */
  { hacer: ["modalidades"],
    audio: "assets/audio/recorrido/15.mp3",
    texto: "Ninguna editorial conoce a tus estudiantes.",
    segundos: 3.4 },

  { hacer: null,
    audio: "assets/audio/recorrido/16.mp3",
    texto: "Su profesora sí. i'Witown solo le devuelve la decisión.",
    segundos: 5 }
];

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {
  var barra = document.getElementById("narraBarra");
  var linea = document.getElementById("narraTxt");
  if (!barra || !linea) return;

  var paso = 0;
  var corriendo = false;
  var temporizador = null;

  /* Cuánto dura un paso. Si no se dijo nada, se calcula por el
     largo del texto, a ritmo de lectura tranquila: ni tan rápido
     que no dé tiempo de leer, ni tan lento que aburra. */
  function cuantoDura(p) {
    if (p.segundos) return p.segundos * 1000;
    return Math.max(2800, Math.min(9000, p.texto.length * 68));
  }

  function hacer(orden) {
    if (!orden || !window.simuladorGuia) return;
    var guia = window.simuladorGuia;
    var que = orden[0];
    if (typeof guia[que] === "function") {
      guia[que](orden[1], orden[2]);
    }
  }

  function pintar(p) {
    linea.textContent = p.texto;
    barra.hidden = false;
  }

  function siguiente() {
    if (!corriendo) return;

    if (paso >= RECORRIDO.length) {
      detener(true);
      return;
    }

    var p = RECORRIDO[paso];
    paso++;

    hacer(p.hacer);
    pintar(p);

    /* El paso dura lo que dure la voz, o el tiempo calculado si es
       más largo: así el subtítulo nunca desaparece antes de que se
       termine de leer, ni se queda pegado después de que la voz
       siguió. Con el sonido apagado manda el tiempo calculado. */
    var minimo = cuantoDura(p);
    var arranco = Date.now();
    var yaSiguio = false;

    function seguir() {
      if (yaSiguio) return;
      yaSiguio = true;
      var falta = Math.max(0, minimo - (Date.now() - arranco));
      temporizador = window.setTimeout(siguiente, falta + 350);
    }

    var hablo = false;
    if (typeof window.presDecir === "function") {
      hablo = window.presDecir(p.texto, "hombre", seguir, p.audio);
    }
    if (!hablo) {
      temporizador = window.setTimeout(siguiente, minimo);
    }
  }

  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    paso = 0;
    if (typeof window.presAmbienteArrancar === "function") window.presAmbienteArrancar();
    siguiente();
  }

  /* "avisar" solo va en true cuando el recorrido se acaba solo: ahí
     hay que decirle al simulador que reponga su botón. Cuando es el
     simulador el que manda parar, avisarle sería devolverle la
     pelota a quien la tiró. */
  function detener(avisar) {
    var estaba = corriendo;
    corriendo = false;
    if (temporizador) { window.clearTimeout(temporizador); temporizador = null; }
    if (typeof window.presAmbienteDetener === "function") window.presAmbienteDetener();
    if (typeof window.presCallar === "function") window.presCallar();
    barra.hidden = true;

    if (estaba && avisar && typeof window.simuladorPararRecorrido === "function") {
      window.simuladorPararRecorrido();
    }
  }

  /* El simulador lo arranca y lo para desde su botón */
  window.recorridoNarrado = {
    arrancar: arrancar,
    detener: function () { detener(false); }
  };
})();
