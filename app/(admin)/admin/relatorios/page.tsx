import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats, getReportData } from "@/lib/queries/admin";
import { RelatoriosClient } from "@/components/admin/relatorios";

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const companyId = (session.user as { companyId: string | null }).companyId;
  if (!companyId) redirect("/admin/login");

  const [stats, report] = await Promise.all([
    getAdminStats(companyId),
    getReportData(companyId),
  ]);

  return (
    <RelatoriosClient
      monthRevenue={report.monthRevenue}
      occupancyRate={report.occupancyRate}
      topCourt={report.topCourt}
      peakHours={report.peakHours}
    />
  );
}
