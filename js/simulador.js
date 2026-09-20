/* ============================================================
   i'Witown — Simulador del recorrido
   VISTA 1: "Modalidad" — el docente escoge CÓMO enseñar el tema
   ============================================================

   Qué demuestra esta vista:
   Una plataforma de editorial entrega el tema YA resuelto, con una
   sola actividad. Aquí el docente escoge entre todas las modalidades
   para el mismo tema, y cada una le entrega sus propios recursos.

   ┌──────────────────────────────────────────────────────────┐
   │  TODO EL CONTENIDO DE PRUEBA ESTÁ EN ESTE ARCHIVO.       │
   │  Para cambiar textos, tema o recursos, se edita aquí.    │
   │  No hay que tocar el HTML.                               │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

/* ---- En qué paso del recorrido va esta vista ---- */
var SIM_PASO = { actual: 1, total: 4 };

/* ---- El tema de ejemplo que se está preparando ---- */
var SIM_TEMA = {
  asignatura: "Matemáticas",
  grado: "4.º de primaria",
  tema: "Fracciones equivalentes",
  periodo: "Periodo 2"
};

/* ---- La docente que aparece en la barra superior ---- */
var SIM_DOCENTE = {
  nombre: "Diana Carolina Bustamante Miranda",
  colegio: "Colegio Santa María"
};

/* ---- El estudiante que aparece en la vista de Wiwi Quest ---- */
var SIM_ESTUDIANTE = {
  nombre: "Nicolas Alberto Páez López",
  grado: "Primero",
  colegio: "Colegio Santa María",
  saldo: "$46.442"
};

/* ============================================================
   LAS 16 MODALIDADES
   Cada una con sus recursos de prueba (datos dummy).
   Para agregar una modalidad nueva, se copia un bloque completo.

   Una modalidad puede además traer un campo "wiwiQuest".
   Cuando lo trae, al hacerle clic el simulador NO muestra la lista
   de recursos: abre la pantalla del estudiante (Wiwi Quest).
   Hoy solo Afianzamiento la tiene. Para dársela a otra modalidad,
   se copia ese bloque completo y se cambian los textos.
   ============================================================ */

