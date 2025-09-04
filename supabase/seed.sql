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
    expected_end_date
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
    CURRENT_DATE + INTERVAL '6 months'
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
    CURRENT_DATE + INTERVAL '3 months'
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
    CURRENT_DATE - INTERVAL '1 month'
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
    CURRENT_DATE - INTERVAL '7 months'
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
    CURRENT_DATE + INTERVAL '2 months'
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
    CURRENT_DATE + INTERVAL '1 month'
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
    CURRENT_DATE + INTERVAL '2 months'
);
---
-- Tasks for the new projects
INSERT INTO task (title, description, project_id, state, due_date) VALUES
(
    'Define campaign target audience',
    'Identify the key demographics and interests for the Q4 marketing campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'completed', CURRENT_DATE - INTERVAL '1 week'
),
(
    'Create social media content calendar',
    'Plan and schedule all social media posts for the campaign on Instagram and TikTok.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 month'
),
(
    'Finalize ad creatives',
    'Collaborate with the graphic designer to finalize all ad images and videos.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'pending', CURRENT_DATE + INTERVAL '1 month 1 week'
),
(
    'Map out weekly running schedule',
    'Create a detailed weekly training plan, including long runs, speed work, and rest days.',
    (
        SELECT id FROM project
        WHERE name = '10k Race Training Plan'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 week'
),
(
    'Research running shoes',
    'Look for suitable running shoes with good cushioning and support for long-distance running.',
    (
        SELECT id FROM project
        WHERE name = '10k Race Training Plan'
    ), 'pending', CURRENT_DATE
),
(
    'Hire an electrician',
    'Interview and hire a certified electrician for the kitchen wiring.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '3 days'
),
(
    'Complete Module 3',
    'Finish the third module on project risk management, including the end-of-module quiz.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'in_progress', CURRENT_DATE + INTERVAL '2 days'
),
(
    'Write final report',
    'Draft and finalize the project report summarizing learnings and a case study from the course.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'pending', CURRENT_DATE + INTERVAL '1 week'
),
(
    'Buy groceries',
    'Purchase food and household items for the week from the supermarket.',
    NULL,
    'pending',
    CURRENT_DATE + INTERVAL '1 day'
),
(
    'Morning cardio',
    '30-minute high-intensity cardio session.',
    NULL,
    'pending',
    CURRENT_DATE
);
---
-- More tasks for existing projects
INSERT INTO task (title, description, project_id, state, due_date) VALUES
(
    'Select kitchen countertops',
    'Visit showrooms and select granite or quartz countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '2 weeks'
),
(
    'Order bathroom tiles',
    'Finalize tile selection and place the order for bathroom flooring and walls.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '3 weeks'
),
(
    'Demolish existing kitchen cabinets',
    'Safely remove and dispose of old kitchen cabinets and countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '4 weeks'
),
(
    'Install new kitchen flooring',
    'Lay down the new tiles or hardwood for the kitchen floor.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '5 weeks'
),
(
    'Assemble and install new kitchen cabinets',
    'Assemble and securely mount the new kitchen cabinets.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '6 weeks'
),
(
    'Install kitchen backsplash',
    'Install the tile backsplash above the countertops.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '7 weeks'
),
(
    'Paint kitchen walls',
    'Paint the kitchen walls with the chosen color.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '8 weeks'
),
(
    'Install new lighting fixtures in kitchen',
    'Install new ceiling lights and under-cabinet lighting.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '9 weeks'
),
(
    'Final plumbing and electrical connections for kitchen',
    'Connect the sink, dishwasher, and new electrical outlets.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', CURRENT_DATE + INTERVAL '10 weeks'
),
(
    'Draft wireframes',
    'Create low-fidelity wireframes for all main pages of the new website.',
    (
        SELECT id FROM project
        WHERE name = 'Website Redesign'
    ), 'completed', CURRENT_DATE - INTERVAL '5 months'
),
(
    'Develop front-end',
    'Code the front-end of the website based on the approved design.',
    (
        SELECT id FROM project
        WHERE name = 'Website Redesign'
    ), 'completed', CURRENT_DATE - INTERVAL '3 months'
),
(
    'Review peer assignments',
    'Provide feedback on two peer assignments for the Agile course.',
    (
        SELECT id FROM project
        WHERE name = 'Agile Project Management Course'
    ), 'pending', CURRENT_DATE + INTERVAL '4 days'
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
INSERT INTO task (title, description, project_id, state, due_date) VALUES
(
    'Organizar escritorio de trabajo',
    'Limpiar y reorganizar el escritorio para mejorar la productividad.',
    (
        SELECT id FROM project
        WHERE name = 'Annual Home Renovation'
    ), 'pending', NULL
),
(
    'Revisar documentos fiscales',
    'Revisar y organizar todos los documentos necesarios para la próxima declaración de impuestos.',
    NULL, 'pending', NULL
),
(
    'Comprar suministros de oficina',
    'Hacer una lista y comprar bolígrafos, papel, y otros suministros necesarios.',
    NULL, 'in_progress', NULL
),
(
    'Llamar al dentista',
    'Programar una cita para la limpieza dental rutinaria.',
    NULL, 'pending', NULL
),
(
    'Investigar cursos online',
    'Buscar cursos de desarrollo profesional en plataformas como Coursera o Udemy.',
    (
        SELECT id FROM project
        WHERE name = 'Personal Development Initiative'
    ), 'pending', NULL
),
(
    'Backup de fotos familiares',
    'Hacer respaldo de todas las fotos familiares en un disco duro externo.',
    NULL, 'pending', NULL
);
