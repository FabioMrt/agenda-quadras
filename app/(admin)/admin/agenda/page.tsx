"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { getWeekSchedule, getAdminCourts } from "@/lib/data/mock-admin";

export default function AgendaPage() {
  const courts = getAdminCourts();
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState(0);

  const schedule = getWeekSchedule(selectedCourt);

  // Hours to display
  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 to 22:00

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
            Agenda
          </h1>
          <p className="text-arena-text-muted text-sm">
            Visualize e gerencie suas reservas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {/* Court filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCourt(undefined)}
            className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              !selectedCourt
                ? "bg-arena-accent text-arena-bg"
                : "bg-white/4 border border-arena-border text-arena-text-secondary"
            }`}
          >
            Todas
          </button>
          {courts.map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourt(court.id)}
              className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                selectedCourt === court.id
                  ? "bg-arena-accent text-arena-bg"
                  : "bg-white/4 border border-arena-border text-arena-text-secondary"
              }`}
            >
              {court.name}
            </button>
          ))}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center"
        >
          <ChevronLeft size={16} className="text-arena-text-secondary" />
        </button>
        <span className="text-white font-heading font-semibold text-sm">
          {weekOffset === 0
            ? "Esta Semana"
            : weekOffset === 1
              ? "Proxima Semana"
              : weekOffset === -1
                ? "Semana Passada"
                : `${weekOffset > 0 ? "+" : ""}${weekOffset} semanas`}
        </span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center"
        >
          <ChevronRight size={16} className="text-arena-text-secondary" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-arena-border">
          <div className="p-2 text-center">
            <span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">
              Hora
            </span>
          </div>
          {schedule.map(({ date, dayName, dayNumber }) => {
            const isToday = date === today;
            return (
              <div key={date} className="p-2 text-center">
                <span
                  className={`text-[0.625rem] font-heading font-semibold block ${
                    isToday ? "text-arena-accent" : "text-arena-text-muted"
                  }`}
                >
                  {dayName}
                </span>
                <span
                  className={`text-sm font-heading font-bold ${
                    isToday ? "text-arena-accent" : "text-white"
                  }`}
                >
                  {dayNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[60vh] overflow-y-auto">
          {hours.map((hour) => {
            const timeStr = `${hour.toString().padStart(2, "0")}:00`;
            return (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-arena-border/50 last:border-0"
              >
                <div className="p-1.5 flex items-center justify-center">
                  <span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">
                    {timeStr}
                  </span>
                </div>
                {schedule.map(({ date, slots }) => {
                  const daySlots = slots.filter((s) => s.time === timeStr);
                  const hasBooked = daySlots.some((s) => s.status === "booked");
                  const bookedSlot = daySlots.find((s) => s.status === "booked");

                  return (
                    <div
                      key={`${date}-${hour}`}
                      className={`p-1 min-h-[40px] border-l border-arena-border/50 ${
                        hasBooked ? "" : ""
                      }`}
                    >
                      {hasBooked && bookedSlot ? (
                        <div className="bg-arena-accent/15 border border-arena-accent/25 rounded-lg px-1.5 py-1 h-full flex items-center gap-1">
                          <User size={10} className="text-arena-accent shrink-0" />
                          <span className="text-arena-accent text-[0.5625rem] font-medium truncate">
                            {bookedSlot.customerName?.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full rounded-lg hover:bg-white/4 transition-colors cursor-pointer" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-arena-accent/15 border border-arena-accent/25" />
          <span className="text-arena-text-muted text-xs font-medium">
            Reservado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-transparent border border-arena-border" />
          <span className="text-arena-text-muted text-xs font-medium">
            Livre
          </span>
        </div>
      </div>
    </div>
  );
}
