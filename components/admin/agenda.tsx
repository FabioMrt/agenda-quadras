"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookingDetail {
  id: string;
  time: string;
  endTime: string;
  courtName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  bookings: BookingDetail[];
}

interface Props {
  initialWeekData: DaySchedule[];
  courts: { id: string; name: string }[];
}

interface ManualBookingForm {
  date: string;
  time: string;
  courtId: string;
  courtName: string;
}

export function AgendaClient({ initialWeekData, courts }: Props) {
  const router = useRouter();
  const [weekData, setWeekData] = useState(initialWeekData);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekLoading, setWeekLoading] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(
    undefined
  );
  const [manualForm, setManualForm] = useState<ManualBookingForm | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<{ booking: BookingDetail; date: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const hours = Array.from({ length: 16 }, (_, i) => i + 7);
  const today = new Date().toISOString().split("T")[0];

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setWeekData((prev) =>
          prev.map((day) => ({
            ...day,
            bookings: day.bookings.filter((b) => b.id !== selectedBooking.booking.id),
          }))
        );
        // Open WhatsApp if phone exists
        if (selectedBooking.booking.customerPhone) {
          const d = new Date(selectedBooking.date + "T00:00:00");
          const dateStr = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
          const msg = `Ola ${selectedBooking.booking.customerName}, sua reserva foi *cancelada*:\n\n` +
            `*${selectedBooking.booking.courtName}*\n` +
            `Data: ${dateStr}\n` +
            `Horario: ${selectedBooking.booking.time} - ${selectedBooking.booking.endTime}\n\n` +
            `Motivo: ${cancelReason}\n\nEntre em contato para reagendar.`;
          const digits = selectedBooking.booking.customerPhone.replace(/\D/g, "");
          const num = digits.length <= 11 ? `55${digits}` : digits;
          window.location.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
        }
        setSelectedBooking(null);
        setCancelReason("");
        router.refresh();
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const fetchWeek = useCallback(async (offset: number) => {
    setWeekLoading(true);
    try {
      const res = await fetch(`/api/admin/agenda?week=${offset}`);
      const json = await res.json();
      if (json.data) setWeekData(json.data);
    } finally {
      setWeekLoading(false);
    }
  }, []);

  const handleWeekChange = (direction: number) => {
    const newOffset = weekOffset + direction;
    setWeekOffset(newOffset);
    setManualForm(null);
    fetchWeek(newOffset);
  };

  const weekLabel =
    weekOffset === 0
      ? "Esta Semana"
      : weekOffset === 1
        ? "Proxima Semana"
        : weekOffset === -1
          ? "Semana Passada"
          : `${weekOffset > 0 ? "+" : ""}${weekOffset} semanas`;

  const handleSlotClick = (date: string, time: string) => {
    const courtId = selectedCourt || "";
    const courtName = selectedCourt
      ? courts.find((c) => c.id === selectedCourt)?.name || ""
      : "";
    setManualForm({ date, time, courtId, courtName });
    setGuestName("");
    setGuestPhone("");
    setNotes("");
    setError("");
  };

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

  const handleCreateManual = async () => {
    if (!manualForm) return;
    setError("");
    setLoading(true);

    const endHour = (parseInt(manualForm.time) + 1).toString().padStart(2, "0");
    const endTime = `${endHour}:00`;

    try {
      const res = await fetch("/api/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: manualForm.courtId,
          date: manualForm.date,
          startTime: manualForm.time,
          endTime,
          guestName: guestName.trim() || notes.trim() || "Reserva manual",
          guestPhone: guestPhone.replace(/\D/g, "") || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar reserva");
        setLoading(false);
        return;
      }

      // Update local state
      const endHour = (parseInt(manualForm.time) + 1).toString().padStart(2, "0");
      setWeekData((prev) =>
        prev.map((day) =>
          day.date === manualForm.date
            ? {
                ...day,
                bookings: [
                  ...day.bookings,
                  {
                    id: data.booking?.id || "",
                    time: manualForm.time,
                    endTime: `${endHour}:00`,
                    courtName: manualForm.courtName,
                    customerName: guestName.trim() || notes.trim() || "Manual",
                    customerPhone: guestPhone.replace(/\D/g, ""),
                    totalPrice: data.booking?.totalPrice || 0,
                    status: "CONFIRMED",
                  },
                ],
              }
            : day
        )
      );

      setManualForm(null);
      router.refresh();
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  };

  const formatDateBR = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-1">
            Agenda
          </h1>
          <p className="text-arena-text-muted text-sm">
            Clique num horario livre para reservar manualmente
          </p>
        </div>
      </div>

      {/* Court filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setSelectedCourt(undefined)}
          className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            !selectedCourt
              ? "bg-arena-accent text-arena-bg"
              : "bg-white/4 border border-arena-border text-arena-text-secondary"
          }`}
        >
          Todas
        </button>
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => setSelectedCourt(court.id)}
            className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              selectedCourt === court.id
                ? "bg-arena-accent text-arena-bg"
                : "bg-white/4 border border-arena-border text-arena-text-secondary"
            }`}
          >
            {court.name}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleWeekChange(-1)}
          className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors"
        >
          <ChevronLeft size={16} className="text-arena-text-secondary" />
        </button>
        <span className="text-white font-heading font-semibold text-sm">
          {weekLoading ? "Carregando..." : weekLabel}
        </span>
        <button
          onClick={() => handleWeekChange(1)}
          className="w-8 h-8 rounded-lg bg-white/4 border border-arena-border flex items-center justify-center hover:bg-white/8 transition-colors"
        >
          <ChevronRight size={16} className="text-arena-text-secondary" />
        </button>
      </div>

      {/* Manual booking form (bottom sheet style) */}
      {manualForm && (
        <div className="bg-arena-surface rounded-2xl border border-arena-accent/20 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-white text-sm tracking-tight">
                Reserva Manual
              </h3>
              <p className="text-arena-text-muted text-xs mt-0.5">
                {manualForm.courtName} · {formatDateBR(manualForm.date)} · {manualForm.time}
              </p>
            </div>
            <button
              onClick={() => setManualForm(null)}
              className="w-7 h-7 rounded-lg bg-white/4 flex items-center justify-center"
            >
              <X size={14} className="text-arena-text-muted" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-xs font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Court selector (when no court is filtered) */}
            {!manualForm.courtId && (
              <div>
                <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1.5 block uppercase tracking-wider">
                  Quadra *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {courts.map((court) => (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() =>
                        setManualForm((prev) =>
                          prev
                            ? { ...prev, courtId: court.id, courtName: court.name }
                            : prev
                        )
                      }
                      className={`text-xs font-heading font-semibold tracking-wide px-3 py-2 rounded-xl transition-all ${
                        manualForm.courtId === court.id
                          ? "bg-arena-accent text-arena-bg"
                          : "bg-white/4 border border-arena-border text-arena-text-secondary"
                      }`}
                    >
                      {court.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1.5 block uppercase tracking-wider">
                Nome do cliente (opcional)
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ex: Joao Silva"
                className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1.5 block uppercase tracking-wider">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="text-arena-text-secondary text-[0.625rem] font-heading font-semibold mb-1.5 block uppercase tracking-wider">
                Observacao (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pelada do trabalho, Aula particular..."
                className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleCreateManual}
            disabled={loading || !manualForm.courtId}
            className="mt-4 w-full bg-arena-accent disabled:bg-arena-accent/30 text-arena-bg font-heading font-bold text-xs tracking-wide rounded-xl py-3 glow-accent active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {loading ? "Criando..." : "Criar Reserva"}
          </button>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-arena-border">
          <div className="p-2 text-center">
            <span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">
              Hora
            </span>
          </div>
          {weekData.map(({ date, dayName, dayNumber }) => {
            const isToday = date === today;
            return (
              <div key={date} className="p-2 text-center">
                <span
                  className={`text-[0.625rem] font-heading font-semibold block ${
                    isToday ? "text-arena-accent" : "text-arena-text-muted"
                  }`}
                >
                  {dayName}
                </span>
                <span
                  className={`text-sm font-heading font-bold ${
                    isToday ? "text-arena-accent" : "text-white"
                  }`}
                >
                  {dayNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[60vh] overflow-y-auto">
          {hours.map((hour) => {
            const timeStr = `${hour.toString().padStart(2, "0")}:00`;
            return (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-arena-border/50 last:border-0"
              >
                <div className="p-1.5 flex items-center justify-center">
                  <span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">
                    {timeStr}
                  </span>
                </div>
                {weekData.map(({ date, bookings }) => {
                  const booking = bookings.find((b) => {
                    if (selectedCourt) {
                      const court = courts.find((c) => c.id === selectedCourt);
                      return b.time === timeStr && b.courtName === court?.name;
                    }
                    return b.time === timeStr;
                  });

                  const isSelected =
                    manualForm?.date === date && manualForm?.time === timeStr;

                  return (
                    <div
                      key={`${date}-${hour}`}
                      className="p-1 min-h-[40px] border-l border-arena-border/50"
                    >
                      {booking ? (
                        <button
                          onClick={() => setSelectedBooking({ booking, date })}
                          className="w-full bg-arena-accent/15 border border-arena-accent/25 rounded-lg px-1.5 py-1 h-full flex items-center gap-1 hover:bg-arena-accent/25 transition-colors text-left"
                        >
                          <User
                            size={10}
                            className="text-arena-accent shrink-0"
                          />
                          <span className="text-arena-accent text-[0.5625rem] font-medium truncate">
                            {booking.customerName.split(" ")[0]}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSlotClick(date, timeStr)}
                          className={`w-full h-full rounded-lg transition-colors flex items-center justify-center ${
                            isSelected
                              ? "bg-arena-accent/20 border border-arena-accent/40"
                              : "hover:bg-white/4 cursor-pointer"
                          }`}
                        >
                          {isSelected && (
                            <Plus size={10} className="text-arena-accent" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-arena-accent/15 border border-arena-accent/25" />
          <span className="text-arena-text-muted text-xs font-medium">
            Reservado (toque para detalhes)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-transparent border border-arena-border" />
          <span className="text-arena-text-muted text-xs font-medium">
            Livre (toque para reservar)
          </span>
        </div>
      </div>

      {/* Booking detail dialog */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => { setSelectedBooking(null); setCancelReason(""); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-arena-surface rounded-t-3xl sm:rounded-2xl p-6 z-10 border-t sm:border border-arena-border-strong"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-white text-base tracking-tight">
                Detalhes da Reserva
              </h3>
              <button
                onClick={() => { setSelectedBooking(null); setCancelReason(""); }}
                className="w-8 h-8 rounded-full bg-white/6 flex items-center justify-center"
              >
                <X size={16} className="text-arena-text-muted" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
                  <User size={14} className="text-arena-accent" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{selectedBooking.booking.customerName}</p>
                  {selectedBooking.booking.customerPhone && (
                    <p className="text-arena-text-muted text-xs flex items-center gap-1">
                      <Phone size={10} />
                      {selectedBooking.booking.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-arena-accent" />
                </div>
                <p className="text-white text-sm font-medium">{selectedBooking.booking.courtName}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-arena-accent" />
                </div>
                <p className="text-white text-sm font-medium">
                  {new Date(selectedBooking.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-arena-accent" />
                </div>
                <p className="text-white text-sm font-medium">
                  {selectedBooking.booking.time} – {selectedBooking.booking.endTime}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
                  <DollarSign size={14} className="text-arena-accent" />
                </div>
                <p className="text-arena-accent font-heading font-bold text-sm">
                  R$ {selectedBooking.booking.totalPrice},00
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-arena-accent/15 text-arena-accent border-arena-accent/30 text-[0.625rem] font-heading font-semibold uppercase tracking-wider px-2 py-0.5"
                >
                  {selectedBooking.booking.status === "CONFIRMED" ? "Confirmado" : selectedBooking.booking.status === "PENDING" ? "Pendente" : "Cancelado"}
                </Badge>
              </div>
            </div>

            {/* Cancel action */}
            <div className="mt-6 pt-4 border-t border-arena-border">
              {!cancelReason && cancelReason === "" ? (
                <button
                  onClick={() => setCancelReason(" ")}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 font-heading font-semibold text-sm rounded-xl py-3 hover:bg-red-500/15 transition-colors"
                >
                  <X size={16} />
                  Cancelar Reserva
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={cancelReason.trim()}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Motivo do cancelamento..."
                    autoFocus
                    className="w-full bg-white/4 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-red-500/40 transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelBooking}
                      disabled={!cancelReason.trim() || cancelLoading}
                      className="flex-1 bg-red-500/15 border border-red-500/25 text-red-400 font-heading font-semibold text-xs rounded-xl py-2.5 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {cancelLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                      Confirmar
                    </button>
                    <button
                      onClick={() => setCancelReason("")}
                      className="px-5 bg-white/4 border border-arena-border text-arena-text-muted font-heading font-semibold text-xs rounded-xl py-2.5"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp contact */}
            {selectedBooking.booking.customerPhone && (
              <button
                onClick={() => {
                  const digits = selectedBooking.booking.customerPhone.replace(/\D/g, "");
                  const num = digits.length <= 11 ? `55${digits}` : digits;
                  window.location.href = `https://wa.me/${num}`;
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-arena-accent-dim border border-arena-accent/20 text-arena-accent font-heading font-semibold text-sm rounded-xl py-3"
              >
                <Phone size={16} />
                Contatar via WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
