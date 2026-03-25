"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  Layers,
  ChevronRight,
  Clock,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { Company, Court, TimeSlot } from "@/lib/types";
import { getNext7Days } from "@/lib/dates";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function CourtSchedulePage({
  company,
  court,
}: {
  company: Company;
  court: Court;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedDate || !court.id) return;
    setLoadingSlots(true);
    setSlotsError(false);
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courtId: court.id, date: dateStr }),
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => { setSlots([]); setSlotsError(true); })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, court.id]);

  const today = mounted ? new Date() : null;
  const days = mounted ? getNext7Days() : [];
  const availableCount = slots.filter((s) => s.available).length;

  const isToday = (day: Date) =>
    today ? day.toDateString() === today.toDateString() : false;

  const handleReserve = () => {
    if (!selectedSlot || !selectedDate) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    router.push(
      `/${company.slug}/quadra/${court.id}/confirmar?date=${dateStr}&time=${selectedSlot.time}&price=${selectedSlot.price}`
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-arena-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena-bg pb-28">
      {/* Header Image */}
      <div className="relative">
        <div className="h-60 overflow-hidden">
          <Image
            src={court.image}
            alt={court.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-arena-bg via-arena-bg/40 to-arena-bg/60" />
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-5 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Court title overlay */}
        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-block bg-arena-accent-dim border border-arena-accent/30 text-arena-accent text-[0.6875rem] font-heading font-semibold px-3 py-1 rounded-full tracking-wide mb-2">
            {court.type}
          </span>
          <h1 className="font-heading text-[1.65rem] font-extrabold text-white tracking-tight leading-tight">
            {court.name}
          </h1>
          <p className="text-arena-text-secondary text-sm mt-0.5 font-medium">
            {company.name}
          </p>
        </div>
      </div>

      {/* Court meta */}
      <div className="px-5 pt-4">
        <div className="flex gap-3 mb-5">
          {[
            { icon: Users, label: `Ate ${court.maxPlayers}` },
            { icon: Layers, label: court.surface },
            { icon: Clock, label: `R$ ${court.pricePerHour}/h` },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/4 border border-arena-border rounded-lg px-2.5 py-1.5"
            >
              <Icon size={12} className="text-arena-text-muted" />
              <span className="text-arena-text-secondary text-xs font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {court.amenities.map((amenity) => (
            <span
              key={amenity}
              className="text-arena-text-muted text-[0.6875rem] bg-white/4 px-2.5 py-1 rounded-lg border border-arena-border font-medium"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-arena-border-strong to-transparent" />
      </div>

      {/* Date Selector */}
      <div className="pt-6">
        <div className="flex items-center gap-2.5 px-5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-arena-accent-dim flex items-center justify-center">
            <Calendar size={14} className="text-arena-accent" />
          </div>
          <h2 className="font-heading text-base font-bold tracking-tight text-white">
            Selecione a Data
          </h2>
        </div>
        <div
          ref={dateScrollRef}
          className="flex gap-2.5 overflow-x-auto px-5 pb-2 no-scrollbar"
        >
          {days.map((day) => {
            const isSelected =
              selectedDate && day.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setSelectedSlot(null);
                }}
                className={`flex flex-col items-center min-w-[60px] py-3 px-2 rounded-2xl transition-all ${
                  isSelected
                    ? "bg-arena-accent text-arena-bg glow-accent"
                    : "bg-white/4 border border-arena-border text-arena-text-secondary"
                }`}
              >
                <span
                  className={`text-[0.6875rem] font-heading font-semibold mb-1 ${
                    isSelected ? "text-arena-bg/70" : "text-arena-text-muted"
                  }`}
                >
                  {isToday(day) ? "Hoje" : DAY_NAMES[day.getDay()]}
                </span>
                <span
                  className={`text-lg font-heading font-extrabold leading-none ${
                    isSelected ? "text-arena-bg" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </span>
                <span
                  className={`text-[0.6875rem] mt-1 font-medium ${
                    isSelected ? "text-arena-bg/60" : "text-arena-text-muted"
                  }`}
                >
                  {MONTH_NAMES[day.getMonth()]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-base font-bold tracking-tight text-white">
            Horarios Disponiveis
          </h2>
          <span className="text-arena-text-muted text-xs font-heading font-medium">
            {loadingSlots ? "..." : `${availableCount} livres`}
          </span>
        </div>
        <p className="text-arena-text-muted text-xs mb-4">
          Sessoes de 1 hora · R$ {court.pricePerHour},00 cada
        </p>

        {/* Legend */}
        <div className="flex gap-5 mb-5">
          {[
            { color: "bg-arena-accent-dim border-arena-accent/40", label: "Livre" },
            { color: "bg-white/3 border-arena-border", label: "Ocupado" },
            { color: "bg-arena-accent border-arena-accent", label: "Selecionado" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[4px] border ${color}`} />
              <span className="text-arena-text-muted text-xs font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loadingSlots && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {slotsError && !loadingSlots && (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm font-medium">Erro ao carregar horarios</p>
            <p className="text-arena-text-muted text-xs mt-1">Tente novamente em instantes</p>
          </div>
        )}

        {/* Empty state */}
        {!loadingSlots && !slotsError && slots.length === 0 && (
          <div className="text-center py-10">
            <p className="text-arena-text-muted text-sm">Sem horarios disponiveis neste dia</p>
          </div>
        )}

        {!loadingSlots && !slotsError && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedSlot?.time === slot.time;
            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                className={`relative py-3.5 rounded-xl text-center transition-all text-sm font-heading font-semibold tracking-wide
                  ${
                    !slot.available
                      ? "bg-white/2 border border-arena-border text-arena-text-muted/40 cursor-not-allowed"
                      : isSelected
                        ? "bg-arena-accent border border-arena-accent text-arena-bg glow-accent-strong"
                        : "bg-arena-accent-dim border border-arena-accent/25 text-arena-accent active:scale-95"
                  }`}
              >
                {slot.time}
                {!slot.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-px bg-arena-text-muted/30 rotate-12" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Bottom CTA bar */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-arena-border-strong px-5 py-5 z-40">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-arena-text-muted text-xs font-heading font-medium uppercase tracking-wider">
                  Selecionado
                </p>
                <p className="text-white font-heading font-bold mt-0.5">
                  {selectedSlot.time} –{" "}
                  {(parseInt(selectedSlot.time) + 1)
                    .toString()
                    .padStart(2, "0")}
                  :00
                  <span className="text-arena-text-muted font-normal text-sm ml-2">
                    {selectedDate?.getDate()}/{selectedDate ? selectedDate.getMonth() + 1 : ""}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-arena-text-muted text-xs font-heading font-medium uppercase tracking-wider">
                  Valor
                </p>
                <p className="text-arena-accent font-heading font-extrabold text-xl mt-0.5">
                  R$ {selectedSlot.price}
                </p>
              </div>
            </div>
            <button
              onClick={handleReserve}
              className="w-full bg-arena-accent text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 flex items-center justify-center gap-2 transition-all glow-accent-strong active:scale-[0.97]"
            >
              <span>Reservar Agora</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp FAB */}
      {!selectedSlot && (
        <div className="fixed bottom-6 right-5 z-40">
          <button
            onClick={() =>
              window.open(`https://wa.me/${company.whatsapp}`, "_blank")
            }
            className="w-14 h-14 bg-arena-accent rounded-full flex items-center justify-center glow-accent-strong active:scale-90 transition-transform"
          >
            <MessageCircle size={22} className="text-arena-bg" />
          </button>
        </div>
      )}
    </div>
  );
}
