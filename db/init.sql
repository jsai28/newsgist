CREATE TABLE IF NOT EXISTS bronze_news_data (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS silver_news_data (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  article_date DATE NOT NULL,
  author VARCHAR(255),
  title TEXT NOT NULL,
  url TEXT UNIQUE
);
CREATE INDEX idx_article_date ON silver_news_data(article_date);

CREATE TABLE IF NOT EXISTS gold_summaries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,,
  silver_id INTEGER UNIQUE REFERENCES silver_news_data(id) ON DELETE CASCADE,
  summary TEXT,
  word_count INTEGER,
  read_time_minutes INTEGER,
  model_used VARCHAR(50),
  url_archive TEXT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
