import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Use direct connection for seed (not pooler)
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

async function main() {
  const superAdminHash = await bcrypt.hash("super-admin-123", 12);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@agendaquadras.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@agendaquadras.com",
      passwordHash: superAdminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Super Admin created:", superAdmin.email);

  // Create Company
  const company = await prisma.company.upsert({
    where: { slug: "arena-elite" },
    update: {},
    create: {
      name: "Arena Elite Sports",
      slug: "arena-elite",
      phone: "(11) 3456-7890",
      whatsapp: "5511934567890",
      address: "Rua das Palmeiras, 842, Jardim America",
      city: "Sao Paulo - SP",
      active: true,
    },
  });
  console.log("Company created:", company.name);

  // Create Company Admin
  const adminHash = await bcrypt.hash("admin-123", 12);
  const companyAdmin = await prisma.user.upsert({
    where: { email: "ricardo@arenaelite.com" },
    update: {},
    create: {
      name: "Ricardo Mendes",
      email: "ricardo@arenaelite.com",
      passwordHash: adminHash,
      role: "COMPANY_ADMIN",
      companyId: company.id,
    },
  });
  console.log("Company Admin created:", companyAdmin.email);

  // Create Court Types
  const societyType = await prisma.courtType.create({
    data: {
      companyId: company.id,
      name: "Society (Futebol 7)",
      icon: "⚽",
    },
  });

  const beachType = await prisma.courtType.create({
    data: {
      companyId: company.id,
      name: "Beach Tenis",
      icon: "🎾",
    },
  });

  // Create Courts
  const societyCourt = await prisma.court.create({
    data: {
      companyId: company.id,
      courtTypeId: societyType.id,
      name: "Quadra Society",
      description:
        "Quadra society gramado sintetico de ultima geracao, iluminacao em LED e marcacoes oficiais.",
      surface: "Gramado Sintetico",
      maxPlayers: 14,
      pricePerHour: 120,
      active: true,
    },
  });

  const beachCourt = await prisma.court.create({
    data: {
      companyId: company.id,
      courtTypeId: beachType.id,
      name: "Quadra Beach Tenis",
      description:
        "Arena de beach tenis com areia selecionada importada, redes oficiais e espaco para aquecimento.",
      surface: "Areia",
      maxPlayers: 4,
      pricePerHour: 80,
      active: true,
    },
  });

  // Create Availability Rules (Mon-Fri 06-23, Sat-Sun 07-22)
  for (const court of [societyCourt, beachCourt]) {
    const price = court.pricePerHour;

    // Mon-Fri
    for (let day = 1; day <= 5; day++) {
      await prisma.availabilityRule.create({
        data: {
          courtId: court.id,
          dayOfWeek: day,
          startTime: "06:00",
          endTime: "23:00",
          slotMinutes: 60,
          price,
        },
      });
    }

    // Sat-Sun
    for (const day of [0, 6]) {
      await prisma.availabilityRule.create({
        data: {
          courtId: court.id,
          dayOfWeek: day,
          startTime: "07:00",
          endTime: "22:00",
          slotMinutes: 60,
          price,
        },
      });
    }
  }

  console.log("Availability rules created for both courts");
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
