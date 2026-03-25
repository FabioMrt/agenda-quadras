"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CalendarCheck,
  List,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Company, Court } from "@/lib/types";
import { BookingSummary } from "@/components/booking/booking-summary";

type Step = "form" | "success";

export function ConfirmBookingPage({
  company,
  court,
  date,
  startTime,
  endTime,
  price,
}: {
  company: Company;
  court: Court;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const phoneDigits = phone.replace(/\D/g, "");
  const isValid = name.trim().length >= 2 && phoneDigits.length >= 10;

  const handleConfirm = async () => {
    if (!isValid) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: court.id,
          date,
          startTime,
          endTime,
          totalPrice: price,
          guestName: name.trim(),
          guestPhone: phoneDigits,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar reserva");
        setLoading(false);
        return;
      }

      setStep("success");
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arena-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="font-heading text-lg font-bold text-white tracking-tight">
            {step === "success" ? "Reserva Solicitada" : "Confirmar Reserva"}
          </h1>
          <p className="text-arena-text-muted text-xs">
            {court.name} · {company.name}
          </p>
        </div>
      </div>

      <div className="px-5 pb-10">
        {/* Booking Summary */}
        <BookingSummary
          courtName={court.name}
          courtType={court.type}
          companyName={company.name}
          date={date}
          startTime={startTime}
          endTime={endTime}
          price={price}
        />

        {/* Step: Form */}
        {step === "form" && (
          <div className="mt-6">
            <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border">
              <h3 className="font-heading font-bold text-white text-base tracking-tight mb-1">
                Seus dados para reserva
              </h3>
              <p className="text-arena-text-muted text-xs mb-5">
                Informe seu nome e WhatsApp para confirmar.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span className="text-red-400 text-sm font-medium">
                    {error}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Joao Silva"
                    className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 focus:ring-1 focus:ring-arena-accent/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
                    Seu WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 focus:ring-1 focus:ring-arena-accent/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              className="mt-5 w-full bg-arena-accent disabled:bg-arena-accent/30 disabled:text-arena-bg/50 text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 glow-accent active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {loading ? "Reservando..." : "Confirmar Reserva"}
            </button>

            <p className="text-arena-text-muted text-xs text-center mt-3">
              A arena confirmara via WhatsApp em breve.
            </p>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-arena-accent-dim flex items-center justify-center glow-accent-strong mb-6">
              <CheckCircle2 size={56} className="text-arena-accent" />
            </div>

            <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight">
              Reserva Solicitada!
            </h2>
            <p className="text-arena-text-secondary text-sm mt-2 max-w-[280px] leading-relaxed">
              Sua reserva na{" "}
              <span className="text-white font-semibold">{company.name}</span>{" "}
              foi solicitada. Voce sera contatado via WhatsApp.
            </p>

            <div className="bg-arena-surface rounded-2xl p-4 w-full mt-6 border border-arena-border text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-arena-text-muted text-sm">Nome</span>
                  <span className="text-white text-sm font-semibold font-heading">
                    {name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-arena-text-muted text-sm">WhatsApp</span>
                  <span className="text-white text-sm font-semibold font-heading">
                    {phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full mt-8 space-y-3">
              <button
                onClick={() =>
                  router.push(`/meus-agendamentos?phone=${phoneDigits}`)
                }
                className="w-full bg-arena-accent text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 glow-accent active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                <List size={18} />
                Ver Meus Agendamentos
              </button>

              <button
                onClick={() => router.push(`/${company.slug}`)}
                className="w-full bg-white/4 border border-arena-border text-arena-text-secondary font-heading font-semibold tracking-wide rounded-2xl py-4 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                <CalendarCheck size={18} />
                Voltar para a Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
