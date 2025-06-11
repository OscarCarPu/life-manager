-- Seed data for 'category' table
INSERT INTO category (name, description, color, parent_category_id) VALUES
('Work', 'Categoría para tareas y proyectos relacionados con el ámbito laboral.', '#FF5733', NULL),
('Personal', 'Categoría para tareas y proyectos personales y del hogar.', '#33FF57', NULL),
('Estudios', 'Categoría para actividades académicas y de aprendizaje.', '#3357FF', NULL),
-- Child of 'Work'
('Desarrollo de Software', 'Proyectos y tareas de programación y desarrollo.', '#FFBD33', 1),
-- Child of 'Work'
('Marketing', 'Actividades relacionadas con estrategias de marketing y promoción.', '#33FFBD', 1),
('Hogar', 'Mantenimiento del hogar y tareas domésticas.', '#BD33FF', 2), -- Child of 'Personal'
-- Child of 'Personal'
('Salud y Bienestar', 'Actividades para el cuidado personal y la salud.', '#FF33BD', 2);

-- Seed data for 'project' table
INSERT INTO project (
    name, description, category_id, color, expected_start_date, expected_end_date, state
) VALUES
(
    'Nuevo Sitio Web', 'Desarrollo completo del sitio web corporativo.', (
        SELECT id FROM category
        WHERE name = 'Desarrollo de Software'
    ), '#FFC300', '2025-06-15', '2025-09-30', 'in_progress'
),
(
    'Campaña de Verano', 'Planificación y ejecución de la campaña de marketing estival.', (
        SELECT id FROM category
        WHERE name = 'Marketing'
    ), '#DAF7A6', '2025-07-01', '2025-08-31', 'not_started'
),
(
    'Reforma Cocina', 'Proyecto de renovación de la cocina.', (
        SELECT id FROM category
        WHERE name = 'Hogar'
    ), '#FF5733', '2025-05-20', '2025-07-15', 'in_progress'
),
(
    'Curso SQL Avanzado', 'Estudio intensivo de SQL avanzado y optimización de bases de datos.', (
        SELECT id FROM category
        WHERE name = 'Estudios'
    ), '#33FF57', '2025-06-01', '2025-07-20', 'in_progress'
),
(
    'Plan de Ejercicio', 'Rutina de ejercicios y dieta para mejorar la condición física.', (
        SELECT id FROM category
        WHERE name = 'Salud y Bienestar'
    ), '#3357FF', '2025-06-10', '2025-12-31', 'in_progress'
),
(
    'Migración a la Nube', 'Migración de la infraestructura actual a servicios cloud.', (
        SELECT id FROM category
        WHERE name = 'Desarrollo de Software'
    ), '#AABBCC', '2025-04-01', '2025-06-10', 'completed'
),
(
    'Organizar Documentos', 'Digitalización y organización de documentos personales.', (
        SELECT id FROM category
        WHERE name = 'Personal'
    ), '#FFE4B5', '2025-06-05', '2025-06-15', 'in_progress'
);

-- Seed data for 'task' table
INSERT INTO task (title, due_date, description, project_id, state) VALUES
(
    'Diseñar maqueta UI/UX',
    '2025-06-25',
    'Crear wireframes y prototipos para el nuevo sitio web.',
    (
        SELECT id FROM project
        WHERE name = 'Nuevo Sitio Web'
    ), 'in_progress'
),
(
    'Desarrollar backend', '2025-08-15', 'Implementar la lógica de negocio y la API.', (
        SELECT id FROM project
        WHERE name = 'Nuevo Sitio Web'
    ), 'pending'
),
(
    'Investigar tendencias de mercado',
    '2025-06-30',
    'Análisis de la competencia y tendencias actuales de marketing.',
    (
        SELECT id FROM project
        WHERE name = 'Campaña de Verano'
    ), 'pending'
),
(
    'Comprar materiales', '2025-06-18', 'Adquirir azulejos, encimeras y electrodomésticos.', (
        SELECT id FROM project
        WHERE name = 'Reforma Cocina'
    ), 'completed'
),
(
    'Instalar gabinetes', '2025-07-05', 'Instalación de todos los gabinetes de la cocina.', (
        SELECT id FROM project
        WHERE name = 'Reforma Cocina'
    ), 'in_progress'
),
(
    'Estudiar subconsultas',
    '2025-06-14',
    'Revisar ejemplos y practicar el uso de subconsultas en SQL.',
    (
        SELECT id FROM project
        WHERE name = 'Curso SQL Avanzado'
    ), 'in_progress'
),
(
    'Planificar rutina semanal',
    '2025-06-12',
    'Definir los días y tipos de ejercicio para la semana.',
    (
        SELECT id FROM project
        WHERE name = 'Plan de Ejercicio'
    ), 'pending'
),
(
    'Completar reporte de migración',
    '2025-06-09',
    'Redactar el informe final sobre la migración a la nube.',
    (
        SELECT id FROM project
        WHERE name = 'Migración a la Nube'
    ), 'completed'
),
(
    'Escanear recibos antiguos',
    '2025-06-10',
    'Digitalizar recibos importantes de los últimos 5 años.',
    (
        SELECT id FROM project
        WHERE name = 'Organizar Documentos'
    ), 'in_progress'
);

-- Seed data for 'task_planning' table
INSERT INTO task_planning (task_id, planned_date, start_hour, end_hour, priority) VALUES
(
    (
        SELECT id FROM task
        WHERE title = 'Diseñar maqueta UI/UX'
    ), '2025-06-12', '09:00:00', '13:00:00', 4
),
(
    (
        SELECT id FROM task
        WHERE title = 'Diseñar maqueta UI/UX'
    ), '2025-06-13', '09:00:00', '12:00:00', 4
),
(
    (
        SELECT id FROM task
        WHERE title = 'Estudiar subconsultas'
    ), '2025-06-11', '14:00:00', '16:00:00', 5
),
(
    (
        SELECT id FROM task
        WHERE title = 'Estudiar subconsultas'
    ), '2025-06-12', '10:00:00', '12:00:00', 5
),
(
    (
        SELECT id FROM task
        WHERE title = 'Planificar rutina semanal'
    ), '2025-06-12', '18:00:00', '19:00:00', 3
),
((
    SELECT id FROM task
    WHERE title = 'Instalar gabinetes'
), '2025-06-15', '08:00:00', '17:00:00', 4),
(
    (
        SELECT id FROM task
        WHERE title = 'Escanear recibos antiguos'
    ), '2025-06-10', '10:00:00', '11:30:00', 2
);
