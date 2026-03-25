import { notFound } from "next/navigation";
import { getCourtById } from "@/lib/queries/company";
import { ConfirmBookingPage } from "@/components/public/confirm-booking";

interface Props {
  params: Promise<{ slug: string; courtId: string }>;
  searchParams: Promise<{ date?: string; time?: string; price?: string }>;
}

export default async function ConfirmarPage({ params, searchParams }: Props) {
  const { slug, courtId } = await params;
  const { date, time, price } = await searchParams;
  const result = await getCourtById(slug, courtId);

  if (!result || !date || !time || !price) {
    notFound();
  }

  const endTime =
    (parseInt(time) + 1).toString().padStart(2, "0") + ":00";

  return (
    <ConfirmBookingPage
      company={result.company}
      court={result.court}
      date={date}
      startTime={time}
      endTime={endTime}
      price={Number(price)}
    />
  );
}
