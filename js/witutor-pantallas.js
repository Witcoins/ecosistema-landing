/* ============================================================
   i'Witown — Cuatro pantallas de I'Witutor, dibujadas
   ============================================================

   Las otras siete secciones de I'Witutor son capturas de la app.
   Estas cuatro no: están dibujadas con HTML, copiando la captura.

   ┌──────────────────────────────────────────────────────────┐
   │  ¿POR QUÉ DIBUJADAS Y NO EN FOTO?                        │
   │                                                          │
   │  Por dos razones:                                        │
   │                                                          │
   │  1. Se ven nítidas a cualquier tamaño. Una captura de    │
   │     computador metida en un marco de 550 px se ve        │
   │     borrosa; esto no.                                    │
   │                                                          │
   │  2. Los datos son de ejemplo. Las capturas traían el     │
   │     correo, el teléfono y la cédula de una persona de    │
   │     verdad, y esto se va a publicar en internet.         │
   │                                                          │
   │  Si algún día se prefiere la captura, se cambia en       │
   │  js/witutor.js el "dibujo" por un "imagen" con la ruta   │
   │  del recorte, y listo. Las dos maneras funcionan.        │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │  PARA CAMBIAR LO QUE DICEN                               │
   │                                                          │
   │  Todo el texto está aquí abajo, en "WITUTOR_DATOS". Se   │
   │  edita ahí y ya: el dibujo se acomoda solo.              │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var WITUTOR_DATOS = {

  /* ---------- Gana Witkis ---------- */
  ganawitkis: {
    titulo: "Responde y Gana Witkis",
    saldo: "§12.434",
    tiempoDeHoy: "10:00",
    pregunta: "Nombre del primer hombre en pisar la luna: (dos palabras)",
    moneda: "MONEDA: GOLD",
    reloj: "00:21",
    avance: 62,                    // qué tanto va la barra, de 0 a 100
    ganados: "+§0"
  },

  /* ---------- Banco ---------- */
  banco: {
    titulo: "Banco",
    sub: "Gana witkis y pásaselos a tus hijos.",
    boton: "Transferir witkis",
    ganado: "+§12.434",
    transferido: "-§0",
    disponible: "§12.434",
    movimientos: [
      { fecha: "1 de septiembre de 2026", tipo: "Ingreso", concepto: "Gana Witkis", monto: "+§312" },
      { fecha: "1 de septiembre de 2026", tipo: "Ingreso", concepto: "Gana Witkis", monto: "+§177" },
      { fecha: "1 de septiembre de 2026", tipo: "Ingreso", concepto: "Gana Witkis", monto: "+§299" },
      { fecha: "1 de septiembre de 2026", tipo: "Ingreso", concepto: "Gana Witkis", monto: "+§324" },
      { fecha: "1 de septiembre de 2026", tipo: "Ingreso", concepto: "Gana Witkis", monto: "+§196" }
    ]
  },

  /* ---------- Perfil ----------
     Ojo: el correo, el celular y la fecha son de ejemplo, a
     propósito. No poner aquí los de una persona de verdad. */
  perfil: {
    nombre: "Fernando Lenin Begambre Begambre",
    vinculados: "2",
    correo: "acudiente@ejemplo.edu.co",
    celular: "300 000 0000",
    nacimiento: "1979-07-30",
    genero: "Masculino",
    nivel: "Tecnólogo",
    pestanas: ["Datos personales", "Estudiantes vinculados", "Actividad parental"],
    boton: "Cambiar/Eliminar datos personales"
  },

  /* ---------- Institucional ---------- */
  institucional: {
    titulo: "Institucional",
    sub: "Accesos que el colegio ha publicado y radicación de PQRS.",
    colegio: "Colegio Gimnasio Cordilleras",
    pestanas: ["Accesos", "PQRS"],
    intro: "Radica ante el colegio una Petición, Queja, Reclamo, Sugerencia o Felicitación. " +
           "Los campos marcados con * son obligatorios.",
    campos: [
      { rotulo: "Tipo de solicitud", valor: "Selecciona...", lista: true,  vacio: true },
      { rotulo: "Asunto",            valor: "Resumen breve de tu solicitud", vacio: true },
      { rotulo: "Nombres",           valor: "Fernando Lenin" },
      { rotulo: "Apellidos",         valor: "Begambre Begambre" },
      { rotulo: "Tipo de documento", valor: "CC", lista: true },
      { rotulo: "Número de documento", valor: "1 000 000 000" },
      { rotulo: "Correo electrónico", valor: "acudiente@ejemplo.edu.co" },
      { rotulo: "Teléfono",          valor: "300 000 0000" }
    ]
  }
};

