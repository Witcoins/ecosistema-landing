/* ============================================================
   i'Witown — El ecosistema, explicado con iconos
   ============================================================

   Las cuatro plataformas, una por cada actor del colegio. Se toca
   una y debajo aparece lo que hace; se toca cada cosa que hace y
   dice de qué se trata.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ ABAJO                         │
   │                                                          │
   │    nombre    el nombre de la plataforma                  │
   │    para      para quién es                               │
   │    icono     su dibujo                                   │
   │    imagen    la foto que sale abajo                      │
   │    frase     el renglón que la resume                    │
   │    piezas    lo que hace, cada una con su nombre corto   │
   │              y la explicación que sale al tocarla        │
   │                                                          │
   │  El orden de la lista es el orden en que se ven.         │
   └──────────────────────────────────────────────────────────┘

   Los dibujos están en MAPA_ICONOS, arriba de js/mapa.js.
   La mecánica también.
   ============================================================ */

var ECO_PLATAFORMAS = [

  { nombre: "AdmonWitown",
    imagen: "assets/img/apps/admon.webp",
    para: "Rectores y administrativos",
    icono: "colegio",
    frase: "Desde aquí el colegio decide, y ve si lo que decidió está pasando.",
    piezas: [
      { nombre: "Comunicación", icono: "agenda",
        texto: "Con los padres, y con confirmación de lectura en tiempo real." },
      { nombre: "Directorio", icono: "familia",
        texto: "Uno solo, con estudiantes, docentes y padres." },
      { nombre: "Anuncios", icono: "megafono",
        texto: "Segmentados por plataforma: cada quien recibe lo suyo." },
      { nombre: "Cupos", icono: "cuadros",
        texto: "Gestión de cupos por curso, al día." },
      { nombre: "Calendario", icono: "calendario",
        texto: "Institucional, con recordatorios automáticos." },
      { nombre: "Trazabilidad", icono: "grafico",
        texto: "Quién usa la plataforma, cuánto y para qué." }
    ] },

  { nombre: "i'Witeachers",
    imagen: "assets/img/apps/witeacher.webp",
    para: "Docentes",
    icono: "teachers",
    frase: "Libertad pedagógica real: el docente arma lo suyo, no escoge de un catálogo.",
    piezas: [
      { nombre: "Nivel cognitivo", icono: "grafico",
        texto: "El de cada estudiante, tema por tema." },
      { nombre: "Tareas", icono: "tareas",
        texto: "Las asigna sin restricción de contenido." },
      { nombre: "Calificaciones", icono: "lista",
        texto: "El registro, donde siempre lo encuentra." },
      { nombre: "Comunicación", icono: "agenda",
        texto: "Con los padres y con la administración." }
    ] },

  { nombre: "I'Witutor",
    imagen: "assets/img/apps/witutor.webp",
    para: "Padres de familia",
    icono: "familia",
    frase: "El papá ve el colegio de su hijo, no un boletín cada dos meses.",
    piezas: [
      { nombre: "Tareas", icono: "tareas",
        texto: "Le avisa cuáles tienen sus hijos." },
      { nombre: "Agenda", icono: "agenda",
        texto: "Los mensajes del colegio, sin perderse entre cien de WhatsApp." },
      { nombre: "Progreso", icono: "grafico",
        texto: "El seguimiento, tema por tema." },
      { nombre: "Informes", icono: "lista",
        texto: "Comportamiento, rendimiento y cumplimiento." },
      { nombre: "Calendario", icono: "calendario",
        texto: "Los eventos institucionales, donde los ve." }
    ] },

  { nombre: "I'Witown",
    imagen: "assets/img/apps/iwitown.webp",
    para: "Estudiantes",
    icono: "juego",
    frase: "La cara que ve el niño. Y la que hace que quiera entrar.",
    piezas: [
      { nombre: "Work", icono: "tareas",
        texto: "Sus tareas asignadas." },
      { nombre: "WiPlan", icono: "calendario",
        texto: "Su calendario." },
      { nombre: "Wiwi Quest", icono: "juego",
        texto: "Donde se mide, gana puntos y avanza." }
    ] }
];

/* ============================================================
   SE ARMA EL MAPA

   La mecánica y los dibujos están en js/mapa.js.
   ============================================================ */

(function () {
  if (typeof window.crearMapa !== "function") return;

  window.crearMapa({
    caja: "ecoMapa",
    pasos: ECO_PLATAFORMAS,
    numerado: false,          /* no son pasos: son cuatro que conviven */
    aLado: true,              /* los iconos al lado y la foto abajo */
    pista: "Toca cada icono para saber qué hace"
  });
})();
