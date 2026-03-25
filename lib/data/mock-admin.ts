import { BookingStatus } from "./mock-data";

export interface AdminBooking {
  id: string;
  courtName: string;
  courtType: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface AdminStats {
  todayBookings: number;
  monthRevenue: number;
  activeCourts: number;
  occupancyRate: number;
  weeklyBookings: { day: string; count: number }[];
}

export interface AdminCourt {
  id: string;
  name: string;
  type: string;
  surface: string;
  pricePerHour: number;
  maxPlayers: number;
  active: boolean;
  amenities: string[];
  bookingsThisMonth: number;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
  }[];
}

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function getAdminStats(): AdminStats {
  const today = new Date();
  return {
    todayBookings: 8,
    monthRevenue: 14520,
    activeCourts: 2,
    occupancyRate: 72,
    weeklyBookings: [
      { day: "Seg", count: 6 },
      { day: "Ter", count: 9 },
      { day: "Qua", count: 4 },
      { day: "Qui", count: 7 },
      { day: "Sex", count: 10 },
      { day: "Sab", count: 8 },
      { day: "Dom", count: 5 },
    ],
  };
}

export function getAdminBookings(): AdminBooking[] {
  const today = new Date();
  return [
    {
      id: "abk-001",
      courtName: "Quadra Society",
      courtType: "Society (Futebol 7)",
      customerName: "Carlos Silva",
      customerPhone: "(11) 99876-5432",
      date: today.toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "09:00",
      totalPrice: 120,
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "abk-002",
      courtName: "Quadra Beach Tenis",
      courtType: "Beach Tenis",
      customerName: "Ana Oliveira",
      customerPhone: "(11) 98765-4321",
      date: today.toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "11:00",
      totalPrice: 80,
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "abk-003",
      courtName: "Quadra Society",
      courtType: "Society (Futebol 7)",
      customerName: "Pedro Santos",
      customerPhone: "(11) 91234-5678",
      date: today.toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "15:00",
      totalPrice: 120,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
    {
      id: "abk-004",
      courtName: "Quadra Society",
      courtType: "Society (Futebol 7)",
      customerName: "Lucas Ferreira",
      customerPhone: "(11) 94567-8901",
      date: today.toISOString().split("T")[0],
      startTime: "19:00",
      endTime: "20:00",
      totalPrice: 120,
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "abk-005",
      courtName: "Quadra Beach Tenis",
      courtType: "Beach Tenis",
      customerName: "Mariana Costa",
      customerPhone: "(11) 93456-7890",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      startTime: "16:00",
      endTime: "17:00",
      totalPrice: 80,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
    {
      id: "abk-006",
      courtName: "Quadra Society",
      courtType: "Society (Futebol 7)",
      customerName: "Rafael Lima",
      customerPhone: "(11) 92345-6789",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      startTime: "20:00",
      endTime: "21:00",
      totalPrice: 120,
      status: "CANCELLED",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];
}

export function getAdminCourts(): AdminCourt[] {
  return [
    {
      id: "society-1",
      name: "Quadra Society",
      type: "Society (Futebol 7)",
      surface: "Gramado Sintetico",
      pricePerHour: 120,
      maxPlayers: 14,
      active: true,
      amenities: ["Gramado sintetico", "Iluminacao LED", "Vestiario", "Estacionamento", "Placar eletronico"],
      bookingsThisMonth: 48,
      availability: [
        { dayOfWeek: 1, startTime: "06:00", endTime: "23:00", slotMinutes: 60 },
        { dayOfWeek: 2, startTime: "06:00", endTime: "23:00", slotMinutes: 60 },
        { dayOfWeek: 3, startTime: "06:00", endTime: "23:00", slotMinutes: 60 },
        { dayOfWeek: 4, startTime: "06:00", endTime: "23:00", slotMinutes: 60 },
        { dayOfWeek: 5, startTime: "06:00", endTime: "23:00", slotMinutes: 60 },
        { dayOfWeek: 6, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 0, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
      ],
    },
    {
      id: "beach-tennis-1",
      name: "Quadra Beach Tenis",
      type: "Beach Tenis",
      surface: "Areia",
      pricePerHour: 80,
      maxPlayers: 4,
      active: true,
      amenities: ["Areia importada", "Rede oficial", "Vestiario", "Loja de raquetes", "Aulas disponiveis"],
      bookingsThisMonth: 32,
      availability: [
        { dayOfWeek: 1, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 2, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 3, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 4, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 5, startTime: "07:00", endTime: "22:00", slotMinutes: 60 },
        { dayOfWeek: 6, startTime: "08:00", endTime: "20:00", slotMinutes: 60 },
        { dayOfWeek: 0, startTime: "08:00", endTime: "20:00", slotMinutes: 60 },
      ],
    },
  ];
}

export function getWeekSchedule(courtId?: string) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const schedule: {
    date: string;
    dayName: string;
    dayNumber: number;
    slots: {
      time: string;
      status: "free" | "booked" | "blocked";
      customerName?: string;
      courtName: string;
    }[];
  }[] = [];

  const bookings = getAdminBookings();
  const courts = courtId
    ? getAdminCourts().filter((c) => c.id === courtId)
    : getAdminCourts();

  for (let d = 0; d < 7; d++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    const slots: typeof schedule[0]["slots"] = [];

    for (const court of courts) {
      for (let hour = 7; hour <= 22; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00`;
        const booking = bookings.find(
          (b) =>
            b.date === dateStr &&
            b.startTime === timeStr &&
            b.courtName === court.name &&
            b.status !== "CANCELLED"
        );

        slots.push({
          time: timeStr,
          status: booking ? "booked" : "free",
          customerName: booking?.customerName,
          courtName: court.name,
        });
      }
    }

    schedule.push({
      date: dateStr,
      dayName: DAY_NAMES_SHORT[date.getDay()],
      dayNumber: date.getDate(),
      slots,
    });
  }

  return schedule;
}
