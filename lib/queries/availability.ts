import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/lib/data/mock-data";

export async function getAvailableSlots(
  courtId: string,
  date: Date
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  const rules = await prisma.availabilityRule.findMany({
    where: { courtId, dayOfWeek },
  });

  if (rules.length === 0) return [];

  // Generate all slots from rules
  const allSlots: TimeSlot[] = [];
  for (const rule of rules) {
    const [startH] = rule.startTime.split(":").map(Number);
    const [endH] = rule.endTime.split(":").map(Number);

    for (let hour = startH; hour < endH; hour += rule.slotMinutes / 60) {
      allSlots.push({
        time: `${Math.floor(hour).toString().padStart(2, "0")}:00`,
        available: true,
        price: rule.price,
      });
    }
  }

  // Get bookings and blocks for this date
  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        courtId,
        date,
        status: { not: "CANCELLED" },
      },
    }),
    prisma.blockedSlot.findMany({
      where: { courtId, date },
    }),
  ]);

  // Mark unavailable
  return allSlots.map((slot) => {
    const isBooked = bookings.some((b) => b.startTime === slot.time);
    const isBlocked = blocks.some(
      (b) => slot.time >= b.startTime && slot.time < b.endTime
    );

    return {
      ...slot,
      available: !isBooked && !isBlocked,
    };
  });
}
