-- Schema para sistema de gestión de tareas
CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria_padre_id INTEGER REFERENCES categoria (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tarea (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha_vencimiento DATE,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categoria (id) ON DELETE CASCADE,
    estado VARCHAR(50) CHECK (
        estado IN ('pendiente', 'completada', 'cancelada')
    ) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
