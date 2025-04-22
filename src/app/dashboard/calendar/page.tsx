import { Metadata } from "next";
import Calendar from "@/components/calendar/calendar";
// Importação corrigida

export const metadata: Metadata = {
  title: "Calendário | Studiefy",
  description: "Visualize e gerencie seus eventos no calendário",
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendário</h1>
        </div>
        <Calendar />
      </div>
    </div>
  );
}
