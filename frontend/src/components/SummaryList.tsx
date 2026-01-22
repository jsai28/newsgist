"use client";

import { format } from "date-fns";
import SummaryCard from "./SummaryCard";

interface Article {
  id: number;
  url: string;
  title: string;
  date: string | null;
  source: string;
}

interface Summary {
  id: number;
  summary: string;
  cluster_id: number;
  processed_at: string;
  articles: Article[];
}

interface SummaryListProps {
  summaries: Summary[];
  selectedDate: Date;
  isLoading: boolean;
}

export default function SummaryList({
  summaries,
  selectedDate,
  isLoading,
}: SummaryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-6" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No summaries available
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          There are no news summaries for{" "}
          <span className="font-medium">
            {format(selectedDate, "MMMM d, yyyy")}
          </span>
          . Try selecting a different date.
        </p>
      </div>
    );
  }

  const totalArticles = summaries.reduce(
    (acc, s) => acc + s.articles.length,
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {summaries.length} {summaries.length === 1 ? "story" : "stories"} from{" "}
          {totalArticles} articles
        </p>
      </div>

      <div className="space-y-4">
        {summaries.map((summary, index) => (
          <SummaryCard
            key={summary.id}
            summary={summary.summary}
            articles={summary.articles}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
