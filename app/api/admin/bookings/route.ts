import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "COMPANY_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = token.companyId as string;
  if (!companyId) {
    return NextResponse.json({ error: "No company" }, { status: 400 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam + "T00:00:00") : new Date(new Date().setHours(0, 0, 0, 0));

  const bookings = await prisma.booking.findMany({
    where: {
      court: { companyId },
      date,
      status: { not: "CANCELLED" },
    },
    include: {
      court: { include: { company: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const mapped = bookings.map((b) => ({
    id: b.id,
    courtName: b.court.name,
    customerName: b.guestName ?? b.user?.name ?? b.user?.email ?? "Usuario",
    customerPhone: b.guestPhone ?? "",
    date: b.date.toISOString().split("T")[0],
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: b.totalPrice,
    status: b.status,
    companyName: b.court.company.name,
  }));

  return NextResponse.json({ bookings: mapped });
}
