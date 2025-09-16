ALTER TABLE project
ADD COLUMN priority INTEGER CHECK (priority >= 1 AND priority <= 5);
