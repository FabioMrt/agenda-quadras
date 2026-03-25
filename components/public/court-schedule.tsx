"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  Layers,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  MessageCircle,
  Calendar,
} from "lucide-react";
import {
  Company,
  Court,
  TimeSlot,
  generateTimeSlots,
  getNext7Days,
} from "@/lib/data/mock-data";

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

interface BookingModalProps {
  courtName: string;
  companyName: string;
  date: Date;
  slot: TimeSlot;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}

function BookingModal({
  courtName,
  companyName,
  date,
  slot,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;

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
    setPhone(formatted);
  };

  const handleSubmit = () => {
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return;
    setStep("success");
    onConfirm(name, phone);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#111827] rounded-t-3xl pt-2 pb-10 px-5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        {step === "form" ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">
                Confirmar Reserva
              </h2>
              <button onClick={onClose} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
              <div className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                Detalhes do agendamento
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Quadra</span>
                  <span className="text-white text-sm font-semibold">
                    {courtName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Data</span>
                  <span className="text-white text-sm font-semibold">
                    {formatDate(date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Horario</span>
                  <span className="text-white text-sm font-semibold">
                    {slot.time} –{" "}
                    {(parseInt(slot.time) + 1).toString().padStart(2, "0")}:00
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-green-400 text-sm font-bold">
                    R$ {slot.price},00
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-1.5 block">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Joao Silva"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold mb-1.5 block">
                  Seu WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                !name.trim() || phone.replace(/\D/g, "").length < 10
              }
              className="mt-5 w-full bg-green-500 disabled:bg-green-500/30 disabled:text-green-300/40 text-white font-bold rounded-2xl py-4 transition-all"
            >
              Solicitar Reserva
            </button>
            <p className="text-slate-500 text-xs text-center mt-3">
              A arena confirmara via WhatsApp em breve.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle2 size={64} className="text-green-400" />
            <h2 className="text-white font-bold text-xl mt-4">
              Solicitacao Enviada!
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Sua reserva na{" "}
              <span className="text-white font-semibold">{companyName}</span>{" "}
              foi solicitada com sucesso.
            </p>
            <div className="bg-white/5 rounded-2xl p-4 w-full mt-5 border border-white/10 text-left">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Quadra</span>
                  <span className="text-white text-sm font-semibold">
                    {courtName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Horario</span>
                  <span className="text-white text-sm font-semibold">
                    {slot.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Nome</span>
                  <span className="text-white text-sm font-semibold">
                    {name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full bg-green-500 text-white font-bold rounded-2xl py-4"
            >
              Otimo!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [showModal, setShowModal] = useState(false);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  const today = mounted ? new Date() : null;
  const days = mounted ? getNext7Days() : [];
  const slots = selectedDate ? generateTimeSlots(court.id, selectedDate) : [];
  const availableCount = slots.filter((s) => s.available).length;

  const handleConfirm = (_name: string, _phone: string) => {
    // In a real app, this would send to backend
  };

  const isToday = (day: Date) =>
    today ? day.toDateString() === today.toDateString() : false;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] pb-24">
      {/* Header */}
      <div className="relative">
        <div className="h-56 overflow-hidden">
          <Image
            src={court.image}
            alt={court.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/30 to-[#0a0f1e]/60" />
        </div>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Court title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {court.type}
            </span>
          </div>
          <h1 className="text-white text-2xl font-black">{court.name}</h1>
          <p className="text-slate-400 text-sm">{company.name}</p>
        </div>
      </div>

      {/* Court meta */}
      <div className="px-4 pt-2">
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-500" />
            <span className="text-slate-400 text-xs">
              Ate {court.maxPlayers} jogadores
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={13} className="text-slate-500" />
            <span className="text-slate-400 text-xs">{court.surface}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-500" />
            <span className="text-slate-400 text-xs">
              R$ {court.pricePerHour}/hora
            </span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex gap-2 flex-wrap mb-5">
          {court.amenities.map((amenity) => (
            <span
              key={amenity}
              className="text-slate-400 text-xs bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="border-t border-white/10" />
      </div>

      {/* Date Selector */}
      <div className="pt-5">
        <div className="flex items-center gap-2 px-4 mb-3">
          <Calendar size={16} className="text-green-400" />
          <h2 className="text-white font-bold text-base">Selecione a Data</h2>
        </div>
        <div
          ref={dateScrollRef}
          className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar"
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
                className={`flex flex-col items-center min-w-[56px] py-3 px-2 rounded-2xl transition-all ${
                  isSelected
                    ? "bg-green-500 text-white"
                    : "bg-white/5 border border-white/10 text-slate-400"
                }`}
              >
                <span
                  className={`text-xs font-semibold mb-1 ${isSelected ? "text-white/80" : "text-slate-500"}`}
                >
                  {isToday(day) ? "Hoje" : DAY_NAMES[day.getDay()]}
                </span>
                <span className="text-lg font-black leading-none text-white">
                  {day.getDate()}
                </span>
                <span
                  className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-slate-600"}`}
                >
                  {MONTH_NAMES[day.getMonth()]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">
            Horarios Disponiveis
          </h2>
          <span className="text-slate-500 text-xs">
            {availableCount} livres · {slots.length - availableCount} ocupados
          </span>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/50" />
            <span className="text-slate-400 text-xs">Disponivel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
            <span className="text-slate-400 text-xs">Ocupado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-500" />
            <span className="text-slate-400 text-xs">Selecionado</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedSlot?.time === slot.time;
            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(isSelected ? null : slot)}
                className={`relative py-3 rounded-2xl text-center transition-all text-sm font-semibold
                  ${
                    !slot.available
                      ? "bg-white/[0.04] border border-white/[0.08] text-slate-600 cursor-not-allowed"
                      : isSelected
                        ? "bg-green-500 border border-green-400 text-white shadow-lg shadow-green-500/25"
                        : "bg-green-500/10 border border-green-500/30 text-green-400 active:scale-95"
                  }`}
              >
                {slot.time}
                {!slot.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-px bg-slate-600 rotate-12" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#111827]/95 backdrop-blur-lg border-t border-white/10 px-4 py-4 z-40">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-slate-400 text-xs">Horario selecionado</p>
                <p className="text-white font-bold">
                  {selectedSlot.time} –{" "}
                  {(parseInt(selectedSlot.time) + 1)
                    .toString()
                    .padStart(2, "0")}
                  :00
                  <span className="text-slate-400 font-normal text-sm ml-2">
                    {selectedDate?.getDate()}/{selectedDate ? selectedDate.getMonth() + 1 : ""}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">Valor</p>
                <p className="text-green-400 font-black text-lg">
                  R$ {selectedSlot.price}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Reservar Agora</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Contact float button */}
      {!selectedSlot && (
        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={() =>
              window.open(`https://wa.me/${company.whatsapp}`, "_blank")
            }
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40"
          >
            <MessageCircle size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedSlot && selectedDate && (
        <BookingModal
          courtName={court.name}
          companyName={company.name}
          date={selectedDate}
          slot={selectedSlot}
          onClose={() => {
            setShowModal(false);
            setSelectedSlot(null);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
