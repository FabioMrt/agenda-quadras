"use client";

import { useState } from "react";
import {
  Users,
  Layers,
  DollarSign,
  CalendarCheck,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAdminCourts, AdminCourt } from "@/lib/data/mock-admin";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function CourtCard({ court }: { court: AdminCourt }) {
  const [active, setActive] = useState(court.active);

  return (
    <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-bold text-white text-base tracking-tight">
              {court.name}
            </h3>
            <Badge
              variant="outline"
              className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded ${
                active
                  ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-arena-text-muted text-xs">{court.type}</p>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors">
            <Pencil size={14} className="text-arena-text-secondary" />
          </button>
          <button
            onClick={() => setActive(!active)}
            className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors"
          >
            {active ? (
              <ToggleRight size={16} className="text-arena-accent" />
            ) : (
              <ToggleLeft size={16} className="text-arena-text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-5">
        {[
          { icon: DollarSign, label: "Preco/h", value: `R$ ${court.pricePerHour}` },
          { icon: Users, label: "Capacidade", value: `${court.maxPlayers}` },
          { icon: Layers, label: "Piso", value: court.surface },
          { icon: CalendarCheck, label: "Este mes", value: `${court.bookingsThisMonth}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <div className="flex items-center gap-1 mb-1">
              <Icon size={11} className="text-arena-text-muted" />
              <span className="text-arena-text-muted text-[0.625rem]">
                {label}
              </span>
            </div>
            <p className="text-white text-xs font-heading font-semibold truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div className="px-5 pb-4">
        <div className="flex gap-1.5 flex-wrap">
          {court.amenities.map((a) => (
            <span
              key={a}
              className="text-arena-text-muted text-[0.625rem] bg-white/4 px-2 py-0.5 rounded-md border border-arena-border font-medium"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="border-t border-arena-border px-5 py-4">
        <p className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold uppercase tracking-wider mb-2">
          Disponibilidade
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {court.availability.map((rule) => (
            <span
              key={rule.dayOfWeek}
              className="text-arena-accent text-[0.625rem] bg-arena-accent/10 px-2 py-1 rounded-md border border-arena-accent/20 font-heading font-medium"
            >
              {DAY_NAMES[rule.dayOfWeek]} {rule.startTime}-{rule.endTime}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuadrasPage() {
  const courts = getAdminCourts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
            Quadras
          </h1>
          <p className="text-arena-text-muted text-sm">
            Gerencie suas quadras e disponibilidade
          </p>
        </div>
        <button className="bg-arena-accent text-arena-bg font-heading font-bold text-xs tracking-wide rounded-xl px-4 py-2.5 glow-accent active:scale-95 transition-transform flex items-center gap-2">
          <Plus size={16} />
          Nova Quadra
        </button>
      </div>

      <div className="space-y-4">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  );
}
