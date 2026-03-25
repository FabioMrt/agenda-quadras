import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCompanyById } from "@/lib/queries/super-admin";
import { EmpresaDetailClient } from "@/components/super-admin/empresa-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmpresaDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/super-admin/login");

  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) notFound();

  return <EmpresaDetailClient company={company} />;
}
