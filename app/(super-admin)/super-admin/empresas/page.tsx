"use client";

import Link from "next/link";
import {
  Plus,
  Building2,
  Map,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSuperAdminCompanies } from "@/lib/data/mock-super-admin";

export default function EmpresasPage() {
  const companies = getSuperAdminCompanies();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
            Empresas
          </h1>
          <p className="text-arena-text-muted text-sm">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>
        <button className="bg-violet-500 hover:bg-violet-400 text-white font-heading font-bold text-xs tracking-wide rounded-xl px-4 py-2.5 shadow-lg shadow-violet-500/15 active:scale-95 transition-all flex items-center gap-2">
          <Plus size={16} />
          Nova Empresa
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            icon: Building2,
            label: "Total",
            value: companies.length,
          },
          {
            icon: Map,
            label: "Quadras",
            value: companies.reduce((s, c) => s + c.courtsCount, 0),
          },
          {
            icon: CalendarCheck,
            label: "Reservas/mes",
            value: companies.reduce((s, c) => s + c.monthlyBookings, 0),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-arena-surface rounded-xl p-3 border border-arena-border text-center"
          >
            <Icon
              size={16}
              className="text-arena-text-muted mx-auto mb-1.5"
            />
            <p className="text-white font-heading font-extrabold text-lg">
              {value}
            </p>
            <p className="text-arena-text-muted text-[0.625rem] font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/super-admin/empresas/${company.id}`}
            className="block bg-arena-surface rounded-2xl border border-arena-border p-5 hover:border-arena-border-strong transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shrink-0">
                <span className="text-arena-bg font-heading font-extrabold text-sm">
                  {company.logo}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-heading font-bold text-sm tracking-tight truncate">
                    {company.name}
                  </h3>
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
                <p className="text-arena-text-muted text-xs">
                  {company.city} · Admin: {company.adminName}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-white font-heading font-bold text-sm">
                      {company.courtsCount}
                    </p>
                    <p className="text-arena-text-muted text-[0.625rem]">
                      Quadras
                    </p>
                  </div>
                  <div className="w-px h-6 bg-arena-border" />
                  <div>
                    <p className="text-white font-heading font-bold text-sm">
                      {company.monthlyBookings}
                    </p>
                    <p className="text-arena-text-muted text-[0.625rem]">
                      Reservas/mes
                    </p>
                  </div>
                  <div className="w-px h-6 bg-arena-border" />
                  <div>
                    <p className="text-arena-accent font-heading font-bold text-sm">
                      R$ {company.monthlyRevenue.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-arena-text-muted text-[0.625rem]">
                      Receita/mes
                    </p>
                  </div>
                </div>
              </div>

              <ArrowUpRight
                size={16}
                className="text-arena-text-muted shrink-0 mt-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
