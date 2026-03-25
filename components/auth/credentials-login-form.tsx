"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

interface CredentialsLoginFormProps {
  redirectUrl: string;
  emailPlaceholder?: string;
  buttonClassName: string;
  focusClassName: string;
}

export function CredentialsLoginForm({
  redirectUrl,
  emailPlaceholder = "admin@arena.com",
  buttonClassName,
  focusClassName,
}: CredentialsLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha incorretos");
      return;
    }

    router.push(redirectUrl);
  };

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span className="text-red-400 text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-arena-text-secondary text-xs font-heading font-semibold mb-2 block uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
            required
            className={`w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none transition-all ${focusClassName}`}
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
            required
            className={`w-full bg-white/4 border border-arena-border-strong rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder:text-arena-text-muted/60 focus:outline-none transition-all ${focusClassName}`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-heading font-bold tracking-wide rounded-2xl py-4 active:scale-[0.97] transition-all flex items-center justify-center gap-2 mt-6 ${buttonClassName}`}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogIn size={18} />
          )}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}
