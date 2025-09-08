ALTER TABLE task ADD COLUMN IF NOT EXISTS priority INTEGER CHECK (priority >= 1 AND priority <= 5);
