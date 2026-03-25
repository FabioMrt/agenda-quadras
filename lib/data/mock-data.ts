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

export const companies: Record<string, Company> = {
  "arena-elite": {
    slug: "arena-elite",
    name: "Arena Elite Sports",
    shortName: "Arena Elite",
    logo: "AE",
    coverImage:
      "https://images.unsplash.com/photo-1645819598410-06aea57ce9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb21wbGV4JTIwYnVpbGRpbmclMjBleHRlcmlvciUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc3NDQ0Nzc1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Espaco esportivo completo com quadras de alta qualidade e estrutura premium para sua pratica esportiva. Venha jogar com conforto e seguranca!",
    address: "Rua das Palmeiras, 842",
    neighborhood: "Jardim America",
    city: "Sao Paulo - SP",
    phone: "(11) 3456-7890",
    whatsapp: "5511934567890",
    rating: 4.8,
    reviewsCount: 312,
    openingHours: "Seg-Sex: 06h-23h | Sab-Dom: 07h-22h",
    courts: [
      {
        id: "society-1",
        name: "Quadra Society",
        type: "Society (Futebol 7)",
        image:
          "https://images.unsplash.com/photo-1725972006441-6fd5ec6d6ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpZXR5JTIwZm9vdGJhbGwlMjBmdXRzYWwlMjBjb3VydHxlbnwxfHx8fDE3NzQ0NDc3NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        pricePerHour: 120,
        description:
          "Quadra society gramado sintetico de ultima geracao, iluminacao em LED e marcacoes oficiais. Perfeita para peladas e campeonatos.",
        amenities: [
          "Gramado sintetico",
          "Iluminacao LED",
          "Vestiario",
          "Estacionamento",
          "Placar eletronico",
        ],
        maxPlayers: 14,
        surface: "Gramado Sintetico",
      },
      {
        id: "beach-tennis-1",
        name: "Quadra Beach Tenis",
        type: "Beach Tenis",
        image:
          "https://images.unsplash.com/photo-1716745559063-2c662f652320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHRlbm5pcyUyMGNvdXJ0JTIwc2FuZHxlbnwxfHx8fDE3NzQ0NDc3NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        pricePerHour: 80,
        description:
          "Arena de beach tenis com areia selecionada importada, redes oficiais e espaco para aquecimento. Ideal para todos os niveis.",
        amenities: [
          "Areia importada",
          "Rede oficial",
          "Vestiario",
          "Loja de raquetes",
          "Aulas disponiveis",
        ],
        maxPlayers: 4,
        surface: "Areia",
      },
    ],
  },
};

export function generateTimeSlots(courtId: string, date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const isBeachTennis = courtId.includes("beach");
  const price = isBeachTennis ? 80 : 120;

  const seed = courtId.length + date.getDate() + date.getMonth();

  const unavailablePatterns: Record<number, number[]> = {
    0: [8, 10, 14, 18, 20],
    1: [9, 11, 16, 19],
    2: [7, 13, 17, 21],
    3: [8, 12, 15, 20],
    4: [10, 14, 18],
    5: [9, 11, 16, 19, 21],
    6: [8, 13, 17],
  };

  const unavailable = unavailablePatterns[seed % 7] || [];

  for (let hour = 7; hour <= 22; hour++) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    const isAvailable = !unavailable.includes(hour);
    slots.push({
      time: timeStr,
      available: isAvailable,
      price: price,
    });
  }

  return slots;
}

export function getNext7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export function getCompanyBySlug(slug: string): Company | null {
  return companies[slug] ?? null;
}

export function getCourtById(
  slug: string,
  courtId: string
): { company: Company; court: Court } | null {
  const company = companies[slug];
  if (!company) return null;
  const court = company.courts.find((c) => c.id === courtId);
  if (!court) return null;
  return { company, court };
}
