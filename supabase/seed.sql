-- Seed de datos para la tabla 'category'
INSERT INTO category (name, description) VALUES
('Work', 'Tasks related to professional activities.'),
('Personal', 'Tasks related to personal life and errands.'),
('Study', 'Tasks related to learning and education.'),
('Health', 'Tasks related to well-being and fitness.'),
('Finance', 'Tasks related to money management.');

INSERT INTO category (name, description, parent_category_id) VALUES
(
    'Project Alpha', 'Specific tasks for Project Alpha.', (
        SELECT id FROM category
        WHERE name = 'Work'
    )
),
(
    'Home Chores', 'Tasks for maintaining the household.', (
        SELECT id FROM category
        WHERE name = 'Personal'
    )
),
('Exam Prep', 'Preparation for upcoming exams.', (
    SELECT id FROM category
    WHERE name = 'Study'
));

---
-- Seed de datos para la tabla 'task'
INSERT INTO task (title, due_date, description, category_id, state) VALUES
(
    'Complete report Q2', '2025-06-15', 'Finish the quarterly financial report.', (
        SELECT id FROM category
        WHERE name = 'Work'
    ), 'in_progress'
),
(
    'Buy groceries', '2025-06-07', 'Milk, eggs, bread, fruits, vegetables.', (
        SELECT id FROM category
        WHERE name = 'Personal'
    ), 'pending'
),
(
    'Study for history exam', '2025-06-20', 'Review chapters 1-5 and practice questions.', (
        SELECT id FROM category
        WHERE name = 'Study'
    ), 'pending'
),
(
    'Go to the gym', '2025-06-06', 'Workout for 1 hour.', (
        SELECT id FROM category
        WHERE name = 'Health'
    ), 'completed'
),
(
    'Pay credit card bill', '2025-06-10', 'Pay the outstanding balance.', (
        SELECT id FROM category
        WHERE name = 'Finance'
    ), 'pending'
),
(
    'Develop new feature', '2025-06-25', 'Implement user authentication for Project Alpha.', (
        SELECT id FROM category
        WHERE name = 'Project Alpha'
    ), 'in_progress'
),
(
    'Clean living room', '2025-06-08', 'Vacuum, dust, and organize.', (
        SELECT id FROM category
        WHERE name = 'Home Chores'
    ), 'pending'
),
(
    'Read "1984" chapter 3', '2025-06-09', 'Continue reading for literature class.', (
        SELECT id FROM category
        WHERE name = 'Study'
    ), 'pending'
);

---
-- Seed de datos para la tabla 'task_planning'
INSERT INTO task_planning (task_id, planned_date, start_hour, end_hour, priority) VALUES
((
    SELECT id FROM task
    WHERE title = 'Complete report Q2'
), '2025-06-12', '09:00:00', '13:00:00', 5),
((
    SELECT id FROM task
    WHERE title = 'Buy groceries'
), '2025-06-07', '17:00:00', '18:00:00', 3),
(
    (
        SELECT id FROM task
        WHERE title = 'Study for history exam'
    ), '2025-06-18', '10:00:00', '12:00:00', 4
),
((
    SELECT id FROM task
    WHERE title = 'Go to the gym'
), '2025-06-06', '07:00:00', '08:00:00', 2),
(
    (
        SELECT id FROM task
        WHERE title = 'Pay credit card bill'
    ), '2025-06-09', '14:00:00', '14:30:00', 5
),
(
    (
        SELECT id FROM task
        WHERE title = 'Develop new feature'
    ), '2025-06-20', '09:00:00', '17:00:00', 5
),
((
    SELECT id FROM task
    WHERE title = 'Clean living room'
), '2025-06-08', '10:00:00', '11:00:00', 3),
(
    (
        SELECT id FROM task
        WHERE title = 'Read "1984" chapter 3'
    ), '2025-06-09', '20:00:00', '21:00:00', 2
);
