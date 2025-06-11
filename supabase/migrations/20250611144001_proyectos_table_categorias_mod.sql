-- Migration for adding project and modifying categories and task interaction

-- Adding white color to category table
ALTER TABLE category
ADD COLUMN color CHAR(7) DEFAULT '#FFFFFF';

-- Create project table
CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES category (id) ON DELETE SET NULL,
    color CHAR(7) DEFAULT '#ADD8E6',
    expected_start_date DATE,
    expected_end_date DATE,
    state VARCHAR(50) CHECK (
        state IN ('not_started', 'in_progress', 'completed', 'archived')
    ) DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding trigger for updated
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Modify task to link to project
ALTER TABLE task
DROP CONSTRAINT IF EXISTS task_category_id_fkey;

ALTER TABLE task
DROP COLUMN IF EXISTS category_id;

ALTER TABLE task
ADD COLUMN project_id INTEGER REFERENCES project (id) ON DELETE CASCADE;

-- Add default task_state
ALTER TABLE task
ALTER COLUMN state SET DEFAULT 'pending';
