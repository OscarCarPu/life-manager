--
-- Seed data for 'categoria' table
--

INSERT INTO categoria (nombre, descripcion, slug) VALUES
('Casa', 'Tareas y responsabilidades relacionadas con el hogar.', 'casa'),
('Estudios', 'Actividades académicas y de aprendizaje.', 'estudios'),
('Trabajo', 'Tareas profesionales y laborales.', 'trabajo'),
(
    'Desarrollo Personal',
    'Actividades para crecimiento personal y bienestar.',
    'desarrollo-personal'
);

-- Subcategories (referencing parent categories)
INSERT INTO categoria (nombre, descripcion, categoria_padre_id, slug) VALUES
(
    'Limpieza', 'Tareas de limpieza y mantenimiento del hogar.', (
        SELECT id FROM categoria
        WHERE nombre = 'Casa'
    ), 'limpieza'
),
(
    'Finanzas Hogar', 'Gestión económica del hogar.', (
        SELECT id FROM categoria
        WHERE nombre = 'Casa'
    ), 'finanzas-hogar'
),
(
    'Proyectos Personales', 'Proyectos de mejora del hogar o personales.', (
        SELECT id FROM categoria
        WHERE nombre = 'Casa'
    ), 'proyectos-personales'
),
(
    'Universidad', 'Tareas y asignaturas universitarias.', (
        SELECT id FROM categoria
        WHERE nombre = 'Estudios'
    ), 'universidad'
),
(
    'Cursos Online', 'Cursos y aprendizaje autodidacta.', (
        SELECT id FROM categoria
        WHERE nombre = 'Estudios'
    ), 'cursos-online'
),
(
    'Reuniones', 'Preparación y asistencia a reuniones de trabajo.', (
        SELECT id FROM categoria
        WHERE nombre = 'Trabajo'
    ), 'reuniones'
),
(
    'Informes', 'Elaboración y revisión de informes y documentos.', (
        SELECT id FROM categoria
        WHERE nombre = 'Trabajo'
    ), 'informes'
),
(
    'Salud y Bienestar', 'Ejercicio, nutrición y cuidado personal.', (
        SELECT id FROM categoria
        WHERE nombre = 'Desarrollo Personal'
    ), 'salud-bienestar'
),
(
    'Lectura', 'Lectura de libros y artículos.', (
        SELECT id FROM categoria
        WHERE nombre = 'Desarrollo Personal'
    ), 'lectura'
);

--
-- Seed data for 'tarea' table
--

INSERT INTO tarea (titulo, descripcion, fecha_vencimiento, slug, categoria_id, estado) VALUES
-- Tareas de Casa
(
    'Limpiar baño a fondo',
    'Sanitarios, ducha, suelo y espejos.',
    '2025-06-05',
    'limpiar-bano-fondo',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Limpieza'
    ), 'pendiente'
),
(
    'Hacer la compra semanal',
    'Lista de la compra y visita al supermercado.',
    '2025-06-02',
    'compra-semanal',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Limpieza'
    ), 'pendiente'
),
(
    'Pagar factura de la luz',
    'Comprobar recibo y realizar pago online.',
    '2025-06-10',
    'pagar-luz',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Finanzas Hogar'
    ), 'pendiente'
),
(
    'Organizar armario del salón',
    'Sacar cosas, limpiar y redistribuir.',
    NULL,
    'organizar-armario-salon',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Proyectos Personales'
    ), 'pendiente'
),
(
    'Revisar presupuesto mensual',
    'Análisis de ingresos y gastos.',
    '2025-06-15',
    'revisar-presupuesto-mensual',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Finanzas Hogar'
    ), 'pendiente'
),
(
    'Montar estantería nueva',
    'Seguir instrucciones y fijar a la pared.',
    '2025-06-20',
    'montar-estanteria',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Proyectos Personales'
    ), 'pendiente'
),

-- Tareas de Estudios
(
    'Estudiar para examen de Bases de Datos',
    'Repasar temas 1-5, hacer ejercicios.',
    '2025-06-08',
    'estudiar-bbdd',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Universidad'
    ), 'pendiente'
),
(
    'Preparar presentación de Historia',
    'Investigar, estructurar y diseñar diapositivas.',
    '2025-06-12',
    'preparar-presentacion-historia',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Universidad'
    ), 'pendiente'
),
(
    'Ver lección 3 de curso de Python',
    'Programación orientada a objetos.',
    NULL,
    'leccion-3-python',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Cursos Online'
    ), 'pendiente'
),
(
    'Hacer ejercicios de cálculo integral',
    'Capítulo 7 del libro de texto.',
    '2025-06-25',
    'ejercicios-calculo',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Universidad'
    ), 'pendiente'
),
(
    'Escribir resumen de artículo científico',
    'Sobre la inteligencia artificial.',
    '2025-06-18',
    'resumen-articulo-ia',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Universidad'
    ), 'pendiente'
),

