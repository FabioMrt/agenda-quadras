"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CalendarX,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMockBookings, Booking, BookingStatus } from "@/lib/data/mock-data";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-arena-accent/15 text-arena-accent border-arena-accent/30",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-arena-gold/15 text-arena-gold border-arena-gold/30",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const isPast = new Date(booking.date + "T23:59:59") < new Date();
  const config = STATUS_CONFIG[booking.status];

  return (
    <div
      className={`bg-arena-surface rounded-2xl p-4 border border-arena-border ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-3">
          <h3 className="text-white font-heading font-bold text-sm tracking-tight">
            {booking.courtName}
          </h3>
          <p className="text-arena-text-muted text-xs mt-0.5">
            {booking.courtType} · {booking.companyName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-[0.625rem] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.className}`}
        >
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Calendar size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium capitalize">
            {formatDate(booking.date)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {booking.startTime} – {booking.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {booking.companyName}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-arena-border">
        <span className="text-arena-text-muted text-xs">Total</span>
        <span className="text-arena-accent font-heading font-extrabold text-sm">
          R$ {booking.totalPrice},00
        </span>
      </div>
    </div>
  );
}

export function MyBookingsPage() {
  const router = useRouter();
  const bookings = getMockBookings();
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const upcoming = filtered.filter(
    (b) => new Date(b.date + "T23:59:59") >= new Date()
  );
  const past = filtered.filter(
    (b) => new Date(b.date + "T23:59:59") < new Date()
  );

  return (
    <div className="min-h-screen bg-arena-bg pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-heading text-lg font-bold text-white tracking-tight">
          Meus Agendamentos
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 mb-6 no-scrollbar overflow-x-auto">
        {[
          { key: "ALL" as const, label: "Todos" },
          { key: "CONFIRMED" as const, label: "Confirmados" },
          { key: "PENDING" as const, label: "Pendentes" },
          { key: "CANCELLED" as const, label: "Cancelados" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              filter === key
                ? "bg-arena-accent text-arena-bg"
                : "bg-white/4 border border-arena-border text-arena-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5">
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-arena-surface flex items-center justify-center mb-5">
              <CalendarX size={36} className="text-arena-text-muted" />
            </div>
            <h2 className="font-heading font-bold text-white text-lg tracking-tight">
              Nenhum agendamento
            </h2>
            <p className="text-arena-text-muted text-sm mt-2 max-w-[260px]">
              Voce ainda nao fez nenhuma reserva. Que tal agendar uma quadra?
            </p>
            <button
              onClick={() => router.push("/arena-elite")}
              className="mt-6 bg-arena-accent text-arena-bg font-heading font-bold tracking-wide rounded-2xl px-8 py-3.5 glow-accent active:scale-[0.97] transition-transform flex items-center gap-2"
            >
              <Search size={16} />
              Encontrar Quadras
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-heading text-sm font-semibold text-arena-text-secondary uppercase tracking-wider mb-3">
                  Proximos
                </h2>
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-heading text-sm font-semibold text-arena-text-secondary uppercase tracking-wider mb-3">
                  Anteriores
                </h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
