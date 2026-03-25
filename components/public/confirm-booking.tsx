"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CalendarCheck, List } from "lucide-react";
import { Company, Court } from "@/lib/data/mock-data";
import { BookingSummary } from "@/components/booking/booking-summary";
import { AuthModal } from "@/components/auth/auth-modal";

type Step = "auth" | "review" | "success";

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
  const [step, setStep] = useState<Step>("auth");
  const [userName, setUserName] = useState("");

  const handleAuthenticated = (name: string) => {
    setUserName(name);
    setStep("review");
  };

  const handleConfirm = () => {
    setStep("success");
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
            {step === "success" ? "Reserva Confirmada" : "Confirmar Reserva"}
          </h1>
          <p className="text-arena-text-muted text-xs">
            {court.name} · {company.name}
          </p>
        </div>
      </div>

      <div className="px-5 pb-10">
        {/* Progress indicator */}
        {step !== "success" && (
          <div className="flex gap-2 mb-6">
            {["auth", "review"].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= (step === "auth" ? 0 : 1)
                    ? "bg-arena-accent"
                    : "bg-arena-border-strong"
                }`}
              />
            ))}
          </div>
        )}

        {/* Booking Summary — always visible */}
        <BookingSummary
          courtName={court.name}
          courtType={court.type}
          companyName={company.name}
          date={date}
          startTime={startTime}
          endTime={endTime}
          price={price}
        />

        {/* Step: Auth */}
        {step === "auth" && (
          <div className="mt-6">
            <AuthModal onAuthenticated={handleAuthenticated} />
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="mt-6 space-y-4">
            <div className="bg-arena-surface rounded-2xl p-4 border border-arena-border">
              <p className="text-arena-text-secondary text-xs font-heading font-semibold uppercase tracking-wider mb-1">
                Reservando como
              </p>
              <p className="text-white text-sm font-semibold">{userName}</p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-arena-accent text-arena-bg font-heading font-bold tracking-wide rounded-2xl py-4 glow-accent-strong active:scale-[0.97] transition-transform text-base"
            >
              Confirmar Reserva
            </button>

            <p className="text-arena-text-muted text-xs text-center">
              Voce recebera a confirmacao por email.
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
              foi solicitada com sucesso.
            </p>

            <div className="w-full mt-8 space-y-3">
              <button
                onClick={() => router.push("/meus-agendamentos")}
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
