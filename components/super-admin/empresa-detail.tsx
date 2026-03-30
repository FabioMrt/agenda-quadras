"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Save,
  X,
  Loader2,
  Upload,
  Phone as PhoneIcon,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

interface CourtItem {
  id: string;
  name: string;
  type: string;
  surface: string;
  pricePerHour: number;
  maxPlayers: number;
  active: boolean;
  amenities: string[];
  bookingsThisMonth: number;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
  }[];
}

interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logoUrl: string | null;
  phone: string;
  whatsapp: string;
  address: string;
  adminName: string;
  adminEmail: string;
  city: string;
  courtsCount: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  active: boolean;
  createdAt: string;
  courts: CourtItem[];
}

function CourtCard({ court }: { court: CourtItem }) {
  const [active, setActive] = useState(court.active);

  return (
    <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
      <div className="flex items-start justify-between p-4 pb-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-bold text-arena-text text-sm tracking-tight">{court.name}</h4>
            <Badge variant="outline" className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded ${active ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
              {active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-arena-text-muted text-xs">{court.type}</p>
        </div>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-lg bg-arena-surface-elevated border border-arena-border flex items-center justify-center"><Pencil size={12} className="text-arena-text-secondary" /></button>
          <button onClick={() => setActive(!active)} className="w-7 h-7 rounded-lg bg-arena-surface-elevated border border-arena-border flex items-center justify-center">
            {active ? <ToggleRight size={14} className="text-arena-accent" /> : <ToggleLeft size={14} className="text-arena-text-muted" />}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-1.5"><DollarSign size={11} className="text-arena-text-muted" /><span className="text-arena-text-secondary text-xs font-medium">R$ {court.pricePerHour}/h</span></div>
        <div className="flex items-center gap-1.5"><Users size={11} className="text-arena-text-muted" /><span className="text-arena-text-secondary text-xs font-medium">{court.maxPlayers} jogadores</span></div>
        <div className="flex items-center gap-1.5"><Layers size={11} className="text-arena-text-muted" /><span className="text-arena-text-secondary text-xs font-medium">{court.surface}</span></div>
      </div>
      <div className="border-t border-arena-border px-4 py-3">
        <p className="text-arena-text-secondary text-[0.5625rem] font-heading font-semibold uppercase tracking-wider mb-1.5">Disponibilidade</p>
        <div className="flex gap-1 flex-wrap">
          {court.availability.map((rule) => (
            <span key={rule.dayOfWeek} className="text-violet-400 text-[0.5625rem] bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20 font-heading font-medium">
              {DAY_NAMES[rule.dayOfWeek]} {rule.startTime}-{rule.endTime}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatPhone(val: string) {
  const digits = val.replace(/\D/g, "");
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function EmpresaDetailClient({ company: initialCompany }: { company: CompanyDetail }) {
  const router = useRouter();
  const [company, setCompany] = useState(initialCompany);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form
  const [editName, setEditName] = useState(company.name);
  const [editSlug, setEditSlug] = useState(company.slug);
  const [editPhone, setEditPhone] = useState(formatPhone(company.phone));
  const [editWhatsapp, setEditWhatsapp] = useState(company.whatsapp);
  const [editAddress, setEditAddress] = useState(company.address);
  const [editCity, setEditCity] = useState(company.city);
  const [editLogoUrl, setEditLogoUrl] = useState(company.logoUrl || "");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState(company.logoUrl || "");

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return;
    setEditLogoFile(file);
    setEditLogoPreview(URL.createObjectURL(file));
  };

  const startEdit = () => {
    setEditName(company.name);
    setEditSlug(company.slug);
    setEditPhone(formatPhone(company.phone));
    setEditWhatsapp(company.whatsapp);
    setEditAddress(company.address);
    setEditCity(company.city);
    setEditLogoUrl(company.logoUrl || "");
    setEditLogoPreview(company.logoUrl || "");
    setEditLogoFile(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload logo if new file selected
      let logoUrl = editLogoUrl;
      if (editLogoFile) {
        const formData = new FormData();
        formData.append("file", editLogoFile);
        formData.append("bucket", "logos");
        formData.append("folder", "companies");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) logoUrl = uploadData.url;
        else { toast.error(uploadData.error || "Erro no upload"); setSaving(false); return; }
      }

      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          logoUrl,
          phone: editPhone.replace(/\D/g, ""),
          whatsapp: editWhatsapp.replace(/\D/g, ""),
          address: editAddress,
          city: editCity,
        }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erro ao salvar"); setSaving(false); return; }

      setCompany({ ...company, name: editName, slug: editSlug, logoUrl, phone: editPhone.replace(/\D/g, ""), whatsapp: editWhatsapp.replace(/\D/g, ""), address: editAddress, city: editCity });
      setEditing(false);
      toast.success("Empresa atualizada!");
      router.refresh();
    } catch {
      toast.error("Erro de conexao");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !company.active }),
    });
    if (res.ok) {
      setCompany({ ...company, active: !company.active });
      toast.success(company.active ? "Empresa desativada" : "Empresa ativada");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Empresa excluida");
        router.push("/super-admin/empresas");
        router.refresh();
      } else {
        toast.error("Erro ao excluir");
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center">
          <ArrowLeft size={16} className="text-arena-text-secondary" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-extrabold text-arena-text tracking-tight">{company.name}</h1>
            <Badge variant="outline" className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded ${company.active ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
              {company.active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <p className="text-arena-text-muted text-xs">Cadastrada em {formatDate(company.createdAt)}</p>
        </div>
        {!editing && (
          <button onClick={startEdit} className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Pencil size={16} className="text-violet-400" />
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-arena-surface rounded-2xl border border-violet-500/20 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-arena-text text-base">Editar Empresa</h3>
            <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-full bg-arena-surface-elevated flex items-center justify-center">
              <X size={14} className="text-arena-text-muted" />
            </button>
          </div>

          {/* Logo upload */}
          <div className="flex items-center gap-4 mb-4">
            <label className="cursor-pointer group">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shrink-0 overflow-hidden border-2 border-arena-border relative">
                {editLogoPreview ? (
                  <img src={editLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-arena-bg font-heading font-extrabold text-lg">{company.logo}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={16} className="text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
            </label>
            <div>
              <p className="text-arena-text-secondary text-xs font-semibold">Logo</p>
              <p className="text-arena-text-muted text-[0.575rem]">{editLogoFile ? editLogoFile.name : "Clique para alterar"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">Nome *</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">Slug</label>
              <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">Telefone</label>
              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">WhatsApp</label>
              <input type="tel" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">Endereco</label>
              <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">Cidade</label>
              <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)}
                className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving || !editName}
              className="flex-1 bg-violet-500 disabled:bg-violet-500/30 text-white font-heading font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setEditing(false)} className="px-6 bg-arena-surface-elevated border border-arena-border text-arena-text-muted font-heading font-semibold text-sm rounded-xl py-3">
              Cancelar
            </button>
          </div>
        </div>
      )}

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
            <p className={`font-heading font-bold text-sm ${accent ? "text-arena-accent" : "text-arena-text"}`}>{value}</p>
            <p className="text-arena-text-muted text-[0.625rem] font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Company info (read mode) */}
      {!editing && (
        <div className="bg-arena-surface rounded-2xl border border-arena-border p-5 mb-6">
          <h2 className="font-heading font-bold text-arena-text text-sm tracking-tight mb-4">Informacoes</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-arena-surface-elevated flex items-center justify-center"><User size={14} className="text-arena-text-muted" /></div>
              <div><p className="text-arena-text text-sm font-medium">{company.adminName}</p><p className="text-arena-text-muted text-xs">Admin</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-arena-surface-elevated flex items-center justify-center"><Mail size={14} className="text-arena-text-muted" /></div>
              <div><p className="text-arena-text text-sm font-medium">{company.adminEmail}</p><p className="text-arena-text-muted text-xs">Email admin</p></div>
            </div>
            {company.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-surface-elevated flex items-center justify-center"><PhoneIcon size={14} className="text-arena-text-muted" /></div>
                <div><p className="text-arena-text text-sm font-medium">{formatPhone(company.phone)}</p><p className="text-arena-text-muted text-xs">Telefone</p></div>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-surface-elevated flex items-center justify-center"><MapPin size={14} className="text-arena-text-muted" /></div>
                <div><p className="text-arena-text text-sm font-medium">{company.address}{company.city ? ` — ${company.city}` : ""}</p><p className="text-arena-text-muted text-xs">Endereco</p></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courts Management */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Map size={16} className="text-violet-400" />
            <h2 className="font-heading font-bold text-arena-text text-sm tracking-tight">Quadras da Empresa</h2>
          </div>
          <button className="bg-violet-500 hover:bg-violet-400 text-white font-heading font-bold text-xs tracking-wide rounded-xl px-3.5 py-2 shadow-lg shadow-violet-500/15 active:scale-95 transition-all flex items-center gap-1.5">
            <Plus size={14} />Nova Quadra
          </button>
        </div>
        {company.courts.length === 0 ? (
          <div className="bg-arena-surface rounded-2xl border border-arena-border p-8 text-center">
            <Building2 size={32} className="text-arena-text-muted mx-auto mb-3" />
            <p className="text-arena-text-muted text-sm">Nenhuma quadra cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">{company.courts.map((court) => <CourtCard key={court.id} court={court} />)}</div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={handleToggleActive} className="w-full flex items-center justify-between bg-arena-surface rounded-xl border border-arena-border px-5 py-4 hover:bg-arena-surface-elevated transition-colors">
          <div className="flex items-center gap-3">
            {company.active ? <ToggleRight size={20} className="text-arena-accent" /> : <ToggleLeft size={20} className="text-arena-text-muted" />}
            <span className="text-arena-text text-sm font-medium">{company.active ? "Desativar Empresa" : "Ativar Empresa"}</span>
          </div>
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 bg-red-500/5 rounded-xl border border-red-500/15 px-5 py-4 hover:bg-red-500/10 transition-colors">
            <Trash2 size={18} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">Excluir Empresa</span>
          </button>
        ) : (
          <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-4">
            <p className="text-red-400 text-sm font-semibold mb-3">Tem certeza? Todos os dados serao perdidos.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 text-white font-heading font-bold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50">
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-5 bg-arena-surface border border-arena-border text-arena-text-muted font-heading font-semibold text-xs rounded-xl py-2.5">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