-- Tareas de Trabajo
(
    'Reunión semanal con equipo',
    'Preparar puntos de agenda y participar.',
    '2025-06-03',
    'reunion-semanal-equipo',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Reuniones'
    ), 'completada'
),
(
    'Enviar informe mensual de ventas',
    'Recopilar datos y redactar análisis.',
    '2025-06-07',
    'enviar-informe-ventas',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Informes'
    ), 'pendiente'
),
(
    'Preparar demo de nuevo producto',
    'Configurar entorno y practicar presentación.',
    '2025-06-14',
    'preparar-demo-producto',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Reuniones'
    ), 'pendiente'
),
(
    'Revisar propuesta de cliente X',
    'Ajustar detalles y enviar feedback.',
    '2025-06-06',
    'revisar-propuesta-cliente-x',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Informes'
    ), 'pendiente'
),
(
    'Responder emails pendientes',
    'Gestionar bandeja de entrada.',
    NULL,
    'responder-emails-pendientes',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Trabajo'
    ), 'pendiente'
),

-- Tareas de Desarrollo Personal
(
    'Hacer 30 min de ejercicio', 'Rutina de fuerza o cardio.', NULL, 'ejercicio-30min', (
        SELECT id FROM categoria
        WHERE nombre = 'Salud y Bienestar'
    ), 'pendiente'
),
(
    'Leer capítulo de "El poder del hábito"',
    'Libro de Charles Duhigg.',
    NULL,
    'leer-el-poder-del-habito',
    (
        SELECT id FROM categoria
        WHERE nombre = 'Lectura'
    ), 'pendiente'
),
(
    'Meditar 10 minutos', 'Sesión guiada de meditación.', NULL, 'meditar-10min', (
        SELECT id FROM categoria
        WHERE nombre = 'Salud y Bienestar'
    ), 'pendiente'
);

--
-- Seed data for 'planificacion_tarea' table
--

INSERT INTO planificacion_tarea (tarea_id, fecha_planificada, prioridad) VALUES
-- Planificación para el 1 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Hacer la compra semanal'
), '2025-06-01', 1),
((
    SELECT id FROM tarea
    WHERE titulo = 'Hacer 30 min de ejercicio'
), '2025-06-01', 5),
((
    SELECT id FROM tarea
    WHERE titulo = 'Leer capítulo de "El poder del hábito"'
), '2025-06-01', 4),

-- Planificación para el 2 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Revisar propuesta de cliente X'
), '2025-06-02', 1),
((
    SELECT id FROM tarea
    WHERE titulo = 'Estudiar para examen de Bases de Datos'
), '2025-06-02', 2),
((
    SELECT id FROM tarea
    WHERE titulo = 'Responder emails pendientes'
), '2025-06-02', 3),

-- Planificación para el 3 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Limpiar baño a fondo'
), '2025-06-03', 2),
((
    SELECT id FROM tarea
    WHERE titulo = 'Ver lección 3 de curso de Python'
), '2025-06-03', 3),
((
    SELECT id FROM tarea
    WHERE titulo = 'Meditar 10 minutos'
), '2025-06-03', 5),

-- Planificación para el 4 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Enviar informe mensual de ventas'
), '2025-06-04', 1),
((
    SELECT id FROM tarea
    WHERE titulo = 'Preparar presentación de Historia'
), '2025-06-04', 2),
((
    SELECT id FROM tarea
    WHERE titulo = 'Organizar armario del salón'
), '2025-06-04', 4),

-- Planificación para el 5 de Junio de 2025 (Tarea repetida en planificación)
((
    SELECT id FROM tarea
    WHERE titulo = 'Estudiar para examen de Bases de Datos'
), '2025-06-05', 1),
((
    SELECT id FROM tarea
    WHERE titulo = 'Hacer 30 min de ejercicio'
), '2025-06-05', 5),

-- Planificación para el 6 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Pagar factura de la luz'
), '2025-06-06', 1),
((
    SELECT id FROM tarea
    WHERE titulo = 'Preparar demo de nuevo producto'
), '2025-06-06', 2),

-- Planificación para el 10 de Junio de 2025
((
    SELECT id FROM tarea
    WHERE titulo = 'Revisar presupuesto mensual'
), '2025-06-10', 1);
