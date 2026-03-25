import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/data/mock-data";
import { CompanyPage } from "@/components/public/company-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return <CompanyPage company={company} />;
}
