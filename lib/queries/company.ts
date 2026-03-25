import { prisma } from "@/lib/prisma";
import type { Company, Court } from "@/lib/data/mock-data";

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const company = await prisma.company.findUnique({
    where: { slug, active: true },
    include: {
      courts: {
        where: { active: true },
        include: { courtType: true },
      },
    },
  });

  if (!company) return null;

  return {
    slug: company.slug,
    name: company.name,
    shortName: company.name.split(" ").slice(0, 2).join(" "),
    logo: company.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    coverImage:
      "https://images.unsplash.com/photo-1645819598410-06aea57ce9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb21wbGV4JTIwYnVpbGRpbmclMjBleHRlcmlvciUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc3NDQ0Nzc1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "",
    address: company.address ?? "",
    neighborhood: "",
    city: company.city ?? "",
    phone: company.phone ?? "",
    whatsapp: company.whatsapp ?? "",
    rating: 4.8,
    reviewsCount: 0,
    openingHours: "",
    courts: company.courts.map(
      (court): Court => ({
        id: court.id,
        name: court.name,
        type: court.courtType.name,
        image:
          court.photos[0] ||
          "https://images.unsplash.com/photo-1725972006441-6fd5ec6d6ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
        pricePerHour: court.pricePerHour,
        description: court.description ?? "",
        amenities: [],
        maxPlayers: court.maxPlayers ?? 0,
        surface: court.surface ?? "",
      })
    ),
  };
}

export async function getCourtById(
  slug: string,
  courtId: string
): Promise<{ company: Company; court: Court } | null> {
  const company = await getCompanyBySlug(slug);
  if (!company) return null;

  const court = company.courts.find((c) => c.id === courtId);
  if (!court) return null;

  return { company, court };
}
