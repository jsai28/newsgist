"use client";

import { useState, useEffect, useTransition } from "react";
import { format, subDays } from "date-fns";
import Calendar from "@/components/Calendar";
import SummaryList from "@/components/SummaryList";
import { getSummariesByDate, getAvailableDates, Summary } from "./actions";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 1));
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAvailableDates().then(setAvailableDates);
  }, []);

  useEffect(() => {
    startTransition(async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const data = await getSummariesByDate(dateStr);
      setSummaries(data);
    });
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2.5 shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NewsGist</h1>
              <p className="text-sm text-gray-500">
                Daily Canadian news summaries
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-8 space-y-6">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                availableDates={availableDates}
              />
            </div>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9">
            <SummaryList
              summaries={summaries}
              selectedDate={selectedDate}
              isLoading={isPending}
            />
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            NewsGist aggregates and summarizes Canadian news using AI.
            Summaries are generated from articles published the previous day.
          </p>
        </div>
      </footer>
    </div>
  );
}
