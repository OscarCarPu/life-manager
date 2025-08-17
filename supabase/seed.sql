-- seed.sql - Extended demo data
-- Categories
INSERT INTO category (name, description, color) VALUES
('Finance', 'Financial management and accounting tasks.', '#48bb78'),
('Marketing', 'Digital and traditional marketing initiatives.', '#ed8936'),
('Health & Wellness', 'Personal health, fitness, and well-being.', '#9f7aea'),
('Productivity', 'Tasks and methods to increase efficiency.', '#38a169'),
('Learning', 'Educational and skill development activities.', '#d53f8c');
---
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
),
(
    'Time Management', 'Techniques and planning for effective use of time.', '#667eea', (
        SELECT id FROM category
        WHERE name = 'Productivity'
    )
);
---
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
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE + INTERVAL '4 month'
),
(
    'Personal Fitness Goal', 'Train for a 10k run.', (
        SELECT id FROM category
        WHERE name = 'Health & Wellness'
    ), 'in_progress', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month'
),
(
    'Monthly Budget Review', 'Review and update the family budget for the month.', (
        SELECT id FROM category
        WHERE name = 'Budgeting'
    ), 'not_started', CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'
),
(
    'Project Management Course', 'Complete an online course on agile project management.', (
        SELECT id FROM category
        WHERE name = 'Learning'
    ), 'in_progress', CURRENT_DATE - INTERVAL '2 weeks', CURRENT_DATE + INTERVAL '2 weeks'
);
---
-- Tasks for the new projects
INSERT INTO task (title, description, project_id, state, due_date) VALUES
(
    'Define campaign target audience',
    'Identify the key demographics for the Q4 marketing campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'completed', CURRENT_DATE + INTERVAL '1 month'
),
(
    'Create social media content calendar',
    'Plan and schedule all social media posts for the campaign.',
    (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 month 1 week'
),
(
    'Hire a graphic designer', 'Find and hire a freelance graphic designer for ad creatives.', (
        SELECT id FROM project
        WHERE name = 'Q4 Marketing Campaign'
    ), 'pending', CURRENT_DATE + INTERVAL '1 month'
),
(
    'Plan running schedule', 'Create a weekly training plan for the 10k.', (
        SELECT id FROM project
        WHERE name = 'Personal Fitness Goal'
    ), 'in_progress', CURRENT_DATE + INTERVAL '1 week'
),
(
    'Research running shoes', 'Look for suitable running shoes online and in stores.', (
        SELECT id FROM project
        WHERE name = 'Personal Fitness Goal'
    ), 'pending', CURRENT_DATE
),
(
    'Review last month''s expenses', 'Gather all receipts and bank statements from last month.', (
        SELECT id FROM project
        WHERE name = 'Monthly Budget Review'
    ), 'pending', CURRENT_DATE + INTERVAL '3 days'
),
(
    'Complete Module 3', 'Finish the third module on project risk management.', (
        SELECT id FROM project
        WHERE name = 'Project Management Course'
    ), 'in_progress', CURRENT_DATE + INTERVAL '2 days'
),
(
    'Submit progress report', 'Write and submit a progress report for the course.', (
        SELECT id FROM project
        WHERE name = 'Project Management Course'
    ), 'pending', CURRENT_DATE + INTERVAL '1 week'
),
(
    'Buy groceries',
    'Purchase food and household items for the week.',
    NULL,
    'pending',
    CURRENT_DATE + INTERVAL '1 day'
),
(
    'Call electrician',
    'Schedule an appointment for the kitchen wiring.',
    NULL,
    'pending',
    CURRENT_DATE + INTERVAL '1 day'
),
(
    'Morning workout', '30-minute cardio session.', NULL, 'pending', CURRENT_DATE
),
(
    'Evening meditation',
    '15-minute mindfulness session to de-stress.',
    NULL,
    'pending',
    CURRENT_DATE
);
---
-- Task Planning with varied priorities and times for today and the next 7 days
INSERT INTO task_planning (task_id, planned_date, start_hour, end_hour, priority) VALUES
-- Today's Plan
(
    (
        SELECT id FROM task
        WHERE title = 'Morning workout'
    ), CURRENT_DATE, '07:00:00', '07:30:00', 1
),
(
    (
        SELECT id FROM task
        WHERE title = 'Review last month''s expenses'
    ),
    CURRENT_DATE,
    '09:00:00',
    '11:00:00',
    2
),
(
    (
        SELECT id FROM task
        WHERE title = 'Research running shoes'
    ),
    CURRENT_DATE,
    '11:00:00',
    '12:00:00',
    3
),
(
    (
        SELECT id FROM task
        WHERE title = 'Evening meditation'
    ),
    CURRENT_DATE,
    '20:00:00',
    '20:15:00',
    1
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
    2
),
(
    (
        SELECT id FROM task
        WHERE title = 'Call electrician'
    ),
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '09:30:00',
    3
),
(
    (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    ),
    CURRENT_DATE + INTERVAL '1 day',
    NULL,
    NULL,
    1
),
-- Day + 2
(
    (
        SELECT id FROM task
        WHERE title = 'Plan running schedule'
    ),
    CURRENT_DATE + INTERVAL '2 day',
    '18:00:00',
    '19:00:00',
    2
),
(
    (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    ),
    CURRENT_DATE + INTERVAL '2 day',
    '10:00:00',
    NULL,
    1
),
-- Day + 3
(
    (
        SELECT id FROM task
        WHERE title = 'Review last month''s expenses'
    ),
    CURRENT_DATE + INTERVAL '3 day',
    '15:00:00',
    '16:00:00',
    2
),
(
    (
        SELECT id FROM task
        WHERE title = 'Hire a graphic designer'
    ),
    CURRENT_DATE + INTERVAL '3 day',
    '10:00:00',
    '12:00:00',
    1
),
-- Day + 4
(
    (
        SELECT id FROM task
        WHERE title = 'Create social media content calendar'
    ),
    CURRENT_DATE + INTERVAL '4 day',
    '13:00:00',
    '15:00:00',
    1
),
-- Day + 5
(
    (
        SELECT id FROM task
        WHERE title = 'Buy groceries'
    ),
    CURRENT_DATE + INTERVAL '5 day',
    '17:00:00',
    '18:00:00',
    2
),
(
    (
        SELECT id FROM task
        WHERE title = 'Plan running schedule'
    ),
    CURRENT_DATE + INTERVAL '5 day',
    '19:00:00',
    '20:00:00',
    3
),
-- Day + 6
(
    (
        SELECT id FROM task
        WHERE title = 'Submit progress report'
    ),
    CURRENT_DATE + INTERVAL '6 day',
    '09:00:00',
    '11:00:00',
    1
),
-- Day + 7
(
    (
        SELECT id FROM task
        WHERE title = 'Create social media content calendar'
    ),
    CURRENT_DATE + INTERVAL '7 day',
    '10:00:00',
    '12:00:00',
    1
);
---
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
),
(
    'Review the syllabus again before starting the module.', NULL, (
        SELECT id FROM task
        WHERE title = 'Complete Module 3'
    )
),
(
    'Need to call the grocery store to see if they have organic eggs.', NULL, (
        SELECT id FROM task
        WHERE title = 'Buy groceries'
    )
),
(
    'The wiring is for the new kitchen island.', NULL, (
        SELECT id FROM task
        WHERE title = 'Call electrician'
    )
),
(
    'Focus on gratitude and deep breathing during the meditation.', NULL, (
        SELECT id FROM task
        WHERE title = 'Evening meditation'
    )
),
(
    'The progress report should summarize key learnings from the first three modules.', NULL, (
        SELECT id FROM task
        WHERE title = 'Submit progress report'
    )
);
