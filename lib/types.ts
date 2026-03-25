export interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

export interface Court {
  id: string;
  name: string;
  type: string;
  image: string;
  pricePerHour: number;
  description: string;
  amenities: string[];
  maxPlayers: number;
  surface: string;
}

export interface Company {
  slug: string;
  name: string;
  shortName: string;
  logo: string;
  coverImage: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewsCount: number;
  openingHours: string;
  courts: Court[];
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: string;
  companySlug: string;
  companyName: string;
  courtId: string;
  courtName: string;
  courtType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}
