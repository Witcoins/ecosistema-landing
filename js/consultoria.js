/* ============================================================
   i'Witown — Consultoría en Innovación Educativa
   ============================================================

   La pestaña donde se cuenta el servicio: de qué parte (la
   identidad del colegio), las dos innovaciones —la pedagógica y
   la tecnológica—, hasta dónde llega y cómo es el proceso.

   ┌──────────────────────────────────────────────────────────┐
   │  TODOS LOS TEXTOS DE LA SECCIÓN ESTÁN AQUÍ ABAJO         │
   │                                                          │
   │  Son cinco listas, en el mismo orden en que se ven:      │
   │                                                          │
   │    CON_IDENTIDAD   de qué partimos (los ocho iconos)     │
   │    CON_INNOVACION  las dos innovaciones y sus botones    │
   │    CON_PROPOSITOS  para qué sirve la tecnología          │
   │    CON_ALCANCES    hasta dónde llega, por temas          │
   │    CON_PROCESO     las cuatro etapas del trabajo         │
   │                                                          │
   │  Para agregar algo se copia una línea entera, con sus    │
   │  comas, y se le cambia el texto. El orden de la lista    │
   │  es el orden en que aparece en la página.                │
   └──────────────────────────────────────────────────────────┘

   Los dibujos ("icono") salen de MAPA_ICONOS, arriba de
   js/mapa.js. Ahí está la lista de los que hay.
   ============================================================ */


/* ---- 0. LAS CINCO PUERTAS -----------------------------------
   Lo primero que ve el prospecto: cinco entradas del mismo
   tamaño, y escoge por dónde entrar. El "cuarto" es el bloque
   que abre cada una; tiene que coincidir con el atributo
   data-cuarto del index.html. */

var CON_PUERTAS = [
  { cuarto: "identidad",  icono: "brujula",
    nombre: "De dónde partimos",
    gancho: "La identidad del colegio, antes que cualquier metodología." },

  { cuarto: "innovacion", icono: "bombillo",
    nombre: "Las dos innovaciones",
    gancho: "La pedagógica y la tecnológica, empujando para el mismo lado." },

  { cuarto: "propositos", icono: "diana",
    nombre: "Para qué",
    gancho: "Qué tiene que lograr la tecnología para valer la pena." },

  { cuarto: "alcances",   icono: "capas",
    nombre: "Hasta dónde llega",
    gancho: "Ocho frentes de trabajo, del currículo a las familias." },

  { cuarto: "proceso",    icono: "ramas",
    nombre: "Cómo trabajamos",
    gancho: "Diagnóstico, diseño, implementación y seguimiento." }
];


/* ---- 1. DE QUÉ PARTIMOS -------------------------------------
   Los ocho asuntos que se miran antes de proponer nada. */

var CON_IDENTIDAD = [
  { icono: "brujula",    nombre: "Enfoque pedagógico",
    texto: "Cómo entiende y practica la enseñanza este colegio, no el de al lado." },
  { icono: "familia",    nombre: "Contexto social y económico",
    texto: "El estrato, el entorno y la realidad de las familias que atiende." },
  { icono: "colegio",    nombre: "Cultura institucional",
    texto: "Lo que se respira en los pasillos: sus rituales, su forma de tratarse, lo que celebra." },
  { icono: "persona",    nombre: "Estudiantes y familias",
    texto: "Quiénes son, cómo aprenden y qué esperan del colegio." },
  { icono: "hoja",       nombre: "Proyecto educativo y filosofía",
    texto: "El PEI y lo que el colegio dice que quiere lograr con cada estudiante." },
  { icono: "diana",      nombre: "Contexto territorial y cultural",
    texto: "La región, la ciudad y el barrio donde está: eso también educa." },
  { icono: "teachers",   nombre: "Capacidades de los docentes",
    texto: "Con qué equipo se cuenta, qué sabe hacer y qué necesita aprender." },
  { icono: "nodos",      nombre: "Infraestructura y ecosistema digital",
    texto: "Los equipos, la conectividad y las plataformas que ya están andando." }
];


