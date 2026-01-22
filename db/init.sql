CREATE TABLE IF NOT EXISTS summaries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  summary TEXT,
  cluster_id INT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  date TIMESTAMP,
  summary_id INT REFERENCES summaries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_summaries_processed_at ON summaries(processed_at);
CREATE INDEX idx_articles_summary_id ON articles(summary_id);
