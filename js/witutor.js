/* ============================================================
   i'Witown — I'Witutor, la app de los papás
   ============================================================

   Es lo que se ve al hacer clic en I'Witutor, en la rueda del
   ecosistema. No es un video ni un pase de fotos: es la app,
   con su marco rojo, su menú lateral y las capturas reales
   metidas por dentro.

   ┌──────────────────────────────────────────────────────────┐
   │  SE PUEDE MANIOBRAR.                                     │
   │                                                          │
   │  Al entrar se recorre sola, para que el visitante vea de │
   │  qué se trata sin tener que hacer nada. En cuanto toca   │
   │  algo —un icono del menú, una pestaña, un punto— se      │
   │  calla y lo maneja él.                                   │
   │                                                          │
   │  Va callada: la frase de cada pantalla se lee abajo.     │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  LAS PANTALLAS ESTÁN EN "WITUTOR_PASOS".                 │
   │                                                          │
   │  Hoy son once, en el mismo orden del menú lateral.       │
   │  Para cambiar una frase, se edita el texto y ya. Para    │
   │  cambiar el orden, se mueven los bloques. Para quitar    │
   │  una, se borra su bloque: el menú y los puntos se        │
   │  acomodan solos.                                         │
   │                                                          │
   │  Cada bloque dice:                                       │
   │    imagen    la captura, ya recortada (ver abajo), o     │
   │    dibujo    el nombre de una pantalla dibujada con      │
   │              HTML, de js/witutor-pantallas.js            │
   │    seccion   el nombre corto, para los puntos            │
   │    pastilla  lo que dice la app arriba, en el centro     │
   │    icono     cuál icono del menú lateral se prende       │
   │    enElRiel  si tiene su propio icono en el menú         │
   │    texto     la frase que se lee al pie                  │
   │    toques    zonas de la captura en las que se puede     │
   │              hacer clic                                  │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  LAS CAPTURAS VAN RECORTADAS.                            │
   │                                                          │
   │  En assets/img/witutor/ hay dos juegos:                  │
   │                                                          │
   │    agenda.webp      la captura completa, como salió      │
   │    p-agenda.webp    solo el contenido, sin la barra roja │
   │                     de arriba ni el menú de la izquierda │
   │                                                          │
   │  Las que usa la app son las que empiezan por "p-": el    │
   │  marco no va dentro de la imagen, lo dibuja la página.   │
   │  Por eso el menú se puede tocar y la barra de arriba     │
   │  cambia de sección.                                      │
   │                                                          │
   │  Para recortar capturas nuevas hay una herramienta:      │
   │     python herramientas/recortar-capturas.py             │
   │                                                          │
   │  Mientras un archivo no esté, esa pantalla muestra un    │
   │  recuadro con el nombre de la sección.                   │
   └──────────────────────────────────────────────────────────┘

   La mecánica —el marco, el menú, los tiempos— está en
   js/app-visor.js, y es la misma de I'Witeacher.
   ============================================================ */

var WITUTOR_PASOS = [

  { imagen: "assets/img/witutor/p-inicio.webp",
    seccion: "Inicio",
    pastilla: "",                 /* en el inicio la app no muestra pastilla */
    icono: "casa",
    enElRiel: true,
    texto: "Todo lo de tus hijos, en una sola pantalla." },

  { imagen: "assets/img/witutor/p-agenda.webp",
    seccion: "Agenda",
    pastilla: "Agenda",
    icono: "agenda",
    enElRiel: true,
    texto: "Mensajes del colegio, en tiempo real.",

    /* La pestaña "Tareas" de la captura lleva a la pantalla de
       tareas, como en la app de verdad. */
    toques: [ { a: 2, x: 38, y: 11.5, ancho: 4.8, alto: 8, rotulo: "Tareas" } ] },

  { imagen: "assets/img/witutor/p-tareas.webp",
    seccion: "Tareas",
    pastilla: "Agenda",
    icono: "agenda",
    enElRiel: false,              /* comparte el icono con Agenda */
    texto: "Revisa sus tareas, estés donde estés.",
    toques: [ { a: 1, x: 14.2, y: 11.5, ancho: 5.2, alto: 8, rotulo: "Mensajes" } ] },

  { imagen: "assets/img/witutor/p-informes.webp",
    seccion: "Informes",
    pastilla: "Informes",
    icono: "informes",
    enElRiel: true,
    texto: "Sus aprendizajes, intereses y rutinas a un clic." },

  { imagen: "assets/img/witutor/p-teachers.webp",
    seccion: "Teachers",
    pastilla: "Teachers",
    icono: "teachers",
    enElRiel: true,
    texto: "Conoce a sus profes y su perfil." },

  { imagen: "assets/img/witutor/p-lectura.webp",
    seccion: "Lectura",
    pastilla: "Lectura - Cuarto",
    icono: "lectura",
    enElRiel: true,
    texto: "Fortalece su lectura y comprensión." },


  { imagen: "assets/img/witutor/p-pagos.webp",
    seccion: "Pagos",
    pastilla: "Pagos",
    icono: "pagos",
    enElRiel: true,
    texto: "Mira qué pagos has hecho al colegio." }
];