/* ---- 2. LAS DOS INNOVACIONES --------------------------------
   Cada una con su pregunta, su frase y sus botones. Al tocar un
   botón aparece lo que dice. */

var CON_INNOVACION = [

  { clave: "pedagogica",
    rotulo: "Innovación pedagógica",
    pregunta: "¿Cómo podemos enseñar de una manera diferente?",
    frase: "Metodologías y estrategias innovadoras para transformar la experiencia " +
           "del aprendizaje de acuerdo con su propia identidad.",
    icono: "bombillo",
    puntos: [
      { nombre: "Experiencias de aprendizaje", icono: "capas",
        titulo: "Transformar la experiencia de aprendizaje",
        texto: "Nuevas metodologías, actividades y recursos diseñados para la forma " +
               "particular de aprender de sus estudiantes." },
      { nombre: "Aprendizaje visible", icono: "ojo",
        titulo: "Hacer visible el aprendizaje",
        texto: "Identificar qué comprende, qué desarrolla y dónde necesita apoyo cada " +
               "estudiante, más allá de una nota o un promedio." },
      { nombre: "Identidad pedagógica", icono: "colegio",
        titulo: "Convertir la identidad del colegio en experiencias",
        texto: "Llevar su filosofía, proyectos, metodología y propuesta pedagógica al " +
               "aula de manera concreta y diferenciadora." },
      { nombre: "Transformación docente", icono: "teachers",
        titulo: "Fortalecer la práctica docente",
        texto: "Acompañar a los profesores para diseñar, implementar y evaluar nuevas " +
               "formas de enseñar, usando también tecnología e IA." },
      { nombre: "Propuesta diferenciadora", icono: "diana",
        titulo: "Construir una propuesta educativa diferenciadora",
        texto: "Integrar pedagogía, tecnología, cultura y experiencias propias para que " +
               "el colegio ofrezca una manera de educar que no sea intercambiable con " +
               "la de otros colegios." }
    ] },

  { clave: "tecnologica",
    rotulo: "Innovación tecnológica",
    pregunta: "¿Qué tecnología puede hacer posible esa transformación?",
    frase: "Integramos tecnología, recursos y tendencias digitales para que el colegio " +
           "aproveche la innovación sin perder su identidad pedagógica.",
    icono: "nodos",
    puntos: [
      { nombre: "Recursos tecnológicos", icono: "cuadros",
        titulo: "Recursos tecnológicos",
        texto: "Selección e integración de plataformas, aplicaciones, contenidos " +
               "digitales y herramientas que respondan a las necesidades reales del colegio." },
      { nombre: "Inteligencia Artificial", icono: "cerebro",
        titulo: "Inteligencia Artificial",
        texto: "Identificación de tendencias y usos de IA para docentes, estudiantes, " +
               "familias y gestión institucional, con criterios pedagógicos y de uso responsable." },
      { nombre: "Dispositivos y ambientes", icono: "teachers",
        titulo: "Dispositivos y ambientes",
        texto: "Definición del uso pedagógico de computadores, tabletas, celulares, " +
               "pantallas y dispositivos interactivos según cada etapa educativa." },
      { nombre: "Ecosistema digital", icono: "union",
        titulo: "Ecosistema digital",
        texto: "Conexión de las plataformas, herramientas y fuentes de información para " +
               "evitar sistemas aislados y facilitar el flujo de datos del colegio." },
      { nombre: "Datos para decidir", icono: "grafico",
        titulo: "Datos para decidir",
        texto: "Transformación de los datos que generan estudiantes, docentes y familias " +
               "en información útil para detectar necesidades, hacer seguimiento y decidir." },
      { nombre: "Tendencias tecnológicas", icono: "brujula",
        titulo: "Tendencias y prospectiva tecnológica",
        texto: "Exploración permanente de nuevas tecnologías, herramientas y tendencias " +
               "educativas para identificar cuáles tienen sentido para el futuro del colegio." }
    ] }
];


/* ---- 3. PARA QUÉ ------------------------------------------- */

