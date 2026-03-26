import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/recurring — create recurring bookings for N weeks
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || (token.role !== "COMPANY_ADMIN" && token.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courtId, dayOfWeek, startTime, weeks, guestName, guestPhone } =
      await req.json();

    if (!courtId || dayOfWeek === undefined || !startTime || !weeks) {
      return NextResponse.json(
        { error: "Campos obrigatorios: quadra, dia, horario, semanas" },
        { status: 400 }
      );
    }

    // Verify court belongs to admin's company
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      return NextResponse.json({ error: "Quadra nao encontrada" }, { status: 404 });
    }
    if (token.role === "COMPANY_ADMIN" && court.companyId !== token.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get price from availability rule
    const rule = await prisma.availabilityRule.findFirst({
      where: { courtId, dayOfWeek },
    });

    const endHour = (parseInt(startTime) + 1).toString().padStart(2, "0");
    const endTime = `${endHour}:00`;

    // Generate dates for the next N weeks on the specified day (UTC)
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr + "T12:00:00Z");

    const dates: Date[] = [];
    const current = new Date(today);

    // Find next occurrence of dayOfWeek
    while (current.getUTCDay() !== dayOfWeek) {
      current.setUTCDate(current.getUTCDate() + 1);
    }

    for (let i = 0; i < weeks; i++) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 7);
    }

    // Check for conflicts and create bookings
    const created: string[] = [];
    const skipped: string[] = [];

    for (const date of dates) {
      const dateStr = date.toISOString().split("T")[0];

      const existing = await prisma.booking.findFirst({
        where: {
          courtId,
          date,
          startTime,
          status: { not: "CANCELLED" },
        },
      });

      if (existing) {
        skipped.push(dateStr);
        continue;
      }

      await prisma.booking.create({
        data: {
          courtId,
          guestName: guestName || "Horario fixo",
          guestPhone: guestPhone || null,
          isRecurring: true,
          date,
          startTime,
          endTime,
          totalPrice: rule?.price ?? court.pricePerHour,
          status: "CONFIRMED",
        },
      });

      created.push(dateStr);
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
      dates: { created, skipped },
    });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar reservas recorrentes" },
      { status: 500 }
    );
  }
}
