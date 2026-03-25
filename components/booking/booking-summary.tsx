"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

interface BookingSummaryProps {
  courtName: string;
  courtType: string;
  companyName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export function BookingSummary({
  courtName,
  courtType,
  companyName,
  date,
  startTime,
  endTime,
  price,
}: BookingSummaryProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  return (
    <div className="bg-arena-accent-dim/40 rounded-2xl p-5 border border-arena-accent/15">
      <div className="text-arena-accent text-[0.6875rem] font-heading font-semibold mb-4 uppercase tracking-widest">
        Resumo da reserva
      </div>

      <div className="space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={14} className="text-arena-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-heading font-semibold">
              {courtName}
            </p>
            <p className="text-arena-text-muted text-xs mt-0.5">
              {courtType} · {companyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
            <Calendar size={14} className="text-arena-accent" />
          </div>
          <p className="text-white text-sm font-medium capitalize">
            {formatDate(date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
            <Clock size={14} className="text-arena-accent" />
          </div>
          <p className="text-white text-sm font-medium">
            {startTime} – {endTime}
          </p>
        </div>

        <div className="h-px bg-arena-accent/15 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-arena-text-secondary text-sm">Total</span>
          <span className="text-arena-accent text-xl font-heading font-extrabold">
            R$ {price},00
          </span>
        </div>
      </div>
    </div>
  );
}
