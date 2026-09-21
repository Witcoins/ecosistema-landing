/* ============================================================
   i'Witown — Landing page
   ============================================================

   ┌──────────────────────────────────────────────────────────┐
   │  CAMBIAR AQUÍ EL NÚMERO DE WHATSAPP.                     │
   │  Formato: código de país + número, SIN +, SIN espacios,  │
   │  SIN guiones.  Ejemplo Colombia: 573001234567            │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

var WHATSAPP = "573236007819";

/* ┌──────────────────────────────────────────────────────┐
   │  LO QUE YA NO SE CONFIGURA AQUI                         │
   │                                                        │
   │  La direccion de correo se escribe a mano en los datos  │
   │  de contacto del index.html. Aqui ya no hay constante,   │
   │  para que no queden dos sitios donde cambiarla y uno se  │
   │  quede viejo. El boton de correo baja al formulario de   │
   │  la propia pagina.                                      │
   │                                                        │
   │  Tampoco hay TEAMS ni CALENDARIO: el boton de la        │
   │  reunion abre el recuadro de js/teams.js, y el enlace   │
   │  de la sala vive en TRES sitios: SALA_TEAMS de          │
   │  js/teams.js (abre la pestaña) y ENLACE_TEAMS de        │
   │  landingAgenda.js y landingSala.js (van en la           │
   │  invitacion y en el aviso).                             │
   └──────────────────────────────────────────────────────┘ */

/* ┌──────────────────────────────────────────────────────────┐
   │  A DÓNDE LLEVA "INGRESAR", el botón de la barra de       │
   │  arriba: a la plataforma, para quien ya tiene cuenta.    │
   │                                                          │
   │  Si se deja vacío, el botón sale apagado y no se puede   │
   │  pinchar, igual que el de Teams.                         │
   └──────────────────────────────────────────────────────────┘ */

var INGRESAR = "https://www.iwitown.com/";

/* ┌──────────────────────────────────────────────────────────┐
   │  EL BOTÓN "WIWI" del menú                                 │
   │                                                          │
   │  A dónde lleva. Mientras esté vacío, el botón sale        │
   │  apagado y avisa, ahí mismo, que falta el enlace.        │
   └──────────────────────────────────────────────────────────┘ */

var WIWI = "https://www.wiwiquest.iwitown.com";

/* ============================================================
   1. Enlaces de WhatsApp
   Arma el enlace de cada botón que tenga el atributo data-wa,
   usando el mensaje que trae en data-wa-msg.
   ============================================================ */

(function () {
  var botones = document.querySelectorAll("[data-wa]");
  for (var i = 0; i < botones.length; i++) {
    var msg = botones[i].getAttribute("data-wa-msg") || "Hola, quiero información sobre i'Witown.";
    botones[i].href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    botones[i].target = "_blank";
    botones[i].rel = "noopener";
  }
})();

/* ============================================================
   1b. Los enlaces que se arman solos
   WhatsApp y los botones que dependen de un enlace de la cabecera
   de este archivo. El de la reunión no pasa por aquí: lo abre
   js/teams.js.
   ============================================================ */

(function () {
  /* El boton de correo ya no abre el programa de correo del visitante: baja
     al formulario de la propia pagina (href="#conversemos" en el HTML). */

  var entradas = document.querySelectorAll("[data-ingresar]");
  for (var k = 0; k < entradas.length; k++) {
    if (INGRESAR) {
      entradas[k].href = INGRESAR;
      entradas[k].target = "_blank";
      entradas[k].rel = "noopener";
    } else {
      entradas[k].classList.add("esta-apagado");
      entradas[k].setAttribute("aria-disabled", "true");
      entradas[k].setAttribute("title", "Falta la dirección de la plataforma en js/script.js");
    }
  }

  enlazar("[data-wiwi]", WIWI, "Falta pegar el enlace de Wiwi en js/script.js", "Falta enlace a esta página");

  /* Los botones que dependen de un enlace de la cabecera de este
     archivo. Si el enlace está vacío, el botón se apaga: más vale
     que se vea desactivado a que lleve a una página en blanco. */
  function enlazar(quienes, aDonde, aviso, rotuloSinEnlace) {
    var botones = document.querySelectorAll(quienes);
    for (var j = 0; j < botones.length; j++) {
      if (aDonde) {
        botones[j].href = aDonde;
        botones[j].target = "_blank";
        botones[j].rel = "noopener";
      } else {
        botones[j].classList.add("esta-apagado");
        botones[j].setAttribute("aria-disabled", "true");
        botones[j].setAttribute("title", aviso);
        /* Algunos botones, además de apagarse, lo dicen en su texto */
        if (rotuloSinEnlace) botones[j].textContent = rotuloSinEnlace;
      }
    }
  }
})();

