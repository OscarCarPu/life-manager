-- Function to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Schema for a task management system
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES category (id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

-- Indexes to improve query performance
CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    description TEXT,
    category_id INTEGER REFERENCES category (id) ON DELETE SET NULL,
    state VARCHAR(50) CHECK (
        state IN ('pending', 'completed', 'in_progress', 'archived')
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

-- Indexes to improve query performance
CREATE TABLE IF NOT EXISTS task_planning (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES task (id) ON DELETE CASCADE NOT NULL,
    planned_date DATE NOT NULL,
    start_hour TIME NULL,
    end_hour TIME NULL,
    priority INTEGER CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp,
    UNIQUE (task_id, planned_date, start_hour)
);

-- Trigger for the category table
CREATE TRIGGER update_category_updated_at
BEFORE UPDATE ON category
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for the task table
CREATE TRIGGER update_task_updated_at
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for the task_planning table
CREATE TRIGGER update_task_planning_updated_at
BEFORE UPDATE ON task_planning
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
