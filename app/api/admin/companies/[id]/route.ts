import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PATCH /api/admin/companies/:id — update company data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, logoUrl, phone, whatsapp, address, city, active } = body;

    // Validate slug uniqueness if changed
    if (slug) {
      const existing = await prisma.company.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug ja em uso" }, { status: 409 });
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(active !== undefined && { active }),
      },
    });

    revalidatePath("/super-admin/empresas");
    revalidatePath(`/super-admin/empresas/${id}`);
    revalidatePath(`/${company.slug}`);

    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Falha ao atualizar empresa" }, { status: 500 });
  }
}

// DELETE /api/admin/companies/:id — delete company
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete related data first
    await prisma.user.deleteMany({ where: { companyId: id } });
    await prisma.company.delete({ where: { id } });

    revalidatePath("/super-admin/empresas");
    revalidatePath("/super-admin");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Falha ao excluir empresa" }, { status: 500 });
  }
}
