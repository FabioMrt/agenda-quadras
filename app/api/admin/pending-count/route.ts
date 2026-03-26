import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "COMPANY_ADMIN") {
    return NextResponse.json({ count: 0, bookings: [] });
  }

  const companyId = token.companyId as string;
  if (!companyId) return NextResponse.json({ count: 0, bookings: [] });

  const bookings = await prisma.booking.findMany({
    where: {
      court: { companyId },
      status: "PENDING",
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: {
      court: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 10,
  });

  const mapped = bookings.map((b) => ({
    id: b.id,
    courtName: b.court.name,
    customerName: b.guestName ?? "Usuario",
    date: b.date.toISOString().split("T")[0],
    startTime: b.startTime,
    endTime: b.endTime,
  }));

  return NextResponse.json({ count: bookings.length, bookings: mapped });
}
