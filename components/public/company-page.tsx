"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ChevronRight,
  Users,
  Layers,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { Company } from "@/lib/data/mock-data";

const SPORT_ICONS: Record<string, string> = {
  "Society (Futebol 7)": "⚽",
  "Beach Tenis": "🎾",
  Futsal: "🏟️",
  Volei: "🏐",
  Basquete: "🏀",
};

export function CompanyPage({ company }: { company: Company }) {
  const [liked, setLiked] = useState(false);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${company.whatsapp}`, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: company.name,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pb-24">
      {/* Hero Cover */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={company.coverImage}
          alt={company.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent" />

        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-end px-4 pt-12 pb-4">
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Share2 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                size={16}
                className={liked ? "text-red-500 fill-red-500" : "text-white"}
              />
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white/20">
            <span className="text-white font-black text-xl">
              {company.logo}
            </span>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <h1 className="text-white text-2xl font-black leading-tight">
              {company.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">
                {company.rating}
              </span>
              <span className="text-slate-500 text-sm">
                ({company.reviewsCount} avaliacoes)
              </span>
            </div>
          </div>
        </div>

        {/* Info pills */}
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-green-400 mt-0.5 shrink-0" />
            <span className="text-slate-300 text-sm">
              {company.address}, {company.neighborhood} — {company.city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-green-400 shrink-0" />
            <span className="text-slate-300 text-sm">
              {company.openingHours}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-green-400 shrink-0" />
            <span className="text-slate-300 text-sm">{company.phone}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm mt-4 leading-relaxed">
          {company.description}
        </p>

        {/* WhatsApp CTA */}
        <button
          onClick={handleWhatsApp}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-2xl py-3 px-4"
        >
          <MessageCircle size={18} className="text-green-400" />
          <span className="text-green-400 text-sm font-semibold">
            Falar com a Arena no WhatsApp
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="mt-6 mx-4 border-t border-white/10" />

      {/* Courts Section */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Nossas Quadras</h2>
          <span className="text-slate-400 text-sm">
            {company.courts.length} disponiveis
          </span>
        </div>

        <div className="space-y-4">
          {company.courts.map((court) => (
            <div
              key={court.id}
              className="bg-[#111827] rounded-3xl overflow-hidden border border-white/5 active:scale-[0.98] transition-transform"
            >
              {/* Court Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={court.image}
                  alt={court.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {SPORT_ICONS[court.type] || "🏟️"} {court.type}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    R$ {court.pricePerHour}/h
                  </span>
                </div>
              </div>

              {/* Court Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base">
                      {court.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {court.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-500 mt-0.5 shrink-0"
                  />
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-slate-500" />
                    <span className="text-slate-400 text-xs">
                      Ate {court.maxPlayers} jogadores
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-slate-500" />
                    <span className="text-slate-400 text-xs">
                      {court.surface}
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {court.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-slate-400 text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10"
                    >
                      {amenity}
                    </span>
                  ))}
                  {court.amenities.length > 3 && (
                    <span className="text-slate-500 text-xs px-2 py-0.5">
                      +{court.amenities.length - 3} mais
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/${company.slug}/quadra/${court.id}`}
                  className="mt-4 w-full bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-2xl py-3 transition-colors block text-center"
                >
                  Ver Horarios Disponiveis
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
