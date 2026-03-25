import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSuperAdminStats, getAllCompanies } from "@/lib/queries/super-admin";
import { SuperAdminDashboardClient } from "@/components/super-admin/dashboard";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/super-admin/login");

  const [stats, companies] = await Promise.all([
    getSuperAdminStats(),
    getAllCompanies(),
  ]);

  return <SuperAdminDashboardClient stats={stats} companies={companies} />;
}
