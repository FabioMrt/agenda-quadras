import { notFound } from "next/navigation";
import { getCourtById } from "@/lib/data/mock-data";
import { CourtSchedulePage } from "@/components/public/court-schedule";

interface Props {
  params: Promise<{ slug: string; courtId: string }>;
}

export default async function CourtPage({ params }: Props) {
  const { slug, courtId } = await params;
  const result = getCourtById(slug, courtId);

  if (!result) {
    notFound();
  }

  return <CourtSchedulePage company={result.company} court={result.court} />;
}
