/* ============================================================
   i'Witown — La A.C.P., explicada con iconos
   ============================================================

   La sección no cuenta todo de una: muestra la progresión —cuatro
   momentos, uno detrás de otro— y cada icono explica lo suyo cuando
   se le hace clic. Así se ve limpia y, aun así, está todo.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ ABAJO                         │
   │                                                          │
   │  Cada bloque de ACP_PASOS es uno de los cuatro pasos:    │
   │                                                          │
   │    nombre    lo que se lee bajo el icono                 │
   │    icono     cuál dibujo lleva (la lista está más abajo) │
   │    frase     el renglón corto que resume el paso         │
   │    detalle   el párrafo que sale al abrirlo              │
   │    piezas    los iconos chiquitos de adentro, cada uno   │
   │              con su nombre y su explicación              │
   │                                                          │
   │  Para agregar un paso se agrega un bloque; para quitarlo │
   │  se borra. La página se acomoda sola.                    │
   └──────────────────────────────────────────────────────────┘

   Los dibujos disponibles están en MAPA_ICONOS, arriba de
   js/mapa.js: ojo, cerebro, bombillo, diana, nodos, brujula,
   cuadros, ramas, balanza, union, puntos, persona, hoja, capas,
   colegio, teachers, familia, juego, megafono, calendario,
   grafico, lista, tareas y agenda.
   ============================================================ */

var ACP_PASOS = [

  { nombre: "Estatus",
    icono: "capas",
    frase: "Los tres momentos de la comprensión.",
    detalle: "Nadie aprende desde cero: siempre se está en algún punto. " +
             "El enfoque nombra tres, y en ese orden: del <em>esto reconozco</em> " +
             "al <em>esto es</em>, y de ahí al <em>esto implica</em>.",
    piezas: [
      { nombre: "Reconozco", icono: "ojo",      texto: "Identifica lo que ve." },
      { nombre: "Es",        icono: "cerebro",  texto: "Procesa y entiende." },
      { nombre: "Implica",   icono: "bombillo", texto: "Aplica y relaciona." }
    ] },

  { nombre: "Fundamentos",
    icono: "diana",
    frase: "El piso de cada momento.",
    detalle: "Cada estatus descansa en tres fundamentos que establecen qué cuenta " +
             "como saber en ese punto. Reconocer no es procesar, y procesar no es " +
             "analizar: el enfoque no los deja confundirse.",
    piezas: [
      { nombre: "Conceptual",    icono: "diana",     texto: "Qué es y qué significa." },
      { nombre: "Procedimental", icono: "nodos",     texto: "Cómo se hace." },
      { nombre: "Actitudinal",   icono: "brujula",   texto: "Para qué y por qué." }
    ] },

  { nombre: "Principios",
    icono: "nodos",
    frase: "Las operaciones del pensamiento.",
    detalle: "Cuarenta y cinco operaciones, nombradas una por una. Cada una queda " +
             "definida con su regla propia y con lo que la separa de su vecina.",
    piezas: [
      { nombre: "Percibir",    icono: "ojo",     texto: "Notar un detalle." },
      { nombre: "Clasificar",  icono: "cuadros", texto: "Ordenar por criterios." },
      { nombre: "Descomponer", icono: "ramas",   texto: "Separar en partes." },
      { nombre: "Comparar",    icono: "balanza", texto: "Encontrar semejanzas y diferencias." },
      { nombre: "Sintetizar",  icono: "union",   texto: "Unir las partes en un todo." },
      { nombre: "Y 40 más",   icono: "puntos",  texto: "Cada una con su definición y su límite." }
    ] },

  { nombre: "Ámbitos",
    icono: "hoja",
    frase: "El techo de la progresión.",
    detalle: "Por encima del análisis hay dos territorios: resolver con criterio " +
             "propio y crear lo suyo. Ahí el conocimiento deja de ser prestado.",
    piezas: [
      { nombre: "Resolver", icono: "persona", texto: "Con criterio propio." },
      { nombre: "Crear",    icono: "hoja",    texto: "Algo que es suyo." }
    ] }
];

/* ============================================================
   SE ARMA EL MAPA

   La mecánica y los dibujos están en js/mapa.js.
   ============================================================ */

(function () {
  if (typeof window.crearMapa !== "function") return;

  window.crearMapa({
    caja: "acpRuta",
    pasos: ACP_PASOS,
    numerado: true,
    pista: "Toca cada icono para saber qué es"
  });
})();
