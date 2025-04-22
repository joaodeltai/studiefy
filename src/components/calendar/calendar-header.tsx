import { ptBR } from "date-fns/locale";

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function CalendarHeader() {
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
}
