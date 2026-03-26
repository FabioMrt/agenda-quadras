"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Repeat,
  Menu,
  LogOut,
  Bell,
  Clock,
  Calendar,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <div className="px-3 pb-6 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <ThemeToggle />
          <span className="text-arena-text-muted text-sm font-heading">Tema</span>
        </div>
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
  const adminRouter = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState<{ id: string; courtName: string; customerName: string; date: string; startTime: string; endTime: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchPending = useCallback(() => {
    fetch("/api/admin/pending-count")
      .then((r) => r.json())
      .then((d) => {
        setPendingCount(d.count || 0);
        setPendingBookings(d.bookings || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [pathname, fetchPending]);

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

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
      <div className="flex-1 lg:ml-[240px] overflow-x-hidden">
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center"
              >
                <Bell size={18} className="text-arena-text-secondary" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-12 w-72 bg-arena-surface border border-arena-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-arena-border">
                      <h4 className="font-heading font-bold text-arena-text text-sm">Notificacoes</h4>
                      <button onClick={() => setShowNotifications(false)}>
                        <X size={14} className="text-arena-text-muted" />
                      </button>
                    </div>
                    {pendingBookings.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="text-arena-text-muted mx-auto mb-2" />
                        <p className="text-arena-text-muted text-xs">Nenhuma pendencia</p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto divide-y divide-arena-border/50">
                        {pendingBookings.map((bk) => (
                          <button
                            key={bk.id}
                            onClick={() => {
                              setShowNotifications(false);
                              adminRouter.push("/admin");
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-arena-surface-elevated transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-arena-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                              <Clock size={14} className="text-arena-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-arena-text text-xs font-semibold truncate">
                                {bk.customerName}
                              </p>
                              <p className="text-arena-text-muted text-[0.625rem]">
                                {bk.courtName} · {formatDateShort(bk.date)} · {bk.startTime}
                              </p>
                            </div>
                            <span className="bg-arena-gold/15 text-arena-gold text-[0.5rem] font-heading font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              Pendente
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {pendingBookings.length > 0 && (
                      <div className="border-t border-arena-border px-4 py-2.5">
                        <button
                          onClick={() => { setShowNotifications(false); adminRouter.push("/admin"); }}
                          className="w-full text-arena-accent text-xs font-heading font-semibold text-center"
                        >
                          Ver todas no Dashboard
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="w-10 h-10 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center">
                <Menu size={18} className="text-arena-text-secondary" />
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
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-full">{children}</main>
      </div>
    </div>
    <Toaster theme="dark" position="top-center" richColors />
    </SessionProvider>
  );
}
