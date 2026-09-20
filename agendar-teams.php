<?php
/* ============================================================
   i'Witown — Aviso de reunión por Teams
   ============================================================

   ┌──────────────────────────────────────────────────────────┐
   │  CONFIGURACIÓN — lo único que hay que cambiar está en    │
   │  el bloque de abajo. Nada más.                           │
   └──────────────────────────────────────────────────────────┘

   Qué hace este archivo:
     1. Recibe los datos del formulario que sale antes de entrar
        a la reunión de Teams (nombre, celular, correo y hora)
     2. Los valida
     3. Manda DOS correos: uno a nosotros y otro a la persona,
        con el enlace de la reunión
     4. Responde en JSON para que la página no se recargue

   La persona entra a la reunión aunque el correo falle: la página
   abre Teams de una vez y este archivo trabaja por detrás. Si algo
   sale mal, queda anotado en el log del servidor.
   ============================================================ */

// ---------- CORREO ----------
define('CORREO_NOSOTROS', 'witcoinsnetwork@gmail.com');     // a dónde nos llega el aviso
define('CORREO_REMITENTE', 'no-responder@iwitown.com');     // <-- REEMPLAZAR: debe ser del mismo dominio del hosting
define('ENLACE_TEAMS', 'https://teams.microsoft.com/meet/2171674064633?p=43SvylWLRpzrCnfPHb');

/* ============================================================
   DE AQUÍ PARA ABAJO NO HAY QUE TOCAR NADA
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

function responder($ok, $mensaje, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode(['ok' => $ok, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
    exit;
}

function limpiar($valor, $largo = 255) {
    $valor = trim((string) $valor);
    $valor = strip_tags($valor);
    // Evita que alguien inyecte encabezados falsos en el correo
    $valor = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valor);
    return mb_substr($valor, 0, $largo);
}

// ---------- Solo se aceptan envíos POST ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// ---------- Trampa anti-spam ----------
if (!empty($_POST['website'])) {
    responder(true, 'Gracias.');
}

// ---------- Recoger datos ----------
$nombre   = limpiar($_POST['nombre']   ?? '', 120);
$celular  = limpiar($_POST['celular']  ?? '', 30);
$correo   = limpiar($_POST['correo']   ?? '', 150);
$cuando   = limpiar($_POST['cuando']   ?? '', 40);

// ---------- Validar ----------
$errores = [];
if ($nombre === '')                              $errores[] = 'el nombre';
if ($celular === '')                             $errores[] = 'el celular';
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) $errores[] = 'un correo válido';
if ($cuando === '')                              $errores[] = 'la hora de la reunión';

if ($errores) {
    responder(false, 'Falta ' . implode(', ', $errores) . '.', 422);
}

// La hora llega como 2026-09-22T15:30. Se deja legible para el correo.
$cuandoBonito = $cuando;
$t = strtotime(str_replace('T', ' ', $cuando));
if ($t) {
    $dias  = ['Sunday'=>'domingo','Monday'=>'lunes','Tuesday'=>'martes','Wednesday'=>'miércoles',
              'Thursday'=>'jueves','Friday'=>'viernes','Saturday'=>'sábado'];
    $meses = [1=>'enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'septiembre','octubre','noviembre','diciembre'];
    $cuandoBonito = $dias[date('l', $t)] . ' ' . date('j', $t) . ' de ' . $meses[(int) date('n', $t)]
                  . ' de ' . date('Y', $t) . ', ' . date('g:i a', $t);
}

$fecha = date('Y-m-d H:i:s');
$ip    = $_SERVER['REMOTE_ADDR'] ?? '';

$cabeceras  = 'From: i-Witown <' . CORREO_REMITENTE . ">\r\n";
$cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ---------- 1. El aviso para nosotros ----------
$asuntoNuestro = 'Reunión por Teams — ' . $nombre;

$cuerpoNuestro  = "Alguien entró a la reunión de Teams desde la landing.\n";
$cuerpoNuestro .= "------------------------------------------------\n\n";
$cuerpoNuestro .= "Nombre:   {$nombre}\n";
$cuerpoNuestro .= "Celular:  {$celular}\n";
$cuerpoNuestro .= "Correo:   {$correo}\n";
$cuerpoNuestro .= "Reunión:  {$cuandoBonito}\n\n";
$cuerpoNuestro .= "------------------------------------------------\n";
$cuerpoNuestro .= "Registrado: {$fecha}\n";
$cuerpoNuestro .= "IP:         {$ip}\n";

$avisoNuestro = @mail(
    CORREO_NOSOTROS,
    $asuntoNuestro,
    $cuerpoNuestro,
    $cabeceras . 'Reply-To: ' . $correo . "\r\n"
);

// ---------- 2. La confirmación para la persona ----------
$asuntoSuyo = 'Tu reunión con i\'Witown';

$cuerpoSuyo  = "Hola {$nombre},\n\n";
$cuerpoSuyo .= "Tu reunión con i'Witown quedó anotada para el {$cuandoBonito}.\n\n";
$cuerpoSuyo .= "Este es el enlace para entrar:\n";
$cuerpoSuyo .= ENLACE_TEAMS . "\n\n";
$cuerpoSuyo .= "Si necesitas cambiar la hora, respóndenos este correo y lo movemos.\n\n";
$cuerpoSuyo .= "Nos vemos,\n";
$cuerpoSuyo .= "El equipo de i'Witown\n";

$avisoSuyo = @mail(
    $correo,
    $asuntoSuyo,
    $cuerpoSuyo,
    $cabeceras . 'Reply-To: ' . CORREO_NOSOTROS . "\r\n"
);

// ---------- Responder ----------
if ($avisoNuestro || $avisoSuyo) {
    responder(true, 'Te mandamos la confirmación al correo.');
}

error_log('[i-Witown] No se pudo avisar de la reunión de: ' . $correo);
responder(false, 'No pudimos mandar la confirmación, pero puedes entrar a la reunión.', 500);