var CON_PROPOSITOS = [
  { icono: "bombillo", nombre: "Potenciar el aprendizaje",
    texto: "Usar la tecnología para enriquecer las experiencias de aprendizaje, no " +
           "simplemente para digitalizar lo que ya existe." },
  { icono: "union",    nombre: "Simplificar y conectar",
    texto: "Integrar herramientas, plataformas y datos para que estudiantes, docentes, " +
           "familias y directivos trabajen dentro de un ecosistema coherente." },
  { icono: "diana",    nombre: "Preparar al colegio para el presente",
    texto: "Incorporar IA, nuevos dispositivos y tendencias digitales de manera pertinente, " +
           "responsable y alineada con la identidad pedagógica del colegio." }
];


/* ---- 4. HASTA DÓNDE LLEGA -----------------------------------
   Ocho temas; se toca uno y se abre su lista. */

var CON_ALCANCES = [

  { nombre: "Currículo", icono: "capas", puntos: [
    "Rediseño de experiencias de aprendizaje.",
    "Integración de proyectos interdisciplinarios.",
    "Articulación entre áreas.",
    "Transformación de contenidos en experiencias.",
    "Diseño de rutas de aprendizaje propias."
  ] },

  { nombre: "Metodologías", icono: "ramas", puntos: [
    "Aprendizaje basado en proyectos.",
    "Aprendizaje basado en retos.",
    "Aprendizaje experiencial.",
    "Gamificación con propósito pedagógico.",
    "Aprendizaje colaborativo.",
    "Estrategias de pensamiento y comprensión.",
    "Modelos híbridos y aprendizaje mediado por tecnología."
  ] },

  { nombre: "Evaluación", icono: "balanza", puntos: [
    "Pasar de evaluar únicamente resultados a observar procesos.",
    "Evidencias de aprendizaje.",
    "Seguimiento por competencias y habilidades.",
    "Evaluación formativa.",
    "Retroalimentación permanente.",
    "Identificación temprana de dificultades."
  ] },

  { nombre: "Innovación del aula", icono: "juego", puntos: [
    "Nuevas dinámicas de participación.",
    "Actividades según los diferentes momentos del aprendizaje.",
    "Uso pedagógico de recursos digitales.",
    "Experiencias que conecten lo aprendido con situaciones reales.",
    "Nuevas formas de documentar el aprendizaje."
  ] },

  { nombre: "Docentes", icono: "teachers", puntos: [
    "Formación y acompañamiento.",
    "Diseño de nuevas prácticas pedagógicas.",
    "Herramientas para interpretar la información del aprendizaje.",
    "Integración responsable de IA.",
    "El docente pasa de transmitir información a diseñar y acompañar el aprendizaje."
  ] },

  { nombre: "Familias", icono: "familia", puntos: [
    "Nuevas formas de mostrar lo que realmente está aprendiendo el estudiante.",
    "Participación de las familias en el proceso.",
    "Comunicación basada en evidencias de aprendizaje.",
    "Orientaciones para acompañar sin reemplazar el trabajo del estudiante."
  ] },

  { nombre: "Tecnología", icono: "nodos", puntos: [
    "Digitalización de procesos pedagógicos.",
    "Integración de plataformas.",
    "Uso de datos para tomar decisiones educativas.",
    "IA como herramienta pedagógica, no como sustituto del pensamiento.",
    "Un ecosistema digital coherente con el modelo educativo."
  ] },

  { nombre: "Identidad y propuesta de valor", icono: "diana", puntos: [
    "Hacer visible aquello que diferencia al colegio.",
    "Convertir sus proyectos y metodologías en experiencias reconocibles.",
    "Integrar la innovación con el PEI.",
    "Experiencias que hagan tangible la propuesta pedagógica ante estudiantes y familias."
  ] }
];


/* ---- 5. EL PROCESO ------------------------------------------
   Cuatro etapas, una detrás de otra. */

