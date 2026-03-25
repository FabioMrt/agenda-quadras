import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookings — list user's bookings
export async function GET() {
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

// POST /api/bookings — create a new booking
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courtId, date, startTime, endTime, totalPrice } = await req.json();

    if (!courtId || !date || !startTime || !endTime || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const existing = await prisma.booking.findFirst({
      where: {
        courtId,
        date: new Date(date),
        startTime,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        courtId,
        userId: session.user.id,
        date: new Date(date),
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
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
