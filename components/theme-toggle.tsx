"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ variant = "default" }: { variant?: "default" | "glass" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const className = variant === "glass"
    ? "w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
    : "w-9 h-9 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center hover:bg-arena-surface-elevated transition-colors";

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {theme === "dark" ? (
        <Sun size={16} className={variant === "glass" ? "text-white" : "text-arena-gold"} />
      ) : (
        <Moon size={16} className={variant === "glass" ? "text-white" : "text-arena-text-secondary"} />
      )}
    </button>
  );
}
