import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(req: NextRequest) {
  try {
    const { courtId, date } = await req.json();

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "courtId and date are required" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(courtId, new Date(date));

    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
