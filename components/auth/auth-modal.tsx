"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

interface AuthModalProps {
  onAuthenticated: (name: string) => void;
}

export function AuthModal({ onAuthenticated }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleGoogleLogin = () => {
    // Placeholder — will integrate with Auth.js
    onAuthenticated("Usuario Google");
  };

  const handleMagicLink = () => {
    if (!email.trim()) return;
    setSent(true);
    // Placeholder — will integrate with Resend
    setTimeout(() => {
      onAuthenticated(email);
    }, 1500);
  };

  return (
    <div className="bg-arena-surface rounded-2xl p-5 border border-arena-border">
      <h3 className="font-heading font-bold text-white text-base tracking-tight mb-1">
        Identifique-se para reservar
      </h3>
      <p className="text-arena-text-muted text-xs mb-5">
        Sem senha. Escolha uma opcao abaixo.
      </p>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-heading font-semibold text-sm rounded-xl py-3.5 active:scale-[0.97] transition-transform mb-3"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        Continuar com Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-arena-border-strong" />
        <span className="text-arena-text-muted text-xs font-medium">ou</span>
        <div className="flex-1 h-px bg-arena-border-strong" />
      </div>

      {/* Magic Link */}
      {!sent ? (
        <div>
          <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
            Receba um link por email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-arena-accent/40 focus:ring-1 focus:ring-arena-accent/20 transition-all"
            />
            <button
              onClick={handleMagicLink}
              disabled={!email.trim()}
              className="bg-arena-accent disabled:bg-arena-accent/20 text-arena-bg rounded-xl px-4 py-3 active:scale-95 transition-all"
            >
              <Mail size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <div className="w-10 h-10 rounded-full bg-arena-accent-dim flex items-center justify-center mx-auto mb-3">
            <Mail size={20} className="text-arena-accent" />
          </div>
          <p className="text-white text-sm font-heading font-semibold">
            Link enviado!
          </p>
          <p className="text-arena-text-muted text-xs mt-1">
            Verifique sua caixa de entrada
          </p>
        </div>
      )}
    </div>
  );
}
