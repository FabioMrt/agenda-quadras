"use client";

import {
  Building2,
  Map,
  CalendarCheck,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompanyItem {
  id: string;
  name: string;
  logo: string;
  logoUrl: string | null;
  city: string;
  courtsCount: number;
  monthlyRevenue: number;
  active: boolean;
}

interface Props {
  stats: {
    totalCompanies: number;
    totalCourts: number;
    totalBookings: number;
    totalRevenue: number;
  };
  companies: CompanyItem[];
}

export function SuperAdminDashboardClient({ stats, companies }: Props) {
  const statCards = [
    { label: "Empresas", value: stats.totalCompanies, icon: Building2, accent: "violet" },
    { label: "Quadras Totais", value: stats.totalCourts, icon: Map, accent: "default" },
    { label: "Reservas no Mes", value: stats.totalBookings, icon: CalendarCheck, accent: "default" },
    { label: "Receita Total", value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, accent: "green" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
        Dashboard
      </h1>
      <p className="text-arena-text-muted text-sm mb-8">
        Visao global da plataforma
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 border ${
              accent === "violet"
                ? "bg-violet-500/10 border-violet-500/20"
                : accent === "green"
                  ? "bg-arena-accent-dim/40 border-arena-accent/15"
                  : "bg-arena-surface border-arena-border"
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{
              background: accent === "violet" ? "rgba(139,92,246,0.2)" : accent === "green" ? "rgba(0,232,123,0.2)" : "rgba(255,255,255,0.04)",
            }}>
              <Icon
                size={16}
                className={
                  accent === "violet"
                    ? "text-violet-400"
                    : accent === "green"
                      ? "text-arena-accent"
                      : "text-arena-text-muted"
                }
              />
            </div>
            <p
              className={`font-heading font-extrabold text-xl tracking-tight ${
                accent === "violet"
                  ? "text-violet-400"
                  : accent === "green"
                    ? "text-arena-accent"
                    : "text-white"
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

      {/* Companies list */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-arena-border">
          <h2 className="font-heading font-bold text-white text-sm tracking-tight">
            Empresas Cadastradas
          </h2>
          <a
            href="/super-admin/empresas"
            className="text-violet-400 text-xs font-heading font-semibold flex items-center gap-1 hover:text-violet-300 transition-colors"
          >
            Ver todas
            <ArrowUpRight size={12} />
          </a>
        </div>

        <div className="divide-y divide-arena-border">
          {companies.map((company) => (
            <a
              key={company.id}
              href={`/super-admin/empresas/${company.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shrink-0 overflow-hidden">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-arena-bg font-heading font-extrabold text-xs">{company.logo}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold truncate">
                    {company.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded shrink-0 ${
                      company.active
                        ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30"
                        : "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}
                  >
                    {company.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-arena-text-muted text-xs truncate">
                  {company.city} · {company.courtsCount} quadras
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-arena-accent font-heading font-bold text-sm">
                  R$ {company.monthlyRevenue.toLocaleString("pt-BR")}
                </p>
                <p className="text-arena-text-muted text-[0.625rem]">/mes</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
