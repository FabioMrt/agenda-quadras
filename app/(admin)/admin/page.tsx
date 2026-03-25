import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats, getTodayBookings } from "@/lib/queries/admin";
import { AdminDashboardClient } from "@/components/admin/dashboard";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const companyId = (session.user as { companyId: string | null }).companyId;
  if (!companyId) redirect("/admin/login");

  const [stats, todayBookings] = await Promise.all([
    getAdminStats(companyId),
    getTodayBookings(companyId),
  ]);

  const bookings = todayBookings.map((b) => ({
    id: b.id,
    courtName: b.court.name,
    customerName: b.guestName ?? b.user?.name ?? b.user?.email ?? "Usuario",
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: b.totalPrice,
    status: b.status as "PENDING" | "CONFIRMED" | "CANCELLED",
  }));

  return <AdminDashboardClient stats={stats} todayBookings={bookings} />;
}
