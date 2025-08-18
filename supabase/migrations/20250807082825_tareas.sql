-- Tabla de categories
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES category (id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES category (id) ON DELETE SET NULL,
    expected_start_date DATE,
    expected_end_date DATE,
    state VARCHAR(50) CHECK (
        state IN ('not_started', 'in_progress', 'completed', 'archived')
    ) DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tareas
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

-- Tabla de planificación de tareas
CREATE TABLE IF NOT EXISTS task_planning (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES task (id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    start_hour TIME,
    end_hour TIME,
    priority INTEGER CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_id, planned_date)
);

-- Tabla notas
CREATE TABLE IF NOT EXISTS note (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    project_id INTEGER REFERENCES project (id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT project_or_task_id_check
    CHECK (
        (project_id IS NOT NULL AND task_id IS NULL) OR (project_id IS NULL AND task_id IS NOT NULL)
    )
);

-- Trigger para la tabla note
CREATE TRIGGER update_note_updated_at
BEFORE UPDATE ON note
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

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
