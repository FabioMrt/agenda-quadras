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
  "Society (Futebol 7)": "\u26BD",
  "Beach Tenis": "\uD83C\uDFBE",
  Futsal: "\uD83C\uDFDF\uFE0F",
  Volei: "\uD83C\uDFD0",
  Basquete: "\uD83C\uDFC0",
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
    <div className="min-h-screen bg-arena-bg pb-28">
      {/* Hero Cover */}
      <div className="relative h-72 overflow-hidden">
        <Image
          src={company.coverImage}
          alt={company.name}
          fill
          className="object-cover"
          priority
        />
        {/* Cinematic gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-arena-bg via-arena-bg/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-arena-bg/30 to-transparent" />

        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-end px-5 pt-14 pb-4">
          <div className="flex gap-2.5">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Share2 size={16} className="text-white/80" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Heart
                size={16}
                className={
                  liked
                    ? "text-red-400 fill-red-400"
                    : "text-white/80"
                }
              />
            </button>
          </div>
        </div>

        {/* Logo badge */}
        <div className="absolute bottom-5 left-5">
          <div className="w-[72px] h-[72px] rounded-2xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center shadow-lg glow-accent border-2 border-arena-accent/20">
            <span className="text-arena-bg font-heading font-extrabold text-2xl tracking-tight">
              {company.logo}
            </span>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="px-5 pt-4">
        <h1 className="font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight text-white">
          {company.name}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <Star size={14} className="text-arena-gold fill-arena-gold" />
          <span className="text-arena-gold text-sm font-bold font-heading">
            {company.rating}
          </span>
          <span className="text-arena-text-muted text-sm">
            ({company.reviewsCount} avaliacoes)
          </span>
        </div>

        {/* Info rows */}
        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={14} className="text-arena-accent" />
            </div>
            <span className="text-arena-text-secondary text-sm leading-relaxed pt-1">
              {company.address}, {company.neighborhood} — {company.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
              <Clock size={14} className="text-arena-accent" />
            </div>
            <span className="text-arena-text-secondary text-sm">
              {company.openingHours}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-accent-dim flex items-center justify-center shrink-0">
              <Phone size={14} className="text-arena-accent" />
            </div>
            <span className="text-arena-text-secondary text-sm">
              {company.phone}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-arena-text-muted text-[0.8125rem] mt-5 leading-relaxed">
          {company.description}
        </p>

        {/* WhatsApp CTA */}
        <button
          onClick={handleWhatsApp}
          className="mt-5 w-full flex items-center justify-center gap-2.5 bg-arena-accent-dim border border-arena-accent/20 rounded-2xl py-3.5 px-4 active:scale-[0.98] transition-transform"
        >
          <MessageCircle size={18} className="text-arena-accent" />
          <span className="text-arena-accent text-sm font-semibold font-heading tracking-wide">
            Falar com a Arena no WhatsApp
          </span>
        </button>
      </div>

      {/* Section divider */}
      <div className="mt-8 mx-5 h-px bg-linear-to-r from-transparent via-arena-border-strong to-transparent" />

      {/* Courts Section */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold tracking-tight text-white">
            Nossas Quadras
          </h2>
          <span className="text-arena-text-muted text-xs font-medium font-heading uppercase tracking-wider">
            {company.courts.length} disponiveis
          </span>
        </div>

        <div className="space-y-5">
          {company.courts.map((court) => (
            <div
              key={court.id}
              className="bg-arena-surface rounded-3xl overflow-hidden border border-arena-border active:scale-[0.98] transition-transform"
            >
              {/* Court Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={court.image}
                  alt={court.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-arena-surface via-arena-surface/20 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="glass border border-white/10 text-white text-xs font-semibold font-heading px-3 py-1.5 rounded-full tracking-wide">
                    {SPORT_ICONS[court.type] || "\uD83C\uDFDF\uFE0F"} {court.type}
                  </span>
                </div>
                <div className="absolute bottom-3.5 right-3.5">
                  <span className="bg-arena-accent text-arena-bg text-xs font-extrabold font-heading px-3.5 py-1.5 rounded-full tracking-wide glow-accent">
                    R$ {court.pricePerHour}/h
                  </span>
                </div>
              </div>

              {/* Court Info */}
              <div className="p-5 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <h3 className="text-white font-heading font-bold text-base tracking-tight">
                      {court.name}
                    </h3>
                    <p className="text-arena-text-muted text-xs mt-1 leading-relaxed line-clamp-2">
                      {court.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-arena-accent-dim flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronRight size={14} className="text-arena-accent" />
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-arena-text-muted" />
                    <span className="text-arena-text-secondary text-xs font-medium">
                      Ate {court.maxPlayers}
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-arena-text-muted" />
                  <div className="flex items-center gap-1.5">
                    <Layers size={12} className="text-arena-text-muted" />
                    <span className="text-arena-text-secondary text-xs font-medium">
                      {court.surface}
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex gap-1.5 mt-3.5 flex-wrap">
                  {court.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-arena-text-muted text-[0.6875rem] bg-white/4 px-2.5 py-1 rounded-lg border border-arena-border font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                  {court.amenities.length > 3 && (
                    <span className="text-arena-text-muted text-[0.6875rem] px-2 py-1 font-medium">
                      +{court.amenities.length - 3}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/${company.slug}/quadra/${court.id}`}
                  className="mt-5 w-full bg-arena-accent hover:brightness-110 text-arena-bg text-sm font-bold font-heading tracking-wide rounded-2xl py-3.5 transition-all block text-center glow-accent active:scale-[0.97]"
                >
                  Ver Horarios
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
