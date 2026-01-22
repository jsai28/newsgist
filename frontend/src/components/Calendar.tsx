"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isFuture,
  startOfDay,
} from "date-fns";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  availableDates: string[];
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  availableDates,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasData = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availableDates.includes(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const hasDataForDay = hasData(day);
          const isTodayOrFuture = isToday(day) || isFuture(startOfDay(day));
          const isDisabled = !isCurrentMonth || isTodayOrFuture;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={isDisabled}
              className={`
                relative p-2 text-sm rounded-lg transition-all
                ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                ${isSelected && !isDisabled ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                ${hasDataForDay && !isSelected && !isDisabled ? "font-semibold text-blue-600" : ""}
              `}
            >
              {format(day, "d")}
              {hasDataForDay && isCurrentMonth && !isTodayOrFuture && (
                <span
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-blue-600"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
