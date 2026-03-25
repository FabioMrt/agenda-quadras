import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getWeekBookings } from "@/lib/queries/admin";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "COMPANY_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = token.companyId as string;
  if (!companyId) {
    return NextResponse.json({ error: "No company" }, { status: 400 });
  }

  const weekOffset = Number(req.nextUrl.searchParams.get("week") || "0");
  const data = await getWeekBookings(companyId, weekOffset);

  return NextResponse.json({ data });
}
