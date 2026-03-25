"use client";

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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSuperAdminCompanyById } from "@/lib/data/mock-super-admin";

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const company = getSuperAdminCompanyById(id);

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
          {
            icon: CalendarCheck,
            label: "Reservas/mes",
            value: company.monthlyBookings,
          },
          {
            icon: DollarSign,
            label: "Receita/mes",
            value: `R$ ${company.monthlyRevenue.toLocaleString("pt-BR")}`,
            accent: true,
          },
          {
            icon: Globe,
            label: "Slug",
            value: `/${company.slug}`,
          },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div
            key={label}
            className="bg-arena-surface rounded-xl p-4 border border-arena-border"
          >
            <Icon
              size={16}
              className={
                accent ? "text-arena-accent mb-2" : "text-arena-text-muted mb-2"
              }
            />
            <p
              className={`font-heading font-bold text-sm ${
                accent ? "text-arena-accent" : "text-white"
              }`}
            >
              {value}
            </p>
            <p className="text-arena-text-muted text-[0.625rem] font-medium mt-0.5">
              {label}
            </p>
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
              <p className="text-white text-sm font-medium">
                {company.adminName}
              </p>
              <p className="text-arena-text-muted text-xs">Nome</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center">
              <Mail size={14} className="text-arena-text-muted" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {company.adminEmail}
              </p>
              <p className="text-arena-text-muted text-xs">Email</p>
            </div>
          </div>
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