var CON_PROCESO = [
  { nombre: "Diagnóstico", icono: "ojo",
    texto: "Escuchamos al colegio: rectoría, docentes, estudiantes y familias. Miramos el " +
           "PEI, las prácticas de aula y lo que ya hay andando en tecnología. De ahí sale " +
           "un retrato de la identidad y de dónde está hoy la experiencia de aprendizaje." },
  { nombre: "Diseño", icono: "bombillo",
    texto: "Con ese retrato en la mano diseñamos la innovación a la medida: qué cambia en el " +
           "currículo, con qué metodologías, cómo se evalúa y qué tecnología la sostiene. " +
           "Queda por escrito, con prioridades y tiempos." },
  { nombre: "Implementación", icono: "ramas",
    texto: "Se lleva al aula con los docentes, no por encima de ellos: formación, diseño " +
           "conjunto de experiencias y acompañamiento mientras se prueba. La tecnología " +
           "entra cuando ya hay una intención pedagógica que sostener." },
  { nombre: "Seguimiento", icono: "grafico",
    texto: "Medimos con evidencias de aprendizaje, no con impresiones: qué comprendieron " +
           "los estudiantes, qué cambió en la práctica docente y qué hay que ajustar. " +
           "El proceso se corrige con datos, cada período." }
];


/* ============================================================
   DE AQUÍ PARA ABAJO ES LA MECÁNICA
   ============================================================ */

