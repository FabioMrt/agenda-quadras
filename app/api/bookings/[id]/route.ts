import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// PATCH /api/bookings/:id — update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || (token.role !== "COMPANY_ADMIN" && token.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Status invalido. Use CONFIRMED ou CANCELLED." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { court: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva nao encontrada" },
        { status: 404 }
      );
    }

    // Company admin can only update bookings from their company
    if (token.role === "COMPANY_ADMIN" && booking.court.companyId !== token.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking: updated });
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar reserva" },
      { status: 500 }
    );
  }
}
