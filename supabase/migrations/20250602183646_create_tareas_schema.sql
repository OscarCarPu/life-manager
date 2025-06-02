-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Schema para sistema de gestión de tareas
CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria_padre_id INTEGER REFERENCES categoria (id) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, categoria_padre_id)
);

-- Índices para mejorar el rendimiento de las consultas
CREATE TABLE IF NOT EXISTS tarea (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha_vencimiento DATE,
    descripcion TEXT,
    slug VARCHAR(255) NOT NULL, -- Para URL amigables
    categoria_id INTEGER REFERENCES categoria (id) ON DELETE SET NULL,
    estado VARCHAR(50) CHECK (
        estado IN ('pendiente', 'completada', 'en_progreso', 'archivada')
    ) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, categoria_id)
);

-- Índices para mejorar el rendimiento de las consultas
CREATE TABLE IF NOT EXISTS planificacion_tarea (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER REFERENCES tarea (id) ON DELETE CASCADE,
    fecha_planificada DATE NOT NULL,
    prioridad INTEGER CHECK (prioridad >= 1 AND prioridad <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tarea_id, fecha_planificada)
);

-- Trigger para la tabla categoria
CREATE TRIGGER update_categoria_updated_at
BEFORE UPDATE ON categoria
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Trigger para la tabla tarea
CREATE TRIGGER update_tarea_updated_at
BEFORE UPDATE ON tarea
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();

-- Trigger para la tabla planificacion_tarea
CREATE TRIGGER update_planificacion_tarea_updated_at
BEFORE UPDATE ON planificacion_tarea
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();
