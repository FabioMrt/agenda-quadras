"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Map,
  CalendarCheck,
  ArrowUpRight,
  X,
  Loader2,
  AlertCircle,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logoUrl: string | null;
  adminName: string;
  city: string;
  courtsCount: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  active: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EmpresasListClient({
  companies: initialCompanies,
}: {
  companies: CompanyItem[];
}) {
  const router = useRouter();
  const [companies] = useState(initialCompanies);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatWhatsApp = (val: string) => {
    const digits = val.replace(/\D/g, "");
    // Format as +55 (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) { setError("Imagem deve ter no maximo 2MB"); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("bucket", "logos");
      formData.append("folder", "companies");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro no upload da logo"); return null; }
      return data.url;
    } catch {
      setError("Erro no upload da imagem");
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const resetForm = () => {
    setName(""); setSlug(""); setLogoUrl(""); setLogoPreview(""); setLogoFile(null);
    setUploadingLogo(false); setPhone(""); setWhatsapp("");
    setAddress(""); setCity(""); setAdminName("");
    setAdminEmail(""); setAdminPassword(""); setError("");
  };

  const handleCreate = async () => {
    if (!name || !slug || !adminEmail || !adminPassword) {
      setError("Preencha os campos obrigatorios");
      return;
    }
    setError(""); setLoading(true);

    try {
      // Upload logo if selected
      let uploadedLogoUrl = logoUrl;
      if (logoFile) {
        const url = await uploadLogo();
        if (url) uploadedLogoUrl = url;
        else { setLoading(false); return; }
      }

      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, logoUrl: uploadedLogoUrl || null,
          phone: phone.replace(/\D/g, ""),
          whatsapp: whatsapp.replace(/\D/g, ""),
          address, city,
          adminName, adminEmail, adminPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar empresa");
        setLoading(false);
        return;
      }

      toast.success("Empresa criada!", { description: `${name} (/${slug})` });
      setShowForm(false);
      resetForm();
      router.refresh();
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-arena-text tracking-tight mb-1">
            Empresas
          </h1>
          <p className="text-arena-text-muted text-sm">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-violet-500 hover:bg-violet-400 text-white font-heading font-bold text-xs tracking-wide rounded-xl px-4 py-2.5 shadow-lg shadow-violet-500/15 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Nova Empresa
        </button>
      </div>

      {/* Create company form */}
      {showForm && (
        <div className="bg-arena-surface rounded-2xl border border-violet-500/20 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-arena-text text-base tracking-tight">
              Nova Empresa
            </h3>
            <button onClick={() => { setShowForm(false); resetForm(); }}
              className="w-7 h-7 rounded-full bg-arena-surface-elevated flex items-center justify-center">
              <X size={14} className="text-arena-text-muted" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-violet-400 text-xs font-heading font-semibold uppercase tracking-wider">
              Dados da empresa
            </p>

            {/* Logo upload */}
            <div className="flex items-center gap-4 mb-2">
              <label className="cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shrink-0 overflow-hidden border-2 border-arena-border group-hover:opacity-80 transition-opacity relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-arena-bg font-heading font-extrabold text-lg">
                      {name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
              </label>
              <div className="flex-1">
                <p className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold uppercase tracking-wider">
                  Logo da empresa
                </p>
                <p className="text-arena-text-muted text-[0.575rem] mt-0.5">
                  {logoFile ? logoFile.name : "Clique na imagem para selecionar"}
                </p>
                <p className="text-arena-text-muted text-[0.5rem]">PNG, JPG ate 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Nome da empresa *
                </label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Arena Sport Center"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Slug (URL) *
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-arena-text-muted text-sm">/</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="arena-sport-center"
                    className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Telefone
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 3456-7890"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  WhatsApp
                </label>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                  placeholder="+55 (11) 99999-8888"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Endereco
                </label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua das Flores, 123"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Cidade
                </label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="Sao Paulo - SP"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
            </div>

            <div className="h-px bg-arena-border my-2" />

            <p className="text-violet-400 text-xs font-heading font-semibold uppercase tracking-wider">
              Admin da empresa
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Nome do admin
                </label>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: Joao Silva"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Email do admin *
                </label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider">
                  Senha do admin *
                </label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 transition-all" />
              </div>
            </div>
          </div>

          <button onClick={handleCreate} disabled={loading || !name || !slug || !adminEmail || !adminPassword}
            className="mt-5 w-full bg-violet-500 disabled:bg-violet-500/30 text-white font-heading font-bold tracking-wide rounded-2xl py-3.5 shadow-lg shadow-violet-500/15 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Building2 size={18} />}
            {loading ? "Criando..." : "Criar Empresa"}
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Building2, label: "Total", value: companies.length },
          { icon: Map, label: "Quadras", value: companies.reduce((s, c) => s + c.courtsCount, 0) },
          { icon: CalendarCheck, label: "Reservas/mes", value: companies.reduce((s, c) => s + c.monthlyBookings, 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-arena-surface rounded-xl p-3 border border-arena-border text-center">
            <Icon size={16} className="text-arena-text-muted mx-auto mb-1.5" />
            <p className="text-arena-text font-heading font-extrabold text-lg">{value}</p>
            <p className="text-arena-text-muted text-[0.625rem] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {companies.map((company) => (
          <Link key={company.id} href={`/super-admin/empresas/${company.id}`}
            className="block bg-arena-surface rounded-2xl border border-arena-border p-5 hover:border-arena-border-strong transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shrink-0 overflow-hidden">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-arena-bg font-heading font-extrabold text-sm">{company.logo}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-arena-text font-heading font-bold text-sm tracking-tight truncate">{company.name}</h3>
                  <Badge variant="outline"
                    className={`text-[0.5625rem] font-heading font-semibold uppercase tracking-wider px-1.5 py-0 rounded shrink-0 ${
                      company.active ? "bg-arena-accent/15 text-arena-accent border-arena-accent/30" : "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}>
                    {company.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-arena-text-muted text-xs">{company.city} · Admin: {company.adminName}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-arena-text font-heading font-bold text-sm">{company.courtsCount}</p>
                    <p className="text-arena-text-muted text-[0.625rem]">Quadras</p>
                  </div>
                  <div className="w-px h-6 bg-arena-border" />
                  <div>
                    <p className="text-arena-text font-heading font-bold text-sm">{company.monthlyBookings}</p>
                    <p className="text-arena-text-muted text-[0.625rem]">Reservas/mes</p>
                  </div>
                  <div className="w-px h-6 bg-arena-border" />
                  <div>
                    <p className="text-arena-accent font-heading font-bold text-sm">R$ {company.monthlyRevenue.toLocaleString("pt-BR")}</p>
                    <p className="text-arena-text-muted text-[0.625rem]">Receita/mes</p>
                  </div>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-arena-text-muted shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
