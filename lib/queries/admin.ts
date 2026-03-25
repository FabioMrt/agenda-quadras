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
      court: { include: { company: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getPendingBookings(companyId: string) {
  return prisma.booking.findMany({
    where: {
      court: { companyId },
      status: "PENDING",
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: {
      court: { include: { company: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
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

export async function getWeekBookings(companyId: string, weekOffset: number = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Monday of target week
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const bookings = await prisma.booking.findMany({
    where: {
      court: { companyId },
      date: { gte: monday, lte: sunday },
      status: { not: "CANCELLED" },
    },
    include: {
      court: true,
      user: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const days = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    const dayBookings = bookings
      .filter((b) => b.date.toISOString().split("T")[0] === dateStr)
      .map((b) => ({
        id: b.id,
        time: b.startTime,
        endTime: b.endTime,
        courtName: b.court.name,
        customerName: b.guestName ?? b.user?.name ?? "Usuario",
        customerPhone: b.guestPhone ?? "",
        totalPrice: b.totalPrice,
        status: b.status as string,
        isRecurring: b.isRecurring,
      }));

    days.push({
      date: dateStr,
      dayName: DAY_NAMES[date.getDay()],
      dayNumber: date.getDate(),
      bookings: dayBookings,
    });
  }

  return days;
}

export async function getReportData(companyId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthBookings, courts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        court: { companyId },
        date: { gte: startOfMonth },
        status: "CONFIRMED",
      },
      include: { court: true },
    }),
    prisma.court.findMany({
      where: { companyId, active: true },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                date: { gte: startOfMonth },
                status: { not: "CANCELLED" },
              },
            },
          },
        },
      },
    }),
  ]);

  const monthRevenue = monthBookings.reduce((s, b) => s + b.totalPrice, 0);

  // Count bookings per hour for peak hours
  const hourCounts: Record<string, number> = {};
  monthBookings.forEach((b) => {
    const hour = b.startTime;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hour, count]) => {
      const endHour = (parseInt(hour) + 1).toString().padStart(2, "0") + ":00";
      const maxPossible = now.getDate() * courts.length;
      return {
        hour: `${hour}-${endHour}`,
        count,
        percentage: maxPossible > 0 ? Math.round((count / maxPossible) * 100) : 0,
      };
    });

  // Top court
  const courtStats = courts
    .map((c) => ({
      name: c.name,
      count: c._count.bookings,
      revenue: monthBookings
        .filter((b) => b.courtId === c.id)
        .reduce((s, b) => s + b.totalPrice, 0),
    }))
    .sort((a, b) => b.count - a.count);

  const topCourt = courtStats[0] ?? null;

  // Occupancy rate
  const totalSlots = courts.length > 0 ? courts.length * 16 * now.getDate() : 1;
  const occupancyRate = Math.min(
    Math.round((monthBookings.length / totalSlots) * 100),
    100
  );

  return {
    monthRevenue,
    occupancyRate,
    totalBookings: monthBookings.length,
    topCourt,
    peakHours,
  };
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
