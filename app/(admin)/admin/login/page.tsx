"use client";

import { CredentialsLoginForm } from "@/components/auth/credentials-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center glow-accent mb-4">
            <span className="text-arena-bg font-heading font-extrabold text-2xl">
              AE
            </span>
          </div>
          <h1 className="font-heading text-xl font-bold text-white tracking-tight">
            Painel Admin
          </h1>
          <p className="text-arena-text-muted text-sm mt-1">
            Arena Elite Sports
          </p>
        </div>

        <CredentialsLoginForm
          redirectUrl="/admin"
          emailPlaceholder="admin@arena.com"
          buttonClassName="bg-arena-accent disabled:bg-arena-accent/50 text-arena-bg glow-accent"
          focusClassName="focus:border-arena-accent/40 focus:ring-1 focus:ring-arena-accent/20"
        />
      </div>
    </div>
  );
}