/* ============================================================
   2. Menú de celular
   ============================================================ */

(function () {
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (!burger || !menu) return;

  burger.addEventListener("click", function () {
    var abierto = menu.classList.toggle("is-abierto");
    burger.classList.toggle("is-abierto", abierto);
    burger.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  // Al tocar un enlace, cerrar el menú
  var enlaces = menu.querySelectorAll("a");
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener("click", function () {
      menu.classList.remove("is-abierto");
      burger.classList.remove("is-abierto");
      burger.setAttribute("aria-expanded", "false");
    });
  }
})();

/* ============================================================
   3. Pestañas "Soy rector" / "Soy papá o mamá"
   ============================================================ */

(function () {
  var tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;

  function activar(tab) {
    for (var i = 0; i < tabs.length; i++) {
      var esta = tabs[i] === tab;
      tabs[i].classList.toggle("is-activa", esta);
      tabs[i].setAttribute("aria-selected", esta ? "true" : "false");

      var quePanel = tabs[i].getAttribute("aria-controls");

      var panel = document.getElementById(quePanel);
      if (panel) {
        panel.hidden = !esta;
        panel.classList.toggle("is-activo", esta);
      }

      /* La frase que va debajo del título cambia con el panel: cada
         una lleva el id del suyo en "data-enunciado". */
      var enunciado = document.querySelector('[data-enunciado="' + quePanel + '"]');
      if (enunciado) enunciado.hidden = !esta;
    }
  }

  for (var i = 0; i < tabs.length; i++) {
    (function (tab) {
      tab.addEventListener("click", function () { activar(tab); });
    })(tabs[i]);
  }

  // Navegación con flechas del teclado (accesibilidad)
  var contenedorTabs = document.querySelector(".tabs");
  contenedorTabs.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var lista = Array.prototype.slice.call(tabs);
    var actual = lista.indexOf(document.activeElement);
    if (actual === -1) return;
    var siguiente = e.key === "ArrowRight"
      ? (actual + 1) % lista.length
      : (actual - 1 + lista.length) % lista.length;
    lista[siguiente].focus();
    activar(lista[siguiente]);
    e.preventDefault();
  });
})();

/* ============================================================
   4. Animación de entrada al hacer scroll
   ============================================================ */

(function () {
  var objetivos = document.querySelectorAll(
    ".tarjeta, .plataforma, .acp-elem, .panel__caja, .precio-caja, .form-caja, .puntos-caja, .ciclo"
  );
  if (!objetivos.length) return;

  // Si el navegador es viejo y no soporta IntersectionObserver, se muestra todo sin animar.
  if (!("IntersectionObserver" in window)) return;

  for (var i = 0; i < objetivos.length; i++) objetivos[i].classList.add("aparece");

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  for (var j = 0; j < objetivos.length; j++) observador.observe(objetivos[j]);
})();

/* ============================================================
   5. Formulario: validación y envío sin recargar la página
   ============================================================ */

(function () {
  var form = document.getElementById("formContacto");
  if (!form) return;

  var msg = document.getElementById("formMsg");
  var btn = document.getElementById("btnEnviar");
  var textoBtn = btn.textContent;

  function mostrar(texto, clase) {
    msg.textContent = texto;
    msg.className = "form-msg " + clase;
  }

  function validar() {
    var ok = true;
    var requeridos = form.querySelectorAll("[required]");

    for (var i = 0; i < requeridos.length; i++) {
      var campo = requeridos[i];
      var vacio = campo.type === "checkbox" ? !campo.checked : !campo.value.trim();
      var malCorreo = campo.type === "email" && campo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value);

      if (vacio || malCorreo) {
        campo.classList.add("error");
        ok = false;
      } else {
        campo.classList.remove("error");
      }
    }
    return ok;
  }

  // Quitar el marcado de error apenas el usuario corrige
  form.addEventListener("input", function (e) {
    if (e.target.classList) e.target.classList.remove("error");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validar()) {
      mostrar("Revisa los campos marcados en rojo.", "falla");
      var primerError = form.querySelector(".error");
      if (primerError) primerError.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando…";
    mostrar("", "");

    fetch(form.action, {
      method: "POST",
      body: new URLSearchParams(new FormData(form)),
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok) {
          form.reset();
          mostrar(data.mensaje || "¡Listo! Recibimos tus datos. Te contactamos pronto.", "ok");
        } else {
          mostrar((data && data.mensaje) || "No pudimos enviar el formulario. Intenta de nuevo.", "falla");
        }
      })
      .catch(function () {
        // Si la funcion no responde o falla la red, ofrecemos WhatsApp como salida.
        mostrar("No pudimos enviar el formulario. Escríbenos por WhatsApp y lo resolvemos ahí mismo.", "falla");
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = textoBtn;
      });
  });
})();
