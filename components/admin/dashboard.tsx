"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  DollarSign,
  Map,
  TrendingUp,
  Clock,
  Check,
  X,
  Loader2,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
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

interface BookingItem {
  id: string;
  courtName: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

interface Props {
  stats: {
    todayBookings: number;
    monthRevenue: number;
    activeCourts: number;
    occupancyRate: number;
  };
  todayBookings: BookingItem[];
}

function BookingRow({ booking, onStatusChange }: { booking: BookingItem; onStatusChange: (id: string, status: string) => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const config = STATUS_CONFIG[booking.status];

  const handleAction = async (status: string) => {
    setLoading(status);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onStatusChange(booking.id, status);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-white/4 flex items-center justify-center shrink-0">
          <Clock size={16} className="text-arena-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-semibold truncate">
              {booking.startTime} – {booking.endTime}
            </p>
            <Badge
              variant="outline"
              className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded shrink-0 ${config.className}`}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-arena-text-muted text-xs truncate">
            {booking.courtName} · {booking.customerName}
          </p>
          {booking.customerPhone && (
            <p className="text-arena-text-muted text-[0.625rem] flex items-center gap-1 mt-0.5">
              <Phone size={10} />
              {booking.customerPhone}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-arena-accent font-heading font-bold text-sm">
            R$ {booking.totalPrice}
          </p>
        </div>
      </div>

      {/* Action buttons for PENDING bookings */}
      {booking.status === "PENDING" && (
        <div className="flex gap-2 mt-3 ml-13">
          <button
            onClick={() => handleAction("CONFIRMED")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 bg-arena-accent/15 border border-arena-accent/30 text-arena-accent font-heading font-semibold text-xs tracking-wide rounded-xl py-2 hover:bg-arena-accent/25 transition-colors disabled:opacity-50"
          >
            {loading === "CONFIRMED" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Confirmar
          </button>
          <button
            onClick={() => handleAction("CANCELLED")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-heading font-semibold text-xs tracking-wide rounded-xl py-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {loading === "CANCELLED" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <X size={13} />
            )}
            Recusar
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminDashboardClient({ stats, todayBookings: initialBookings }: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);

  const statCards = [
    { label: "Reservas Hoje", value: stats.todayBookings, icon: CalendarCheck, accent: true },
    { label: "Receita do Mes", value: `R$ ${stats.monthRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, accent: false },
    { label: "Quadras Ativas", value: stats.activeCourts, icon: Map, accent: false },
    { label: "Taxa Ocupacao", value: `${stats.occupancyRate}%`, icon: TrendingUp, accent: false },
  ];

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: newStatus as BookingItem["status"] } : b
      )
    );
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
        Dashboard
      </h1>
      <p className="text-arena-text-muted text-sm mb-8">
        Visao geral da sua arena
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 border ${
              accent
                ? "bg-arena-accent-dim/40 border-arena-accent/15"
                : "bg-arena-surface border-arena-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  accent ? "bg-arena-accent/20" : "bg-white/4"
                }`}
              >
                <Icon
                  size={16}
                  className={accent ? "text-arena-accent" : "text-arena-text-muted"}
                />
              </div>
            </div>
            <p
              className={`font-heading font-extrabold text-xl tracking-tight ${
                accent ? "text-arena-accent" : "text-white"
              }`}
            >
              {value}
            </p>
            <p className="text-arena-text-muted text-xs font-medium mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Today's Bookings */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-arena-border">
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Reservas de Hoje
          </h2>
          <span className="text-arena-text-muted text-xs font-heading">
            {bookings.length} reservas
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-arena-text-muted text-sm">
              Nenhuma reserva para hoje
            </p>
          </div>
        ) : (
          <div className="divide-y divide-arena-border">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
