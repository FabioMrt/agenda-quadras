"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Repeat,
  Menu,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/recorrentes", label: "Horarios Fixos", icon: Repeat },
  { href: "/admin/relatorios", label: "Relatorios", icon: BarChart3 },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center">
            <span className="text-arena-bg font-heading font-extrabold text-sm">
              AE
            </span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-sm tracking-tight">
              Arena Elite
            </h2>
            <p className="text-arena-text-muted text-[0.625rem] font-medium">
              Painel Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-arena-accent/10 text-arena-accent font-semibold"
                    : "text-arena-text-secondary hover:text-white hover:bg-white/4"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-arena-accent" : "text-arena-text-muted"}
                />
                <span className="font-heading tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-arena-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={18} />
          <span className="font-heading tracking-wide">Sair</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Don't apply layout to login page
  if (pathname === "/admin/login") {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
    <div className="min-h-screen bg-arena-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col bg-arena-surface border-r border-arena-border shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-[240px]">
        {/* Mobile/Tablet header */}
        <header className="lg:hidden flex items-center justify-between px-5 pt-14 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-arena-accent to-emerald-500 flex items-center justify-center">
              <span className="text-arena-bg font-heading font-extrabold text-xs">
                AE
              </span>
            </div>
            <span className="font-heading font-bold text-white text-sm">
              Arena Elite
            </span>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center">
              <Menu size={18} className="text-white" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] bg-arena-surface border-arena-border p-0"
              showCloseButton={false}
            >
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page content */}
        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
    <Toaster theme="dark" position="top-center" richColors />
    </SessionProvider>
  );
}
