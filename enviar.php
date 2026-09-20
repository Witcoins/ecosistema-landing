<?php
/* ============================================================
   i'Witown — Recepción del formulario de contacto
   ============================================================

   ┌──────────────────────────────────────────────────────────┐
   │  CONFIGURACIÓN — lo único que hay que cambiar está en    │
   │  el bloque de abajo. Nada más.                           │
   └──────────────────────────────────────────────────────────┘

   Qué hace este archivo:
     1. Recibe los datos del formulario de index.html
     2. Los valida
     3. Los guarda en la base de datos (si está configurada)
     4. Manda una copia por correo
     5. Responde en JSON para que la página no se recargue

   Si NO quieres usar base de datos todavía, deja
   DB_HOST en cadena vacía ("") y el script solo mandará el correo.
   ============================================================ */

// ---------- CORREO ----------
define('CORREO_DESTINO', 'contacto@iwitown.com');           // <-- REEMPLAZAR: a dónde llegan los leads
define('CORREO_REMITENTE', 'no-responder@iwitown.com');     // <-- REEMPLAZAR: debe ser del mismo dominio del hosting

// ---------- BASE DE DATOS ----------
// Estos datos se los da el hosting (cPanel > Bases de datos MySQL).
// Para desactivar la base de datos, deja DB_HOST como "".
define('DB_HOST', 'localhost');
define('DB_NOMBRE', 'nombre_de_la_base');                   // <-- REEMPLAZAR
define('DB_USUARIO', 'usuario_de_la_base');                 // <-- REEMPLAZAR
define('DB_CLAVE', 'clave_de_la_base');                     // <-- REEMPLAZAR
define('DB_TABLA', 'leads');

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
// Un robot llena todos los campos, incluido el oculto. Una persona no lo ve.
// Respondemos "ok" a propósito para que el robot crea que funcionó.
if (!empty($_POST['website'])) {
    responder(true, 'Gracias.');
}

// ---------- Recoger datos ----------
$nombre      = limpiar($_POST['nombre']      ?? '', 120);
$rol         = limpiar($_POST['rol']         ?? '', 40);
$colegio     = limpiar($_POST['colegio']     ?? '', 150);
$ciudad      = limpiar($_POST['ciudad']      ?? '', 80);
$estudiantes = isset($_POST['estudiantes']) && $_POST['estudiantes'] !== ''
               ? (int) $_POST['estudiantes'] : null;
$correo      = limpiar($_POST['correo']      ?? '', 150);
$telefono    = limpiar($_POST['telefono']    ?? '', 30);
$mensaje     = limpiar($_POST['mensaje']     ?? '', 1000);
$autoriza    = (($_POST['autoriza'] ?? '') === 'si');

// ---------- Validar ----------
$errores = [];
if ($nombre === '')                                     $errores[] = 'el nombre';
if ($rol === '')                                        $errores[] = 'el perfil';
if (!filter_var($correo, FILTER_VALIDATE_EMAIL))        $errores[] = 'un correo válido';
if ($telefono === '')                                   $errores[] = 'el teléfono';
if (!$autoriza)                                         $errores[] = 'la autorización de datos';

if ($errores) {
    responder(false, 'Falta ' . implode(', ', $errores) . '.', 422);
}

// ---------- Datos de contexto ----------
$ip     = $_SERVER['REMOTE_ADDR'] ?? '';
$origen = limpiar($_SERVER['HTTP_REFERER'] ?? '', 255);
$fecha  = date('Y-m-d H:i:s');

// ---------- Guardar en la base de datos ----------
$guardadoEnBD = false;
if (DB_HOST !== '') {
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NOMBRE . ';charset=utf8mb4',
            DB_USUARIO,
            DB_CLAVE,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );

        $sql = 'INSERT INTO ' . DB_TABLA . '
                (nombre, rol, colegio, ciudad, num_estudiantes, correo, telefono,
                 mensaje, autoriza_datos, ip, origen, creado_en)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $pdo->prepare($sql)->execute([
            $nombre, $rol, $colegio, $ciudad, $estudiantes, $correo, $telefono,
            $mensaje, 1, $ip, $origen, $fecha
        ]);

        $guardadoEnBD = true;

    } catch (PDOException $e) {
        // No mostramos el error técnico al visitante, pero lo dejamos anotado
        // en el log del servidor para que se pueda revisar después.
        error_log('[i-Witown] Error de base de datos: ' . $e->getMessage());
    }
}

// ---------- Mandar el correo ----------
$asunto = 'Nuevo contacto desde la landing — ' . $nombre;

$cuerpo  = "Llegó un contacto nuevo desde iwitown.com\n";
$cuerpo .= "----------------------------------------\n\n";
$cuerpo .= "Nombre:        {$nombre}\n";
$cuerpo .= "Perfil:        {$rol}\n";
$cuerpo .= "Colegio:       " . ($colegio ?: '(no indicó)') . "\n";
$cuerpo .= "Ciudad:        " . ($ciudad ?: '(no indicó)') . "\n";
$cuerpo .= "Estudiantes:   " . ($estudiantes !== null ? $estudiantes : '(no indicó)') . "\n";
$cuerpo .= "Correo:        {$correo}\n";
$cuerpo .= "Teléfono:      {$telefono}\n\n";
$cuerpo .= "Mensaje:\n" . ($mensaje ?: '(sin mensaje)') . "\n\n";
$cuerpo .= "----------------------------------------\n";
$cuerpo .= "Fecha:         {$fecha}\n";
$cuerpo .= "IP:            {$ip}\n";
$cuerpo .= "Guardado en BD: " . ($guardadoEnBD ? 'sí' : 'NO — revisar configuración') . "\n";

$cabeceras  = 'From: i-Witown <' . CORREO_REMITENTE . ">\r\n";
$cabeceras .= 'Reply-To: ' . $correo . "\r\n";
$cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";

$correoEnviado = @mail(CORREO_DESTINO, $asunto, $cuerpo, $cabeceras);

// ---------- Responder ----------
if ($guardadoEnBD || $correoEnviado) {
    responder(true, '¡Listo! Recibimos tus datos. Te contactamos muy pronto.');
}

error_log('[i-Witown] No se pudo guardar ni enviar el correo del lead: ' . $correo);
responder(false, 'No pudimos procesar tu solicitud. Escríbenos por WhatsApp y lo resolvemos ahí mismo.', 500);