/* ============================================================
   DE AQUÍ PARA ABAJO SE DIBUJA
   ============================================================ */

var WITUTOR_PANTALLAS = (function () {

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* La flechita de los menús desplegables */
  var CHEVRON =
    '<svg class="wtp__chevron" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M6 9.5 12 15.5 18 9.5"/>' +
    '</svg>';

  var LUPA =
    '<svg class="wtp__lupa" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20.5 20.5"/>' +
    '</svg>';

  /* ---------- Gana Witkis ---------- */
  function ganawitkis() {
    var d = WITUTOR_DATOS.ganawitkis;
    return '' +
      '<div class="wtp">' +
        '<div class="wtp__encabezado">' +
          '<h3 class="wtp__titulo">' + esc(d.titulo) + '</h3>' +
          '<div class="wtp__marcadores">' +
            '<div class="wtp__marcador">' +
              '<span class="wtp__marcador-eti">SALDO</span>' +
              '<b class="wtp__marcador-val">' + esc(d.saldo) + '</b>' +
            '</div>' +
            '<div class="wtp__marcador">' +
              '<span class="wtp__marcador-eti">TIEMPO DE HOY</span>' +
              '<b class="wtp__marcador-val">' + esc(d.tiempoDeHoy) + '</b>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="wtp__dos">' +
          '<div>' +
            '<div class="wtp__pregunta">' +
              '<p class="wtp__pregunta-txt">' + esc(d.pregunta) + '</p>' +
              '<p class="wtp__moneda">' + esc(d.moneda) + '</p>' +
            '</div>' +

            '<div class="wtp__caja">' +
              '<div class="wtp__reloj-fila">' +
                '<span class="wtp__reloj-eti">Tiempo de la pregunta</span>' +
                '<span class="wtp__reloj">' + esc(d.reloj) + '</span>' +
              '</div>' +
              '<div class="wtp__barra">' +
                '<i style="width:' + (+d.avance || 0) + '%"></i>' +
              '</div>' +
              '<div class="wtp__reloj-fila wtp__reloj-fila--pie">' +
                '<span>Witkis ganados en esta sesión</span>' +
                '<b class="wtp__verde">' + esc(d.ganados) + '</b>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="wtp__caja wtp__respuesta">' +
            '<p class="wtp__respuesta-eti">Tu respuesta</p>' +
            '<span class="wtp__campo wtp__campo--foco">Escribe tu respuesta...</span>' +
            '<p class="wtp__ayuda">Presiona Enter para enviar</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- Banco ---------- */
  function banco() {
    var d = WITUTOR_DATOS.banco;

    var filas = "";
    for (var i = 0; i < d.movimientos.length; i++) {
      var m = d.movimientos[i];
      filas +=
        '<div class="wtp__fila">' +
          '<span>' + esc(m.fecha) + '</span>' +
          '<span>' + esc(m.tipo) + '</span>' +
          '<span>' + esc(m.concepto) + '</span>' +
          '<b class="wtp__verde wtp__derecha">↙ ' + esc(m.monto) + '</b>' +
        '</div>';
    }

    return '' +
      '<div class="wtp">' +
        '<div class="wtp__encabezado">' +
          '<div>' +
            '<h3 class="wtp__titulo wtp__titulo--negro">' + esc(d.titulo) + '</h3>' +
            '<p class="wtp__sub">' + esc(d.sub) + '</p>' +
          '</div>' +
          '<span class="wtp__boton">✈ ' + esc(d.boton) + '</span>' +
        '</div>' +

        '<div class="wtp__tres">' +
          '<div class="wtp__caja">' +
            '<p class="wtp__cifra-eti">Total ganado</p>' +
            '<b class="wtp__cifra wtp__naranja">' + esc(d.ganado) + '</b>' +
          '</div>' +
          '<div class="wtp__caja">' +
            '<p class="wtp__cifra-eti">Total transferido</p>' +
            '<b class="wtp__cifra wtp__verde">' + esc(d.transferido) + '</b>' +
          '</div>' +
          '<div class="wtp__caja">' +
            '<p class="wtp__cifra-eti">Saldo disponible</p>' +
            '<b class="wtp__cifra">' + esc(d.disponible) + '</b>' +
          '</div>' +
        '</div>' +

        '<span class="wtp__campo wtp__campo--busca">' + LUPA + 'Buscar en el historial...</span>' +

        '<div class="wtp__tabla">' +
          '<div class="wtp__fila wtp__fila--titulos">' +
            '<span>Fecha</span><span>Tipo</span><span>Concepto</span>' +
            '<span class="wtp__derecha">Monto</span>' +
          '</div>' +
          filas +
        '</div>' +
      '</div>';
  }

  /* ---------- Perfil ---------- */
  function perfil() {
    var d = WITUTOR_DATOS.perfil;

    var pestanas = "";
    for (var i = 0; i < d.pestanas.length; i++) {
      pestanas += '<span class="wtp__lado' + (i === 0 ? " es-actual" : "") + '">' +
                    esc(d.pestanas[i]) +
                  '</span>';
    }

    function dato(rotulo, valor, enlace) {
      return '<div class="wtp__dato">' +
               '<p class="wtp__dato-eti">' + esc(rotulo) + '</p>' +
               '<p class="wtp__dato-val' + (enlace ? " wtp__enlace" : "") + '">' +
                 esc(valor) +
               '</p>' +
             '</div>';
    }

    return '' +
      '<div class="wtp">' +
        '<div class="wtp__caja wtp__quien">' +
          '<span class="wtp__avatar">🧝</span>' +
          '<div>' +
            '<p class="wtp__quien-nombre">' + esc(d.nombre) + '</p>' +
            '<p class="wtp__quien-linea">Usuarios vinculados: ' + esc(d.vinculados) + '</p>' +
            '<p class="wtp__quien-linea wtp__enlace">' + esc(d.correo) + '</p>' +
            '<p class="wtp__quien-linea wtp__enlace">' + esc(d.celular) + '</p>' +
          '</div>' +
          '<span class="wtp__lapiz">✎</span>' +
        '</div>' +

        '<div class="wtp__con-lado">' +
          '<div class="wtp__lados">' + pestanas + '</div>' +

          '<div class="wtp__caja wtp__panel">' +
            '<h4 class="wtp__panel-tit">Datos personales</h4>' +
            '<div class="wtp__datos">' +
              dato("Nombre", d.nombre) +
              dato("Fecha de nacimiento", d.nacimiento) +
              dato("Género", d.genero, true) +
              dato("Nivel académico", d.nivel) +
              dato("Correo", d.correo) +
              dato("Celular", d.celular, true) +
              dato("Usuarios vinculados", d.vinculados) +
            '</div>' +
            '<span class="wtp__boton wtp__boton--suave">' + esc(d.boton) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- Institucional ---------- */
  function institucional() {
    var d = WITUTOR_DATOS.institucional;

    var pestanas = "";
    for (var i = 0; i < d.pestanas.length; i++) {
      pestanas += '<span class="wtp__pestana' + (i === 1 ? " es-actual" : "") + '">' +
                    esc(d.pestanas[i]) +
                  '</span>';
    }

    var campos = "";
    for (var c = 0; c < d.campos.length; c++) {
      var k = d.campos[c];
      campos +=
        '<div class="wtp__campo-caja">' +
          '<p class="wtp__campo-eti">' + esc(k.rotulo) + ' <b>*</b></p>' +
          '<span class="wtp__campo' + (k.vacio ? " es-vacio" : "") + '">' +
            esc(k.valor) + (k.lista ? CHEVRON : "") +
          '</span>' +
        '</div>';
    }

    return '' +
      '<div class="wtp">' +
        '<h3 class="wtp__titulo wtp__titulo--negro">🔗 ' + esc(d.titulo) + '</h3>' +
        '<p class="wtp__sub">' + esc(d.sub) + '</p>' +

        '<div class="wtp__colegio">' +
          '<span class="wtp__colegio-eti">Colegio:</span>' +
          '<span class="wtp__campo wtp__campo--angosto">' + esc(d.colegio) + CHEVRON + '</span>' +
        '</div>' +

        '<div class="wtp__pestanas">' + pestanas + '</div>' +

        '<div class="wtp__caja wtp__formulario">' +
          '<p class="wtp__intro">' + esc(d.intro) + '</p>' +
          '<div class="wtp__campos">' + campos + '</div>' +
        '</div>' +
      '</div>';
  }

  return {
    ganawitkis: ganawitkis,
    banco: banco,
    perfil: perfil,
    institucional: institucional
  };
})();
