import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCompanyCourts } from "@/lib/queries/admin";
import { RecorrentesClient } from "@/components/admin/recorrentes";

export default async function RecorrentesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const companyId = (session.user as { companyId: string | null }).companyId;
  if (!companyId) redirect("/admin/login");

  const courts = await getCompanyCourts(companyId);
  const courtList = courts.map((c) => ({ id: c.id, name: c.name }));

  return <RecorrentesClient courts={courtList} />;
}
