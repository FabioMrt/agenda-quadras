"use client";

import { DollarSign, TrendingUp, Clock, Award } from "lucide-react";

interface Props {
  monthRevenue: number;
  occupancyRate: number;
  topCourt: { name: string; count: number; revenue: number } | null;
  peakHours: { hour: string; count: number; percentage: number }[];
}

export function RelatoriosClient({
  monthRevenue,
  occupancyRate,
  topCourt,
  peakHours,
}: Props) {
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
            R$ {monthRevenue.toLocaleString("pt-BR")}
          </p>
          <p className="text-arena-text-muted text-xs mt-0.5">Receita do mes</p>
        </div>
        <div className="bg-arena-surface rounded-2xl p-4 border border-arena-border">
          <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-arena-text-muted" />
          </div>
          <p className="text-white font-heading font-extrabold text-xl">
            {occupancyRate}%
          </p>
          <p className="text-arena-text-muted text-xs mt-0.5">Taxa ocupacao</p>
        </div>
      </div>

      {/* Top court */}
      {topCourt && (
        <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-arena-gold" />
            <h2 className="font-heading font-bold text-white text-sm tracking-tight">
              Quadra Mais Popular
            </h2>
          </div>
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
        </div>
      )}

      {/* Peak hours */}
      <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-arena-accent" />
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Horarios de Pico
          </h2>
        </div>
        {peakHours.length === 0 ? (
          <p className="text-arena-text-muted text-sm">
            Sem dados suficientes ainda
          </p>
        ) : (
          <div className="space-y-3">
            {peakHours.map(({ hour, percentage }) => (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-arena-text-secondary text-xs font-heading font-medium w-24 shrink-0">
                  {hour}
                </span>
                <div className="flex-1 h-2 bg-white/4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-arena-accent/60 to-arena-accent rounded-full"
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  />
                </div>
                <span className="text-arena-text-muted text-xs font-heading font-semibold w-8 text-right">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