var MODALIDADES = [
  {
    id: "afianzamiento",
    nombre: "Afianzamiento",
    icono: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    recursos: [
      "Ronda de repaso con 12 ejercicios graduados",
      "Tarjetas de refuerzo según el nivel de dominio de cada niño",
      "Reto de 5 minutos para cerrar la clase"
    ],

    /* ---- Pantalla del estudiante para esta modalidad ---- */
    wiwiQuest: {
      modo: "Refuerzo - Ganar examen",
      tema: "Fraccionarios",
      subtema: "Fracciones equivalentes",
      principio: "Rigor Conceptual",
      pregunta: "Dos fracciones equivalentes son aquellas que:",
      puntos: "$200",
      totalPreguntas: 6,
      segundosTotales: 126,
      segundosRestantes: 114,
      opciones: [
        { letra: "a", texto: "Representan la misma cantidad aunque se escriban distinto.", correcta: true },
        { letra: "b", texto: "Tienen siempre el mismo numerador.", correcta: false },
        { letra: "c", texto: "Se suman entre sí para dar un número entero.", correcta: false },
        { letra: "d", texto: "Solo se pueden escribir de una única forma.", correcta: false }
      ],

      /* Lo que sale en el modal al final del recorrido automático.
         "erradaDemo" es la letra que el recorrido escoge primero, a
         propósito, para mostrar cómo se ve una respuesta equivocada. */
      retroalimentacion: {
        erradaDemo: "b",
        titulo: "¡Eso es!",
        tituloFallo: "Casi. Mira por qué:",
        texto: "1/2 y 2/4 se escriben distinto, pero tapan el mismo pedazo del entero. Eso, y no otra cosa, es lo que hace equivalentes a dos fracciones.",
        porQue: "Pensar que deben tener el mismo numerador se cae con un solo ejemplo: 1/2 y 2/4 tienen numeradores distintos y aun así valen lo mismo.",
        puntos: "+200"
      }
    }
  },
  {
    id: "actividades-interactivas",
    nombre: "Actividades interactivas",
    icono: '<path d="M9 9l3 11 2-6 6-2-11-3z"/><path d="M4 4l1.6 1.6"/><path d="M2.5 8.2H4.6"/><path d="M8.2 2.5V4.6"/>',

    /* ============================================================
       Esta modalidad no muestra una lista de recursos: abre el
       catálogo de actividades, igual que en la plataforma real.

       Para agregar, quitar o renombrar una actividad se edita esta
       lista. "color" puede ser: verde, azul, morado, naranja o rojo
       (los colores están en css/simulador.css, bloque ACTIVIDADES).
       ============================================================ */
    actividades: [
      { nombre: "Sopa de Letras",       color: "verde",   descripcion: "Encuentra las palabras escondidas en la cuadrícula.",
        icono: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>' },
      { nombre: "Crucigrama",           color: "verde",   descripcion: "Completa la retícula usando las definiciones.",
        icono: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
      { nombre: "Wiwi Jumps",           color: "verde",   descripcion: "Wiwi cruza la ciudad saltando a la respuesta correcta.",
        icono: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="3.6" r="1.4"/><path d="M9 13h.01M15 13h.01"/>' },
      { nombre: "Relacionar Columnas",  color: "azul",    descripcion: "Une cada elemento de la izquierda con su pareja.",
        icono: '<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>' },
      { nombre: "Test",                 color: "morado",  descripcion: "Preguntas de selección con una o varias respuestas.",
        icono: '<path d="M9.5 6H20M9.5 12H20M9.5 18H20"/><path d="M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>' },
      { nombre: "Completar Frases",     color: "verde",   descripcion: "Rellena los espacios en blanco del texto.",
        icono: '<path d="M4 7h16M4 12h7M15 12h5M4 17h16"/>' },

      { nombre: "Ruleta de Palabras",   color: "naranja", descripcion: "Adivina la palabra que empieza por cada letra.",
        icono: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>' },
      { nombre: "Mapa Interactivo",     color: "azul",    descripcion: "Ubica cada nombre en el punto correcto de la imagen.",
        icono: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>' },
      { nombre: "Memory",               color: "morado",  descripcion: "Destapa las cartas y encuentra las parejas.",
        icono: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/>' },
      { nombre: "Relacionar Grupos",    color: "verde",   descripcion: "Clasifica cada elemento en su categoría.",
        icono: '<circle cx="12" cy="6" r="3"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/>' },
      { nombre: "Sí o No",              color: "rojo",    descripcion: "Decide si cada afirmación es verdadera o falsa.",
        icono: '<path d="M2 13l4 4L13 7"/><path d="M11 13l4 4L22 7"/>' },
      { nombre: "Ordenar Letras",       color: "verde",   descripcion: "Lee la definición y arma la palabra con las letras sueltas.",
        icono: '<path d="M3 19l5-13 5 13M5 15h6"/><path d="M21 19v-5a3 3 0 0 0-6 0v5M15 16h6"/>' },

      { nombre: "Video Quiz",           color: "azul",    descripcion: "El video se pausa y aparece una pregunta.",
        icono: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3z"/>' },
      { nombre: "Ordenar Palabras",     color: "verde",   descripcion: "Arma la frase colocando las palabras en orden.",
        icono: '<path d="M7 4v16M4 17l3 3 3-3"/><path d="M17 20V4M14 7l3-3 3 3"/>' },
      { nombre: "Adivinanza",           color: "naranja", descripcion: "Descubre la palabra letra por letra.",
        icono: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>' },
      { nombre: "Presentación",         color: "azul",    descripcion: "Recorre el contenido lámina por lámina.",
        icono: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>' },
      { nombre: "Step",                 color: "naranja", descripcion: "Coloca los elementos en la fila que les corresponde.",
        icono: '<rect x="3" y="5" width="18" height="4" rx="1"/><rect x="3" y="11" width="18" height="4" rx="1"/><rect x="3" y="17" width="12" height="4" rx="1"/>' },
      { nombre: "Dictado",              color: "morado",  descripcion: "Escucha la frase y escríbela correctamente.",
        icono: '<path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>' },

      { nombre: "Mensajería",           color: "azul",    descripcion: "Escucha una conversación y responde sobre lo que dijeron.",
        icono: '<path d="M16 11a5 5 0 0 1-5 5H7l-4 3v-8a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5z"/><path d="M13 6h3a5 5 0 0 1 5 5v7"/>' },
      { nombre: "AsterQuiz",            color: "rojo",    descripcion: "Contrarreloj: acierta antes de que se acabe el tiempo.",
        icono: '<path d="M12 2s4.5 2.2 4.5 9c0 3.6-1.8 5.6-1.8 5.6H9.3S7.5 14.6 7.5 11c0-6.8 4.5-9 4.5-9z"/><path d="M9.3 16.6L7 21l3-1.2M14.7 16.6L17 21l-3-1.2"/><circle cx="12" cy="9.2" r="1.5"/>' }
    ]
  },
  {
    id: "argumentacion",
    nombre: "Argumentación",
    icono: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    recursos: [
      "Debate dirigido: ¿1/2 y 2/4 son el mismo número?",
      "Guía para que el niño sustente su respuesta con dibujos",
      "Rúbrica de argumentación lista para el docente"
    ]
  },
  {
    id: "colaboracion",
    nombre: "Colaboración",
    icono: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    recursos: [
      "Reto en parejas: construir la misma fracción de tres formas",
      "Mesa de trabajo de cuatro con roles asignados",
      "Tablero compartido para comparar respuestas del grupo"
    ]
  },
  {
    id: "consulta",
    nombre: "Consulta",
    icono: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    recursos: [
      "Mini-glosario ilustrado de fracciones",
      "Ficha de consulta: dónde aparecen las fracciones en la casa",
      "Lista de fuentes verificadas para el grado"
    ]
  },
  {
    id: "ejercicio",
    nombre: "Ejercicio",
    icono: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    recursos: [
      "Set de 20 ejercicios con dificultad progresiva",
      "Ejercicios de completar la fracción equivalente",
      "Autoevaluación de 8 preguntas con resultado inmediato"
    ]
  },
  {
    id: "experimento",
    nombre: "Experimento",
    icono: '<path d="M9 2v6L4.5 17A2 2 0 0 0 6.3 20h11.4a2 2 0 0 0 1.8-3L15 8V2"/><path d="M8 2h8"/><path d="M7.5 14h9"/>',
    recursos: [
      "Repartir una pizza de papel con distintos cortes",
      "Medir con vasos: 2/4 de agua frente a 1/2",
      "Formato de registro de observaciones del experimento"
    ]
  },
  {
    id: "investigacion",
    nombre: "Investigación",
    icono: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
    recursos: [
      "Pregunta guía: ¿dónde usan fracciones en la cocina de tu casa?",
      "Entrevista a un adulto sobre medidas y repartos",
      "Formato para presentar los hallazgos al salón"
    ]
  },
  {
    id: "juego",
    nombre: "Juego",
    icono: '<path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-.6 5.81A2.5 2.5 0 0 0 6.6 16.3l1.7-2.3h7.4l1.7 2.3a2.5 2.5 0 0 0 4.5-1.9l-.6-5.81A4 4 0 0 0 17.32 5z"/><path d="M6 10h4"/><path d="M8 8v4"/><path d="M16.5 9.5h.01"/><path d="M15 11.5h.01"/>',
    recursos: [
      "Dominó de fracciones equivalentes",
      "Carrera de parejas equivalentes por equipos",
      "Bingo de fracciones para todo el salón"
    ]
  },
  {
    id: "lectura",
    nombre: "Lectura",
    icono: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    recursos: [
      "Cuento corto: el reparto de la herencia",
      "Lectura guiada con preguntas al margen",
      "Texto informativo adaptado al grado"
    ]
  },
  {
    id: "observacion",
    nombre: "Observación",
    icono: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    recursos: [
      "Galería de imágenes: la misma parte, distinto corte",
      "Video de tres minutos con pausas guiadas",
      "Bitácora de lo observado"
    ]
  },
  {
    id: "presentacion",
    nombre: "Presentación",
    icono: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    recursos: [
      "Plantilla de exposición de cinco láminas",
      "Guion para explicarle el tema a un compañero",
      "Lista de chequeo antes de exponer"
    ]
  },
  {
    id: "practica",
    nombre: "Práctica",
    icono: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>',
    recursos: [
      "Estación de trabajo con material concreto",
      "Práctica dirigida paso a paso",
      "Práctica libre con verificación automática"
    ]
  },
  {
    id: "reflexion",
    nombre: "Reflexión",
    icono: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    recursos: [
      "Pregunta de cierre: ¿qué entendiste hoy que ayer no?",
      "Diario de aprendizaje de tres líneas",
      "Semáforo de comprensión para levantar la mano"
    ]
  },
  {
    id: "taller",
    nombre: "Taller",
    icono: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    recursos: [
      "Taller: construir un fraccionario con cartulina",
      "Instrucciones paso a paso para el docente",
      "Lista de materiales del taller"
    ]
  },
  {
    id: "trabajo",
    nombre: "Trabajo",
    icono: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    recursos: [
      "Trabajo en casa con acompañamiento del padre",
      "Proyecto corto de tres sesiones",
      "Formato de entrega con criterios de evaluación"
    ]
  }
];

/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA DEL SIMULADOR
   ============================================================ */

(function () {
  var grid = document.getElementById("simGrid");
  if (!grid) return;

  var zonaResultado = document.getElementById("simResultado");
  var panelModalidades = document.querySelector(".vt__panel");
  var contador      = document.getElementById("simContador");
  var barraProgreso = document.getElementById("simBarra");
  var btnAuto       = document.getElementById("simAuto");
  var btnContinuar  = document.getElementById("simContinuar");

  /* Elementos de la vista del estudiante */
  var wiwi         = document.getElementById("simWiwi");
  var ventanaDoc   = document.getElementById("simVentanaDocente");
  var pieSim       = document.querySelector(".sim__pie");
  var zonaOpciones = document.getElementById("wqOpciones");
  var btnVolver    = document.getElementById("wqVolver");
  var modal        = document.getElementById("wqModal");
  var modalCerrar  = document.getElementById("wqModalCerrar");
  var cajaPregunta = document.querySelector(".wq__pregunta");
  var wiwiActual   = null;
  var relojTimer   = null;
  var demoTimers   = [];

  var exploradas = {};
  var totalExploradas = 0;
  var autoCorriendo = false;
  var autoTimer = null;

  /* ---- Pintar los datos del tema y de la docente ---- */
  function texto(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor;
  }
  texto("simDocente", SIM_DOCENTE.nombre);
  texto("simColegio", SIM_DOCENTE.colegio);
  texto("simTema", SIM_TEMA.tema);
  texto("simMeta", SIM_TEMA.asignatura + " · " + SIM_TEMA.grado + " · " + SIM_TEMA.periodo);
  texto("simPaso", "Paso " + SIM_PASO.actual + " de " + SIM_PASO.total);
  texto("simTotalModalidades", String(MODALIDADES.length));

  /* ---- Construir la cuadrícula de modalidades ---- */
  function icono(svgInterno, clase) {
    return '<svg class="' + clase + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           svgInterno + '</svg>';
  }

  for (var i = 0; i < MODALIDADES.length; i++) {
    var m = MODALIDADES[i];
    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "vt-mod";
    boton.setAttribute("data-id", m.id);
    boton.setAttribute("aria-pressed", "false");
    boton.innerHTML = icono(m.icono, "vt-mod__ico") +
                      '<span class="vt-mod__texto">' + m.nombre + "</span>";
    grid.appendChild(boton);
  }

  /* ---- Qué pasa al escoger una modalidad ---- */
  function escoger(id, porAuto) {
    var modalidad = null;
    for (var k = 0; k < MODALIDADES.length; k++) {
      if (MODALIDADES[k].id === id) { modalidad = MODALIDADES[k]; break; }
    }
    if (!modalidad) return;

    // Marcar visualmente la seleccionada
    var botones = grid.querySelectorAll(".vt-mod");
    for (var j = 0; j < botones.length; j++) {
      var esta = botones[j].getAttribute("data-id") === id;
      botones[j].classList.toggle("is-activa", esta);
      botones[j].setAttribute("aria-pressed", esta ? "true" : "false");
      if (esta) botones[j].classList.add("is-vista");
    }

    // Llevar la cuenta de cuántas se han explorado
    if (!exploradas[id]) {
      exploradas[id] = true;
      totalExploradas++;
      actualizarContador();
    }

    // Si la modalidad tiene pantalla de estudiante, se abre esa en vez
    // de la lista de recursos. El recorrido automático nunca la abre:
    // sería muy brusco estando pasando de una en una.
    if (modalidad.wiwiQuest && !porAuto) {
      detenerAuto();
      if (panelModalidades) panelModalidades.hidden = false;
      if (zonaResultado) zonaResultado.hidden = true;
      if (btnContinuar) btnContinuar.disabled = false;
      abrirWiwi(modalidad);
      return;
    }

    // Si la modalidad trae catálogo de actividades, se muestra ese
    if (modalidad.actividades) {
      mostrarActividades(modalidad);
      if (btnContinuar) btnContinuar.disabled = false;
      return;
    }

    // Dibujar el resultado
    var lista = "";
    for (var r = 0; r < modalidad.recursos.length; r++) {
      lista += "<li>" + modalidad.recursos[r] + "</li>";
    }

    zonaResultado.innerHTML =
      '<div class="res">' +
        '<div class="res__head">' +
          '<span class="res__ico">' + icono(modalidad.icono, "") + "</span>" +
          "<div>" +
            '<p class="res__eyebrow">La docente escogió</p>' +
            "<h3>" + modalidad.nombre + "</h3>" +
          "</div>" +
          '<span class="res__conteo">' + modalidad.recursos.length + " recursos listos</span>" +
        "</div>" +
        '<p class="res__intro">Para el mismo tema — <strong>' + SIM_TEMA.tema +
          "</strong> — i'Witown le entrega estos recursos:</p>" +
        '<ul class="res__lista">' + lista + "</ul>" +
        '<button type="button" class="res__volver" id="resVolver">← Volver a las modalidades</button>' +
        '<p class="res__remate">Una plataforma de editorial le habría entregado ' +
          "<strong>una sola actividad</strong>, ya decidida. Aquí la docente acaba de " +
          "escoger entre <strong>todas estas maneras</strong> de enseñar lo mismo.</p>" +
      "</div>";

    zonaResultado.hidden = false;

    /* La lista reemplaza a la cuadrícula en vez de ponerse debajo.
       Así la ventana no crece y todo sigue cabiendo en el marco. */
    if (panelModalidades) panelModalidades.hidden = true;

    var volver = document.getElementById("resVolver");
    if (volver) {
      volver.addEventListener("click", function () {
        detenerAuto();
        if (panelModalidades) panelModalidades.hidden = false;
        zonaResultado.hidden = true;
      });
    }

    if (btnContinuar) btnContinuar.disabled = false;

    // Si el usuario hizo clic, se detiene el recorrido automático
    if (!porAuto) detenerAuto();
  }


  /* ============================================================
     CATÁLOGO DE ACTIVIDADES INTERACTIVAS

     Reemplaza a la cuadrícula de modalidades, igual que la lista de
     recursos, para que todo siga cabiendo dentro del marco.
     ============================================================ */

  function mostrarActividades(modalidad) {
    var tarjetas = "";
    for (var i = 0; i < modalidad.actividades.length; i++) {
      var a = modalidad.actividades[i];
      tarjetas +=
        '<div class="act" data-color="' + (a.color || "azul") +
             '" data-i="' + i + '" role="button" tabindex="0"' +
             ' title="' + a.descripcion + '">' +
          '<span class="act__ico">' + icono(a.icono, "") + "</span>" +
          '<p class="act__nombre">' + a.nombre + "</p>" +
          '<p class="act__desc">' + a.descripcion + "</p>" +
        "</div>";
    }

    zonaResultado.innerHTML =
      '<div class="acts">' +
        '<div class="acts__head">' +
          '<button type="button" class="res__volver" id="resVolver">← Volver a las modalidades</button>' +
          '<p class="acts__titulo">' + modalidad.actividades.length +
            " actividades para <strong>" + SIM_TEMA.tema + "</strong>, y la docente escoge</p>" +
        "</div>" +
        '<div class="acts__grid">' + tarjetas + "</div>" +
      "</div>";

    zonaResultado.hidden = false;
    if (panelModalidades) panelModalidades.hidden = true;

    var volver = document.getElementById("resVolver");
    if (volver) {
      volver.addEventListener("click", function () {
        detenerAuto();
        if (panelModalidades) panelModalidades.hidden = false;
        zonaResultado.hidden = true;
      });
    }

    /* Tocar una actividad abre su pantalla, con el marco de la
       plataforma. El contenido lo arma js/actividades.js */
    var rejilla = zonaResultado.querySelector(".acts__grid");
    if (rejilla && typeof window.actividadHTML === "function") {
      rejilla.addEventListener("click", function (e) {
        var tarjeta = e.target.closest ? e.target.closest(".act") : null;
        if (!tarjeta) return;
        abrirActividad(modalidad, +tarjeta.getAttribute("data-i"));
      });
      rejilla.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var tarjeta = e.target.closest ? e.target.closest(".act") : null;
        if (!tarjeta) return;
        e.preventDefault();
        abrirActividad(modalidad, +tarjeta.getAttribute("data-i"));
      });
    }
  }

  /* ---- La pantalla de una actividad ---- */
  function abrirActividad(modalidad, i) {
    var act = modalidad.actividades[i];
    if (!act) return;

    zonaResultado.innerHTML = window.actividadHTML(act, SIM_TEMA.tema);
    zonaResultado.hidden = false;
    if (panelModalidades) panelModalidades.hidden = true;

    var volver = document.getElementById("axVolver");
    if (volver) {
      volver.addEventListener("click", function () {
        mostrarActividades(modalidad);   // regresa al catálogo
      });
    }
  }

  function actualizarContador() {
    if (contador) {
      /* Se cuenta lo que el visitante lleva visto, sin decir de
         cuántas: el número total no es lo que se quiere contar. */
      contador.innerHTML = "Has visto <strong>" + totalExploradas + "</strong> modalidad" +
                           (totalExploradas === 1 ? "" : "es");
    }
    if (barraProgreso) {
      barraProgreso.style.width = (totalExploradas / MODALIDADES.length * 100) + "%";
    }
  }
  actualizarContador();

  /* ---- Clic en una modalidad ---- */
  grid.addEventListener("click", function (e) {
    var boton = e.target.closest ? e.target.closest(".vt-mod") : null;
    if (!boton) return;
    escoger(boton.getAttribute("data-id"), false);
  });

  /* ============================================================
     EL RECORRIDO NARRADO

     El guion y los tiempos están en js/recorrido.js. Aquí solo
     queda el botón que lo arranca y lo para, y la puerta por la
     que ese archivo maneja esta pantalla (window.simuladorGuia,
     más abajo).

     "detenerAuto" es el único punto donde se para. Se llama desde
     todos los clics del visitante, así que en cuanto él toca algo
     el recorrido se quita de en medio y lo deja explorar. */

  function iniciarAuto() {
    if (!window.recorridoNarrado) return;
    autoCorriendo = true;
    if (btnAuto) btnAuto.textContent = "Detener el recorrido";
    window.recorridoNarrado.arrancar();
  }

  function detenerAuto() {
    if (!autoCorriendo) return;
    autoCorriendo = false;
    window.clearTimeout(autoTimer);
    if (btnAuto) btnAuto.textContent = "Ver el recorrido narrado";
    if (window.recorridoNarrado) window.recorridoNarrado.detener();
  }

  if (btnAuto) {
    btnAuto.addEventListener("click", function () {
      if (autoCorriendo) detenerAuto();
      else iniciarAuto();
    });
  }

  // Si la persona prefiere menos movimiento, no arrancamos nada solo.
  // El recorrido automático siempre queda a un clic de distancia.

  /* ============================================================
     VISTA DEL ESTUDIANTE — WIWI QUEST
     ============================================================ */

  function abrirWiwi(modalidad) {
    var q = modalidad.wiwiQuest;
    if (!wiwi || !q) return;
    wiwiActual = q;

    // Llenar todos los textos de la pantalla
    texto("wqModalidad", modalidad.nombre);
    texto("wqModo",      q.modo);
    texto("wqTema",      q.tema);
    texto("wqSubtema",   q.subtema);
    texto("wqPrincipio", q.principio);
    texto("wqTexto",     q.pregunta);
    texto("wqPuntos",    q.puntos);
    texto("wqNombre",    SIM_ESTUDIANTE.nombre);
    texto("wqGrado",     SIM_ESTUDIANTE.grado);
    texto("wqColegio",   SIM_ESTUDIANTE.colegio);
    texto("wqSaldo",     SIM_ESTUDIANTE.saldo);
    texto("wqSegTotal",  q.segundosTotales + " seg");
    texto("wqSegRest",   q.segundosRestantes + " seg");
    texto("wqTiempo",    "00:11");
    texto("wqAciertos",  "0/" + q.totalPreguntas + " correctas");

    // Construir las opciones de respuesta
    zonaOpciones.innerHTML = "";
    for (var i = 0; i < q.opciones.length; i++) {
      var op = q.opciones[i];
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "wq-op";
      boton.setAttribute("data-letra", op.letra);
      boton.setAttribute("data-correcta", op.correcta ? "si" : "no");
      boton.innerHTML = '<span class="wq-op__letra">' + op.letra + "</span>" +
                        "<span>" + op.texto + "</span>";
      zonaOpciones.appendChild(boton);
    }

    ponerBarraTiempo(q.segundosRestantes, q.segundosTotales);

    // Dejar la pantalla limpia por si ya se había visto antes
    if (cajaPregunta) cajaPregunta.classList.remove("esta-encendida");
    cerrarModal();

    // Cambiar la pantalla del docente por la del estudiante
    ventanaDoc.hidden = true;
    if (zonaResultado) zonaResultado.hidden = true;
    if (pieSim) pieSim.hidden = true;
    wiwi.hidden = false;

    arrancarReloj(q);
    arrancarDemo(q);

    /* Antes aquí había un scrollIntoView. Se quitó: ahora todas las
       pantallas viven dentro del mismo marco fijo, así que mover la
       página no hacía falta — solo provocaba un salto de la barra de
       desplazamiento al pasar de una pantalla a otra. */
  }

  function cerrarWiwi() {
    detenerReloj();
    cancelarDemo();
    cerrarModal();
    wiwiActual = null;
    wiwi.hidden = true;
    ventanaDoc.hidden = false;
    if (pieSim) pieSim.hidden = false;
  }

  function ponerBarraTiempo(restantes, totales) {
    var barra = document.getElementById("wqBarra");
    if (barra) barra.style.width = ((totales - restantes) / totales * 100) + "%";
  }

  /* ---- Reloj que va corriendo mientras se ve la pantalla ---- */
  function arrancarReloj(q) {
    detenerReloj();
    var corridos  = 11;                 // arranca en 00:11, como en la plataforma
    var restantes = q.segundosRestantes;

    relojTimer = window.setInterval(function () {
      corridos++;
      restantes--;
      if (restantes < 0) { detenerReloj(); return; }

      var mm = Math.floor(corridos / 60);
      var ss = corridos % 60;
      texto("wqTiempo", (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss);
      texto("wqSegRest", restantes + " seg");
      ponerBarraTiempo(restantes, q.segundosTotales);
    }, 1000);
  }

  function detenerReloj() {
    if (relojTimer) { window.clearInterval(relojTimer); relojTimer = null; }
  }

  /* ============================================================
     RECORRIDO AUTOMÁTICO DENTRO DE LA PANTALLA DEL ESTUDIANTE

     La secuencia, apenas se abre la pantalla:
       1. Se enciende la pregunta en verde neón
       2. El recorrido escoge una respuesta equivocada  → rosado neón
       3. Después escoge la correcta                    → verde neón
       4. Sale el modal con la retroalimentación

     Si el visitante hace clic en una opción, el recorrido se detiene
     y manda él. Para cambiar el ritmo, se editan los milisegundos.
     ============================================================ */

  var DEMO_TIEMPOS = {
    enciendePregunta:  700,
    escogeErrada:     2600,
    escogeCorrecta:   4800,
    muestraModal:     6300
  };

  function luego(ms, fn) { demoTimers.push(window.setTimeout(fn, ms)); }

  function cancelarDemo() {
    for (var i = 0; i < demoTimers.length; i++) window.clearTimeout(demoTimers[i]);
    demoTimers = [];
  }

  function apagarPregunta() {
    if (cajaPregunta) cajaPregunta.classList.remove("esta-encendida");
  }

  function marcarOpcion(boton, clase) {
    if (!boton) return;
    boton.classList.add("se-escoge");
    luego(300, function () {
      boton.classList.remove("se-escoge");
      boton.classList.add(clase);
    });
  }

  function bloquearOpciones() {
    var todas = zonaOpciones.querySelectorAll(".wq-op");
    for (var i = 0; i < todas.length; i++) todas[i].disabled = true;
  }

  function arrancarDemo(q) {
    cancelarDemo();
    var r = q.retroalimentacion;
    if (!r || !zonaOpciones) return;

    // 1. La pregunta se enciende
    luego(DEMO_TIEMPOS.enciendePregunta, function () {
      if (cajaPregunta) cajaPregunta.classList.add("esta-encendida");
    });

    // 2. Escoge una equivocada, a propósito
    luego(DEMO_TIEMPOS.escogeErrada, function () {
      marcarOpcion(zonaOpciones.querySelector('.wq-op[data-letra="' + r.erradaDemo + '"]'), "es-errada");
    });

    // 3. Ahora sí escoge la correcta
    luego(DEMO_TIEMPOS.escogeCorrecta, function () {
      apagarPregunta();
      marcarOpcion(zonaOpciones.querySelector('.wq-op[data-correcta="si"]'), "es-correcta");
      texto("wqAciertos", "1/" + q.totalPreguntas + " correctas");
      detenerReloj();
    });

    // 4. Sale la retroalimentación
    luego(DEMO_TIEMPOS.muestraModal, function () {
      bloquearOpciones();
      abrirModal(r, true);
    });
  }

  /* ---- Modal de retroalimentación ---- */
  function abrirModal(r, acerto) {
    if (!modal || !r) return;
    texto("wqModalTitulo", acerto ? r.titulo : (r.tituloFallo || "Casi. Mira por qué:"));
    texto("wqModalTexto",  r.texto);
    texto("wqModalPorque", r.porQue);
    texto("wqModalPuntos", acerto ? r.puntos : "");
    modal.hidden = false;

    /* Nada de mover la página aquí: el modal ya queda centrado dentro
       del marco. El foco se pone sin desplazar, para que la barra de
       desplazamiento no se mueva sola. */
    if (modalCerrar) modalCerrar.focus({ preventScroll: true });
  }

  function cerrarModal() { if (modal) modal.hidden = true; }

  if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) cerrarModal();   // clic por fuera de la caja
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) cerrarModal();
  });

  /* ---- Responder la pregunta a mano ----
     Si el visitante se adelanta y responde él, el recorrido se detiene. */
  if (zonaOpciones) {
    zonaOpciones.addEventListener("click", function (e) {
      var boton = e.target.closest ? e.target.closest(".wq-op") : null;
      if (!boton || boton.disabled) return;

      cancelarDemo();
      apagarPregunta();
      detenerReloj();

      var acerto = boton.getAttribute("data-correcta") === "si";
      boton.classList.add(acerto ? "es-correcta" : "es-errada");

      // Se bloquean todas y, si falló, se le muestra cuál era la buena
      var todas = zonaOpciones.querySelectorAll(".wq-op");
      for (var i = 0; i < todas.length; i++) {
        todas[i].disabled = true;
        if (!acerto && todas[i].getAttribute("data-correcta") === "si") {
          todas[i].classList.add("es-correcta");
        }
      }

      if (acerto && wiwiActual) {
        texto("wqAciertos", "1/" + wiwiActual.totalPreguntas + " correctas");
      }

      if (wiwiActual && wiwiActual.retroalimentacion) {
        luego(700, function () { abrirModal(wiwiActual.retroalimentacion, acerto); });
      }
    });
  }

  if (btnVolver) btnVolver.addEventListener("click", cerrarWiwi);


  /* ============================================================
     DEJAR EL SIMULADOR COMO RECIÉN ABIERTO

     La presentación llama a esto cada vez que entra al paso de la
     app. Sin esto, si el visitante había abierto una modalidad y
     después repetía la presentación, al volver se encontraba la
     lista de recursos abierta en vez de la cuadrícula.
     ============================================================ */

  /* ============================================================
     LA PUERTA PARA EL RECORRIDO NARRADO

     js/recorrido.js no sabe nada de cómo está hecho el simulador:
     solo pide "muéstrame las modalidades", "abre esta actividad".
     Todo lo que ese archivo puede hacer está aquí, y nada más.

     Estas funciones NO paran el recorrido, a diferencia de los
     clics del visitante: son el recorrido moviéndose a sí mismo.
     ============================================================ */

  /* Antes de mostrar otra cosa hay que recoger lo de la pantalla
     anterior: la demo de respuestas del estudiante sigue corriendo
     sola con sus temporizadores, y su modal de retroalimentación se
     queda abierto encima de lo que venga después. */
  function recoger() {
    cancelarDemo();
    cerrarModal();
    detenerReloj();
  }

  window.simuladorGuia = {

    /* La cuadrícula de las modalidades */
    modalidades: function () {
      recoger();
      if (wiwi)             wiwi.hidden = true;
      if (ventanaDoc)       ventanaDoc.hidden = false;
      if (zonaResultado)    zonaResultado.hidden = true;
      if (panelModalidades) panelModalidades.hidden = false;
    },

    /* Escoge una modalidad, como si le hubieran hecho clic */
    modalidad: function (id) {
      recoger();
      if (wiwi) wiwi.hidden = true;
      if (ventanaDoc) ventanaDoc.hidden = false;
      escoger(id, true);
    },

    /* La pantalla del estudiante de una modalidad que la tenga */
    estudiante: function (id) {
      var m = porId(id);
      if (!m || !m.wiwiQuest) return;
      recoger();
      if (panelModalidades) panelModalidades.hidden = false;
      if (zonaResultado)    zonaResultado.hidden = true;
      abrirWiwi(m);
    },

    /* El catálogo de actividades de una modalidad que lo tenga */
    catalogo: function (id) {
      var m = porId(id);
      if (!m || !m.actividades) return;
      recoger();
      if (wiwi) wiwi.hidden = true;
      if (ventanaDoc) ventanaDoc.hidden = false;
      mostrarActividades(m);
    },

    /* Una actividad del catálogo, por su nombre */
    actividad: function (id, nombre) {
      var m = porId(id);
      if (!m || !m.actividades) return;
      for (var i = 0; i < m.actividades.length; i++) {
        if (m.actividades[i].nombre === nombre) {
          recoger();
          if (wiwi) wiwi.hidden = true;
          if (ventanaDoc) ventanaDoc.hidden = false;
          abrirActividad(m, i);
          return;
        }
      }
    }
  };

  /* El recorrido avisa por aquí cuando llega al final, para que el
     botón vuelva a decir "Ver el recorrido narrado" */
  window.simuladorPararRecorrido = detenerAuto;

  function porId(id) {
    for (var i = 0; i < MODALIDADES.length; i++) {
      if (MODALIDADES[i].id === id) return MODALIDADES[i];
    }
    return null;
  }

  window.simuladorAlInicio = function () {
    detenerAuto();
    cancelarDemo();
    cerrarModal();
    detenerReloj();

    if (wiwi)             wiwi.hidden = true;
    if (ventanaDoc)       ventanaDoc.hidden = false;
    if (pieSim)           pieSim.hidden = false;
    if (zonaResultado)    zonaResultado.hidden = true;
    if (panelModalidades) panelModalidades.hidden = false;

    // Quitar la marca de la última modalidad escogida
    var botones = grid.querySelectorAll(".vt-mod");
    for (var i = 0; i < botones.length; i++) {
      botones[i].classList.remove("is-activa");
      botones[i].setAttribute("aria-pressed", "false");
    }
  };

  /* ---- Botón de continuar ----
     PENDIENTE: cuando exista la Vista 2 del recorrido, este botón
     debe llevar allá. Por ahora baja a la siguiente sección. */
  if (btnContinuar) {
    btnContinuar.addEventListener("click", function () {
      var destino = document.getElementById("realidad");
      if (destino) destino.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
