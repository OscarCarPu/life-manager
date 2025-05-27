INSERT INTO categoria (nombre, descripcion, categoria_padre_id) VALUES
('Personal', 'Tareas personales', NULL),
('Trabajo', 'Tareas laborales', NULL),
('Estudio', 'Tareas académicas', NULL),
('Grado ciencias', 'Tareas del grado en ciencias', 3),
('Asignatura 1', 'Tareas de la asignatura 1', 3),
('Asignatura 2', 'Tareas de la asignatura 2', 3),
('Asignatura 3', 'Tareas de la asignatura 3', 3),
('Casa', 'Tareas del hogar', 1),
('Proyecto 1', 'Proyecto personal 1', 1),
('Subcategoria 1', 'Subcategoría de ejemplo', 9);

INSERT INTO tarea (
    titulo, fecha_vencimiento, descripcion, categoria_id, estado
) VALUES
(
    'Comprar víveres',
    '2025-06-15',
    'Comprar frutas y verduras para la semana',
    8,
    'pendiente'
),
(
    'Enviar informe',
    '2025-06-20',
    'Enviar el informe mensual al jefe',
    2,
    'pendiente'
),
(
    'Estudiar para examen',
    '2025-06-25',
    'Preparar el examen de asignatura 1',
    5,
    'pendiente'
),
(
    'Limpiar la casa',
    '2025-06-18',
    'Realizar limpieza general de la casa',
    8,
    'pendiente'
),
(
    'Revisar proyecto 1',
    '2025-06-30',
    'Revisar avances del proyecto personal 1',
    9,
    'pendiente'
),
('Bajar cosas a trastero', NULL, 'Bajar cosas al trastero', 8, 'completada'),
('Hacer la compra', NULL, 'Hacer la compra del mes', 8, 'cancelada'),
(
    'Revisar asignatura 2',
    NULL,
    'Revisar los apuntes de la asignatura 2',
    6,
    'pendiente'
),
(
    'Enviar tarea de asignatura 3',
    '2025-06-27',
    'Enviar la tarea de la asignatura 3 antes del viernes',
    7,
    'pendiente'
);
