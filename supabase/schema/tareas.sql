-- Schema para sistema de gestión de tareas
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color CHAR(7) DEFAULT '#3182ce',
    parent_category_id INTEGER REFERENCES category (id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES category (id) ON DELETE SET NULL,
    color CHAR(7) DEFAULT '#f6e05e',
    expected_start_date DATE,
    expected_end_date DATE,
    state VARCHAR(50) CHECK (
        state IN ('not_started', 'in_progress', 'completed', 'archived')
    ) DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE,
    description TEXT,
    project_id INTEGER REFERENCES project (id) ON DELETE CASCADE,
    state VARCHAR(50) CHECK (
        state IN ('pending', 'completed', 'in_progress', 'archived')
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE TABLE IF NOT EXISTS task_planning (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES task (id) ON DELETE CASCADE NOT NULL,
    planned_date DATE NOT NULL,
    start_hour TIME,
    end_hour TIME,
    priority INTEGER CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_id, planned_date)
);

-- Trigger para la tabla category
CREATE TRIGGER update_category_updated_at
BEFORE UPDATE ON category
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Trigger para la tabla project
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Trigger para la tabla task
CREATE TRIGGER update_task_updated_at
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Trigger para la tabla task_planning
CREATE TRIGGER update_task_planning_updated_at
BEFORE UPDATE ON task_planning
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();
