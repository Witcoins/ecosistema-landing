/* ============================================================
   AdmonWitown — La app de quien dirige el colegio
   ============================================================

   Antes era una maqueta dibujada a mano. Ahora son las capturas de
   verdad, igual que las otras tres apps.

   ┌──────────────────────────────────────────────────────────┐
   │  QUÉ SE PUEDE CAMBIAR AQUÍ                               │
   │                                                          │
   │  Cada bloque de abajo es una pantalla, en el orden en    │
   │  que se ven:                                             │
   │                                                          │
   │    imagen    el archivo, en assets/img/admon/            │
   │    seccion   el nombre corto, para los puntos            │
   │    pastilla  lo que dice la etiqueta de la app           │
   │    icono     cuál del menú de la izquierda se enciende   │
   │    enElRiel  si se llega tocando ese icono               │
   │    texto     la frase que se lee al pie                  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  LOS DATOS DE LAS CAPTURAS NO SON DE NADIE               │
   │                                                          │
   │  Las capturas venían con el nombre de la rectora, el de  │
   │  su colegio, los de cinco estudiantes, los de cinco      │
   │  docentes con su correo, y una tabla de acudientes con   │
   │  sus datos de uso. Todo eso se reemplazó por nombres de  │
   │  ejemplo antes de meterlas aquí.                         │
   │                                                          │
   │  Si algún día se cambian las imágenes, hay que volver a  │
   │  revisarlo: esta página es pública.                      │
   └──────────────────────────────────────────────────────────┘

   La mecánica está en js/app-visor.js, la misma de las otras apps.
   ============================================================ */

var ADMON_PASOS = [

  { imagen: "assets/img/admon/p-inicio.webp",
    seccion: "Inicio",
    pastilla: "",                 /* en el inicio la app no muestra pastilla */
    icono: "casa",
    enElRiel: true,
    texto: "Su colegio entero, desde que entra." },

  { imagen: "assets/img/admon/p-anuncios.webp",
    seccion: "Anuncios",
    pastilla: "Mensajería",
    icono: "agenda",
    enElRiel: true,
    texto: "Un anuncio, y escoge a quién le llega." },

  { imagen: "assets/img/admon/p-calendario.webp",
    seccion: "Calendario",
    pastilla: "Mensajería",
    icono: "informes",
    enElRiel: true,
    texto: "El calendario institucional, desde su escritorio." },

  { imagen: "assets/img/admon/p-estudiantes.webp",
    seccion: "Asignaciones",
    pastilla: "Asignaciones",
    icono: "colegio",
    enElRiel: true,
    texto: "Administra todo lo de su colegio: grados, áreas y cupos." },

  { imagen: "assets/img/admon/p-docentes.webp",
    seccion: "Profesores",
    pastilla: "Profesores",
    icono: "teachers",
    enElRiel: true,
    texto: "Su comunidad entra o sale del ecosistema a un clic." },

  { imagen: "assets/img/admon/p-uso.webp",
    seccion: "Informes de uso",
    pastilla: "Papás / Tutores",
    icono: "grupo",
    enElRiel: true,
    texto: "Ya puede ver qué papá acompaña a su hijo en el proceso." }
];

/* El menú lateral, de arriba abajo */
var ADMON_RIEL = ["casa", "agenda", "informes", "colegio", "teachers", "grupo"];

/* ============================================================
   QUIÉN ENTRÓ

   Es lo que dice la franja de arriba. Ojo: también está escrito
   dentro de las imágenes, así que si se cambia aquí, hay que
   cambiarlo allá.
   ============================================================ */

var ADMON_QUIEN = {
  usuario: "Camila Ospina Rojas",
  colegio: "Colegio Santa María"
};

/* Cuánto se queda cada pantalla mientras el recorrido va solo */
var ADMON_SEGUNDOS = 4.2;

/* Esta app va callada, igual que las otras */
var ADMON_VOZ = false;

var ADMON_NARRACION = { archivo: "", marcas: [ 0 ] };

/* ============================================================
   SE ARMA LA APP
   ============================================================ */

(function () {
  if (typeof window.crearVisorDeApp !== "function") return;

  var app = window.crearVisorDeApp({
    clase:     "admon",
    nombre:    "AdmonWitown",
    marca:     "ADMONWITOWN",
    quien:     ADMON_QUIEN,
    riel:      ADMON_RIEL,
    pasos:     ADMON_PASOS,
    segundos:  ADMON_SEGUNDOS,
    voz:       ADMON_VOZ,
    narracion: ADMON_NARRACION
  });

  window.admonHTML     = app.html;
  window.admonArrancar = app.arrancar;
  window.admonDetener  = app.detener;
})();
