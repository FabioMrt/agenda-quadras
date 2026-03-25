import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCompanies } from "@/lib/queries/super-admin";
import { EmpresasListClient } from "@/components/super-admin/empresas-list";

export default async function EmpresasPage() {
  const session = await auth();
  if (!session?.user) redirect("/super-admin/login");

  const companies = await getAllCompanies();

  return <EmpresasListClient companies={companies} />;
}
