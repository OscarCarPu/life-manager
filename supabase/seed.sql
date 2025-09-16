-- seed.sql - Extended demo data
-- Categories
INSERT INTO category (name, description) VALUES
('Finance', 'Financial management and accounting tasks.'),
('Marketing', 'Digital and traditional marketing initiatives.'),
('Health & Wellness', 'Personal health, fitness, and well-being.'),
(
    'Home & Personal',
    'Tasks related to home maintenance and personal errands.'
),
('Learning', 'Educational and skill development activities.');
---
-- Subcategories
INSERT INTO category (name, description, parent_category_id) VALUES
(
    'Budgeting', 'Monthly and annual budget planning.', (
        SELECT id FROM category
        WHERE name = 'Finance'
    )
),
(
    'Social Media',
    'Content creation and scheduling for social media platforms.',
    (
        SELECT id FROM category
        WHERE name = 'Marketing'
    )
),
(
    'Time Management',
    'Techniques and planning for effective use of time.',
    (
        SELECT id FROM category
        WHERE name = 'Learning'
    )
);
---
-- Projects
INSERT INTO project (
    name,
    description,
    category_id,
    state,
    expected_start_date,
    expected_end_date,
    priority
) VALUES
(
    'Annual Home Renovation',
    'Manage the complete renovation of the kitchen and bathroom.',
    (
        SELECT id FROM category
        WHERE name = 'Home & Personal'
    ),
    'not_started',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 months',
    4
),
(
    'Q4 Marketing Campaign',
    'Develop and execute a new marketing campaign for the fourth quarter.',
    (
        SELECT id FROM category
        WHERE name = 'Marketing'
    ),
    'in_progress',
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE + INTERVAL '3 months',
    4
),
(
    'Website Redesign',
    'Redesign and launch the new company website.',
    (
        SELECT id FROM category
        WHERE name = 'Marketing'
    ),
    'completed',
    CURRENT_DATE - INTERVAL '6 months',
    CURRENT_DATE - INTERVAL '1 month',
    3
),
(
    '2023 Tax Filing',
    'Completed tax filing for the year 2023.',
    (
        SELECT id FROM category
        WHERE name = 'Finance'
    ),
    'archived',
    CURRENT_DATE - INTERVAL '8 months',
    CURRENT_DATE - INTERVAL '7 months',
    2
),
(
    '10k Race Training Plan',
    'A comprehensive training plan to prepare for a 10k race.',
    (
        SELECT id FROM category
        WHERE name = 'Health & Wellness'
    ),
    'in_progress',
    CURRENT_DATE - INTERVAL '1 week',
    CURRENT_DATE + INTERVAL '2 months',
    3
),
(
    'Agile Project Management Course',
    'Complete an online course on Agile project management.',
    (
        SELECT id FROM category
        WHERE name = 'Learning'
    ),
    'in_progress',
    CURRENT_DATE - INTERVAL '2 weeks',
    CURRENT_DATE + INTERVAL '1 month',
    2
),
(
    'Budget music festival',
    'Plan and organize a budget-friendly music festival in the local park.',
    (
        SELECT id FROM category
        WHERE name = 'Budgeting'
    ),
    'not_started',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 months',
    3
);
---
-- Tasks for the new projects
INSERT INTO task (title, description, project_id, state, due_date, priority) VALUES
(
    'Define campaign target audience',
    'Identify the key demographics and interests for the Q4 marketing campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'completed', CURRENT_DATE - INTERVAL '1 week', 3
),
(
    'Create social media content calendar',
    'Plan and schedule all social media posts for the campaign on Instagram and TikTok.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 month', 4
),
(
    'Finalize ad creatives',
    'Collaborate with the graphic designer to finalize all ad images and videos.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'pending', CURRENT_DATE + INTERVAL '1 month 1 week', 2
),
(
    'Map out weekly running schedule',
    'Create a detailed weekly training plan, including long runs, speed work, and rest days.',
    (
        SELECT id FROM project
        WHERE name = '10k Race Training Plan'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 week', 5
),
(
    'Research running shoes',
    'Look for suitable running shoes with good cushioning and support for long-distance running.',
    (
        SELECT id FROM project
        WHERE name = '10k Race Training Plan'
    ), 'pending', CURRENT_DATE, 3
),
(
    'Hire an electrician',
    'Interview and hire a certified electrician for the kitchen wiring.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '3 days', 4
),
(
    'Complete Module 3',
    'Finish the third module on project risk management, including the end-of-module quiz.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'in_progress', CURRENT_DATE + INTERVAL '2 days', 2
),
(
    'Write final report',
    'Draft and finalize the project report summarizing learnings and a case study from the course.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'pending', CURRENT_DATE + INTERVAL '1 week', 3
),
(
    'Buy groceries',
    'Purchase food and household items for the week from the supermarket.',
    NULL,
    'pending',
    CURRENT_DATE + INTERVAL '1 day', 1
),
(
    'Morning cardio',
    '30-minute high-intensity cardio session.',
    NULL,
    'pending',
    CURRENT_DATE, 2
);
---
-- More tasks for existing projects
INSERT INTO task (title, description, project_id, state, due_date, priority) VALUES
(
    'Select kitchen countertops',
    'Visit showrooms and select granite or quartz countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '2 weeks', 3
),
(
    'Order bathroom tiles',
    'Finalize tile selection and place the order for bathroom flooring and walls.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '3 weeks', 4
),
(
    'Demolish existing kitchen cabinets',
    'Safely remove and dispose of old kitchen cabinets and countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '4 weeks', 5
),
(
    'Install new kitchen flooring',
    'Lay down the new tiles or hardwood for the kitchen floor.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '5 weeks', 4
),
(
    'Assemble and install new kitchen cabinets',
    'Assemble and securely mount the new kitchen cabinets.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '6 weeks', 3
),
(
    'Install kitchen backsplash',
    'Install the tile backsplash above the countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '7 weeks', 2
),
(
    'Paint kitchen walls',
    'Paint the kitchen walls with the chosen color.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '8 weeks', 1
),
(
    'Install new lighting fixtures in kitchen',
    'Install new ceiling lights and under-cabinet lighting.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '9 weeks', 3
),
(
    'Final plumbing and electrical connections for kitchen',
    'Connect the sink, dishwasher, and new electrical outlets.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '10 weeks', 5
),
(
    'Draft wireframes',
    'Create low-fidelity wireframes for all main pages of the new website.',
    (
        SELECT id FROM project
        WHERE name = 'Website Redesign'
    ), 'completed', CURRENT_DATE - INTERVAL '5 months', 4
),
(
    'Develop front-end',
    'Code the front-end of the website based on the approved design.',
    (
        SELECT id FROM project
        WHERE name = 'Website Redesign'
    ), 'completed', CURRENT_DATE - INTERVAL '3 months', 5
),
(
    'Review peer assignments',
    'Provide feedback on two peer assignments for the Agile course.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'pending', CURRENT_DATE + INTERVAL '4 days', 2
);
---
-- Task Planning with varied priorities and times
INSERT INTO task_planning (
    task_id, planned_date, start_hour, end_hour, priority, done
) VALUES
-- Today's Plan
(
    (
        SELECT id FROM task
        WHERE title = 'Morning cardio'
    ), CURRENT_DATE, '07:00:00', '07:30:00', 1, TRUE
),
(
    (
        SELECT id FROM task
        WHERE title = 'Research running shoes'
    ),
    CURRENT_DATE,
    '11:00:00',
    '12:00:00',
    3,
    FALSE
),
(
    (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    ),
    CURRENT_DATE,
    '14:00:00',
    '16:00:00',
    1,
    TRUE
),
-- Tomorrow's Plan (Day + 1)
(
    (
        SELECT id FROM task
        WHERE title = 'Buy groceries'
    ),
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '10:30:00',
    2,
    FALSE
),
-- Day + 3
(
    (
        SELECT id FROM task
        WHERE title = 'Hire an electrician'
    ),
    CURRENT_DATE + INTERVAL '3 day',
    '10:00:00',
    '12:00:00',
    1,
    FALSE
),
(
    (
        SELECT id FROM task
        WHERE title = 'Finalize ad creatives'
    ),
    CURRENT_DATE + INTERVAL '3 day',
    '14:00:00',
    '16:00:00',
    2,
    FALSE
),
-- Day + 5
(
    (
        SELECT id FROM task
        WHERE title = 'Map out weekly running schedule'
    ),
    CURRENT_DATE + INTERVAL '5 day',
    '19:00:00',
    '20:00:00',
    3,
    FALSE
);
---
-- Notes for projects and tasks
INSERT INTO note (content, project_id, task_id) VALUES
(
    'The campaign will focus heavily on Instagram and TikTok, with a budget allocation of 60% and 40% respectively.', -- noqa: LT05
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), NULL
),
(
    'The actor for the public service announcement has been confirmed and will be available for filming next week.', -- noqa: LT05
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), NULL
),
(
    'Make sure the training plan includes rest days and cross-training exercises to avoid injury.', -- noqa: LT05
    (
        SELECT id FROM project
        WHERE name = '10k Race Training Plan'
    ), NULL
),
(
    'Remember to check for local running stores before buying online to get a professional gait analysis.', -- noqa: LT05
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Research running shoes'
    )
),
(
    'Found a highly-rated electrician on Yelp with good reviews for kitchen wiring jobs. Will call tomorrow.', -- noqa: LT05
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Hire an electrician'
    )
),
(
    'I need to review the syllabus again before starting the module, especially the sections on risk mitigation.', -- noqa: LT05
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    )
),
(
    'Make sure to complete the end-of-module quiz for Module 3. It counts toward the final grade.',
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    )
),
(
    'The goal is to buy all necessary items and avoid impulse purchases at the checkout aisle.',
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Buy groceries'
    )
),
(
    'The final report should summarize key learnings from the first three modules and propose a case study example based on my own experience.', -- noqa: LT05
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Write final report'
    )
),
(
    'Morning cardio will be a 30-minute elliptical session at the gym.', NULL, (
        SELECT id FROM task
        WHERE title = 'Morning cardio'
    )
);
---
-- More notes for projects and tasks
INSERT INTO note (content, project_id, task_id) VALUES
(
    'Budget for renovation is $25,000. Need to track all expenses carefully.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), NULL
),
(
    'The new website increased user engagement by 25% in the first month.',
    (
        SELECT id FROM project
        WHERE name = 'Website Redesign'
    ), NULL
),
(
    'Focus on providing constructive and actionable feedback for the peer reviews.',
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Review peer assignments'
    )
),
(
    'Leaning towards a light-colored quartz for a modern look. Get samples from Home Depot and Lowes.', -- noqa: LT05
    NULL,
    (
        SELECT id FROM task
        WHERE title = 'Select kitchen countertops'
    )
);

