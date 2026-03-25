import { prisma } from "./prisma";

interface Slot {
  time: string;
  endTime: string;
  available: boolean;
  price: number;
}

function generateSlots(
  startTime: string,
  endTime: string,
  slotMinutes: number,
  price: number
): Slot[] {
  const slots: Slot[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  for (let t = startTotal; t + slotMinutes <= endTotal; t += slotMinutes) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const endSlotH = Math.floor((t + slotMinutes) / 60);
    const endSlotM = (t + slotMinutes) % 60;

    slots.push({
      time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      endTime: `${endSlotH.toString().padStart(2, "0")}:${endSlotM.toString().padStart(2, "0")}`,
      available: true,
      price,
    });
  }

  return slots;
}

function overlaps(
  slot: { time: string; endTime: string },
  block: { startTime: string; endTime: string }
): boolean {
  return slot.time < block.endTime && slot.endTime > block.startTime;
}

export async function getAvailableSlots(courtId: string, date: Date) {
  const dayOfWeek = date.getDay();

  // Get availability rules for this day
  const rules = await prisma.availabilityRule.findMany({
    where: { courtId, dayOfWeek },
  });

  if (rules.length === 0) return []; // Court closed on this day

  // Generate all possible slots from rules
  const allSlots: Slot[] = [];
  for (const rule of rules) {
    allSlots.push(
      ...generateSlots(rule.startTime, rule.endTime, rule.slotMinutes, rule.price)
    );
  }

  // Get existing bookings and blocked slots for this date
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

  // Mark unavailable slots
  return allSlots.map((slot) => {
    const isBooked = bookings.some((b) =>
      overlaps(slot, { startTime: b.startTime, endTime: b.endTime })
    );
    const isBlocked = blocks.some((b) =>
      overlaps(slot, { startTime: b.startTime, endTime: b.endTime })
    );

    return {
      ...slot,
      available: !isBooked && !isBlocked,
    };
  });
}
