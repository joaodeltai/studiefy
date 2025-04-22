"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  date: string;
  type: string;
  subjectId?: string | null;
  subjectName?: string;
  subjectColor?: string;
};

type CalendarDayProps = {
  day: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

export default function CalendarDay({ day, events, isCurrentMonth, isToday }: CalendarDayProps) {
  const router = useRouter();
  
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "prova":
        return "Prova";
      case "simulado":
        return "Simulado";
      case "trabalho":
        return "Trabalho";
      case "redacao":
        return "Redau00e7u00e3o";
      default:
        return "Evento";
    }
  };

  const handleEventClick = (event: Event) => {
    if (event.subjectId === undefined) {
      // Evento geral
      router.push(`/dashboard/events/${event.id}`);
    } else {
      // Evento de matu00e9ria especu00edfica
      router.push(`/dashboard/subjects/${event.subjectId}/events/${event.id}`);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-950 p-2 h-32 overflow-y-auto",
        !isCurrentMonth && "opacity-50",
        "transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900"
      )}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "flex items-center justify-center h-6 w-6 rounded-full text-sm",
            isToday
              ? "bg-primary text-primary-foreground font-medium"
              : "text-gray-700 dark:text-gray-300"
          )}
        >
          {format(day, "d")}
        </div>
      </div>

      <div className="mt-1 space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="flex items-center p-1 rounded-md text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{
              borderLeft: `3px solid ${event.subjectColor}`,
            }}
          >
            <div className="ml-1 truncate">
              <span className="font-medium">{event.title}</span>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <span>{getEventTypeLabel(event.type)}</span>
                <span>u2022</span>
                <span>{event.subjectName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
