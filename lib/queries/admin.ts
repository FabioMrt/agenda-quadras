import { prisma } from "@/lib/prisma";

export async function getAdminStats(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayBookings, monthBookings, activeCourts, totalSlots] =
    await Promise.all([
      prisma.booking.count({
        where: {
          court: { companyId },
          date: today,
          status: { not: "CANCELLED" },
        },
      }),
      prisma.booking.findMany({
        where: {
          court: { companyId },
          date: { gte: startOfMonth },
          status: "CONFIRMED",
        },
        select: { totalPrice: true },
      }),
      prisma.court.count({
        where: { companyId, active: true },
      }),
      prisma.availabilityRule.count({
        where: { court: { companyId } },
      }),
    ]);

  const monthRevenue = monthBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Approximate occupancy: confirmed bookings / total available slots
  const monthBookingsCount = monthBookings.length;
  const daysInMonth = today.getDate();
  const dailySlots = totalSlots > 0 ? totalSlots : 1;
  const occupancyRate =
    totalSlots > 0
      ? Math.round((monthBookingsCount / (dailySlots * daysInMonth)) * 100)
      : 0;

  return {
    todayBookings,
    monthRevenue,
    activeCourts,
    occupancyRate: Math.min(occupancyRate, 100),
  };
}

export async function getTodayBookings(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.booking.findMany({
    where: {
      court: { companyId },
      date: today,
      status: { not: "CANCELLED" },
    },
    include: {
      court: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getAdminBookings(companyId: string) {
  return prisma.booking.findMany({
    where: {
      court: { companyId },
    },
    include: {
      court: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { date: "desc" },
    take: 50,
  });
}

export async function getCompanyCourts(companyId: string) {
  return prisma.court.findMany({
    where: { companyId },
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
  });
}
