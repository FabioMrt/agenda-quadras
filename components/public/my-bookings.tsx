"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CalendarX,
  Search,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-arena-accent/15 text-arena-accent border-arena-accent/30",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-arena-gold/15 text-arena-gold border-arena-gold/30",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

interface BookingItem {
  id: string;
  courtName: string;
  courtType: string;
  companyName: string;
  companySlug: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
}

function BookingCard({ booking }: { booking: BookingItem }) {
  const isPast = new Date(booking.date + "T23:59:59") < new Date();
  const config = STATUS_CONFIG[booking.status];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div
      className={`bg-arena-surface rounded-2xl p-4 border border-arena-border ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-3">
          <h3 className="text-white font-heading font-bold text-sm tracking-tight">
            {booking.courtName}
          </h3>
          <p className="text-arena-text-muted text-xs mt-0.5">
            {booking.courtType} · {booking.companyName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-[0.625rem] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.className}`}
        >
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Calendar size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium capitalize">
            {formatDate(booking.date)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {booking.startTime} – {booking.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin size={13} className="text-arena-text-muted shrink-0" />
          <span className="text-arena-text-secondary text-xs font-medium">
            {booking.companyName}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-arena-border">
        <span className="text-arena-text-muted text-xs">Total</span>
        <span className="text-arena-accent font-heading font-extrabold text-sm">
          R$ {booking.totalPrice},00
        </span>
      </div>
    </div>
  );
}

export function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(phoneParam);
  const [searchPhone, setSearchPhone] = useState(phoneParam);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!phoneParam);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

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

  const fetchBookings = async (phoneDigits: string) => {
    if (phoneDigits.length < 10) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/bookings?phone=${phoneDigits}`);
      const data = await res.json();

      const items: BookingItem[] = (data.bookings || []).map(
        (b: {
          id: string;
          date: string;
          startTime: string;
          endTime: string;
          totalPrice: number;
          status: BookingStatus;
          court: {
            name: string;
            company: { name: string; slug: string };
            courtType: { name: string };
          };
        }) => ({
          id: b.id,
          courtName: b.court.name,
          courtType: b.court.courtType.name,
          companyName: b.court.company.name,
          companySlug: b.court.company.slug,
          date: b.date.split("T")[0],
          startTime: b.startTime,
          endTime: b.endTime,
          totalPrice: b.totalPrice,
          status: b.status,
        })
      );

      setBookings(items);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneParam && phoneParam.length >= 10) {
      setSearchPhone(phoneParam);
      fetchBookings(phoneParam);
    }
  }, [phoneParam]);

  const handleSearch = () => {
    const digits = phone.replace(/\D/g, "");
    setSearchPhone(digits);
    fetchBookings(digits);
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const upcoming = filtered.filter(
    (b) => new Date(b.date + "T23:59:59") >= new Date()
  );
  const past = filtered.filter(
    (b) => new Date(b.date + "T23:59:59") < new Date()
  );

  return (
    <div className="min-h-screen bg-arena-bg pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-heading text-lg font-bold text-white tracking-tight">
          Meus Agendamentos
        </h1>
      </div>

      {/* Phone search */}
      <div className="px-5 mb-6">
        <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
          Buscar por WhatsApp
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Phone
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-arena-text-muted"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="(11) 99999-9999"
              className="w-full bg-white/4 border border-arena-border-strong rounded-xl pl-11 pr-4 py-3 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 focus:ring-1 focus:ring-arena-accent/20 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={phone.replace(/\D/g, "").length < 10}
            className="bg-arena-accent disabled:bg-arena-accent/30 text-arena-bg rounded-xl px-5 py-3 active:scale-95 transition-all font-heading font-bold text-sm"
          >
            Buscar
          </button>
        </div>
      </div>

      {!searched ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-5">
          <div className="w-20 h-20 rounded-full bg-arena-surface flex items-center justify-center mb-5">
            <Search size={36} className="text-arena-text-muted" />
          </div>
          <h2 className="font-heading font-bold text-white text-lg tracking-tight">
            Digite seu WhatsApp
          </h2>
          <p className="text-arena-text-muted text-sm mt-2 max-w-[260px]">
            Informe o numero usado na reserva para ver seus agendamentos.
          </p>
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          {bookings.length > 0 && (
            <div className="flex gap-2 px-5 mb-6 no-scrollbar overflow-x-auto">
              {[
                { key: "ALL" as const, label: "Todos" },
                { key: "CONFIRMED" as const, label: "Confirmados" },
                { key: "PENDING" as const, label: "Pendentes" },
                { key: "CANCELLED" as const, label: "Cancelados" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`text-xs font-heading font-semibold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    filter === key
                      ? "bg-arena-accent text-arena-bg"
                      : "bg-white/4 border border-arena-border text-arena-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="px-5">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 rounded-full bg-arena-surface flex items-center justify-center mb-5">
                  <CalendarX size={36} className="text-arena-text-muted" />
                </div>
                <h2 className="font-heading font-bold text-white text-lg tracking-tight">
                  Nenhum agendamento
                </h2>
                <p className="text-arena-text-muted text-sm mt-2 max-w-[260px]">
                  Nao encontramos reservas para este numero.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcoming.length > 0 && (
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-arena-text-secondary uppercase tracking-wider mb-3">
                      Proximos
                    </h2>
                    <div className="space-y-3">
                      {upcoming.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                )}

                {past.length > 0 && (
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-arena-text-secondary uppercase tracking-wider mb-3">
                      Anteriores
                    </h2>
                    <div className="space-y-3">
                      {past.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
