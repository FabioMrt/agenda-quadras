import type { Booking } from "@/lib/types";

// Temporary mock bookings — will be replaced when end-user auth is connected
export const mockBookings: Booking[] = [
  {
    id: "bk-001",
    companySlug: "arena-elite",
    companyName: "Arena Elite Sports",
    courtId: "society-1",
    courtName: "Quadra Society",
    courtType: "Society (Futebol 7)",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    startTime: "19:00",
    endTime: "20:00",
    totalPrice: 120,
    status: "CONFIRMED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "bk-002",
    companySlug: "arena-elite",
    companyName: "Arena Elite Sports",
    courtId: "beach-tennis-1",
    courtName: "Quadra Beach Tenis",
    courtType: "Beach Tenis",
    date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "09:00",
    totalPrice: 80,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
  {
    id: "bk-003",
    companySlug: "arena-elite",
    companyName: "Arena Elite Sports",
    courtId: "society-1",
    courtName: "Quadra Society",
    courtType: "Society (Futebol 7)",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    startTime: "20:00",
    endTime: "21:00",
    totalPrice: 120,
    status: "CANCELLED",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export function getMockBookings(): Booking[] {
  return mockBookings;
}
