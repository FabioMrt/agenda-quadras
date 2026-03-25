"use client";

import { Shield } from "lucide-react";
import { CredentialsLoginForm } from "@/components/auth/credentials-login-form";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-xl font-bold text-white tracking-tight">
            Super Admin
          </h1>
          <p className="text-arena-text-muted text-sm mt-1">
            Painel de Controle
          </p>
        </div>

        <CredentialsLoginForm
          redirectUrl="/super-admin"
          emailPlaceholder="super@admin.com"
          buttonClassName="bg-violet-500 disabled:bg-violet-500/50 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20"
          focusClassName="focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
        />
      </div>
    </div>
  );
}