/* El menú lateral, de arriba abajo. Los iconos que no llevan a
   ninguna pantalla salen apagados, como en la app de verdad. */
var WITUTOR_RIEL = ["casa", "agenda", "informes", "teachers", "lectura", "pagos"];

/* ============================================================
   QUIÉN ENTRÓ

   Es lo que dice la franja roja de arriba. Son datos de ejemplo:
   se cambian aquí y ya.
   ============================================================ */

var WITUTOR_QUIEN = {
  usuario: "Fernando Lenin Begambre Begambre",
  colegio: "Colegio Gimnasio Cordilleras"
};

/* Cuánto se queda cada pantalla mientras el recorrido va solo. En
   cuanto el visitante toca algo, esto deja de contar. */
var WITUTOR_SEGUNDOS = 4.2;

/* ============================================================
   ¿ESTA APP HABLA?

   Hoy no. Va callada: se ve la app, se lee la frase de abajo y
   suena la música de fondo, nada más.

   ┌──────────────────────────────────────────────────────────┐
   │  PARA PONERLE VOZ HAY DOS CAMINOS.                       │
   │                                                          │
   │  A. UNA GRABACIÓN SEGUIDA, una sola para todo. Se deja   │
   │     el archivo en assets/audio/witutor/ y se escribe su  │
   │     ruta en "archivo", aquí abajo. Las pantallas pasan   │
   │     a seguir al audio, en los segundos que digan las     │
   │     "marcas", y el recorrido deja de ir por tiempo.      │
   │                                                          │
   │  B. UNA GRABACIÓN POR PANTALLA. Se pone WITUTOR_VOZ en   │
   │     true y a cada bloque de WITUTOR_PASOS se le agrega   │
   │     audio: "assets/audio/witutor/agenda.mp3" (y así).    │
   │     Donde falte la grabación, lo dice la voz del         │
   │     computador.                                          │
   │                                                          │
   │  Con los dos puestos manda la grabación seguida.         │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var WITUTOR_VOZ = false;

var WITUTOR_NARRACION = {
  /* Vacío = sin narración seguida. */
  archivo: "",

  /* El segundo en que entra cada pantalla, en el orden de
     WITUTOR_PASOS. Tiene que haber una por pantalla —hoy once— y
     la primera es siempre 0. */
  marcas: [ 0 ]
};

/* ============================================================
   SE ARMA LA APP
   ============================================================ */

(function () {
  if (typeof window.crearVisorDeApp !== "function") return;

  var app = window.crearVisorDeApp({
    clase:     "witutor",
    nombre:    "I'Witutor",
    marca:     "WITUTOR",
    quien:     WITUTOR_QUIEN,
    riel:      WITUTOR_RIEL,
    pasos:     WITUTOR_PASOS,
    segundos:  WITUTOR_SEGUNDOS,
    voz:       WITUTOR_VOZ,
    narracion: WITUTOR_NARRACION,
    dibujos:   window.WITUTOR_PANTALLAS
  });

  window.witutorHTML     = app.html;
  window.witutorArrancar = app.arrancar;
  window.witutorDetener  = app.detener;
})();