(function () {

  var raiz = document.getElementById("consultoria");
  if (!raiz) return;

  var iconos = (typeof MAPA_ICONOS === "object" && MAPA_ICONOS) ? MAPA_ICONOS : {};

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function dibujo(nombre) {
    var d = iconos[nombre] || iconos.diana || "";
    return '<svg class="con-ico" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  }

  function caja(id) { return document.getElementById(id); }


  /* ---- 1. De qué partimos: la rueda ----

     Las ocho cosas no se muestran todas a la vez: van en una rueda
     que gira, como la de una tragamonedas. La que queda en la
     ventana del medio es la que se explica debajo.

     Se mueve con las flechas, tocando el nombre de arriba o de
     abajo, o con las teclas. Al abrir la puerta da una vuelta de
     presentación. */

  var RUEDA_ALTO = 46;          /* lo que mide cada renglón, en píxeles */

  function armarIdentidad() {
    var c = caja("conIdentidad");
    if (!c) return;

    var total = CON_IDENTIDAD.length;
    var enQue = 0;
    var girando = false;

    var h = '<div class="con-rueda">' +
              '<button type="button" class="con-rueda__flecha" data-giro="-1"' +
              ' aria-label="Anterior">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>' +
              '</button>' +
              '<div class="con-rueda__ventana">' +
                '<ul class="con-rueda__cinta" id="conCinta">';

    /* La cinta lleva la última de primera y la primera de última:
       así, en los extremos, arriba y abajo siempre se asoma la que
       sigue, y la rueda se ve redonda. */
    var orden = [total - 1];
    for (var o = 0; o < total; o++) { orden.push(o); }
    orden.push(0);

    for (var i = 0; i < orden.length; i++) {
      var cual = orden[i];
      h += '<li class="con-rueda__item" data-va="' + cual + '">' +
             dibujo(CON_IDENTIDAD[cual].icono) +
             '<span>' + esc(CON_IDENTIDAD[cual].nombre) + '</span>' +
           '</li>';
    }

    h += '</ul><span class="con-rueda__marco" aria-hidden="true"></span></div>' +
         '<button type="button" class="con-rueda__flecha" data-giro="1"' +
         ' aria-label="Siguiente">' +
           '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
         '</button>' +
         '</div>' +
         '<div class="con-rueda__texto" id="conRuedaTexto" aria-live="polite"></div>';

    c.innerHTML = h;

    var cinta = caja("conCinta");
    var texto = caja("conRuedaTexto");
    var items = cinta.querySelectorAll(".con-rueda__item");

    function pintar() {
      /* La ventana muestra tres renglones: el de la mitad es el
         escogido, así que la cinta se corre uno hacia arriba. */
      cinta.style.transform = "translateY(" + (-enQue * RUEDA_ALTO) + "px)";
      for (var a = 0; a < items.length; a++) {
        items[a].classList.toggle("es-elegido", a === enQue + 1);
      }
      var p = CON_IDENTIDAD[enQue];
      texto.innerHTML = "<h4>" + esc(p.nombre) + "</h4><p>" + esc(p.texto) + "</p>";
      texto.classList.remove("es-entra");
      /* jshint expr:true */
      texto.offsetWidth;
      texto.classList.add("es-entra");
    }

    function mover(cuanto) {
      enQue = (enQue + cuanto + total) % total;
      pintar();
    }

    /* La vuelta de presentación: arranca abajo y sube hasta la
       primera, frenando de a poco. */
    function girar() {
      if (girando) return;
      girando = true;
      /* Da una vuelta entera y frena en la primera, sin importar
         dónde hubiera quedado. */
      var pasos = total + ((total - enQue) % total);
      var espera = 55;
      (function paso() {
        mover(1);
        pasos--;
        if (pasos > 0) {
          espera = espera + 18;
          window.setTimeout(paso, espera);
        } else {
          girando = false;
        }
      })();
    }

    var flechas = c.querySelectorAll(".con-rueda__flecha");
    for (var f = 0; f < flechas.length; f++) {
      flechas[f].addEventListener("click", (function (cuanto) {
        return function () { if (!girando) mover(cuanto); };
      })(parseInt(flechas[f].getAttribute("data-giro"), 10)));
    }

    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener("click", (function (n) {
        return function () { if (!girando) { enQue = n; pintar(); } };
      })(parseInt(items[k].getAttribute("data-va"), 10)));
    }

    c.addEventListener("keydown", function (ev) {
      if (girando) return;
      if (ev.key === "ArrowDown") { ev.preventDefault(); mover(1); }
      if (ev.key === "ArrowUp")   { ev.preventDefault(); mover(-1); }
    });

    pintar();
    window.conGiraLaRueda = girar;
  }


  /* ---- 2. Las dos innovaciones ---- */
  function armarInnovacion() {
    var c = caja("conInnovacion");
    if (!c) return;

    var h = '<div class="con-solapas" role="tablist">';
    for (var i = 0; i < CON_INNOVACION.length; i++) {
      var b = CON_INNOVACION[i];
      h += '<button type="button" class="con-solapa' + (i === 0 ? " es-activa" : "") + '"' +
           ' role="tab" data-cual="' + b.clave + '"' +
           ' aria-selected="' + (i === 0 ? "true" : "false") + '">' +
             dibujo(b.icono) +
             '<span class="con-solapa__nombre">' + esc(b.rotulo) + '</span>' +
             '<span class="con-solapa__pregunta">' + esc(b.pregunta) + '</span>' +
           '</button>';
    }
    h += '</div>';

    for (var j = 0; j < CON_INNOVACION.length; j++) {
      var bl = CON_INNOVACION[j];
      h += '<div class="con-bloque' + (j === 0 ? " es-activo" : "") +
           '" data-bloque="' + bl.clave + '"' + (j === 0 ? "" : " hidden") + '>' +
             '<p class="con-bloque__frase">' + esc(bl.frase) + '</p>' +
             '<div class="con-bloque__cuerpo">' +
               '<div class="con-botones">';
      for (var k = 0; k < bl.puntos.length; k++) {
        var pt = bl.puntos[k];
        h += '<button type="button" class="con-boton' + (k === 0 ? " es-activo" : "") +
             '" data-punto="' + k + '">' +
               dibujo(pt.icono) + '<span>' + esc(pt.nombre) + '</span>' +
             '</button>';
      }
      h += '</div>' +
           '<div class="con-detalle" data-detalle>' +
             '<h4>' + esc(bl.puntos[0].titulo) + '</h4>' +
             '<p>' + esc(bl.puntos[0].texto) + '</p>' +
           '</div>' +
           '</div></div>';
    }

    c.innerHTML = h;

    /* Cambiar de innovación */
    var solapas = c.querySelectorAll(".con-solapa");
    var bloques = c.querySelectorAll("[data-bloque]");
    for (var s = 0; s < solapas.length; s++) {
      solapas[s].addEventListener("click", (function (cual) {
        return function () {
          for (var a = 0; a < solapas.length; a++) {
            var suya = solapas[a].getAttribute("data-cual") === cual;
            solapas[a].classList.toggle("es-activa", suya);
            solapas[a].setAttribute("aria-selected", suya ? "true" : "false");
          }
          for (var b = 0; b < bloques.length; b++) {
            var mia = bloques[b].getAttribute("data-bloque") === cual;
            bloques[b].hidden = !mia;
            bloques[b].classList.toggle("es-activo", mia);
          }
        };
      })(solapas[s].getAttribute("data-cual")));
    }

    /* Cambiar de punto dentro de una innovación */
    for (var t = 0; t < bloques.length; t++) {
      (function (bloque) {
        var datos = null;
        for (var d = 0; d < CON_INNOVACION.length; d++) {
          if (CON_INNOVACION[d].clave === bloque.getAttribute("data-bloque")) {
            datos = CON_INNOVACION[d];
          }
        }
        var botones = bloque.querySelectorAll(".con-boton");
        var detalle = bloque.querySelector("[data-detalle]");
        for (var e = 0; e < botones.length; e++) {
          botones[e].addEventListener("click", (function (n) {
            return function () {
              for (var f = 0; f < botones.length; f++) {
                botones[f].classList.toggle("es-activo", f === n);
              }
              var pt = datos.puntos[n];
              detalle.innerHTML = "<h4>" + esc(pt.titulo) + "</h4><p>" + esc(pt.texto) + "</p>";
              detalle.classList.remove("es-entra");
              /* jshint expr:true */
              detalle.offsetWidth;
              detalle.classList.add("es-entra");
            };
          })(e));
        }
      })(bloques[t]);
    }
  }


  /* ---- 3. Para qué ---- */
  function armarPropositos() {
    var c = caja("conPropositos");
    if (!c) return;
    var h = "";
    for (var i = 0; i < CON_PROPOSITOS.length; i++) {
      var p = CON_PROPOSITOS[i];
      h += '<article class="con-proposito">' +
             dibujo(p.icono) +
             '<h4>' + esc(p.nombre) + '</h4>' +
             '<p>' + esc(p.texto) + '</p>' +
           '</article>';
    }
    c.innerHTML = h;
  }


  /* ---- 4. Hasta dónde llega ---- */
  function armarAlcances() {
    var c = caja("conAlcances");
    if (!c) return;

    var h = '<div class="con-temas">';
    for (var i = 0; i < CON_ALCANCES.length; i++) {
      h += '<button type="button" class="con-tema' + (i === 0 ? " es-activo" : "") +
           '" data-tema="' + i + '">' +
             dibujo(CON_ALCANCES[i].icono) +
             '<span>' + esc(CON_ALCANCES[i].nombre) + '</span>' +
           '</button>';
    }
    h += '</div><ul class="con-lista" id="conLista"></ul>';
    c.innerHTML = h;

    var lista = caja("conLista");
    var temas = c.querySelectorAll(".con-tema");

    function mostrar(n) {
      for (var a = 0; a < temas.length; a++) {
        temas[a].classList.toggle("es-activo", a === n);
      }
      var h2 = "";
      for (var b = 0; b < CON_ALCANCES[n].puntos.length; b++) {
        h2 += "<li>" + esc(CON_ALCANCES[n].puntos[b]) + "</li>";
      }
      lista.innerHTML = h2;
      lista.classList.remove("es-entra");
      /* jshint expr:true */
      lista.offsetWidth;
      lista.classList.add("es-entra");
    }

    for (var t = 0; t < temas.length; t++) {
      temas[t].addEventListener("click", (function (n) {
        return function () { mostrar(n); };
      })(t));
    }
    mostrar(0);
  }


  /* ---- 5. El proceso ---- */
  function armarProceso() {
    var c = caja("conProceso");
    if (!c) return;
    var h = "";
    for (var i = 0; i < CON_PROCESO.length; i++) {
      var p = CON_PROCESO[i];
      h += '<article class="con-etapa">' +
             '<span class="con-etapa__num">' + (i + 1) + '</span>' +
             dibujo(p.icono) +
             '<h4>' + esc(p.nombre) + '</h4>' +
             '<p>' + esc(p.texto) + '</p>' +
           '</article>';
    }
    c.innerHTML = h;
  }


  /* ---- La foto del encabezado ----

     Detrás del título hay una foto apagada. Al tocarla, el texto
     se hace transparente y la foto toma su color; al tocar otra
     vez, vuelve el texto.

     Si el archivo no existe, el encabezado se queda como estaba:
     sin foto y sin nada que tocar. */
  function prepararCabeza() {
    var cabeza = document.getElementById("conCabeza");
    var foto   = document.getElementById("conFoto");
    var pista  = document.getElementById("conPista");
    if (!cabeza || !foto) return;

    function apagar() {
      cabeza.classList.add("sin-foto");
      if (pista) pista.hidden = true;
    }

    function encender() {
      cabeza.classList.remove("sin-foto");
      cabeza.classList.add("con-foto");
      if (pista) pista.hidden = false;

      cabeza.addEventListener("click", function () {
        var abierta = cabeza.classList.toggle("es-foto");
        if (pista) pista.textContent = abierta ? "Toca para volver al texto"
                                               : "Toca la imagen";
      });
    }

    foto.addEventListener("error", apagar);
    if (foto.complete) {
      if (foto.naturalWidth) encender(); else apagar();
    } else {
      foto.addEventListener("load", encender);
    }
  }


  /* ---- Las cinco puertas ----

     Se dibujan las entradas y se deja abierta la primera. Al tocar
     una, se esconden los otros cuatro cuartos. */
  function armarPuertas() {
    var c = caja("conPuertas");
    if (!c) return;

    var h = "";
    for (var i = 0; i < CON_PUERTAS.length; i++) {
      var pu = CON_PUERTAS[i];
      /* El gancho no se pinta: la pastilla lleva solo el nombre, y
         el gancho sale al dejar el mouse encima. Debajo de la fila,
         cada cuarto ya trae su propia bajada. */
      h += '<button type="button" class="con-puerta' + (i === 0 ? " es-abierta" : "") +
           '" data-abre="' + pu.cuarto + '" aria-pressed="' + (i === 0) + '"' +
           ' title="' + esc(pu.gancho) + '">' +
             dibujo(pu.icono) +
             '<span>' + esc(pu.nombre) + '</span>' +
           '</button>';
    }
    c.innerHTML = h;

    var puertas = c.querySelectorAll(".con-puerta");
    var cuartos = raiz.querySelectorAll("[data-cuarto]");

    function abrir(cual) {
      for (var a = 0; a < puertas.length; a++) {
        var suya = puertas[a].getAttribute("data-abre") === cual;
        puertas[a].classList.toggle("es-abierta", suya);
        puertas[a].setAttribute("aria-pressed", suya ? "true" : "false");
      }
      for (var b = 0; b < cuartos.length; b++) {
        var mio = cuartos[b].getAttribute("data-cuarto") === cual;
        cuartos[b].hidden = !mio;
        if (mio) {
          if (cual === "identidad" && typeof window.conGiraLaRueda === "function") {
            window.conGiraLaRueda();
          }
          cuartos[b].classList.remove("es-entra");
          /* jshint expr:true */
          cuartos[b].offsetWidth;
          cuartos[b].classList.add("es-entra");
        }
      }
    }

    for (var d = 0; d < puertas.length; d++) {
      puertas[d].addEventListener("click", (function (cual) {
        return function () { abrir(cual); };
      })(puertas[d].getAttribute("data-abre")));
    }
  }


  prepararCabeza();
  armarPuertas();
  armarIdentidad();
  armarInnovacion();
  armarPropositos();
  armarAlcances();
  armarProceso();
})();
