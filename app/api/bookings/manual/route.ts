import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/manual — admin creates a booking manually
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || (token.role !== "COMPANY_ADMIN" && token.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courtId, date, startTime, endTime, guestName, guestPhone, notes } =
      await req.json();

    if (!courtId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Quadra, data e horario sao obrigatorios" },
        { status: 400 }
      );
    }

    // Verify court belongs to admin's company
    if (token.role === "COMPANY_ADMIN") {
      const court = await prisma.court.findUnique({
        where: { id: courtId },
      });
      if (!court || court.companyId !== token.companyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Check for conflicts
    const existing = await prisma.booking.findFirst({
      where: {
        courtId,
        date: new Date(date + "T12:00:00Z"),
        startTime,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Horario ja reservado" },
        { status: 409 }
      );
    }

    // Get price from availability rule
    const dayOfWeek = new Date(date + "T12:00:00Z").getDay();
    const rule = await prisma.availabilityRule.findFirst({
      where: { courtId, dayOfWeek },
    });

    const booking = await prisma.booking.create({
      data: {
        courtId,
        guestName: guestName || notes || "Reserva manual",
        guestPhone: guestPhone || null,
        date: new Date(date + "T12:00:00Z"),
        startTime,
        endTime,
        totalPrice: rule?.price ?? 0,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar reserva manual" },
      { status: 500 }
    );
  }
}
