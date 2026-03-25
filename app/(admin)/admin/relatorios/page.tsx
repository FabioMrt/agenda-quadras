"use client";

import {
  DollarSign,
  TrendingUp,
  Clock,
  CalendarCheck,
  Award,
} from "lucide-react";
import { getAdminStats, getAdminBookings, getAdminCourts } from "@/lib/data/mock-admin";

export default function RelatoriosPage() {
  const stats = getAdminStats();
  const bookings = getAdminBookings();
  const courts = getAdminCourts();

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Most popular court
  const courtBookingCount = courts.map((c) => ({
    name: c.name,
    count: c.bookingsThisMonth,
    revenue: c.bookingsThisMonth * c.pricePerHour,
  }));
  const topCourt = courtBookingCount.sort((a, b) => b.count - a.count)[0];

  // Peak hours (mock)
  const peakHours = [
    { hour: "18:00-19:00", percentage: 92 },
    { hour: "19:00-20:00", percentage: 88 },
    { hour: "20:00-21:00", percentage: 85 },
    { hour: "08:00-09:00", percentage: 70 },
    { hour: "10:00-11:00", percentage: 62 },
  ];

  // Monthly revenue (mock)
  const monthlyRevenue = [
    { month: "Out", value: 10200 },
    { month: "Nov", value: 11800 },
    { month: "Dez", value: 9500 },
    { month: "Jan", value: 12400 },
    { month: "Fev", value: 13100 },
    { month: "Mar", value: 14520 },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
        Relatorios
      </h1>
      <p className="text-arena-text-muted text-sm mb-8">
        Metricas e performance da sua arena
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-arena-accent-dim/40 rounded-2xl p-4 border border-arena-accent/15">
          <div className="w-8 h-8 rounded-lg bg-arena-accent/20 flex items-center justify-center mb-3">
            <DollarSign size={16} className="text-arena-accent" />
          </div>
          <p className="text-arena-accent font-heading font-extrabold text-xl">
            R$ {stats.monthRevenue.toLocaleString("pt-BR")}
          </p>
          <p className="text-arena-text-muted text-xs mt-0.5">Receita do mes</p>
        </div>
        <div className="bg-arena-surface rounded-2xl p-4 border border-arena-border">
          <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-arena-text-muted" />
          </div>
          <p className="text-white font-heading font-extrabold text-xl">
            {stats.occupancyRate}%
          </p>
          <p className="text-arena-text-muted text-xs mt-0.5">Taxa ocupacao</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border mb-6">
        <h2 className="font-heading font-bold text-white text-sm tracking-tight mb-4">
          Receita Mensal
        </h2>
        <div className="flex items-end gap-3 h-36">
          {monthlyRevenue.map(({ month, value }) => {
            const height = (value / maxRevenue) * 100;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-arena-text-secondary text-[0.5625rem] font-heading font-semibold">
                  {(value / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-lg relative overflow-hidden"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-arena-accent/50 to-arena-accent/15 rounded-lg" />
                </div>
                <span className="text-arena-text-muted text-[0.625rem] font-medium">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top court */}
      <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-arena-gold" />
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Quadra Mais Popular
          </h2>
        </div>
        {topCourt && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-heading font-semibold text-sm">
                {topCourt.name}
              </p>
              <p className="text-arena-text-muted text-xs mt-0.5">
                {topCourt.count} reservas este mes
              </p>
            </div>
            <p className="text-arena-accent font-heading font-extrabold">
              R$ {topCourt.revenue.toLocaleString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      {/* Peak hours */}
      <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-arena-accent" />
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Horarios de Pico
          </h2>
        </div>
        <div className="space-y-3">
          {peakHours.map(({ hour, percentage }) => (
            <div key={hour} className="flex items-center gap-3">
              <span className="text-arena-text-secondary text-xs font-heading font-medium w-24 shrink-0">
                {hour}
              </span>
              <div className="flex-1 h-2 bg-white/4 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-arena-accent/60 to-arena-accent rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-arena-text-muted text-xs font-heading font-semibold w-8 text-right">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
