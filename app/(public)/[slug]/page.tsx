import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/queries/company";
import { CompanyPage } from "@/components/public/company-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return <CompanyPage company={company} />;
}
