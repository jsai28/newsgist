"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Article {
  id: number;
  url: string;
  title: string;
  date: string | null;
  source: string;
}

export interface Summary {
  id: number;
  summary: string;
  cluster_id: number;
  processed_at: string;
  articles: Article[];
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const sourceMap: Record<string, string> = {
      "cbc.ca": "CBC News",
      "ctvnews.ca": "CTV News",
      "globalnews.ca": "Global News",
      "theglobeandmail.com": "Globe and Mail",
      "thestar.com": "Toronto Star",
    };
    return sourceMap[hostname] || hostname;
  } catch {
    return "Unknown";
  }
}

export async function getSummariesByDate(dateStr: string): Promise<Summary[]> {
  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await pool.query(
    `SELECT
      s.id,
      s.summary,
      s.cluster_id,
      s.processed_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'url', a.url,
            'title', a.title,
            'date', a.date
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as articles
    FROM summaries s
    LEFT JOIN articles a ON a.summary_id = s.id
    WHERE s.processed_at >= $1 AND s.processed_at <= $2
    GROUP BY s.id, s.summary, s.cluster_id, s.processed_at
    ORDER BY s.processed_at DESC`,
    [startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return result.rows.map((row) => ({
    ...row,
    processed_at: row.processed_at.toISOString(),
    articles: row.articles.map((article: { id: number; url: string; title: string; date: string | null }) => ({
      ...article,
      date: article.date ? new Date(article.date).toISOString() : null,
      source: extractSource(article.url),
    })),
  }));
}

export async function getAvailableDates(): Promise<string[]> {
  const result = await pool.query(
    `SELECT DISTINCT DATE(processed_at) as date
     FROM summaries
     ORDER BY date DESC`
  );

  return result.rows.map((row) => {
    const d = new Date(row.date);
    return d.toISOString().split("T")[0];
  });
}
