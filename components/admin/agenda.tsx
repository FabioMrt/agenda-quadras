"use client";

import { useState, useCallback, useEffect } from "react";
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
  Repeat,
  LayoutGrid,
  CalendarDays,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { todayString } from "@/lib/dates";

interface BookingDetail {
  id: string;
  time: string;
  endTime: string;
  courtName: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  isRecurring?: boolean;
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

type ViewMode = "day" | "week" | "list";

const COURT_COLORS = [
  { bg: "bg-arena-accent/15", border: "border-arena-accent/25", text: "text-arena-accent", dot: "bg-arena-accent" },
  { bg: "bg-violet-500/15", border: "border-violet-500/25", text: "text-violet-400", dot: "bg-violet-400" },
  { bg: "bg-amber-500/15", border: "border-amber-500/25", text: "text-amber-400", dot: "bg-amber-400" },
  { bg: "bg-cyan-500/15", border: "border-cyan-500/25", text: "text-cyan-400", dot: "bg-cyan-400" },
  { bg: "bg-rose-500/15", border: "border-rose-500/25", text: "text-rose-400", dot: "bg-rose-400" },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

export function AgendaClient({ initialWeekData, courts }: Props) {
  const router = useRouter();
  const [weekData, setWeekData] = useState(initialWeekData);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekLoading, setWeekLoading] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayStr = todayString();
    const idx = initialWeekData.findIndex((d) => d.date === todayStr);
    return idx >= 0 ? idx : 0;
  });

  // Manual booking form
  const [manualForm, setManualForm] = useState<ManualBookingForm | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Booking detail dialog
  const [selectedBooking, setSelectedBooking] = useState<{ booking: BookingDetail; date: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const today = todayString();

  // Auto-detect: mobile = day view, desktop = week view
  useEffect(() => {
    const saved = localStorage.getItem("agenda-view");
    if (saved && ["day", "week", "list"].includes(saved)) {
      setViewMode(saved as ViewMode);
    } else {
      setViewMode(window.innerWidth < 768 ? "day" : "week");
    }
  }, []);

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("agenda-view", mode);
  };

  // Color map
  const courtColorMap = new Map<string, typeof COURT_COLORS[0]>();
  courts.forEach((c, i) => courtColorMap.set(c.name, COURT_COLORS[i % COURT_COLORS.length]));

  // Week fetching
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

  const weekLabel = weekOffset === 0 ? "Esta Semana" : weekOffset === 1 ? "Proxima Semana" : weekOffset === -1 ? "Semana Passada" : `${weekOffset > 0 ? "+" : ""}${weekOffset} sem`;

  // Manual booking
  const handleSlotClick = (date: string, time: string) => {
    const courtId = selectedCourt || "";
    const courtName = selectedCourt ? courts.find((c) => c.id === selectedCourt)?.name || "" : "";
    setManualForm({ date, time, courtId, courtName });
    setGuestName(""); setGuestPhone(""); setNotes(""); setError("");
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length <= 11) {
      if (digits.length > 6) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      else if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      else if (digits.length > 0) formatted = `(${digits}`;
    }
    setGuestPhone(formatted);
  };

  const handleCreateManual = async () => {
    if (!manualForm) return;
    setError(""); setLoading(true);
    const endHour = (parseInt(manualForm.time) + 1).toString().padStart(2, "0");
    const endTime = `${endHour}:00`;
    try {
      const res = await fetch("/api/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: manualForm.courtId, date: manualForm.date, startTime: manualForm.time, endTime,
          guestName: guestName.trim() || notes.trim() || "Reserva manual",
          guestPhone: guestPhone.replace(/\D/g, "") || null, notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao criar reserva"); setLoading(false); return; }
      const newEndHour = (parseInt(manualForm.time) + 1).toString().padStart(2, "0");
      setWeekData((prev) => prev.map((day) => day.date === manualForm.date ? {
        ...day, bookings: [...day.bookings, {
          id: data.booking?.id || "", time: manualForm.time, endTime: `${newEndHour}:00`,
          courtName: manualForm.courtName, customerName: guestName.trim() || notes.trim() || "Manual",
          customerPhone: guestPhone.replace(/\D/g, ""), totalPrice: data.booking?.totalPrice || 0,
          status: "CONFIRMED",
        }],
      } : day));
      setManualForm(null);
      toast.success("Reserva criada!", { description: `${manualForm.courtName} · ${manualForm.time}` });
      router.refresh();
    } catch { setError("Erro de conexao"); } finally { setLoading(false); }
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.booking.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setWeekData((prev) => prev.map((day) => ({
          ...day, bookings: day.bookings.filter((b) => b.id !== selectedBooking.booking.id),
        })));
        toast.error("Reserva cancelada", { description: `${selectedBooking.booking.courtName} · ${selectedBooking.booking.time}` });
        setSelectedBooking(null); setCancelReason(""); router.refresh();
      }
    } finally { setCancelLoading(false); }
  };

  const selectedDay = weekData[selectedDayIndex] || weekData[0];

  // Filter bookings by court
  const filterBookings = (bookings: BookingDetail[]) => {
    if (!selectedCourt) return bookings;
    const courtName = courts.find((c) => c.id === selectedCourt)?.name;
    return bookings.filter((b) => b.courtName === courtName);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-arena-text tracking-tight mb-1">Agenda</h1>
          <p className="text-arena-text-muted text-sm">Gerencie suas reservas</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { mode: "day" as ViewMode, icon: CalendarDays, label: "Dia" },
          { mode: "week" as ViewMode, icon: LayoutGrid, label: "Semana" },
          { mode: "list" as ViewMode, icon: List, label: "Lista" },
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => changeView(mode)}
            className={`flex items-center gap-1.5 text-xs font-heading font-semibold tracking-wide px-3 py-2 rounded-xl transition-all ${
              viewMode === mode
                ? "bg-arena-accent text-arena-bg"
                : "bg-arena-surface border border-arena-border text-arena-text-secondary"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Court filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        <button onClick={() => setSelectedCourt(undefined)}
          className={`text-xs font-heading font-semibold tracking-wide px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${!selectedCourt ? "bg-arena-accent text-arena-bg" : "bg-arena-surface border border-arena-border text-arena-text-secondary"}`}>
          Todas
        </button>
        {courts.map((court) => (
          <button key={court.id} onClick={() => setSelectedCourt(court.id)}
            className={`text-xs font-heading font-semibold tracking-wide px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${selectedCourt === court.id ? "bg-arena-accent text-arena-bg" : "bg-arena-surface border border-arena-border text-arena-text-secondary"}`}>
            {court.name}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => handleWeekChange(-1)} className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center">
          <ChevronLeft size={16} className="text-arena-text-secondary" />
        </button>
        <span className="text-arena-text font-heading font-semibold text-sm">{weekLoading ? "..." : weekLabel}</span>
        <button onClick={() => handleWeekChange(1)} className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center">
          <ChevronRight size={16} className="text-arena-text-secondary" />
        </button>
      </div>

      {/* Manual booking form */}
      {manualForm && (
        <div className="bg-arena-surface rounded-2xl border border-arena-accent/20 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading font-bold text-arena-text text-sm">Reserva Manual</h3>
              <p className="text-arena-text-muted text-xs">{manualForm.courtName || "Selecione quadra"} · {new Date(manualForm.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })} · {manualForm.time}</p>
            </div>
            <button onClick={() => setManualForm(null)} className="w-7 h-7 rounded-lg bg-arena-surface-elevated flex items-center justify-center"><X size={14} className="text-arena-text-muted" /></button>
          </div>
          {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3"><AlertCircle size={14} className="text-red-400 shrink-0" /><span className="text-red-400 text-xs">{error}</span></div>}
          <div className="space-y-2">
            {!manualForm.courtId && (
              <div className="flex gap-2 flex-wrap">
                {courts.map((court) => (
                  <button key={court.id} onClick={() => setManualForm((prev) => prev ? { ...prev, courtId: court.id, courtName: court.name } : prev)}
                    className={`text-xs font-heading font-semibold px-3 py-1.5 rounded-xl transition-all ${manualForm.courtId === court.id ? "bg-arena-accent text-arena-bg" : "bg-arena-surface-elevated border border-arena-border text-arena-text-secondary"}`}>{court.name}</button>
                ))}
              </div>
            )}
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nome (opcional)"
              className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2 text-arena-text text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all" />
            <input type="tel" value={guestPhone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="WhatsApp (opcional)"
              className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2 text-arena-text text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all" />
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Obs: Pelada, Aula..."
              className="w-full bg-arena-surface-elevated border border-arena-border-strong rounded-xl px-3 py-2 text-arena-text text-xs placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 transition-all" />
          </div>
          <button onClick={handleCreateManual} disabled={loading || !manualForm.courtId}
            className="mt-3 w-full bg-arena-accent disabled:bg-arena-accent/30 text-arena-bg font-heading font-bold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {loading ? "Criando..." : "Criar Reserva"}
          </button>
        </div>
      )}

      {/* ═══ VIEW: DAY ═══ */}
      {viewMode === "day" && (
        <div>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {weekData.map((day, i) => {
              const isSelected = i === selectedDayIndex;
              const isToday = day.date === today;
              const dayBookings = filterBookings(day.bookings);
              return (
                <button key={day.date} onClick={() => setSelectedDayIndex(i)}
                  className={`flex flex-col items-center min-w-[52px] py-2 px-1.5 rounded-xl transition-all ${isSelected ? "bg-arena-accent text-arena-bg" : "bg-arena-surface border border-arena-border text-arena-text-secondary"}`}>
                  <span className={`text-[0.6rem] font-heading font-semibold ${isSelected ? "text-arena-bg/70" : "text-arena-text-muted"}`}>{isToday ? "Hoje" : day.dayName}</span>
                  <span className={`text-base font-heading font-extrabold leading-none mt-0.5 ${isSelected ? "text-arena-bg" : "text-arena-text"}`}>{day.dayNumber}</span>
                  {dayBookings.length > 0 && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? "bg-arena-bg/50" : "bg-arena-accent"}`} />}
                </button>
              );
            })}
          </div>

          {/* Day schedule */}
          {selectedDay && (
            <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
              <div className="px-4 py-3 border-b border-arena-border flex justify-between items-center">
                <h3 className="font-heading font-bold text-arena-text text-sm">
                  {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </h3>
                <span className="text-arena-text-muted text-xs font-heading">{filterBookings(selectedDay.bookings).length} reservas</span>
              </div>
              <div className="divide-y divide-arena-border/50">
                {HOURS.map((hour) => {
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  const slotBookings = filterBookings(selectedDay.bookings).filter((b) => b.time === timeStr);
                  return (
                    <div key={hour} className="flex items-stretch">
                      <div className="w-16 shrink-0 flex items-center justify-center border-r border-arena-border/50 py-3">
                        <span className="text-arena-text-muted text-xs font-heading font-medium">{timeStr}</span>
                      </div>
                      <div className="flex-1 py-1.5 px-2 min-h-[44px]">
                        {slotBookings.length > 0 ? (
                          <div className="space-y-1">
                            {slotBookings.map((bk) => {
                              const colors = courtColorMap.get(bk.courtName) || COURT_COLORS[0];
                              return (
                                <button key={bk.id} onClick={() => setSelectedBooking({ booking: bk, date: selectedDay.date })}
                                  className={`w-full ${colors.bg} border ${bk.isRecurring ? "border-dashed" : ""} ${colors.border} rounded-lg px-3 py-2 flex items-center gap-2 text-left`}>
                                  {bk.isRecurring ? <Repeat size={12} className={colors.text} /> : <div className={`w-2 h-2 rounded-full ${colors.dot}`} />}
                                  <div className="flex-1 min-w-0">
                                    <span className={`${colors.text} text-xs font-semibold`}>{bk.customerName}</span>
                                    <span className="text-arena-text-muted text-[0.625rem] ml-2">{bk.courtName}</span>
                                  </div>
                                  <span className="text-arena-text-muted text-[0.625rem]">R${bk.totalPrice}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button onClick={() => handleSlotClick(selectedDay.date, timeStr)}
                            className="w-full h-full rounded-lg hover:bg-arena-surface-elevated transition-colors flex items-center justify-center">
                            <Plus size={12} className="text-arena-text-muted/30" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ VIEW: WEEK (grid) ═══ */}
      {viewMode === "week" && (
        <div className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-8 border-b border-arena-border">
                <div className="p-2 text-center"><span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">Hora</span></div>
                {weekData.map(({ date, dayName, dayNumber }) => (
                  <div key={date} className="p-2 text-center">
                    <span className={`text-[0.625rem] font-heading font-semibold block ${date === today ? "text-arena-accent" : "text-arena-text-muted"}`}>{dayName}</span>
                    <span className={`text-sm font-heading font-bold ${date === today ? "text-arena-accent" : "text-arena-text"}`}>{dayNumber}</span>
                  </div>
                ))}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {HOURS.map((hour) => {
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  return (
                    <div key={hour} className="grid grid-cols-8 border-b border-arena-border/50 last:border-0">
                      <div className="p-1.5 flex items-center justify-center">
                        <span className="text-arena-text-muted text-[0.625rem] font-heading font-medium">{timeStr}</span>
                      </div>
                      {weekData.map(({ date, bookings }) => {
                        const slotBookings = filterBookings(bookings).filter((b) => b.time === timeStr);
                        const isSelected = manualForm?.date === date && manualForm?.time === timeStr;
                        return (
                          <div key={`${date}-${hour}`} className="p-1 min-h-[40px] border-l border-arena-border/50">
                            {slotBookings.length > 0 ? (
                              <div className="flex flex-col gap-0.5 h-full">
                                {slotBookings.map((bk) => {
                                  const colors = courtColorMap.get(bk.courtName) || COURT_COLORS[0];
                                  return (
                                    <button key={bk.id} onClick={() => setSelectedBooking({ booking: bk, date })}
                                      className={`w-full ${colors.bg} border ${bk.isRecurring ? "border-dashed" : ""} ${colors.border} rounded-lg px-1 py-0.5 flex items-center gap-0.5 hover:opacity-80 text-left`}>
                                      {bk.isRecurring ? <Repeat size={8} className={colors.text} /> : <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />}
                                      <span className={`${colors.text} text-[0.5rem] font-medium truncate`}>{slotBookings.length > 1 ? bk.customerName.split(" ")[0]?.slice(0, 3) : bk.customerName.split(" ")[0]}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <button onClick={() => handleSlotClick(date, timeStr)}
                                className={`w-full h-full rounded-lg transition-colors flex items-center justify-center ${isSelected ? "bg-arena-accent/20 border border-arena-accent/40" : "hover:bg-arena-surface-elevated cursor-pointer"}`}>
                                {isSelected && <Plus size={10} className="text-arena-accent" />}
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
          </div>
        </div>
      )}

      {/* ═══ VIEW: LIST ═══ */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {weekData.map((day) => {
            const dayBookings = filterBookings(day.bookings);
            if (dayBookings.length === 0) return null;
            const isToday = day.date === today;
            return (
              <div key={day.date} className="bg-arena-surface rounded-2xl border border-arena-border overflow-hidden">
                <div className="px-4 py-3 border-b border-arena-border flex items-center gap-2">
                  {isToday && <div className="w-2 h-2 rounded-full bg-arena-accent" />}
                  <h3 className={`font-heading font-bold text-sm ${isToday ? "text-arena-accent" : "text-arena-text"}`}>
                    {day.dayName} {day.dayNumber}
                  </h3>
                  <span className="text-arena-text-muted text-xs font-heading ml-auto">{dayBookings.length} reservas</span>
                </div>
                <div className="divide-y divide-arena-border/50">
                  {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map((bk) => {
                    const colors = courtColorMap.get(bk.courtName) || COURT_COLORS[0];
                    return (
                      <button key={bk.id} onClick={() => setSelectedBooking({ booking: bk, date: day.date })}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-arena-surface-elevated transition-colors text-left">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                          {bk.isRecurring ? <Repeat size={14} className={colors.text} /> : <Clock size={14} className={colors.text} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-arena-text text-sm font-semibold">{bk.time} - {bk.endTime}</span>
                            {bk.isRecurring && <Badge variant="outline" className="bg-violet-500/15 text-violet-400 border-violet-500/30 border-dashed text-[0.5rem] px-1 py-0"><Repeat size={8} /></Badge>}
                          </div>
                          <p className="text-arena-text-muted text-xs truncate">{bk.courtName} · {bk.customerName}</p>
                        </div>
                        <span className="text-arena-accent font-heading font-bold text-sm shrink-0">R${bk.totalPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {weekData.every((d) => filterBookings(d.bookings).length === 0) && (
            <div className="text-center py-16">
              <Calendar size={32} className="text-arena-text-muted mx-auto mb-3" />
              <p className="text-arena-text-muted text-sm">Nenhuma reserva nesta semana</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {courts.map((court) => {
          const colors = courtColorMap.get(court.name) || COURT_COLORS[0];
          return (
            <div key={court.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              <span className="text-arena-text-muted text-[0.625rem] font-medium">{court.name}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded border border-dashed border-violet-400/50 flex items-center justify-center"><Repeat size={6} className="text-violet-400" /></div>
          <span className="text-arena-text-muted text-[0.625rem] font-medium">Fixo</span>
        </div>
      </div>

      {/* ═══ BOOKING DETAIL DIALOG ═══ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => { setSelectedBooking(null); setCancelReason(""); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-arena-surface rounded-t-3xl sm:rounded-2xl p-6 z-10 border-t sm:border border-arena-border-strong" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-arena-border-strong rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-arena-text text-base">Detalhes da Reserva</h3>
              <button onClick={() => { setSelectedBooking(null); setCancelReason(""); }} className="w-8 h-8 rounded-full bg-arena-surface-elevated flex items-center justify-center"><X size={16} className="text-arena-text-muted" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0"><User size={14} className="text-arena-accent" /></div>
                <div>
                  <p className="text-arena-text text-sm font-semibold">{selectedBooking.booking.customerName}</p>
                  {selectedBooking.booking.customerPhone && <p className="text-arena-text-muted text-xs flex items-center gap-1"><Phone size={10} />{selectedBooking.booking.customerPhone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0"><MapPin size={14} className="text-arena-accent" /></div>
                <p className="text-arena-text text-sm font-medium">{selectedBooking.booking.courtName}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0"><Calendar size={14} className="text-arena-accent" /></div>
                <p className="text-arena-text text-sm font-medium">{new Date(selectedBooking.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0"><Clock size={14} className="text-arena-accent" /></div>
                <p className="text-arena-text text-sm font-medium">{selectedBooking.booking.time} – {selectedBooking.booking.endTime}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0"><DollarSign size={14} className="text-arena-accent" /></div>
                <p className="text-arena-accent font-heading font-bold text-sm">R$ {selectedBooking.booking.totalPrice},00</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-arena-accent/15 text-arena-accent border-arena-accent/30 text-[0.625rem] font-heading font-semibold uppercase tracking-wider px-2 py-0.5">
                  {selectedBooking.booking.status === "CONFIRMED" ? "Confirmado" : selectedBooking.booking.status === "PENDING" ? "Pendente" : "Cancelado"}
                </Badge>
                {selectedBooking.booking.isRecurring && (
                  <Badge variant="outline" className="bg-violet-500/15 text-violet-400 border-violet-500/30 border-dashed text-[0.625rem] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1"><Repeat size={10} />Fixo</Badge>
                )}
              </div>
            </div>
            {/* Cancel */}
            <div className="mt-6 pt-4 border-t border-arena-border">
              {!cancelReason ? (
                <button onClick={() => setCancelReason(" ")} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 font-heading font-semibold text-sm rounded-xl py-3"><X size={16} />Cancelar Reserva</button>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={cancelReason.trim()} onChange={(e) => setCancelReason(e.target.value)} placeholder="Motivo..." autoFocus
                    className="w-full bg-arena-surface-elevated border border-red-500/20 rounded-xl px-4 py-2.5 text-arena-text text-sm placeholder:text-arena-text-muted/60 focus:outline-none focus:border-red-500/40 transition-all" />
                  <div className="flex gap-2">
                    <button onClick={handleCancelBooking} disabled={!cancelReason.trim() || cancelLoading}
                      className="flex-1 bg-red-500/15 border border-red-500/25 text-red-400 font-heading font-semibold text-xs rounded-xl py-2.5 disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {cancelLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}Confirmar
                    </button>
                    <button onClick={() => setCancelReason("")} className="px-5 bg-arena-surface-elevated border border-arena-border text-arena-text-muted font-heading font-semibold text-xs rounded-xl py-2.5">Voltar</button>
                  </div>
                </div>
              )}
            </div>
            {selectedBooking.booking.customerPhone && (
              <button onClick={() => { const d = selectedBooking.booking.customerPhone.replace(/\D/g, ""); const n = d.length <= 11 ? `55${d}` : d; window.open(`https://wa.me/${n}`, "_blank"); }}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-arena-accent-dim border border-arena-accent/20 text-arena-accent font-heading font-semibold text-sm rounded-xl py-3">
                <Phone size={16} />WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
