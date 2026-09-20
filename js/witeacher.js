/* ============================================================
   i'Witown — I'Witeacher, la app de la profesora
   ============================================================

   Es lo que se ve al hacer clic en I'Witeacher, en la rueda del
   ecosistema. Igual que I'Witutor: es la app, con su marco
   morado, su menú lateral y las capturas reales por dentro, y se
   puede maniobrar.

   ┌──────────────────────────────────────────────────────────┐
   │  LAS PANTALLAS ESTÁN EN "WITEACHER_PASOS".               │
   │                                                          │
   │  Hoy son trece: once del menú lateral y dos más que se   │
   │  abren desde el gestor de tareas —las actividades        │
   │  interactivas y una sopa de letras ya armada—.           │
   │                                                          │
   │  Para cambiar una frase, se edita el texto y ya. Cada    │
   │  bloque dice:                                            │
   │    imagen    la captura, ya recortada                    │
   │    seccion   el nombre corto, para los puntos            │
   │    pastilla  lo que dice la app arriba, en el centro     │
   │    icono     cuál icono del menú lateral se prende       │
   │    enElRiel  si tiene su propio icono en el menú         │
   │    texto     la frase que se lee al pie                  │
   │    toques    zonas de la captura en las que se puede     │
   │              hacer clic                                  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  DATOS DE EJEMPLO                                        │
   │                                                          │
   │  Las capturas salieron de la plataforma de verdad. En    │
   │  las que traían datos personales —la cédula y el correo  │
   │  de la docente, los nombres de siete estudiantes y de    │
   │  sus acudientes, y la conversación de la comunidad— se   │
   │  reemplazaron por datos de ejemplo antes de meterlas.    │
   │                                                          │
   │  Las capturas originales están en el escritorio, en la   │
   │  carpeta Witeacher. Las de aquí ya vienen limpias.       │
   └──────────────────────────────────────────────────────────┘

   La mecánica está en js/app-visor.js, la misma de I'Witutor.
   ============================================================ */

var WITEACHER_PASOS = [

  { imagen: "assets/img/witeacher/p-inicio.webp",
    seccion: "Inicio",
    pastilla: "",                 /* en el inicio la app no muestra pastilla */
    icono: "casa",
    enElRiel: true,
    texto: "Su día de clase, ordenado desde que entra." },

  { imagen: "assets/img/witeacher/p-agenda.webp",
    seccion: "Agenda",
    pastilla: "Agenda para Padres",
    icono: "agenda",
    enElRiel: true,
    texto: "Le escribe a los papás de todo el grupo, de una." },

  { imagen: "assets/img/witeacher/p-tareas.webp",
    seccion: "Tareas",
    pastilla: "Gestor de tareas",
    icono: "tareas",
    enElRiel: true,
    texto: "Estas son las modalidades y cientos de actividades con las que armas tu clase o asignas tareas." },


  { imagen: "assets/img/witeacher/p-lectura.webp",
    seccion: "Lectura",
    pastilla: "Lectura - Tercero",
    icono: "lectura",
    enElRiel: true,
    texto: "La potente herramienta para fortalecer la lectura y su comprensión." },

  { imagen: "assets/img/witeacher/p-portal.webp",
    seccion: "Portal Witown",
    pastilla: "Portal Witown",
    icono: "portal",
    enElRiel: true,
    texto: "Los datos en tiempo real de cada estudiante." }
];


/* El menú lateral, de arriba abajo */
var WITEACHER_RIEL = ["casa", "agenda", "tareas", "lectura", "portal"];

/* ============================================================
   QUIÉN ENTRÓ

   Es lo que dice la franja morada de arriba. Se cambia aquí.
   ============================================================ */

var WITEACHER_QUIEN = {
  usuario: "Paula Andrea León",
  colegio: "Colegio Santa María"
};

/* Cuánto se queda cada pantalla mientras el recorrido va solo */
var WITEACHER_SEGUNDOS = 4.2;

/* Igual que I'Witutor, esta app va callada. Para ponerle voz,
   las instrucciones están en js/witutor.js: es el mismo mecanismo. */
var WITEACHER_VOZ = false;

var WITEACHER_NARRACION = { archivo: "", marcas: [ 0 ] };

/* ============================================================
   SE ARMA LA APP
   ============================================================ */

(function () {
  if (typeof window.crearVisorDeApp !== "function") return;

  var app = window.crearVisorDeApp({
    clase:     "witeacher",
    nombre:    "I'Witeacher",
    marca:     "WITEACHER",
    quien:     WITEACHER_QUIEN,
    riel:      WITEACHER_RIEL,
    pasos:     WITEACHER_PASOS,
    segundos:  WITEACHER_SEGUNDOS,
    voz:       WITEACHER_VOZ,
    narracion: WITEACHER_NARRACION
  });

  window.witeacherHTML     = app.html;
  window.witeacherArrancar = app.arrancar;
  window.witeacherDetener  = app.detener;
})();
