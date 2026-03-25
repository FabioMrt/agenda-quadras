"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Map,
  CalendarCheck,
  DollarSign,
  User,
  Mail,
  Globe,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Pencil,
  Users,
  Layers,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getSuperAdminCompanyById,
} from "@/lib/data/mock-super-admin";
import { getAdminCourts, AdminCourt } from "@/lib/data/mock-admin";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function CourtCard({ court }: { court: AdminCourt }) {
  const [active, setActive] = useState(court.active);

  return (
    <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
      <div className="flex items-start justify-between p-4 pb-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-bold text-white text-sm tracking-tight">
              {court.name}
            </h4>
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
          <button className="w-7 h-7 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors">
            <Pencil size={12} className="text-arena-text-secondary" />
          </button>
          <button
            onClick={() => setActive(!active)}
            className="w-7 h-7 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors"
          >
            {active ? (
              <ToggleRight size={14} className="text-arena-accent" />
            ) : (
              <ToggleLeft size={14} className="text-arena-text-muted" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <DollarSign size={11} className="text-arena-text-muted" />
          <span className="text-arena-text-secondary text-xs font-medium">
            R$ {court.pricePerHour}/h
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-arena-text-muted" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {court.maxPlayers} jogadores
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers size={11} className="text-arena-text-muted" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {court.surface}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-1.5 flex-wrap">
          {court.amenities.map((a) => (
            <span
              key={a}
              className="text-arena-text-muted text-[0.5625rem] bg-white/4 px-2 py-0.5 rounded-md border border-arena-border font-medium"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-arena-border px-4 py-3">
        <p className="text-arena-text-secondary text-[0.5625rem] font-heading font-semibold uppercase tracking-wider mb-1.5">
          Disponibilidade
        </p>
        <div className="flex gap-1 flex-wrap">
          {court.availability.map((rule) => (
            <span
              key={rule.dayOfWeek}
              className="text-violet-400 text-[0.5625rem] bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20 font-heading font-medium"
            >
              {DAY_NAMES[rule.dayOfWeek]} {rule.startTime}-{rule.endTime}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const company = getSuperAdminCompanyById(id);
  const courts = getAdminCourts(); // Mock: all courts belong to this company

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 size={48} className="text-arena-text-muted mb-4" />
        <h2 className="font-heading font-bold text-white text-lg">
          Empresa nao encontrada
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-violet-400 text-sm font-heading font-semibold"
        >
          Voltar
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors"
        >
          <ArrowLeft size={16} className="text-arena-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-extrabold text-white tracking-tight">
              {company.name}
            </h1>
            <Badge
              variant="outline"
              className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded ${
                company.active
                  ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {company.active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-arena-text-muted text-xs">
            Cadastrada em {formatDate(company.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Map, label: "Quadras", value: company.courtsCount },
          { icon: CalendarCheck, label: "Reservas/mes", value: company.monthlyBookings },
          { icon: DollarSign, label: "Receita/mes", value: `R$ ${company.monthlyRevenue.toLocaleString("pt-BR")}`, accent: true },
          { icon: Globe, label: "Slug", value: `/${company.slug}` },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="bg-arena-surface rounded-xl p-4 border border-arena-border">
            <Icon size={16} className={accent ? "text-arena-accent mb-2" : "text-arena-text-muted mb-2"} />
            <p className={`font-heading font-bold text-sm ${accent ? "text-arena-accent" : "text-white"}`}>
              {value}
            </p>
            <p className="text-arena-text-muted text-[0.625rem] font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Admin info */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border p-5 mb-6">
        <h2 className="font-heading font-bold text-white text-sm tracking-tight mb-4">
          Administrador
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center">
              <User size={14} className="text-arena-text-muted" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{company.adminName}</p>
              <p className="text-arena-text-muted text-xs">Nome</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center">
              <Mail size={14} className="text-arena-text-muted" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{company.adminEmail}</p>
              <p className="text-arena-text-muted text-xs">Email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courts Management */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Map size={16} className="text-violet-400" />
            <h2 className="font-heading font-bold text-white text-sm tracking-tight">
              Quadras da Empresa
            </h2>
          </div>
          <button className="bg-violet-500 hover:bg-violet-400 text-white font-heading font-bold text-xs tracking-wide rounded-xl px-3.5 py-2 shadow-lg shadow-violet-500/15 active:scale-95 transition-all flex items-center gap-1.5">
            <Plus size={14} />
            Nova Quadra
          </button>
        </div>

        <div className="space-y-3">
          {courts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between bg-arena-surface rounded-xl border border-arena-border px-5 py-4 hover:bg-white/2 transition-colors">
          <div className="flex items-center gap-3">
            {company.active ? (
              <ToggleRight size={20} className="text-arena-accent" />
            ) : (
              <ToggleLeft size={20} className="text-arena-text-muted" />
            )}
            <span className="text-white text-sm font-medium">
              {company.active ? "Desativar Empresa" : "Ativar Empresa"}
            </span>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 bg-red-500/5 rounded-xl border border-red-500/15 px-5 py-4 hover:bg-red-500/10 transition-colors">
          <Trash2 size={18} className="text-red-400" />
          <span className="text-red-400 text-sm font-medium">
            Excluir Empresa
          </span>
        </button>
      </div>
    </div>
  );
}
