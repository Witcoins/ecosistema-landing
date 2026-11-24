/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — Donar artículos (/feria/donar). Va DESPUÉS de       │
   │ fiesta.js (usa window.Feria para el sonido y las serpentinas) y de   │
   │ adultos.js (la raya de avance y las secciones que aparecen).         │
   │                                                                      │
   │  1. Pide al servidor los artículos y sus precios, y si está abierto. │
   │  2. Arma el paquete: "Agregar" pone el mínimo y luego − / +.         │
   │  3. La barra de abajo muestra el total; "Continuar" abre los datos.  │
   │  4. Pagar: el servidor firma el pago y se va a la pasarela de Wompi. │
   │  5. Al volver (?ref=...) pregunta al servidor cómo quedó el pago.    │
   │                                                                      │
   │ El precio lo calcula el servidor al firmar: lo de aquí es solo para  │
   │ mostrar. Contrato: witown_be, feria_donar_articulos_service.         │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  // En local (firebase serve) se usa el backend local de Docker (puerto 5001).
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = (LOCAL ? "http://localhost:5001" : (document.body.getAttribute("data-api") || "")).replace(/\/+$/, "");
  var BASE = API + "/feria/donar-articulos";
  var WOMPI = "https://checkout.wompi.co/p/";
  var Feria = window.Feria || {};

  var $ = function (sel) { return document.querySelector(sel); };
  var grilla = $("[data-grilla]");
  var estado = $("[data-estado]");
  var barra = $("[data-barra]");
  var secDatos = $("[data-seccion-datos]");
  var form = $("[data-form]");
  var errorEl = $("[data-error]");
  var botonPagar = $("[data-pagar]");

  var articulos = [];
  var maxTotal = 0;
  var cant = {};          // id del artículo → cantidad elegida
  var enviando = false;

  function pesos(v) { return "$" + Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fiesta(el, n) {
    if (Feria.caja) Feria.caja();
    if (Feria.serpentinasEn && el) Feria.serpentinasEn(el, n || 10);
  }

  function pedir(metodo, ruta, cuerpo) {
    var op = { method: metodo, headers: { "Accept": "application/json" } };
    if (cuerpo) { op.headers["Content-Type"] = "application/json"; op.body = JSON.stringify(cuerpo); }
    return fetch(BASE + ruta, op).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, datos: d || {} }; });
    });
  }

  /* ---------- 1. Artículos ---------- */
  function cargar() {
    estado.textContent = "Cargando los artículos…";
    pedir("GET", "").then(function (r) {
      if (r.status === 404) {
        estado.innerHTML = '<span class="fa-alerta" style="display:block">' + esc(r.datos.message || "Las donaciones de artículos para la feria están cerradas.") + "</span>";
        return;
      }
      if (!r.ok) throw new Error();
      articulos = r.datos.articulos || [];
      maxTotal = r.datos.max_total_cop || 0;
      if (r.datos.aviso) $("[data-aviso]").textContent = r.datos.aviso;
      var nombre = r.datos.colegio && r.datos.colegio.nombre;
      if (nombre) $("[data-colegio]").textContent = " de " + nombre;
      estado.textContent = "";
      pintar();
    }).catch(function () {
      estado.innerHTML = 'No pudimos cargar los artículos. <button type="button" class="dn-reintentar fa-boton">Intentar de nuevo</button>';
      var b = estado.querySelector(".dn-reintentar");
      if (b) b.addEventListener("click", cargar);
    });
  }

  function pintar() {
    grilla.innerHTML = articulos.map(function (a) {
      var minTxt = a.minimo > 1 ? "Desde " + a.minimo + " " + esc(a.unidad) : "Desde 1 " + (a.unidad === "bolsas" ? "bolsa" : esc(a.unidad));
      var por = a.unidad === "bolsas" ? "la bolsa" : "c/u";
      return '<li class="dn-art" data-id="' + esc(a.id) + '">' +
        "<h3>" + esc(a.nombre) + "</h3>" +
        '<p class="dn-art-det">' + esc(a.detalle) + "</p>" +
        '<p class="dn-art-precio">' + pesos(a.precio_cop) + "<small>" + por + "</small></p>" +
        '<p class="dn-art-min">' + minTxt + "</p>" +
        '<div class="dn-control"></div>' +
        '<p class="dn-art-sub" aria-live="polite"></p>' +
        "</li>";
    }).join("");
    articulos.forEach(function (a) { pintarControl(a); });
  }

  function porId(id) { for (var i = 0; i < articulos.length; i++) if (articulos[i].id === id) return articulos[i]; return null; }

  /* ---------- 2. Armar el paquete ---------- */
  function pintarControl(a) {
    var li = grilla.querySelector('[data-id="' + a.id + '"]');
    if (!li) return;
    var caja = li.querySelector(".dn-control");
    var n = cant[a.id] || 0;
    li.classList.toggle("elegido", n > 0);
    li.querySelector(".dn-art-sub").textContent = n > 0 ? "Subtotal " + pesos(n * a.precio_cop) : "";
    if (!n) {
      caja.innerHTML = '<button type="button" class="dn-agregar">Agregar ' + a.minimo + "</button>";
      caja.querySelector("button").addEventListener("click", function (e) {
        cant[a.id] = a.minimo;
        fiesta(e.currentTarget, 12);
        pintarControl(a);
        totales();
        var inp = caja.querySelector("input");
        if (inp) inp.focus();
      });
      return;
    }
    caja.innerHTML = '<div class="dn-cant">' +
      '<button type="button" data-menos aria-label="Quitar uno de ' + esc(a.nombre) + '">−</button>' +
      '<input type="number" inputmode="numeric" min="' + a.minimo + '" max="' + a.maximo + '" value="' + n + '" aria-label="Cantidad de ' + esc(a.nombre) + '">' +
      '<button type="button" data-mas aria-label="Agregar uno de ' + esc(a.nombre) + '">+</button>' +
      "</div>";
    var inp = caja.querySelector("input");
    caja.querySelector("[data-menos]").addEventListener("click", function () {
      var v = (cant[a.id] || 0) - 1;
      // Por debajo del mínimo el artículo sale del paquete.
      cambiar(a, v < a.minimo ? 0 : v, true);
    });
    caja.querySelector("[data-mas]").addEventListener("click", function () {
      cambiar(a, Math.min(a.maximo, (cant[a.id] || 0) + 1), false);
    });
    inp.addEventListener("input", function () {
      var v = parseInt(inp.value, 10);
      if (!isNaN(v) && v >= a.minimo && v <= a.maximo) { cant[a.id] = v; actualizarSub(a); totales(); }
    });
    inp.addEventListener("change", function () {
      var v = parseInt(inp.value, 10);
      if (isNaN(v) || v <= 0) { cambiar(a, 0, true); return; }
      cambiar(a, Math.max(a.minimo, Math.min(a.maximo, v)), false);
    });
  }

  function actualizarSub(a) {
    var li = grilla.querySelector('[data-id="' + a.id + '"]');
    if (li) li.querySelector(".dn-art-sub").textContent = cant[a.id] ? "Subtotal " + pesos(cant[a.id] * a.precio_cop) : "";
  }

  function cambiar(a, v, repintar) {
    var antes = cant[a.id] || 0;
    if (v > 0) cant[a.id] = v; else delete cant[a.id];
    if (repintar || !antes !== !v) pintarControl(a);
    else {
      var inp = grilla.querySelector('[data-id="' + a.id + '"] input');
      if (inp) inp.value = v;
      actualizarSub(a);
    }
    if (!v) {
      var boton = grilla.querySelector('[data-id="' + a.id + '"] .dn-agregar');
      if (boton) boton.focus();
    }
    totales();
  }

  function elegidos() {
    return articulos.filter(function (a) { return cant[a.id] > 0; })
      .map(function (a) { return { a: a, n: cant[a.id], sub: cant[a.id] * a.precio_cop }; });
  }

  /* ---------- 3. Total ---------- */
  function totales() {
    var lista = elegidos();
    var total = lista.reduce(function (s, x) { return s + x.sub; }, 0);
    barra.hidden = lista.length === 0;
    document.body.classList.toggle("con-barra", lista.length > 0);
    $("[data-barra-cant]").textContent = lista.length === 1 ? "1 artículo" : lista.length + " artículos";
    $("[data-barra-total]").textContent = pesos(total);
    if (!lista.length) secDatos.hidden = true;
    if (!secDatos.hidden) resumen();
    return total;
  }

  function resumen() {
    var lista = elegidos();
    var total = lista.reduce(function (s, x) { return s + x.sub; }, 0);
    $("[data-resumen]").innerHTML = lista.map(function (x) {
      return '<div class="fila"><span>' + x.n + " · " + esc(x.a.nombre) + "</span><b>" + pesos(x.sub) + "</b></div>";
    }).join("") +
      '<div class="tot"><span>Total</span><span>' + pesos(total) + "</span></div>" +
      '<button type="button" class="editar" data-editar>Cambiar artículos</button>';
    $("[data-editar]").addEventListener("click", function () {
      document.getElementById("articulos").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    botonPagar.textContent = "Pagar " + pesos(total) + " con Wompi";
  }

  // Con el formulario a la vista la barra sobra (y taparía el botón de pagar).
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      barra.classList.toggle("dn-barra--oculta", es[0].isIntersecting);
    }, { threshold: 0 }).observe(form);
  }

  $("[data-barra-btn]").addEventListener("click", function (e) {
    e.preventDefault();
    if (!elegidos().length) return;
    secDatos.hidden = false;
    resumen();
    secDatos.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- 4. Pagar ---------- */
  function mostrarError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
    if (msg) errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (enviando) return;
    mostrarError("");
    var lista = elegidos();
    if (!lista.length) { mostrarError("Elija al menos un artículo."); return; }
    var total = lista.reduce(function (s, x) { return s + x.sub; }, 0);
    if (maxTotal && total > maxTotal) { mostrarError("El total no puede pasar de " + pesos(maxTotal) + " en un solo pago."); return; }

    // Campos obligatorios: se marca el primero que falte.
    var faltante = null;
    form.querySelectorAll("input[required], select[required]").forEach(function (c) {
      var bien = c.type === "checkbox" ? c.checked : c.checkValidity() && c.value.trim() !== "";
      if (c.type !== "checkbox") c.setAttribute("aria-invalid", bien ? "false" : "true");
      if (!bien && !faltante) faltante = c;
    });
    if (faltante) {
      mostrarError(faltante.type === "checkbox"
        ? "Para continuar debe aceptar las dos casillas."
        : faltante.type === "email" && faltante.value ? "Revise el correo: no parece válido." : "Faltan datos de facturación.");
      faltante.focus();
      return;
    }

    var f = form.elements;
    var cuerpo = {
      items: lista.map(function (x) { return { id: x.a.id, cantidad: x.n }; }),
      a_nombre_de: f.a_nombre_de.value.trim(),
      acepta_aviso: f.acepta_aviso.checked,
      sitio_web: f.sitio_web.value,
      datos_facturacion: {
        tipo_documento: f.tipo_documento.value,
        num_documento: f.num_documento.value.trim(),
        nombres: f.nombres.value.trim(),
        apellidos: f.apellidos.value.trim(),
        email: f.email.value.trim(),
        telefono: f.telefono.value.trim(),
        direccion: f.direccion.value.trim(),
        ciudad: f.ciudad.value.trim(),
        departamento: f.departamento.value.trim()
      }
    };

    enviando = true;
    botonPagar.disabled = true;
    var textoBoton = botonPagar.textContent;
    botonPagar.textContent = "Preparando el pago…";
    pedir("POST", "/checkout", cuerpo).then(function (r) {
      if (!r.ok || !r.datos.reference) {
        throw new Error(r.datos.message || r.datos.error || "No se pudo preparar el pago. Intente de nuevo.");
      }
      var d = r.datos;
      var vuelta = location.origin + "/feria/donar?ref=" + encodeURIComponent(d.reference);
      var url = WOMPI + "?" + [
        "public-key=" + encodeURIComponent(d.public_key),
        "currency=" + encodeURIComponent(d.currency),
        "amount-in-cents=" + encodeURIComponent(d.amount_in_cents),
        "reference=" + encodeURIComponent(d.reference),
        "signature:integrity=" + encodeURIComponent(d.signature),
        "redirect-url=" + encodeURIComponent(vuelta),
        "customer-data:email=" + encodeURIComponent(cuerpo.datos_facturacion.email),
        "customer-data:full-name=" + encodeURIComponent(cuerpo.datos_facturacion.nombres + " " + cuerpo.datos_facturacion.apellidos)
      ].join("&");
      location.href = url;
    }).catch(function (err) {
      enviando = false;
      botonPagar.disabled = false;
      botonPagar.textContent = textoBoton;
      mostrarError(err && err.message && err.message !== "Failed to fetch" ? err.message : "No hay conexión con el servidor. Intente de nuevo.");
    });
  });

  /* ---------- 5. Al volver de Wompi ---------- */
  // Se busca la referencia en toda la dirección: no depende de cómo Wompi
  // agregue su propio parámetro (?id= o &id=) al volver.
  var hallada = location.search.match(/fd_[0-9a-f]{32}/);
  var ref = hallada ? hallada[0] : "";
  var secRes = $("#resultado");
  var intentos = 0;
  var MAX_INTENTOS = 10;     // ~40 s: PSE y Nequi a veces tardan en confirmar

  function pintarResultado(clase, titulo, texto, d) {
    secRes.hidden = false;
    secRes.className = "fa-seccion dn-resultado" + (clase ? " " + clase : "");
    var lista = d && d.items && d.items.length ? "<ul>" + d.items.map(function (i) {
      return "<li><span>" + i.cantidad + " · " + esc(i.nombre) + "</span><b>" + pesos(i.subtotal_cop) + "</b></li>";
    }).join("") + "<li><span><b>Total</b></span><b>" + pesos(d.monto_cop) + "</b></li></ul>" : "";
    secRes.innerHTML = '<div class="dn-res-caja"><h2>' + titulo + "</h2>" + texto + lista +
      '<a class="dn-otra" href="/feria/donar">Hacer otra donación</a></div>';
  }

  function revisar() {
    intentos++;
    pedir("POST", "/confirmar", { reference: ref }).then(function (r) {
      var d = r.datos || {};
      if (!r.ok) {
        pintarResultado("mal", "No encontramos el pago", "<p>" + esc(d.message || "Revise el enlace o intente donar de nuevo.") + "</p>");
        return;
      }
      var e = d.estado;
      if (e === "aprobado") {
        pintarResultado("", "¡Gracias!", "<p>Su donación quedó registrada" + (d.a_nombre_de ? " a nombre de <b>" + esc(d.a_nombre_de) + "</b>" : "") +
          ". La factura le llegará al correo. i'Witown compra los artículos y los lleva a la feria.</p>", d);
        fiesta(secRes.querySelector("h2"), 30);
      } else if (e === "pendiente" && intentos < MAX_INTENTOS) {
        pintarResultado("mal", "Confirmando…", '<p><span class="dn-girando" aria-hidden="true"></span>Estamos esperando la respuesta del banco. No cierre esta página.</p>', d);
        setTimeout(revisar, 4000);
      } else if (e === "pendiente") {
        pintarResultado("mal", "Pago en proceso", "<p>El banco todavía no confirma el pago. Si se aprueba, la donación queda registrada sola y la factura le llega al correo. Ya puede cerrar esta página.</p>", d);
      } else if (e === "monto_invalido" || e === "aprobado_sin_registrar") {
        pintarResultado("mal", "Lo revisamos", "<p>Recibimos el pago, pero hay que revisarlo a mano. No vuelva a pagar: i'Witown se pone en contacto con usted.</p>", d);
      } else {
        pintarResultado("mal", "No se aprobó", "<p>El pago no se aprobó y no se cobró nada. Puede intentarlo de nuevo.</p>", d);
      }
    }).catch(function () {
      if (intentos < MAX_INTENTOS) { setTimeout(revisar, 4000); return; }
      pintarResultado("mal", "Sin conexión", "<p>No pudimos consultar el pago. Si se aprobó, la donación queda registrada sola. Puede recargar esta página en un momento.</p>");
    });
  }

  if (ref) {
    pintarResultado("mal", "Confirmando…", '<p><span class="dn-girando" aria-hidden="true"></span>Consultando su pago…</p>');
    secRes.scrollIntoView({ block: "start" });
    revisar();
  }

  cargar();
})();
