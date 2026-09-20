/* ============================================================
   i'Witown — La app del estudiante, con sus capturas
   ============================================================

   Antes esta app era un dibujo hecho a mano. Ahora son las capturas
   de verdad, igual que I'Witeacher y I'Witutor.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ                               │
   │                                                          │
   │  Cada bloque de abajo es una pantalla, en el orden en    │
   │  que se ven:                                             │
   │                                                          │
   │    imagen    el archivo, en assets/img/iwitown/          │
   │    seccion   el nombre corto, para los puntos            │
   │    pastilla  lo que dice la etiqueta de la app           │
   │    icono     cuál del menú de la izquierda se enciende   │
   │    enElRiel  si se llega tocando ese icono               │
   │    texto     la frase que se lee al pie                  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  LOS DATOS DE LAS CAPTURAS NO SON DE NADIE               │
   │                                                          │
   │  Las capturas venían con el nombre real de un estudiante │
   │  y el de su colegio. Se reemplazaron por unos de         │
   │  ejemplo antes de meterlas aquí. Si algún día se         │
   │  cambian las imágenes, hay que volver a revisarlo: esta  │
   │  página es pública.                                      │
   └──────────────────────────────────────────────────────────┘

   La mecánica está en js/app-visor.js, la misma de las otras apps.
   ============================================================ */

var IWITOWN_PASOS = [

  { imagen: "assets/img/iwitown/p-inicio.webp",
    seccion: "Inicio",
    pastilla: "",                 /* en el inicio la app no muestra pastilla */
    icono: "casa",
    enElRiel: true,
    texto: "Todo su aprendizaje, adaptado a su ritmo en una misma app." },

  { imagen: "assets/img/iwitown/p-work.webp",
    seccion: "Work",
    pastilla: "Work",
    icono: "tareas",
    enElRiel: true,
    texto: "Tareas y sus resultados en tiempo real." },

  { imagen: "assets/img/iwitown/p-refuerzo.webp",
    seccion: "Refuerzo",
    pastilla: "Refuerzo",
    icono: "lectura",
    enElRiel: true,
    texto: "Un entorno que lo prepara para evaluaciones y aprendizajes a su ritmo." },

  { imagen: "assets/img/iwitown/p-movimientos.webp",
    seccion: "Movimientos",
    pastilla: "Cuenta de Witown",
    icono: "banco",
    enElRiel: true,
    texto: "Lo que aprende y estudia se le recompensa (práctica financiera)." },

  { imagen: "assets/img/iwitown/p-shopping.webp",
    seccion: "Shopping",
    pastilla: "Shopping",
    icono: "regalo",
    enElRiel: true,
    texto: "Con lo que gana compra y realiza transacciones." }
];

/* El menú lateral, de arriba abajo */
var IWITOWN_RIEL = ["casa", "tareas", "lectura", "banco", "regalo"];

/* ============================================================
   QUIÉN ENTRÓ

   Es lo que dice la franja de arriba. Ojo: también está escrito
   dentro de las imágenes, así que si se cambia aquí, hay que
   cambiarlo allá.
   ============================================================ */

var IWITOWN_QUIEN = {
  usuario: "Mateo Restrepo Vélez",
  colegio: "Colegio Santa María"
};

/* Cuánto se queda cada pantalla mientras el recorrido va solo */
var IWITOWN_SEGUNDOS = 4.2;

/* Esta app va callada, igual que las otras */
var IWITOWN_VOZ = false;

var IWITOWN_NARRACION = { archivo: "", marcas: [ 0 ] };

/* ============================================================
   SE ARMA LA APP
   ============================================================ */

(function () {
  if (typeof window.crearVisorDeApp !== "function") return;

  var app = window.crearVisorDeApp({
    clase:     "iwitown",
    nombre:    "I'Witown",
    marca:     "WITOWN",
    quien:     IWITOWN_QUIEN,
    riel:      IWITOWN_RIEL,
    pasos:     IWITOWN_PASOS,
    segundos:  IWITOWN_SEGUNDOS,
    voz:       IWITOWN_VOZ,
    narracion: IWITOWN_NARRACION
  });

  window.iwitownHTML     = app.html;
  window.iwitownArrancar = app.arrancar;
  window.iwitownDetener  = app.detener;
})();
