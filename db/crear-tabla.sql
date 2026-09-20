-- ============================================================
-- i'Witown — Tabla de contactos de la landing page
-- ============================================================
--
-- CÓMO USAR ESTE ARCHIVO:
--   1. Entra a cPanel > phpMyAdmin
--   2. Selecciona la base de datos del sitio en el panel izquierdo
--   3. Pestaña "SQL"
--   4. Pega todo el contenido de este archivo y dale "Continuar"
--
-- Eso crea la tabla. No borra nada de lo que ya exista.
-- ============================================================

CREATE TABLE IF NOT EXISTS `leads` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`          VARCHAR(120)  NOT NULL,
  `rol`             VARCHAR(40)   NOT NULL COMMENT 'rector, coordinador, docente, padre, otro',
  `colegio`         VARCHAR(150)  DEFAULT NULL,
  `ciudad`          VARCHAR(80)   DEFAULT NULL,
  `num_estudiantes` INT UNSIGNED  DEFAULT NULL,
  `correo`          VARCHAR(150)  NOT NULL,
  `telefono`        VARCHAR(30)   NOT NULL,
  `mensaje`         TEXT          DEFAULT NULL,
  `autoriza_datos`  TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Ley 1581 de 2012 - Habeas Data',
  `ip`              VARCHAR(45)   DEFAULT NULL,
  `origen`          VARCHAR(255)  DEFAULT NULL COMMENT 'de qué página llegó',
  `estado`          VARCHAR(30)   NOT NULL DEFAULT 'nuevo' COMMENT 'nuevo, contactado, agendado, cerrado, descartado',
  `notas_internas`  TEXT          DEFAULT NULL,
  `creado_en`       DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_correo` (`correo`),
  KEY `idx_rol` (`rol`),
  KEY `idx_estado` (`estado`),
  KEY `idx_creado` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- CONSULTAS ÚTILES (opcionales — para revisar los leads)
-- ============================================================

-- Los últimos 50 contactos que llegaron:
-- SELECT id, creado_en, nombre, rol, colegio, ciudad, telefono, correo, estado
-- FROM leads
-- ORDER BY creado_en DESC
-- LIMIT 50;

-- Solo los rectores y coordinadores que todavía no se han contactado:
-- SELECT * FROM leads
-- WHERE rol IN ('rector','coordinador') AND estado = 'nuevo'
-- ORDER BY creado_en DESC;

-- Cuántos contactos llegaron por perfil:
-- SELECT rol, COUNT(*) AS total
-- FROM leads
-- GROUP BY rol
-- ORDER BY total DESC;

-- Marcar un contacto como ya atendido (cambia el 1 por el id real):
-- UPDATE leads SET estado = 'contactado' WHERE id = 1;
