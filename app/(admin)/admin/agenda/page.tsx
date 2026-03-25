import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWeekBookings, getCompanyCourts } from "@/lib/queries/admin";
import { AgendaClient } from "@/components/admin/agenda";

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const companyId = (session.user as { companyId: string | null }).companyId;
  if (!companyId) redirect("/admin/login");

  const [weekData, courts] = await Promise.all([
    getWeekBookings(companyId, 0),
    getCompanyCourts(companyId),
  ]);

  const courtList = courts.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return <AgendaClient initialWeekData={weekData} courts={courtList} />;
}
