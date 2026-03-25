import { prisma } from "@/lib/prisma";

export async function getSuperAdminStats() {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const [totalCompanies, totalCourts, monthBookings] = await Promise.all([
    prisma.company.count(),
    prisma.court.count(),
    prisma.booking.findMany({
      where: {
        date: { gte: startOfMonth },
        status: "CONFIRMED",
      },
      select: { totalPrice: true },
    }),
  ]);

  return {
    totalCompanies,
    totalCourts,
    totalBookings: monthBookings.length,
    totalRevenue: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
  };
}

export async function getAllCompanies() {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const companies = await prisma.company.findMany({
    include: {
      courts: {
        select: { id: true },
      },
      users: {
        where: { role: "COMPANY_ADMIN" },
        select: { name: true, email: true },
        take: 1,
      },
      _count: {
        select: { courts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get booking counts per company
  const companyIds = companies.map((c) => c.id);
  const courtIds = companies.flatMap((c) => c.courts.map((ct) => ct.id));

  const bookingsByCompany = await prisma.booking.groupBy({
    by: ["courtId"],
    where: {
      courtId: { in: courtIds },
      date: { gte: startOfMonth },
      status: { not: "CANCELLED" },
    },
    _count: true,
    _sum: { totalPrice: true },
  });

  return companies.map((company) => {
    const companyCourtIds = company.courts.map((c) => c.id);
    const companyBookings = bookingsByCompany.filter((b) =>
      companyCourtIds.includes(b.courtId)
    );
    const monthlyBookings = companyBookings.reduce(
      (sum, b) => sum + b._count,
      0
    );
    const monthlyRevenue = companyBookings.reduce(
      (sum, b) => sum + (b._sum.totalPrice ?? 0),
      0
    );
    const admin = company.users[0];

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo: company.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      adminName: admin?.name ?? "Sem admin",
      adminEmail: admin?.email ?? "",
      city: company.city ?? "",
      courtsCount: company._count.courts,
      monthlyBookings,
      monthlyRevenue,
      active: company.active,
      createdAt: company.createdAt.toISOString().split("T")[0],
    };
  });
}

export async function getCompanyById(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "COMPANY_ADMIN" },
        select: { name: true, email: true },
        take: 1,
      },
      courts: {
        include: {
          courtType: true,
          availabilityRules: true,
          _count: {
            select: {
              bookings: {
                where: {
                  date: {
                    gte: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                  },
                  status: { not: "CANCELLED" },
                },
              },
            },
          },
        },
      },
      _count: {
        select: { courts: true },
      },
    },
  });

  if (!company) return null;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const courtIds = company.courts.map((c) => c.id);

  const [monthlyBookingsCount, monthlyRevenue] = await Promise.all([
    prisma.booking.count({
      where: {
        courtId: { in: courtIds },
        date: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.booking.aggregate({
      where: {
        courtId: { in: courtIds },
        date: { gte: startOfMonth },
        status: "CONFIRMED",
      },
      _sum: { totalPrice: true },
    }),
  ]);

  const admin = company.users[0];

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo: company.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    adminName: admin?.name ?? "Sem admin",
    adminEmail: admin?.email ?? "",
    city: company.city ?? "",
    courtsCount: company._count.courts,
    monthlyBookings: monthlyBookingsCount,
    monthlyRevenue: monthlyRevenue._sum.totalPrice ?? 0,
    active: company.active,
    createdAt: company.createdAt.toISOString().split("T")[0],
    courts: company.courts.map((court) => ({
      id: court.id,
      name: court.name,
      type: court.courtType.name,
      surface: court.surface ?? "",
      pricePerHour: court.pricePerHour,
      maxPlayers: court.maxPlayers ?? 0,
      active: court.active,
      amenities: [] as string[],
      bookingsThisMonth: court._count.bookings,
      availability: court.availabilityRules.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        slotMinutes: r.slotMinutes,
      })),
    })),
  };
}
