"use client";

import { useState } from "react";
import {
  Repeat,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  Phone,
} from "lucide-react";

const DAY_OPTIONS = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terca-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7;
  return { value: `${h.toString().padStart(2, "0")}:00`, label: `${h.toString().padStart(2, "0")}:00` };
});

const WEEK_OPTIONS = [4, 8, 12, 16, 20, 24];

interface Props {
  courts: { id: string; name: string }[];
}

interface RecurringResult {
  created: number;
  skipped: number;
  dates: { created: string[]; skipped: string[] };
}

export function RecorrentesClient({ courts }: Props) {
  const [courtId, setCourtId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | "">("");
  const [startTime, setStartTime] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecurringResult | null>(null);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length <= 11) {
      if (digits.length > 6) {
        formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length > 2) {
        formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length > 0) {
        formatted = `(${digits}`;
      }
    }
    setGuestPhone(formatted);
  };

  const isValid = courtId && dayOfWeek !== "" && startTime && weeks > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/bookings/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          dayOfWeek,
          startTime,
          weeks,
          guestName: guestName.trim() || null,
          guestPhone: guestPhone.replace(/\D/g, "") || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar reservas");
        return;
      }

      setResult(data);
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCourtId("");
    setDayOfWeek("");
    setStartTime("");
    setWeeks(4);
    setGuestName("");
    setGuestPhone("");
  };

  const selectedDayLabel = DAY_OPTIONS.find((d) => d.value === dayOfWeek)?.label;
  const selectedCourtLabel = courts.find((c) => c.id === courtId)?.name;

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Repeat size={20} className="text-arena-accent" />
        <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight">
          Horarios Fixos
        </h1>
      </div>
      <p className="text-arena-text-muted text-sm mb-8">
        Crie reservas recorrentes para turmas que alugam mensalmente.
      </p>

      {result ? (
        /* Result screen */
        <div>
          <div className="bg-arena-accent-dim/40 rounded-2xl p-5 border border-arena-accent/15 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-arena-accent-dim flex items-center justify-center mx-auto mb-4 glow-accent">
              <Check size={32} className="text-arena-accent" />
            </div>
            <h2 className="font-heading font-bold text-white text-lg">
              {result.created} reservas criadas
            </h2>
            {result.skipped > 0 && (
              <p className="text-arena-gold text-sm mt-1">
                {result.skipped} horarios ja ocupados (ignorados)
              </p>
            )}
            <p className="text-arena-text-muted text-xs mt-2">
              {selectedCourtLabel} · {selectedDayLabel}s {startTime} · {weeks} semanas
            </p>
          </div>

          {/* Created dates */}
          {result.dates.created.length > 0 && (
            <div className="bg-arena-surface rounded-2xl border border-arena-border p-4 mb-4">
              <h3 className="font-heading font-semibold text-arena-accent text-xs uppercase tracking-wider mb-3">
                Datas criadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.dates.created.map((d) => (
                  <span key={d} className="text-white text-xs bg-arena-accent/10 border border-arena-accent/20 px-2.5 py-1 rounded-lg font-medium">
                    {new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skipped dates */}
          {result.dates.skipped.length > 0 && (
            <div className="bg-arena-surface rounded-2xl border border-arena-border p-4 mb-6">
              <h3 className="font-heading font-semibold text-arena-gold text-xs uppercase tracking-wider mb-3">
                Ja ocupados (ignorados)
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.dates.skipped.map((d) => (
                  <span key={d} className="text-arena-gold text-xs bg-arena-gold/10 border border-arena-gold/20 px-2.5 py-1 rounded-lg font-medium">
                    {new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full bg-arena-accent text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 glow-accent active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Criar Outro Horario Fixo
          </button>
        </div>
      ) : (
        /* Form */
        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Court */}
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} />
              Quadra
            </label>
            <div className="flex gap-2 flex-wrap">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setCourtId(court.id)}
                  className={`text-sm font-heading font-semibold tracking-wide px-4 py-2.5 rounded-xl transition-all ${
                    courtId === court.id
                      ? "bg-arena-accent text-arena-bg"
                      : "bg-white/4 border border-arena-border text-arena-text-secondary"
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>

          {/* Day of week */}
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
              <Repeat size={12} />
              Dia da semana
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => setDayOfWeek(day.value)}
                  className={`text-xs font-heading font-semibold tracking-wide px-3 py-2 rounded-xl transition-all ${
                    dayOfWeek === day.value
                      ? "bg-arena-accent text-arena-bg"
                      : "bg-white/4 border border-arena-border text-arena-text-secondary"
                  }`}
                >
                  {day.label.split("-")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Start time */}
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} />
              Horario
            </label>
            <div className="grid grid-cols-4 gap-2">
              {HOURS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setStartTime(h.value)}
                  className={`text-xs font-heading font-semibold py-2 rounded-xl transition-all ${
                    startTime === h.value
                      ? "bg-arena-accent text-arena-bg"
                      : "bg-white/4 border border-arena-border text-arena-text-secondary"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weeks */}
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
              Quantidade de semanas
            </label>
            <div className="flex gap-2 flex-wrap">
              {WEEK_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeeks(w)}
                  className={`text-xs font-heading font-semibold px-4 py-2 rounded-xl transition-all ${
                    weeks === w
                      ? "bg-arena-accent text-arena-bg"
                      : "bg-white/4 border border-arena-border text-arena-text-secondary"
                  }`}
                >
                  {w} semanas
                </button>
              ))}
            </div>
          </div>

          {/* Guest info */}
          <div className="bg-arena-surface rounded-2xl p-4 border border-arena-border space-y-3">
            <p className="text-arena-text-secondary text-xs font-heading font-semibold uppercase tracking-wider">
              Dados da turma / cliente (opcional)
            </p>
            <div>
              <label className="text-arena-text-muted text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider flex items-center gap-1">
                <User size={10} />
                Nome
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ex: Pelada do Escritorio, Turma do Joao..."
                className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="text-arena-text-muted text-[0.625rem] font-heading font-semibold mb-1 block uppercase tracking-wider flex items-center gap-1">
                <Phone size={10} />
                WhatsApp
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all"
              />
            </div>
          </div>

          {/* Preview */}
          {isValid && (
            <div className="bg-arena-accent-dim/30 rounded-xl p-3 border border-arena-accent/15">
              <p className="text-arena-accent text-xs font-heading font-semibold">
                {selectedCourtLabel} · {selectedDayLabel}s as {startTime} · {weeks} semanas
              </p>
              <p className="text-arena-text-muted text-[0.625rem] mt-0.5">
                Serao criadas {weeks} reservas confirmadas
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!isValid || loading}
            className="w-full bg-arena-accent disabled:bg-arena-accent/30 text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 glow-accent active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Repeat size={18} />
            )}
            {loading ? "Criando reservas..." : "Criar Horario Fixo"}
          </button>
        </div>
      )}
    </div>
  );
}
