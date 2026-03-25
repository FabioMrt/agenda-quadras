export interface SuperAdminCompany {
  id: string;
  name: string;
  slug: string;
  logo: string;
  adminName: string;
  adminEmail: string;
  city: string;
  courtsCount: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  active: boolean;
  createdAt: string;
}

export interface SuperAdminStats {
  totalCompanies: number;
  totalCourts: number;
  totalBookings: number;
  totalRevenue: number;
  companiesGrowth: number;
  revenueGrowth: number;
}

export function getSuperAdminStats(): SuperAdminStats {
  return {
    totalCompanies: 3,
    totalCourts: 7,
    totalBookings: 284,
    totalRevenue: 38450,
    companiesGrowth: 50,
    revenueGrowth: 18,
  };
}

export function getSuperAdminCompanies(): SuperAdminCompany[] {
  return [
    {
      id: "comp-001",
      name: "Arena Elite Sports",
      slug: "arena-elite",
      logo: "AE",
      adminName: "Ricardo Mendes",
      adminEmail: "ricardo@arenaelite.com",
      city: "Sao Paulo - SP",
      courtsCount: 2,
      monthlyBookings: 80,
      monthlyRevenue: 14520,
      active: true,
      createdAt: "2025-08-15",
    },
    {
      id: "comp-002",
      name: "Quadra Mania",
      slug: "quadra-mania",
      logo: "QM",
      adminName: "Fernanda Lima",
      adminEmail: "fernanda@quadramania.com",
      city: "Campinas - SP",
      courtsCount: 3,
      monthlyBookings: 120,
      monthlyRevenue: 15200,
      active: true,
      createdAt: "2025-10-02",
    },
    {
      id: "comp-003",
      name: "Gol de Placa Arena",
      slug: "gol-de-placa",
      logo: "GP",
      adminName: "Marcos Souza",
      adminEmail: "marcos@goldeplaca.com",
      city: "Santos - SP",
      courtsCount: 2,
      monthlyBookings: 84,
      monthlyRevenue: 8730,
      active: false,
      createdAt: "2026-01-10",
    },
  ];
}

export function getSuperAdminCompanyById(
  id: string
): SuperAdminCompany | null {
  return getSuperAdminCompanies().find((c) => c.id === id) ?? null;
}
