/* ┌──────────────────────────────────────────────────────────────────────┐
   │ Feria I'witown — Kits de pre-venta (/feria/kits). Va DESPUÉS de      │
   │ fiesta.js (window.Feria: sonido y serpentinas) y de adultos.js.      │
   │                                                                      │
   │  1. Pide al servidor los kits (precio y witkis) y si está abierto.   │
   │  2. "Agregar" suma una escarapela; cada una pide el nombre de quien  │
   │     la usa y para quién es (invitado o estudiante).                  │
   │  3. La barra de abajo muestra el total; "Continuar" baja a los datos.│
   │  4. Pagar: el servidor firma el pago y se va a la pasarela de Wompi. │
   │  5. Al volver (?ref=… o lo guardado) confirma el pago y muestra el   │
   │     QR y el número de cada escarapela, para imprimir o reclamar.     │
   │                                                                      │
   │ El precio y los witkis los calcula el servidor al firmar: lo de aquí │
   │ es solo para mostrar. Contrato: witown_be, feria_kits_service.       │
   └──────────────────────────────────────────────────────────────────────┘ */
(function () {
  // En local (firebase serve) se usa el backend local de Docker (puerto 5001).
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = (LOCAL ? "http://localhost:5001" : (document.body.getAttribute("data-api") || "")).replace(/\/+$/, "");
  var BASE = API + "/feria/kits";
  var WOMPI = "https://checkout.wompi.co/p/";
  var PENDIENTE = "feria_kit_pendiente";
  var MAX_PENDIENTE_MS = 3 * 60 * 60 * 1000;   // una compra sin confirmar se recuerda 3 horas
  var Feria = window.Feria || {};

  var $ = function (sel) { return document.querySelector(sel); };
  var grilla = $("[data-grilla]");
  var estado = $("[data-estado]");
  var barra = $("[data-barra]");
  var secLineas = $("[data-seccion-lineas]");
  var lineasEl = $("[data-lineas]");
  var secDatos = $("[data-seccion-datos]");
  var form = $("[data-form]");
  var errorEl = $("[data-error]");
  var botonPagar = $("[data-pagar]");
  var secRes = $("#resultado");

  var kits = [];
  var tipos = [];
  var maxKits = 10;
  var lineas = [];        // [{kit_id, nombre, tipo}] — una por escarapela
  var enviando = false;

  function pesos(v) { return "$" + Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function wk(v) { return Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fiesta(el, n) {
    if (Feria.caja) Feria.caja();
    if (Feria.serpentinasEn && el) Feria.serpentinasEn(el, n || 10);
  }
  function porId(id) { for (var i = 0; i < kits.length; i++) if (kits[i].id === id) return kits[i]; return null; }
  function olvidarPendiente() { try { localStorage.removeItem(PENDIENTE); } catch (e) { /* nada */ } }

  function pedir(metodo, ruta, cuerpo) {
    var op = { method: metodo, headers: { "Accept": "application/json" } };
    if (cuerpo) { op.headers["Content-Type"] = "application/json"; op.body = JSON.stringify(cuerpo); }
    return fetch(BASE + ruta, op).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, datos: d || {} }; });
    });
  }

  /* ---------- 1. Kits ---------- */
  function cargar() {
    estado.textContent = "Cargando los kits…";
    pedir("GET", "").then(function (r) {
      if (r.status === 404) {
        estado.innerHTML = '<span class="fa-alerta" style="display:block">' + esc(r.datos.message || "La pre-venta de kits para la feria está cerrada.") + "</span>";
        return;
      }
      if (!r.ok) throw new Error();
      kits = r.datos.kits || [];
      tipos = r.datos.tipos || [];
      maxKits = r.datos.max_kits || 10;
      if (r.datos.aviso) $("[data-aviso]").textContent = r.datos.aviso;
      var nombre = r.datos.colegio && r.datos.colegio.nombre;
      if (nombre) $("[data-colegio]").textContent = " para la feria de " + nombre;
      var nota = $("[data-nota]");
      if (r.datos.refrigerio_cop) {
        nota.textContent = "Cada kit incluye un bono de refrigerio (bebida y snack que se eligen en la cafetería). " +
          "Los witkis " +
          "sirven en los puestos y compras de la feria. Los juegos de los docentes (Trivis y Stop) y las fotos se pagan con la escarapela del estudiante.";
        nota.hidden = false;
      }
      estado.textContent = "";
      pintar();
    }).catch(function () {
      estado.innerHTML = 'No pudimos cargar los kits. <button type="button" class="dn-reintentar fa-boton">Intentar de nuevo</button>';
      var b = estado.querySelector(".dn-reintentar");
      if (b) b.addEventListener("click", cargar);
    });
  }

  function pintar() {
    grilla.innerHTML = kits.map(function (k) {
      return '<li class="dn-art" data-id="' + esc(k.id) + '">' +
        '<p class="dn-art-precio">' + pesos(k.precio_cop) + "</p>" +
        "<h3>" + wk(k.witkis) + " witkis</h3>" +
        '<p class="dn-art-det">+ bono de refrigerio</p>' +
        '<p class="dn-art-sub" aria-live="polite"></p>' +
        '<button type="button" class="dn-agregar">Agregar</button>' +
        "</li>";
    }).join("");
    kits.forEach(function (k) {
      var li = grilla.querySelector('[data-id="' + k.id + '"]');
      li.querySelector(".dn-agregar").addEventListener("click", function (e) { agregar(k, e.currentTarget); });
    });
  }

  /* ---------- 2. Escarapelas ---------- */
  function agregar(k, boton) {
    if (lineas.length >= maxKits) { mostrarErrorLineas("Máximo " + maxKits + " kits por pago."); return; }
    lineas.push({ kit_id: k.id, nombre: "", tipo: "" });
    fiesta(boton, 12);
    pintarLineas();
    totales();
    secLineas.hidden = false;
    var ultimo = lineasEl.querySelector("li:last-child input");
    if (ultimo) {
      ultimo.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { ultimo.focus({ preventScroll: true }); }, 350);
    }
  }

  function mostrarErrorLineas(msg) {
    var p = secLineas.querySelector(".dn-error-lineas");
    if (!p) {
      p = document.createElement("p");
      p.className = "dn-error dn-error-lineas";
      p.setAttribute("role", "alert");
      lineasEl.parentNode.insertBefore(p, lineasEl.nextSibling);
    }
    p.textContent = msg;
    p.hidden = !msg;
  }

  function pintarLineas() {
    var opciones = tipos.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.nombre) + "</option>"; }).join("");
    lineasEl.innerHTML = lineas.map(function (l, i) {
      var k = porId(l.kit_id) || {};
      return '<li class="dn-linea" data-i="' + i + '">' +
        '<div class="dn-linea-cab"><b>' + pesos(k.precio_cop) + "</b><span>" + wk(k.witkis) + " witkis + refrigerio</span>" +
        '<button type="button" class="dn-quitar" data-quitar aria-label="Quitar este kit">Quitar</button></div>' +
        '<label class="dn-campo"><span>Nombre de quien la usa</span>' +
        '<input data-nombre maxlength="80" autocomplete="off" placeholder="Nombre y apellido" value="' + esc(l.nombre) + '"></label>' +
        '<label class="dn-campo"><span>Para quién es</span>' +
        '<select data-tipo><option value="">Elija…</option>' + opciones + "</select></label>" +
        "</li>";
    }).join("");
    lineasEl.querySelectorAll(".dn-linea").forEach(function (li) {
      var i = +li.getAttribute("data-i");
      var sel = li.querySelector("[data-tipo]");
      sel.value = lineas[i].tipo;
      li.querySelector("[data-nombre]").addEventListener("input", function (e) { lineas[i].nombre = e.target.value; });
      sel.addEventListener("change", function (e) { lineas[i].tipo = e.target.value; });
      li.querySelector("[data-quitar]").addEventListener("click", function () {
        lineas.splice(i, 1);
        pintarLineas();
        totales();
        mostrarErrorLineas("");
        if (!lineas.length) { secLineas.hidden = true; secDatos.hidden = true; }
      });
    });
    kits.forEach(function (k) {
      var n = lineas.filter(function (l) { return l.kit_id === k.id; }).length;
      var li = grilla.querySelector('[data-id="' + k.id + '"]');
      if (!li) return;
      li.classList.toggle("elegido", n > 0);
      li.querySelector(".dn-art-sub").textContent = n ? (n === 1 ? "1 en su compra" : n + " en su compra") : "";
      li.querySelector(".dn-agregar").textContent = n ? "Agregar otro" : "Agregar";
    });
  }

  /* ---------- 3. Total ---------- */
  function total() {
    return lineas.reduce(function (s, l) { var k = porId(l.kit_id); return s + (k ? k.precio_cop : 0); }, 0);
  }

  function totales() {
    barra.hidden = lineas.length === 0;
    document.body.classList.toggle("con-barra", lineas.length > 0);
    $("[data-barra-cant]").textContent = lineas.length === 1 ? "1 kit" : lineas.length + " kits";
    $("[data-barra-total]").textContent = pesos(total());
    if (!secDatos.hidden) resumen();
  }

  function resumen() {
    $("[data-resumen]").innerHTML = lineas.map(function (l) {
      var k = porId(l.kit_id) || {};
      return '<div class="fila"><span>' + esc(l.nombre || "Sin nombre") + " · " + wk(k.witkis) + " witkis + refrigerio</span><b>" + pesos(k.precio_cop) + "</b></div>";
    }).join("") +
      '<div class="tot"><span>Total</span><span>' + pesos(total()) + "</span></div>" +
      '<button type="button" class="editar" data-editar>Cambiar kits</button>';
    $("[data-editar]").addEventListener("click", function () {
      document.getElementById("kits").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    botonPagar.textContent = "Pagar " + pesos(total()) + " con Wompi";
  }

  // Revisa nombre y "para quién" de cada escarapela; marca la primera que falte.
  function lineasCompletas() {
    var faltante = null;
    lineasEl.querySelectorAll(".dn-linea").forEach(function (li) {
      var i = +li.getAttribute("data-i");
      var inp = li.querySelector("[data-nombre]"), sel = li.querySelector("[data-tipo]");
      var bienN = lineas[i].nombre.trim() !== "", bienT = !!lineas[i].tipo;
      inp.setAttribute("aria-invalid", bienN ? "false" : "true");
      sel.setAttribute("aria-invalid", bienT ? "false" : "true");
      if (!faltante && !bienN) faltante = inp;
      if (!faltante && !bienT) faltante = sel;
    });
    return faltante;
  }

  // Con el formulario a la vista, la barra sobra (y taparía el botón de pagar).
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      barra.classList.toggle("dn-barra--oculta", es[0].isIntersecting);
    }, { threshold: 0 }).observe(form);
  }

  $("[data-barra-btn]").addEventListener("click", function (e) {
    e.preventDefault();
    if (!lineas.length) return;
    secLineas.hidden = false;
    var falta = lineasCompletas();
    if (falta) {
      mostrarErrorLineas("Escriba el nombre y elija para quién es cada escarapela.");
      falta.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { falta.focus({ preventScroll: true }); }, 350);
      return;
    }
    mostrarErrorLineas("");
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
    if (!lineas.length) { mostrarError("Elija al menos un kit."); return; }
    var faltaLinea = lineasCompletas();
    if (faltaLinea) {
      mostrarErrorLineas("Escriba el nombre y elija para quién es cada escarapela.");
      faltaLinea.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var faltante = null;
    form.querySelectorAll("input[required], select[required]").forEach(function (c) {
      var bien = c.type === "checkbox" ? c.checked : c.checkValidity() && c.value.trim() !== "";
      if (c.type !== "checkbox") c.setAttribute("aria-invalid", bien ? "false" : "true");
      if (!bien && !faltante) faltante = c;
    });
    if (faltante) {
      mostrarError(faltante.type === "checkbox" ? "Para continuar debe aceptar las dos casillas."
        : faltante.type === "email" && faltante.value ? "Revise el correo: no parece válido." : "Faltan datos de facturación.");
      faltante.focus();
      return;
    }

    var f = form.elements;
    var cuerpo = {
      items: lineas.map(function (l) { return { kit_id: l.kit_id, nombre: l.nombre.trim(), tipo: l.tipo }; }),
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
      // Solo en local se usa lo guardado (Wompi no devuelve a localhost).
      try { localStorage.setItem(PENDIENTE, JSON.stringify({ ref: d.reference, t: Date.now() })); } catch (e2) { /* sin almacenamiento */ }
      var vuelta = location.origin + "/feria/kits?ref=" + encodeURIComponent(d.reference);
      location.href = WOMPI + "?" + [
        "public-key=" + encodeURIComponent(d.public_key),
        "currency=" + encodeURIComponent(d.currency),
        "amount-in-cents=" + encodeURIComponent(d.amount_in_cents),
        "reference=" + encodeURIComponent(d.reference),
        "signature:integrity=" + encodeURIComponent(d.signature),
        // Wompi bloquea (403) una dirección de regreso a localhost o 127.0.0.1: en
        // local no se manda y, al volver a abrir la página, se confirma lo guardado.
        LOCAL ? "" : "redirect-url=" + encodeURIComponent(vuelta),
        "customer-data:email=" + encodeURIComponent(cuerpo.datos_facturacion.email),
        "customer-data:full-name=" + encodeURIComponent(cuerpo.datos_facturacion.nombres + " " + cuerpo.datos_facturacion.apellidos)
      ].filter(Boolean).join("&");
    }).catch(function (err) {
      enviando = false;
      botonPagar.disabled = false;
      botonPagar.textContent = textoBoton;
      mostrarError(err && err.message && err.message !== "Failed to fetch" ? err.message : "No hay conexión con el servidor. Intente de nuevo.");
    });
  });

  // Al volver con "atrás" desde Wompi el navegador puede mostrar la página guardada
  // con el botón en "Preparando el pago…": se deja usable de nuevo.
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted && enviando) {
      enviando = false;
      botonPagar.disabled = false;
      if (lineas.length) resumen();
    }
  });

  /* ---------- 5. Al volver de Wompi ---------- */
  var hallada = location.search.match(/fk_[0-9a-f]{32}/);
  var ref = hallada ? hallada[0] : "";
  if (!ref && LOCAL) {
    // Solo en local: Wompi no devuelve a localhost, así que se confirma lo guardado.
    try {
      var guardada = JSON.parse(localStorage.getItem(PENDIENTE) || "null");
      if (guardada && /^fk_[0-9a-f]{32}$/.test(guardada.ref) && Date.now() - guardada.t < MAX_PENDIENTE_MS) ref = guardada.ref;
      else olvidarPendiente();
    } catch (e) { /* sin almacenamiento */ }
  }
  var intentos = 0;
  var MAX_INTENTOS = 10;     // ~40 s: PSE y Nequi a veces tardan en confirmar

  function pintarResultado(clase, titulo, texto) {
    secRes.hidden = false;
    secRes.className = "fa-seccion dn-resultado" + (clase ? " " + clase : "");
    secRes.innerHTML = '<div class="dn-res-caja"><h2>' + titulo + "</h2>" + texto + "</div>";
  }

  function tarjetas(d) {
    return '<div class="dn-qrs">' + (d.items || []).map(function (i) {
      return '<div class="dn-qr">' +
        (i.qr ? '<img src="' + esc(i.qr) + '" alt="Código QR de la escarapela ' + esc(i.num_cuenta) + '">' : "") +
        '<p class="dn-qr-num">' + esc(i.num_cuenta) + "</p>" +
        "<p><b>" + esc(i.nombre) + "</b><br>" + esc(i.kit_nombre) + " · " + wk(i.witkis) + " witkis<br>+ bono de refrigerio</p>" +
        "</div>";
    }).join("") + "</div>";
  }

  function revisar() {
    intentos++;
    pedir("POST", "/confirmar", { reference: ref }).then(function (r) {
      var d = r.datos || {};
      if (!r.ok) {
        olvidarPendiente();
        pintarResultado("mal", "No encontramos el pago", "<p>" + esc(d.message || "Revise el enlace o intente de nuevo.") + "</p>");
        return;
      }
      var e = d.estado;
      if (e !== "pendiente") olvidarPendiente();
      if (e === "aprobado") {
        pintarResultado("", "¡Listo! Estas son sus escarapelas",
          "<p>Ya tienen sus witkis. <b>Imprímalas</b> (o tómele una foto a esta pantalla) o <b>reclámelas impresas en la entrada de la feria</b>, " +
          "donde le entregan también el bono de refrigerio. La factura le llega al correo.</p>" + tarjetas(d) +
          '<button type="button" class="dn-otra" data-imprimir>Imprimir</button> <a class="dn-otra" href="/feria/kits">Comprar otro kit</a>');
        document.body.classList.add("con-qrs");
        var bi = secRes.querySelector("[data-imprimir]");
        if (bi) bi.addEventListener("click", function () { window.print(); });
        fiesta(secRes.querySelector("h2"), 30);
      } else if (e === "pendiente" && intentos < MAX_INTENTOS) {
        pintarResultado("mal", "Confirmando…", '<p><span class="dn-girando" aria-hidden="true"></span>Estamos esperando la respuesta del banco. No cierre esta página.</p>');
        setTimeout(revisar, 4000);
      } else if (e === "pendiente") {
        pintarResultado("mal", "Pago sin confirmar",
          "<p>Todavía no vemos el pago. Si alcanzó a pagar, recargue esta página en unos minutos para ver sus escarapelas. Si salió de la pasarela sin pagar, puede intentarlo de nuevo.</p>" +
          '<button type="button" class="dn-otra" data-recargar>Recargar</button> <a class="dn-otra" href="/feria/kits">Intentar de nuevo</a>');
        var br = secRes.querySelector("[data-recargar]");
        if (br) br.addEventListener("click", function () { location.reload(); });
      } else if (e === "monto_invalido" || e === "aprobado_sin_registrar") {
        pintarResultado("mal", "Lo revisamos", "<p>Recibimos el pago, pero hay que revisarlo a mano. No vuelva a pagar: i'Witown se pone en contacto con usted.</p>");
      } else {
        pintarResultado("mal", "No se aprobó", '<p>El pago no se aprobó y no se cobró nada. Puede intentarlo de nuevo.</p><a class="dn-otra" href="/feria/kits">Intentar de nuevo</a>');
      }
    }).catch(function () {
      if (intentos < MAX_INTENTOS) { setTimeout(revisar, 4000); return; }
      pintarResultado("mal", "Sin conexión", "<p>No pudimos consultar el pago. Si se aprobó, sus escarapelas ya están creadas. Recargue esta página en un momento.</p>");
    });
  }

  if (ref) {
    pintarResultado("mal", "Confirmando…", '<p><span class="dn-girando" aria-hidden="true"></span>Consultando su pago…</p>');
    secRes.scrollIntoView({ block: "start" });
    revisar();
  }

  cargar();
})();
