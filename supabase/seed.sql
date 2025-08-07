-- seed.sql - Extended demo data

-- Categories
INSERT INTO category (name, description, color) VALUES
('Finance', 'Financial management and accounting tasks.', '#48bb78'),
('Marketing', 'Digital and traditional marketing initiatives.', '#ed8936'),
('Health & Wellness', 'Personal health, fitness, and well-being.', '#9f7aea');

-- Subcategories
INSERT INTO category (name, description, color, parent_category_id) VALUES
(
    'Budgeting', 'Monthly and annual budget planning.', '#4299e1', (
        SELECT id FROM category
        WHERE name = 'Finance'
    )
),
(
    'Social Media', 'Content creation and scheduling for social media platforms.', '#f6ad55', (
        SELECT id FROM category
        WHERE name = 'Marketing'
    )
);

-- Projects
INSERT INTO project (
    name, description, category_id, state, expected_start_date, expected_end_date
) VALUES
(
    'Q4 Marketing Campaign',
    'Develop and execute a new marketing campaign for the fourth quarter.',
    (
        SELECT id FROM category
        WHERE name = 'Marketing'
    ), 'in_progress', '2025-10-01', '2025-12-31'
),
(
    'Personal Fitness Goal', 'Train for a 10k run.', (
        SELECT id FROM category
        WHERE name = 'Health & Wellness'
    ), 'in_progress', '2025-09-01', '2025-11-01'
),
(
    'Monthly Budget Review', 'Review and update the family budget for the month.', (
        SELECT id FROM category
        WHERE name = 'Budgeting'
    ), 'not_started', '2025-08-01', '2025-08-05'
);

-- Tasks for the new projects
INSERT INTO task (title, description, project_id, state, due_date) VALUES
(
    'Define campaign target audience',
    'Identify the key demographics for the Q4 marketing campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'completed', '2025-10-07'
),
(
    'Create social media content calendar',
    'Plan and schedule all social media posts for the campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'in_progress', '2025-10-15'
),
(
    'Hire a graphic designer', 'Find and hire a freelance graphic designer for ad creatives.', (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'pending', '2025-10-10'
),
(
    'Plan running schedule', 'Create a weekly training plan for the 10k.', (
        SELECT id FROM project
        WHERE name = 'Personal Fitness Goal'
    ), 'in_progress', '2025-09-05'
),
(
    'Research running shoes', 'Look for suitable running shoes online and in stores.', (
        SELECT id FROM project
        WHERE name = 'Personal Fitness Goal'
    ), 'pending', '2025-09-01'
),
(
    'Review last month''s expenses', 'Gather all receipts and bank statements from last month.', (
        SELECT id FROM project
        WHERE name = 'Monthly Budget Review'
    ), 'pending', '2025-08-03'
);

-- Task Planning with varied priorities and times
INSERT INTO task_planning (task_id, planned_date, start_hour, end_hour, priority) VALUES
-- Planning for "Create social media content calendar"
(
    (
        SELECT id FROM task
        WHERE title = 'Create social media content calendar'
    ), '2025-10-10', '14:00:00', '17:00:00', 1
),
(
    (
        SELECT id FROM task
        WHERE title = 'Create social media content calendar'
    ), '2025-10-11', '09:00:00', '12:00:00', 1
),
-- Planning for "Plan running schedule"
(
    (
        SELECT id FROM task
        WHERE title = 'Plan running schedule'
    ), '2025-08-28', '19:00:00', '20:00:00', 3
),
-- Planning for "Review last month's expenses"
(
    (
        SELECT id FROM task
        WHERE title = 'Review last month''s expenses'
    ), '2025-08-02', '10:00:00', '11:30:00', 2
);

-- Notes for new projects and tasks
INSERT INTO note (content, project_id, task_id) VALUES
(
    'The campaign will focus heavily on Instagram and TikTok.', (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), NULL
),
(
    'Make sure the training plan includes rest days and cross-training.', (
        SELECT id FROM project
        WHERE name = 'Personal Fitness Goal'
    ), NULL
),
(
    'Remember to check for local running stores before buying online.', NULL, (
        SELECT id FROM task
        WHERE title = 'Research running shoes'
    )
),
(
    'The goal is to reduce discretionary spending by 10% this month.', (
        SELECT id FROM project
        WHERE name = 'Monthly Budget Review'
    ), NULL
);
