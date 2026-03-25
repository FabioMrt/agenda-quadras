import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/payment — handle payment gateway webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Validate webhook signature from payment gateway
    // TODO: Parse gateway-specific payload (Mercado Pago / Stripe)

    const { bookingId, status, gatewayId } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { bookingId },
      data: {
        status: status === "approved" ? "PAID" : "FAILED",
        gatewayId,
        paidAt: status === "approved" ? new Date() : null,
      },
    });

    // If payment approved, confirm the booking
    if (status === "approved") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    }

    return NextResponse.json({ payment });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