-- Additional tasks without due_date for testing
INSERT INTO task (title, description, project_id, state, due_date, priority) VALUES
(
    'Organizar escritorio de trabajo',
    'Limpiar y reorganizar el escritorio para mejorar la productividad.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', NULL, 2
),
(
    'Revisar documentos fiscales',
    'Revisar y organizar todos los documentos necesarios para la próxima declaración de impuestos.',
    NULL, 'pending', NULL, 4
),
(
    'Comprar suministros de oficina',
    'Hacer una lista y comprar bolígrafos, papel, y otros suministros necesarios.',
    NULL, 'in_progress', NULL, 1
),
(
    'Llamar al dentista',
    'Programar una cita para la limpieza dental rutinaria.',
    NULL, 'pending', NULL, 3
),
(
    'Investigar cursos online',
    'Buscar cursos de desarrollo profesional en plataformas como Coursera o Udemy.',
    (
        SELECT id FROM project
        WHERE name = 'Personal Development Initiative'
    ), 'pending', NULL, 2
),
(
    'Backup de fotos familiares',
    'Hacer respaldo de todas las fotos familiares en un disco duro externo.',
    NULL, 'pending', NULL, 3
);

INSERT INTO daily_insights (date, text, type, focus_score, productivity_score, sentiment_score, general_score) VALUES
(CURRENT_DATE - INTERVAL '40 days', 'Primer día de seguimiento. Me siento abrumado por el trabajo acumulado. El móvil es una distracción constante. Procrastiné mucho.', 'day', 3, 2, 4, 3),
(CURRENT_DATE - INTERVAL '40 days', 'Empezando la semana. El sprint actual tiene tareas que no me motivan. Me cuesta entender los requisitos de un cliente.', 'job', 2, 3, 3, 2),
(CURRENT_DATE - INTERVAL '39 days', 'Intenté la técnica Pomodoro y logré mantener el foco en la mañana. Por la tarde volví a distraerme.', 'day', 5, 4, 5, 4),
(CURRENT_DATE - INTERVAL '39 days', 'Resolví un pequeño bug que me tenía atascado. La sensación de logro ayudó, pero el avance fue lento.', 'job', 4, 5, 6, 5),
(CURRENT_DATE - INTERVAL '38 days', 'Tuve una mañana productiva, me sentí bien. La tarde fue más lenta. Tuve un par de llamadas que me cortaron el ritmo.', 'day', 6, 6, 6, 6),
(CURRENT_DATE - INTERVAL '38 days', 'Avancé en una tarea que me parecía muy pesada. La terminé antes de lo esperado, pero el código no es tan limpio como quisiera.', 'job', 6, 7, 7, 6),
(CURRENT_DATE - INTERVAL '37 days', 'Día malo. Un amigo me visitó y no logré concentrarme en nada. Frustrado por no haber avanzado en mi proyecto personal.', 'day', 2, 2, 3, 3),
(CURRENT_DATE - INTERVAL '37 days', 'Me sentí desmotivado, la tarea no me gustaba. Pasé más tiempo en Jira que programando. Entregué un código de baja calidad.', 'job', 3, 2, 2, 2),
(CURRENT_DATE - INTERVAL '36 days', 'Me propuse recuperar el tiempo perdido. Fui a una biblioteca a trabajar. Sentí una presión positiva y me ayudó mucho.', 'day', 7, 8, 8, 7),
(CURRENT_DATE - INTERVAL '36 days', 'Reunión con el equipo para aclarar requisitos. La comunicación fue buena y ahora entiendo mejor lo que hay que hacer.', 'job', 7, 7, 7, 7),
(CURRENT_DATE - INTERVAL '35 days', 'Buen día, me sentí en control. Avancé en mi proyecto personal de gestión y me animé. Puntuaciones positivas.', 'day', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '35 days', 'Terminé una funcionalidad clave y pasé a QA. Hubo algunos comentarios, pero no eran bloqueantes. Me siento más aliviado.', 'job', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '34 days', 'Volví a trabajar desde casa. Tuve una llamada personal que me interrumpió la concentración por horas. Me costó mucho volver al foco.', 'day', 5, 5, 6, 5),
(CURRENT_DATE - INTERVAL '34 days', 'El cliente hizo cambios de última hora que requerían reescribir parte del código. Sentí que perdía el tiempo.', 'job', 5, 6, 4, 5),
(CURRENT_DATE - INTERVAL '33 days', 'Me levanté con más energía y ganas. Fui al gimnasio y eso me ayudó a empezar el día con el pie derecho. Logré leer un poco del curso de Spark.', 'day', 7, 7, 7, 7),
(CURRENT_DATE - INTERVAL '33 days', 'Encontré una solución elegante para un problema complicado en el trabajo. Me sentí útil y programando de verdad, no solo siguiendo un manual.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '32 days', 'Tuve una conversación difícil con un familiar, y eso me afectó durante la jornada. Me costó mucho concentrarme, a pesar de las ganas.', 'day', 4, 4, 3, 4),
(CURRENT_DATE - INTERVAL '32 days', 'Me asignaron una tarea de mantenimiento, y me pasé toda la tarde leyendo código legado. Frustrante y aburrido.', 'job', 4, 5, 4, 4),
(CURRENT_DATE - INTERVAL '31 days', 'Fui a un espacio de coworking, y la energía del lugar me impulsó. Terminé un módulo importante de mi proyecto personal.', 'day', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '31 days', 'El código que entregué ayer fue aprobado por QA sin comentarios. ¡Qué alivio! Ahora a por la siguiente tarea.', 'job', 8, 9, 9, 9),
(CURRENT_DATE - INTERVAL '30 days', 'Hoy me siento cansado mentalmente. El trabajo fue pesado y no me quedaron ganas de hacer nada personal. Simplemente descansé.', 'day', 6, 6, 5, 6),
(CURRENT_DATE - INTERVAL '30 days', 'Un error en producción nos tuvo a todos muy estresados. No logramos resolverlo hasta el final del día.', 'job', 5, 5, 4, 5),
(CURRENT_DATE - INTERVAL '29 days', 'Después de un día estresante, me tomé un descanso real. Jugué un videojuego y desconecté. Al final del día me sentí mejor.', 'day', 7, 6, 7, 6),
(CURRENT_DATE - INTERVAL '29 days', 'El bug de ayer se resolvió gracias a un compañero. Me frustra no haberlo visto, pero me siento agradecido.', 'job', 6, 6, 7, 7),
(CURRENT_DATE - INTERVAL '28 days', 'Día de mucha productividad personal. Avancé en mi proyecto y leí sobre Kafka. Siento que me acerco a mi meta de datos.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '28 days', 'Tuve una reunión de seguimiento con mi jefe. Me dio feedback constructivo sobre mi productividad. Ahora sé que tengo que mejorar mi enfoque.', 'job', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '27 days', 'La reunión de ayer me dio un empujón para enfocarme. Hoy no revisé el móvil hasta el descanso del almuerzo. Puntuaciones altas.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '27 days', 'Hoy me enfoqué en una sola tarea y la terminé rápido. Me gustó la dinámica. Sentí que el trabajo era más un desafío que un simple trámite.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '26 days', 'Un bajón hoy. Tuve muchos problemas técnicos en mi PC y eso me puso de mal humor. No logré hacer casi nada de lo que quería.', 'day', 3, 3, 4, 3),
(CURRENT_DATE - INTERVAL '26 days', 'Tuve que lidiar con problemas de infraestructura que no son mi responsabilidad. Pasé la mitad del día en ello y me frustré mucho. Mi productividad bajó.', 'job', 5, 4, 3, 4),
(CURRENT_DATE - INTERVAL '25 days', 'Intenté dejar atrás la frustración de ayer. Me enfoqué en un proyecto personal divertido y me sentí mucho mejor.', 'day', 7, 7, 8, 7),
(CURRENT_DATE - INTERVAL '25 days', 'Hoy, me puse al día con el trabajo que no hice ayer. El código fluyó y me sentí en la zona, resolviendo problemas de verdad. Me gustó la sensación.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '24 days', 'Tuve un día productivo en lo personal. Mi rutina de ejercicio está funcionando y me siento con más energía.', 'day', 8, 9, 9, 9),
(CURRENT_DATE - INTERVAL '24 days', 'En la reunión de equipo me asignaron una tarea que me parecía interesante y desafiante. Eso me motivó para el resto de la jornada. ', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '23 days', 'Otro día con muchas distracciones. Sentí que el progreso en mis proyectos se estancaba, y eso bajó mi ánimo. Tuve problemas de conexión.', 'day', 5, 6, 5, 5),
(CURRENT_DATE - INTERVAL '23 days', 'El cliente no aprobó una de las funcionalidades que había entregado. Tendré que hacer cambios significativos. Es frustrante.', 'job', 6, 5, 4, 5),
(CURRENT_DATE - INTERVAL '22 days', 'Decidí tomarme un día de descanso total de pantallas. Salí a caminar y a desconectar. Me sentí mucho más recargado.', 'day', 7, 7, 9, 8),
(CURRENT_DATE - INTERVAL '22 days', 'Volví al trabajo con la mente fresca. Encontré la solución para el problema que tenía con el cliente. Me siento optimista.', 'job', 9, 9, 8, 9),
(CURRENT_DATE - INTERVAL '21 days', 'Muy enfocado hoy. Leí un capítulo de mi curso de datos y resolví un problema de lógica en mi proyecto personal.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '21 days', 'Tuve una reunión con mi jefe donde pude expresar mi interés en proyectos de datos. Dijo que lo tendría en cuenta. Fue un alivio.', 'job', 9, 8, 9, 9),
(CURRENT_DATE - INTERVAL '20 days', 'Sigo en racha. Me siento más proactivo y en control. La rutina de seguimiento me está ayudando a notar las mejoras.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '20 days', 'La rutina de mañana fue clave. Entregué mi tarea de trabajo mucho antes de lo esperado, y tuve tiempo para ayudar a un compañero.', 'job', 9, 10, 10, 9),
(CURRENT_DATE - INTERVAL '19 days', 'Hoy no me sentí al 100%. Me costó arrancar por la mañana. Pasé demasiado tiempo viendo noticias en lugar de trabajar.', 'day', 6, 6, 6, 6),
(CURRENT_DATE - INTERVAL '19 days', 'Estaba probando una nueva librería para el trabajo y no funcionó como esperaba. Frustración y código de baja calidad.', 'job', 5, 5, 4, 5),
(CURRENT_DATE - INTERVAL '18 days', 'Me forcé a ir a un café a trabajar. El cambio de ambiente ayudó a mi concentración. La rutina está funcionando.', 'day', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '18 days', 'Finalmente resolví el problema de la librería de ayer. La sensación de éxito me subió la moral. Pude avanzar en otras tareas.', 'job', 8, 8, 9, 8),
(CURRENT_DATE - INTERVAL '17 days', 'Tuve una reunión de seguimiento con mi jefe y me dio muy buen feedback sobre la calidad de mi trabajo. Me siento valorado.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '17 days', 'El feedback de mi jefe me motivó. Avancé más de lo que esperaba en la planificación de una nueva funcionalidad. Productividad al máximo.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '16 days', 'Un bajón de energía hoy. No dormí bien y se notó en mi concentración. El día se me hizo muy largo.', 'day', 5, 5, 5, 5),
(CURRENT_DATE - INTERVAL '16 days', 'Cometí un error tonto al desplegar código y tuve que revertirlo. El estrés me pasó factura. La calidad del código bajó.', 'job', 6, 5, 4, 5),
(CURRENT_DATE - INTERVAL '15 days', 'Acepté que los errores ocurren y me enfoqué en solucionar el problema de ayer. Me sentí más tranquilo y en control.', 'day', 7, 7, 7, 7),
(CURRENT_DATE - INTERVAL '15 days', 'Con la mente más clara, pude solucionar el problema de despliegue en minutos. Entregué un par de tareas más pequeñas.', 'job', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '14 days', 'Día de desconexión. Me tomé un tiempo para mí. Fui a caminar y medité un poco. Volví a casa renovado.', 'day', 7, 7, 9, 8),
(CURRENT_DATE - INTERVAL '14 days', 'Logré terminar el sprint a tiempo gracias al trabajo de la semana. Me sentí muy orgulloso del equipo.', 'job', 8, 8, 9, 9),
(CURRENT_DATE - INTERVAL '13 days', 'El descanso de ayer me ayudó a empezar la semana con mucha energía. Me sentí productivo en mis proyectos personales.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '13 days', 'Empezamos un nuevo sprint con tareas más interesantes. Las reuniones iniciales fueron fluidas y me sentí parte del equipo.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '12 days', 'Tuve un conflicto con un compañero de equipo. Me frustró la situación y me afectó durante el día.', 'day', 6, 5, 4, 5),
(CURRENT_DATE - INTERVAL '12 days', 'El conflicto afectó mi trabajo. Pasé más tiempo lidiando con la situación que programando. La calidad de mi trabajo bajó.', 'job', 6, 6, 5, 6),
(CURRENT_DATE - INTERVAL '11 days', 'Hablé con mi compañero y solucionamos el conflicto. La comunicación abierta me hizo sentir mucho mejor. El ambiente se sintió más ligero.', 'day', 8, 8, 8, 8),
(CURRENT_DATE - INTERVAL '11 days', 'Al resolver el problema personal, me pude enfocar mejor. Me sentí más a gusto en el equipo. La productividad regresó a niveles altos.', 'job', 8, 9, 9, 9),
(CURRENT_DATE - INTERVAL '10 days', 'Buen día, me sentí en control de mis tareas y logré avanzar significativamente en mi proyecto personal. Puntuaciones altas.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '10 days', 'Entregué una funcionalidad compleja que el cliente pidió. QA no encontró bugs. Me sentí muy orgulloso.', 'job', 9, 10, 10, 10),
(CURRENT_DATE - INTERVAL '9 days', 'Un día de tranquilidad. Me dediqué a aprender sobre Apache Kafka. Fue un día más de aprendizaje que de productividad.', 'day', 8, 8, 9, 8),
(CURRENT_DATE - INTERVAL '9 days', 'Participé en una reunión con el equipo de datos. Me sentí emocionado de ver el trabajo que hacen. Me dio más ganas de seguir con mis estudios.', 'job', 8, 8, 9, 9),
(CURRENT_DATE - INTERVAL '8 days', 'Me siento más cómodo con mi rutina de trabajo. La gestión del tiempo está mejorando. La frustración es menor.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '8 days', 'El código fluye. Avancé en mi tarea principal y logré refactorizar un código antiguo para mejorar su rendimiento.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '7 days', 'Tuve un día difícil. Me enfermé y no pude concentrarme en nada. El día fue de puro descanso.', 'day', 2, 2, 2, 2),
(CURRENT_DATE - INTERVAL '7 days', 'No pude trabajar por estar enfermo. Fue frustrante sentir que me atrasaba, pero me tomé el tiempo para recuperarme.', 'job', 2, 2, 2, 2),
(CURRENT_DATE - INTERVAL '6 days', 'Volví al trabajo después de estar enfermo. La mente estaba un poco borrosa, pero pude ponerme al día con algunas tareas.', 'day', 6, 6, 7, 6),
(CURRENT_DATE - INTERVAL '6 days', 'El equipo fue muy comprensivo con mi ausencia. Me dieron un par de tareas sencillas para que me reincorporara sin estrés.', 'job', 7, 7, 8, 7),
(CURRENT_DATE - INTERVAL '5 days', 'Día muy productivo. La pausa por enfermedad me hizo apreciar más mi trabajo. Me concentré al máximo.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '5 days', 'Resolví una tarea difícil. Me sentí muy satisfecho con mi habilidad para resolver problemas. Me sentí muy útil.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '4 days', 'Tuve una conversación sobre mis objetivos a largo plazo en el trabajo. Me siento más alineado con mis metas profesionales.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '4 days', 'Mi jefe me dio una tarea relacionada con datos. Un pequeño paso en la dirección correcta. Me siento muy motivado.', 'job', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '3 days', 'Día de mucha energía. Pude equilibrar bien el trabajo y mis proyectos personales. Siento que estoy saliendo del bache.', 'day', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '3 days', 'Mi código fue a producción sin errores. Una sensación de logro inmensa. El QA me felicitó por la calidad.', 'job', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '2 days', 'Logré terminar el trabajo temprano y tuve tiempo para dedicarme a un hobby. Me siento más equilibrado.', 'day', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '2 days', 'Un cliente me llamó para agradecer por una funcionalidad que había desarrollado. Me sentí muy bien y útil.', 'job', 9, 9, 9, 9),
(CURRENT_DATE - INTERVAL '1 day', 'Reflexioné sobre mi progreso. Me siento muy diferente a como estaba hace un par de meses. La autogestión está funcionando.', 'day', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '1 day', 'Ayudé a un nuevo compañero con un problema. Disfruté compartiendo mi conocimiento y me sentí parte importante del equipo.', 'job', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '0 days', 'Hoy me siento en un buen lugar, mental y profesionalmente. Sigo aprendiendo y trabajando en mis metas. Confío en el proceso.', 'day', 10, 10, 10, 10),
(CURRENT_DATE - INTERVAL '0 days', 'Recibí una propuesta de trabajo que me parece muy interesante. Me sentí satisfecho por mi evolución y el reconocimiento que recibí.', 'job', 10, 10, 10, 10);

-- Habits and Metrics seed
-- Base Habits
INSERT INTO habit (name, description, type) VALUES
('Meditación', 'Sesión corta de mindfulness', 'boolean'),
('Leer 20 minutos', 'Lectura diaria para aprendizaje', 'boolean'),
('Ejercicio', 'Entrenamiento físico con puntuación subjetiva 1-10', 'score')
ON CONFLICT DO NOTHING;

-- Base Metrics
INSERT INTO metric (name, description, unit) VALUES
('Peso', 'Peso corporal matutino', 'kg'),
('Horas de sueño', 'Duración total de sueño', 'h'),
('Pasos', 'Conteo diario de pasos', 'steps')
ON CONFLICT DO NOTHING;

-- 40 days of Habit Entries (boolean)
INSERT INTO habit_entry (habit_id, date, completed)
SELECT h.id, gs::date AS date,
      CASE WHEN (EXTRACT(DOW FROM gs)::int IN (0,6)) THEN (RANDOM() < 0.7) ELSE (RANDOM() < 0.85) END AS completed
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN habit h ON h.name = 'Meditación'
ON CONFLICT (habit_id, date) DO NOTHING;

INSERT INTO habit_entry (habit_id, date, completed)
SELECT h.id, gs::date AS date,
      CASE WHEN (EXTRACT(DOW FROM gs)::int IN (0,6)) THEN (RANDOM() < 0.6) ELSE (RANDOM() < 0.8) END AS completed
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN habit h ON h.name = 'Leer 20 minutos'
ON CONFLICT (habit_id, date) DO NOTHING;

-- 40 days of Habit Entries (score)
INSERT INTO habit_entry (habit_id, date, score)
SELECT h.id, gs::date AS date,
      GREATEST(1, LEAST(10, ROUND((5 + 2 * SIN(EXTRACT(EPOCH FROM gs)/86400.0) + (RANDOM()*2-1)*1.5)::numeric)))::int AS score
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN habit h ON h.name = 'Ejercicio'
ON CONFLICT (habit_id, date) DO NOTHING;

-- 40 days of Metric Entries
-- Peso: tendencia ligera a la baja con ruido
INSERT INTO metric_entry (metric_id, date, value)
SELECT m.id, gs::date AS date,
      ROUND((78.0 - 0.05 * (CURRENT_DATE - gs::date) + (RANDOM()-0.5)*0.8)::numeric, 1) AS value
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN metric m ON m.name = 'Peso'
ON CONFLICT (metric_id, date) DO NOTHING;

-- Horas de sueño: alrededor de 7.2h con variación
INSERT INTO metric_entry (metric_id, date, value)
SELECT m.id, gs::date AS date,
      ROUND((7.2 + 0.5 * SIN(2 * PI() * (EXTRACT(DOW FROM gs)::int) / 7.0) + (RANDOM()-0.5)*0.8)::numeric, 2) AS value
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN metric m ON m.name = 'Horas de sueño'
ON CONFLICT (metric_id, date) DO NOTHING;

-- Pasos: más pasos en días laborables, menos en fin de semana, con ruido
INSERT INTO metric_entry (metric_id, date, value)
SELECT m.id, gs::date AS date,
      GREATEST(0, ROUND(
         (CASE WHEN EXTRACT(DOW FROM gs)::int IN (0,6)
             THEN 6500 + (RANDOM()-0.5)*2500
             ELSE 9000 + (RANDOM()-0.5)*3000
         END)::numeric
      )) AS value
FROM generate_series(CURRENT_DATE - INTERVAL '39 days', CURRENT_DATE, INTERVAL '1 day') AS gs
JOIN metric m ON m.name = 'Pasos'
ON CONFLICT (metric_id, date) DO NOTHING;
