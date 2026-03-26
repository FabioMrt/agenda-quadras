"use client";

import { MessageCircle, X } from "lucide-react";

interface Props {
  phone: string;
  message: string;
  onClose: () => void;
}

export function WhatsAppConfirmDialog({ phone, message, onClose }: Props) {
  const digits = phone.replace(/\D/g, "");
  const fullNumber = digits.length <= 11 ? `55${digits}` : digits;
  const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;

  const handleSend = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-arena-surface rounded-2xl p-5 border border-arena-border-strong z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-arena-text text-sm tracking-tight">
            Enviar mensagem no WhatsApp?
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-arena-surface-elevated flex items-center justify-center"
          >
            <X size={14} className="text-arena-text-muted" />
          </button>
        </div>

        <div className="bg-arena-surface-elevated rounded-xl p-3 mb-4 max-h-40 overflow-y-auto">
          <p className="text-arena-text-secondary text-xs whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSend}
            className="flex-1 bg-arena-accent text-arena-bg font-heading font-bold text-sm tracking-wide rounded-xl py-3 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Enviar
          </button>
          <button
            onClick={onClose}
            className="px-5 bg-arena-surface-elevated border border-arena-border text-arena-text-muted font-heading font-semibold text-sm rounded-xl py-3"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
