import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookings — list bookings by phone or by authenticated user
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");

  if (phone) {
    const bookings = await prisma.booking.findMany({
      where: { guestPhone: phone },
      include: {
        court: {
          include: {
            company: true,
            courtType: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ bookings });
  }

  // Fallback: authenticated user bookings
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      court: {
        include: {
          company: true,
          courtType: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ bookings });
}

// POST /api/bookings — create a new booking (guest or authenticated)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courtId, date, startTime, endTime, totalPrice, guestName, guestPhone } = body;

    if (!courtId || !date || !startTime || !endTime || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!guestName || !guestPhone) {
      return NextResponse.json(
        { error: "Nome e telefone sao obrigatorios" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
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

    // Check if authenticated user exists
    const session = await auth();

    const booking = await prisma.booking.create({
      data: {
        courtId,
        userId: session?.user?.id ?? null,
        guestName,
        guestPhone,
        date: new Date(date + "T12:00:00Z"),
        startTime,
        endTime,
        totalPrice,
        status: "PENDING",
      },
      include: {
        court: {
          include: { company: true },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar reserva" },
      { status: 500 }
    );
  }
}
