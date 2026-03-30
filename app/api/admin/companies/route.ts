import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// POST /api/admin/companies — super-admin creates a new company + admin user
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, logoUrl, phone, whatsapp, address, city, adminName, adminEmail, adminPassword } =
      await req.json();

    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Nome, slug, email e senha do admin sao obrigatorios" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Esse slug ja esta em uso" },
        { status: 409 }
      );
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Esse email ja esta cadastrado" },
        { status: 409 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        city: city || null,
        active: true,
      },
    });

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: adminName || name + " Admin",
        email: adminEmail,
        passwordHash,
        role: "COMPANY_ADMIN",
        companyId: company.id,
      },
    });

    revalidatePath("/super-admin/empresas");
    revalidatePath("/super-admin");

    return NextResponse.json({ company }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar empresa" },
      { status: 500 }
    );
  }
}
