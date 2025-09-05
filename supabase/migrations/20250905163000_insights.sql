CREATE TABLE IF NOT EXISTS daily_insights (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    text TEXT NOT NULL,
    type CHAR(3) NOT NULL CHECK (type IN ('job', 'day')),
    focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
    productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
    sentiment_score INTEGER CHECK (sentiment_score >= 1 AND sentiment_score <= 10),
    general_score INTEGER CHECK (general_score >= 1 AND general_score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (date, type)
);

CREATE TRIGGER update_daily_insights_updated_at
BEFORE UPDATE ON daily_insights
FOR EACH ROW
EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN();
