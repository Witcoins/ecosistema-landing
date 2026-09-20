/* ============================================================
   i'Witown — Vistas de las actividades interactivas
   ============================================================

   Cuando el visitante toca una actividad del catálogo, aquí se
   arma la pantalla que ve, con el mismo marco de la plataforma:
   barra verde arriba con el nombre, el tema y los contadores, y
   debajo el tablero de la actividad.

   ┌──────────────────────────────────────────────────────────┐
   │  TODO EL CONTENIDO DE PRUEBA ESTÁ EN ESTE ARCHIVO.       │
   │  Palabras, pistas, preguntas: se editan aquí abajo.      │
   └──────────────────────────────────────────────────────────┘

   Tres actividades tienen su propio tablero, copiado de la
   plataforma: Sopa de Letras, Crucigrama y Wiwi Jumps.
   Las demás usan una de tres plantillas —pregunta, parejas u
   ordenar— que siguen el mismo marco. Cualquiera de ellas se
   puede convertir en tablero propio más adelante.
   ============================================================ */

/* ---- Lo que se evalúa en los ejemplos ---- */
var ACT_PALABRAS = ["NUMERADOR", "DENOMINADOR", "EQUIVALENTE", "FRACCION",
                    "MITAD", "CUARTO", "ENTERO", "PARTE"];

/* ---- Las pistas del crucigrama ---- */
var ACT_CRUCIGRAMA = {
  /* fila, columna (empezando en 0), palabra y pista.
     Solo se dibujan las casillas vacías y su número, como en la
     plataforma: las letras las pone el estudiante. */
  horizontales: [
    { fila: 2, col: 1, largo: 9, pista: "Número de arriba en una fracción." },
    { fila: 4, col: 5, largo: 5, pista: "Resultado de partir un entero en dos." },
    { fila: 6, col: 0, largo: 6, pista: "Lo que se reparte completo." },
    { fila: 8, col: 4, largo: 5, pista: "Cada una de las porciones iguales." }
  ],
  verticales: [
    { fila: 0, col: 3, largo: 8, pista: "Forma de escribir una parte de un todo." },
    { fila: 2, col: 6, largo: 6, pista: "Una de cuatro partes iguales." },
    { fila: 1, col: 9, largo: 5, pista: "Otra manera de decir mitad." },
    { fila: 5, col: 1, largo: 4, pista: "Que valen lo mismo." }
  ],
  columnas: 11,
  filas: 9
};

/* ---- La pregunta de Wiwi Jumps ---- */
var ACT_JUMPS = {
  pregunta: "¿Cuántos cuartos hacen un medio?",
  estaciones: 4,
  opciones: [
    { letra: "A", numero: "1", texto: "Uno" },
    { letra: "B", numero: "2", texto: "Dos" },
    { letra: "C", numero: "3", texto: "Tres" },
    { letra: "D", numero: "4", texto: "Cuatro" }
  ]
};

/* ---- Contenido de las plantillas genéricas ---- */
var ACT_GENERICAS = {
  pregunta: {
    enunciado: "¿Cuál de estas fracciones vale lo mismo que 1/2?",
    opciones: [
      { letra: "a", texto: "2/4" },
      { letra: "b", texto: "1/3" },
      { letra: "c", texto: "3/5" },
      { letra: "d", texto: "2/6" }
    ]
  },
  parejas: {
    izquierda: ["1/2", "1/4", "3/4", "2/3"],
    derecha:   ["2/6 + 1/3", "2/8", "6/8", "4/8"]
  },
  ordenar: {
    enunciado: "Ordena de menor a mayor",
    piezas: ["1/4", "1/3", "1/2", "3/4"]
  }
};

/* Qué plantilla usa cada actividad que no tiene tablero propio */
var ACT_PLANTILLAS = {
  "Relacionar Columnas": "parejas",
  "Test":                "pregunta",
  "Completar Frases":    "ordenar",
  "Ruleta de Palabras":  "pregunta",
  "Mapa Interactivo":    "parejas",
  "Memory":              "parejas",
  "Relacionar Grupos":   "parejas",
  "Sí o No":             "pregunta",
  "Ordenar Letras":      "ordenar",
  "Video Quiz":          "pregunta",
  "Ordenar Palabras":    "ordenar",
  "Adivinanza":          "pregunta",
  "Presentación":        "ordenar",
  "Step":                "ordenar",
  "Dictado":             "pregunta",
  "Mensajería":          "pregunta",
  "AsterQuiz":           "pregunta"
};

/* ============================================================
   DE AQUÍ PARA ABAJO SE ARMAN LAS PANTALLAS
   ============================================================ */

