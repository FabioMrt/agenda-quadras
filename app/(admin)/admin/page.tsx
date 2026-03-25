import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats, getTodayBookings, getPendingBookings } from "@/lib/queries/admin";
import { AdminDashboardClient } from "@/components/admin/dashboard";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const companyId = (session.user as { companyId: string | null }).companyId;
  if (!companyId) redirect("/admin/login");

  const [stats, todayBookings, pendingBookings] = await Promise.all([
    getAdminStats(companyId),
    getTodayBookings(companyId),
    getPendingBookings(companyId),
  ]);

  const mapBooking = (b: typeof todayBookings[0]) => ({
    id: b.id,
    courtName: b.court.name,
    customerName: b.guestName ?? b.user?.name ?? b.user?.email ?? "Usuario",
    customerPhone: b.guestPhone ?? "",
    date: b.date.toISOString().split("T")[0],
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: b.totalPrice,
    status: b.status as "PENDING" | "CONFIRMED" | "CANCELLED",
    companyName: b.court.company.name,
  });

  return (
    <AdminDashboardClient
      stats={stats}
      todayBookings={todayBookings.map(mapBooking)}
      pendingBookings={pendingBookings.map(mapBooking)}
    />
  );
}
