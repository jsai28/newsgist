"use client";

import { useState } from "react";
import { format } from "date-fns";

interface Article {
  id: number;
  url: string;
  title: string;
  date: string | null;
  source: string;
}

interface SummaryCardProps {
  summary: string;
  articles: Article[];
  index: number;
}

const sourceColors: Record<string, string> = {
  "CBC News": "bg-red-100 text-red-700 border-red-200",
  "CTV News": "bg-blue-100 text-blue-700 border-blue-200",
  "Global News": "bg-green-100 text-green-700 border-green-200",
  "Globe and Mail": "bg-amber-100 text-amber-700 border-amber-200",
  "Toronto Star": "bg-purple-100 text-purple-700 border-purple-200",
};

const sourceDots: Record<string, string> = {
  "CBC News": "bg-red-500",
  "CTV News": "bg-blue-500",
  "Global News": "bg-green-500",
  "Globe and Mail": "bg-amber-500",
  "Toronto Star": "bg-purple-500",
};

export default function SummaryCard({
  summary,
  articles,
  index,
}: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const uniqueSources = [...new Set(articles.map((a) => a.source))];

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <ul className="text-gray-800 text-base leading-relaxed space-y-2">
              {summary.split('\n').filter(line => line.trim()).map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{line.replace(/^-\s*/, '')}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {uniqueSources.map((source) => (
                <span
                  key={source}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    sourceColors[source] || "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${sourceDots[source] || "bg-gray-500"}`}
                  />
                  {source}
                </span>
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 ml-12 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {isExpanded ? "Hide sources" : "View sources"}
          <svg
            className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Source Articles
          </h4>
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.id} className="group">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 -mx-3 rounded-lg hover:bg-white transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        sourceDots[article.source] || "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title || "Untitled Article"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{article.source}</span>
                        {article.date && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>
                              {format(new Date(article.date), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg
                      className="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
