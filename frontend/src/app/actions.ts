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
  publish_date: string;
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
  const result = await pool.query(
    `SELECT
      s.id,
      s.summary,
      s.cluster_id,
      s.publish_date,
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
    WHERE s.publish_date = $1
    GROUP BY s.id, s.summary, s.cluster_id, s.publish_date
    ORDER BY s.cluster_id`,
    [dateStr]
  );

  return result.rows.map((row) => ({
    ...row,
    publish_date: row.publish_date.toISOString().split("T")[0],
    articles: row.articles.map((article: { id: number; url: string; title: string; date: string | null }) => ({
      ...article,
      date: article.date ? new Date(article.date).toISOString() : null,
      source: extractSource(article.url),
    })),
  }));
}

export async function getAvailableDates(): Promise<string[]> {
  const result = await pool.query(
    `SELECT DISTINCT publish_date
     FROM summaries
     ORDER BY publish_date DESC`
  );

  return result.rows
    .filter((row) => row.publish_date !== null)
    .map((row) => row.publish_date.toISOString().split("T")[0]);
}
