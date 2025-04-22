"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAllEvents } from "@/hooks/useAllEvents";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Componentes inline para resolver problemas de importação

// Componente CalendarDay
const CalendarDay = ({ day, events, isCurrentMonth, isToday }: { day: Date; events: Event[]; isCurrentMonth: boolean; isToday: boolean }) => {
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
        return "Redação";
      default:
        return "Evento";
    }
  };

  const handleEventClick = (event: Event) => {
    if (event.subjectId === undefined || event.subjectId === null) {
      // Evento geral
      router.push(`/dashboard/events/${event.id}`);
    } else {
      // Evento de matéria específica
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
                <span>•</span>
                <span>{event.subjectName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente CalendarHeader
const CalendarHeader = () => {
  const weekDays = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  return (
    <>
      {weekDays.map((day) => (
        <div
          key={day}
          className="bg-white dark:bg-gray-950 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {day.substring(0, 3)}
        </div>
      ))}
    </>
  );
};

type Event = {
  id: string;
  title: string;
  date: string;
  type: string;
  subjectId?: string | null;
  subjectName?: string;
  subjectColor?: string;
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Record<string, Event[]>>({});
  
  const { events: allEvents } = useAllEvents();

  useEffect(() => {
    // Converter eventos do formato do Studiefy para o formato do calendário
    if (allEvents) {
      const formattedEvents = allEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        subjectId: event.subject_id,
        subjectName: event.subject?.name || "Geral",
        subjectColor: event.subject?.color || "#6B7280",
      }));
      setEvents(formattedEvents);
    }
  }, [allEvents]);

  useEffect(() => {
    // Gerar dias do calendário
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDay = getDay(monthStart);
    
    // Obter todos os dias do mês atual
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Adicionar dias vazios no início para alinhar com o dia da semana correto
    const paddingDays = Array(startDay).fill(null);
    
    // Combinar dias vazios com dias do mês
    const allDays = [...paddingDays, ...daysInMonth];
    
    setCalendarDays(allDays);
    
    // Filtrar eventos para o mês atual
    const filteredByMonth = events.filter((event) => {
      const eventDate = parseISO(event.date);
      return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
    });
    
    // Agrupar eventos por dia
    const eventsByDay: Record<string, Event[]> = {};
    filteredByMonth.forEach((event) => {
      const dateKey = format(parseISO(event.date), "yyyy-MM-dd");
      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }
      eventsByDay[dateKey].push(event);
    });
    
    setFilteredEvents(eventsByDay);
  }, [currentDate, events]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-border p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-medium">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Badge variant="outline" className="ml-2">
            {events.length} eventos
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTodayClick}
            className="text-sm"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
        <CalendarHeader />
        
        {calendarDays.map((day, index) => {
          if (!day) {
            // Dias vazios para preencher o início do calendário
            return <div key={`empty-${index}`} className="bg-gray-50 dark:bg-gray-900 h-32" />;
          }
          
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = filteredEvents[dateKey] || [];
          
          return (
            <CalendarDay 
              key={dateKey}
              day={day}
              events={dayEvents}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isToday(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