(function () {

  function svg(interno, clase) {
    return '<svg class="' + (clase || "") + '" viewBox="0 0 24 24" fill="none" ' +
           'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
           'stroke-linejoin="round" aria-hidden="true">' + interno + "</svg>";
  }

  /* ---- Sopa de letras: coloca las palabras de verdad y rellena el resto ---- */
  function tableroSopa(palabras, filas, columnas) {
    var letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    var rejilla = [];
    var f, c;
    for (f = 0; f < filas; f++) {
      rejilla[f] = [];
      for (c = 0; c < columnas; c++) rejilla[f][c] = null;
    }

    function cabe(p, f, c, df, dc) {
      for (var i = 0; i < p.length; i++) {
        var ff = f + df * i, cc = c + dc * i;
        if (ff < 0 || cc < 0 || ff >= filas || cc >= columnas) return false;
        if (rejilla[ff][cc] !== null && rejilla[ff][cc] !== p[i]) return false;
      }
      return true;
    }

    function poner(p, f, c, df, dc) {
      for (var i = 0; i < p.length; i++) rejilla[f + df * i][c + dc * i] = p[i];
    }

    var direcciones = [[0, 1], [1, 0], [1, 1]];
    for (var n = 0; n < palabras.length; n++) {
      var p = palabras[n];
      for (var intento = 0; intento < 300; intento++) {
        var d = direcciones[Math.floor(Math.random() * direcciones.length)];
        var ff = Math.floor(Math.random() * filas);
        var cc = Math.floor(Math.random() * columnas);
        if (cabe(p, ff, cc, d[0], d[1])) { poner(p, ff, cc, d[0], d[1]); break; }
      }
    }

    var html = "";
    for (f = 0; f < filas; f++) {
      for (c = 0; c < columnas; c++) {
        var l = rejilla[f][c] || letras[Math.floor(Math.random() * letras.length)];
        html += '<span class="ax-sopa__celda">' + l + "</span>";
      }
    }
    return html;
  }

  /* ---- Crucigrama: dibuja las casillas vacías y sus números ---- */
  function tableroCrucigrama(datos) {
    var abiertas = {}, numeros = {};

    function marcar(lista, df, dc) {
      for (var i = 0; i < lista.length; i++) {
        var w = lista[i];
        for (var j = 0; j < w.largo; j++) {
          abiertas[(w.fila + df * j) + "," + (w.col + dc * j)] = true;
        }
      }
    }
    marcar(datos.horizontales, 0, 1);
    marcar(datos.verticales, 1, 0);

    // Numerar los inicios, en orden de lectura
    var inicios = [];
    datos.horizontales.forEach(function (w) { inicios.push({ f: w.fila, c: w.col, w: w, tipo: "h" }); });
    datos.verticales.forEach(function (w)   { inicios.push({ f: w.fila, c: w.col, w: w, tipo: "v" }); });
    inicios.sort(function (a, b) { return a.f - b.f || a.c - b.c; });

    var num = 0, vistos = {};
    inicios.forEach(function (x) {
      var k = x.f + "," + x.c;
      if (!vistos[k]) { num++; vistos[k] = num; numeros[k] = num; }
      x.w.numero = vistos[k];
    });

    var html = "";
    for (var f = 0; f < datos.filas; f++) {
      for (var c = 0; c < datos.columnas; c++) {
        var k = f + "," + c;
        if (abiertas[k]) {
          html += '<span class="ax-cruci__celda">' +
                    (numeros[k] ? '<i>' + numeros[k] + "</i>" : "") + "</span>";
        } else {
          html += '<span class="ax-cruci__celda ax-cruci__celda--bloque"></span>';
        }
      }
    }

    function pistas(lista) {
      return lista.slice().sort(function (a, b) { return a.numero - b.numero; })
        .map(function (w) {
          return '<li><b>' + w.numero + ".</b> " + w.pista + "</li>";
        }).join("");
    }

    return {
      rejilla: html,
      horizontales: pistas(datos.horizontales),
      verticales: pistas(datos.verticales)
    };
  }

  /* ---- Wiwi Jumps ---- */
  function tableroJumps(d) {
    var planetas = d.opciones.map(function (o) {
      return '<div class="ax-jump__planeta">' +
               '<span class="ax-jump__letra">' + o.letra + "</span>" +
               '<span class="ax-jump__num">' + o.numero + "</span>" +
               '<span class="ax-jump__texto">' + o.texto + "</span>" +
             "</div>";
    }).join("");

    var estaciones = "";
    for (var i = 0; i < d.estaciones; i++) estaciones += '<span class="ax-jump__estacion"></span>';

    return '<div class="ax-jump">' +
             '<p class="ax-jump__pregunta">' + d.pregunta + "</p>" +
             '<div class="ax-jump__planetas">' + planetas + "</div>" +
             '<div class="ax-jump__ruta">' +
               '<span class="ax-jump__punta ax-jump__punta--base"><b>◖◗</b>BASE</span>' +
               '<span class="ax-jump__linea">' + estaciones + "</span>" +
               '<span class="ax-jump__punta ax-jump__punta--torre"><b>⌂</b>TORRE</span>' +
             "</div>" +
             '<p class="ax-jump__pie">Estación <b>0</b> de ' + d.estaciones +
               " · faltan <b>" + d.estaciones + "</b> para la Torre</p>" +
           "</div>";
  }

  /* ---- Plantillas genéricas ---- */
  function plantillaPregunta() {
    var d = ACT_GENERICAS.pregunta;
    return '<div class="ax-gen">' +
             '<p class="ax-gen__enunciado">' + d.enunciado + "</p>" +
             '<div class="ax-gen__opciones">' +
               d.opciones.map(function (o) {
                 return '<div class="ax-gen__op"><span>' + o.letra + "</span>" + o.texto + "</div>";
               }).join("") +
             "</div>" +
           "</div>";
  }

  function plantillaParejas() {
    var d = ACT_GENERICAS.parejas;
    return '<div class="ax-gen ax-gen--parejas">' +
             '<div class="ax-gen__col">' +
               d.izquierda.map(function (t) { return '<div class="ax-gen__ficha">' + t + "</div>"; }).join("") +
             "</div>" +
             '<div class="ax-gen__medio">' + svg('<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>') + "</div>" +
             '<div class="ax-gen__col">' +
               d.derecha.map(function (t) { return '<div class="ax-gen__ficha ax-gen__ficha--der">' + t + "</div>"; }).join("") +
             "</div>" +
           "</div>";
  }

  function plantillaOrdenar() {
    var d = ACT_GENERICAS.ordenar;
    return '<div class="ax-gen">' +
             '<p class="ax-gen__enunciado">' + d.enunciado + "</p>" +
             '<div class="ax-gen__piezas">' +
               d.piezas.map(function (t) { return '<div class="ax-gen__pieza">' + t + "</div>"; }).join("") +
             "</div>" +
             '<div class="ax-gen__huecos">' +
               d.piezas.map(function () { return '<span class="ax-gen__hueco"></span>"'; }).join("").replace(/"/g, "") +
             "</div>" +
           "</div>";
  }

  /* ============================================================
     ARMAR LA PANTALLA COMPLETA
     ============================================================ */

  window.actividadHTML = function (act, tema) {
    var cuerpo, contador;

    if (act.nombre === "Sopa de Letras") {
      contador = "0/" + ACT_PALABRAS.length;
      cuerpo = '<div class="ax-sopa">' +
                 '<div class="ax-sopa__rejilla">' + tableroSopa(ACT_PALABRAS, 12, 12) + "</div>" +
                 '<div class="ax-sopa__palabras">' +
                   ACT_PALABRAS.map(function (p) { return "<span>" + p + "</span>"; }).join("") +
                 "</div>" +
               "</div>";

    } else if (act.nombre === "Crucigrama") {
      var cr = tableroCrucigrama(ACT_CRUCIGRAMA);
      contador = "0/" + (ACT_CRUCIGRAMA.horizontales.length + ACT_CRUCIGRAMA.verticales.length);
      cuerpo = '<div class="ax-cruci">' +
                 '<div class="ax-cruci__rejilla" style="grid-template-columns: repeat(' +
                   ACT_CRUCIGRAMA.columnas + ', 1fr)">' + cr.rejilla + "</div>" +
                 '<div class="ax-cruci__pistas">' +
                   '<p class="ax-cruci__titulo">Horizontales</p><ul>' + cr.horizontales + "</ul>" +
                   '<p class="ax-cruci__titulo ax-cruci__titulo--v">Verticales</p><ul>' + cr.verticales + "</ul>" +
                 "</div>" +
               "</div>";

    } else if (act.nombre === "Wiwi Jumps") {
      contador = "0/" + ACT_JUMPS.estaciones;
      cuerpo = tableroJumps(ACT_JUMPS);

    } else {
      var tipo = ACT_PLANTILLAS[act.nombre] || "pregunta";
      contador = "0/4";
      cuerpo = tipo === "parejas" ? plantillaParejas()
             : tipo === "ordenar" ? plantillaOrdenar()
             : plantillaPregunta();
    }

    var vidas = act.nombre === "Wiwi Jumps"
      ? '<span class="ax__chip ax__chip--vidas">♥ ♥ ♥</span>'
      : '<span class="ax__chip">0:11</span>';

    return '<div class="ax" data-color="' + (act.color || "azul") + '">' +
             '<div class="ax__barra">' +
               '<span class="ax__ico">' + svg(act.icono) + "</span>" +
               '<div class="ax__tit">' +
                 '<p class="ax__eyebrow">' + act.nombre + "</p>" +
                 "<h4>" + tema + "</h4>" +
               "</div>" +
               '<div class="ax__chips">' + vidas +
                 '<span class="ax__chip">' + contador + "</span>" +
                 '<span class="ax__chip ax__chip--ico">?</span>' +
                 '<span class="ax__chip ax__chip--ico">×</span>' +
               "</div>" +
             "</div>" +
             '<div class="ax__cuerpo">' + cuerpo + "</div>" +
           "</div>" +
           '<div class="ax__pie">' +
             '<button type="button" class="res__volver" id="axVolver">← Volver a las actividades</button>' +
             '<span class="ax__pie-btn">Adjuntar a la tarea</span>' +
             '<span class="ax__pie-btn">Corregir a mano</span>' +
             '<span class="ax__pie-btn">Generar otra versión</span>' +
           "</div>";
  };
})();
