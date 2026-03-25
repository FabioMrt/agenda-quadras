"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/super-admin");
  };

  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="super@admin.com"
              className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-500 hover:bg-violet-400 text-white font-heading font-bold tracking-wide rounded-2xl py-4 shadow-lg shadow-violet-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 mt-6"
          >
            <LogIn size={18} />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
