"use client";

import {
  CalendarCheck,
  DollarSign,
  Map,
  TrendingUp,
  Clock,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAdminStats, getAdminBookings } from "@/lib/data/mock-admin";

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

export default function AdminDashboard() {
  const stats = getAdminStats();
  const bookings = getAdminBookings();
  const todayBookings = bookings.filter(
    (b) => b.date === new Date().toISOString().split("T")[0] && b.status !== "CANCELLED"
  );

  const statCards = [
    {
      label: "Reservas Hoje",
      value: stats.todayBookings,
      icon: CalendarCheck,
      accent: true,
    },
    {
      label: "Receita do Mes",
      value: `R$ ${stats.monthRevenue.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      accent: false,
    },
    {
      label: "Quadras Ativas",
      value: stats.activeCourts,
      icon: Map,
      accent: false,
    },
    {
      label: "Taxa Ocupacao",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      accent: false,
    },
  ];

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

      {/* Weekly chart (simple bar visualization) */}
      <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border mb-8">
        <h2 className="font-heading font-bold text-white text-sm tracking-tight mb-4">
          Reservas da Semana
        </h2>
        <div className="flex items-end gap-2">
          {stats.weeklyBookings.map(({ day, count }) => {
            const maxCount = 10;
            const barHeight = Math.max((count / maxCount) * 96, 8);
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold">
                  {count}
                </span>
                <div
                  className="w-full rounded-lg overflow-hidden bg-linear-to-t from-arena-accent/60 to-arena-accent/20"
                  style={{ height: `${barHeight}px` }}
                />
                <span className="text-arena-text-muted text-[0.625rem] font-medium">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-arena-border">
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Reservas de Hoje
          </h2>
          <span className="text-arena-text-muted text-xs font-heading">
            {todayBookings.length} reservas
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-arena-text-muted text-sm">
              Nenhuma reserva para hoje
            </p>
          </div>
        ) : (
          <div className="divide-y divide-arena-border">
            {todayBookings.map((booking) => {
              const config = STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
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
                  </div>
                  <p className="text-arena-accent font-heading font-bold text-sm shrink-0">
                    R$ {booking.totalPrice}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
