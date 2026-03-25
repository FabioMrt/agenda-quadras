import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin routes — require COMPANY_ADMIN
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if ((session.user as { role: string }).role !== "COMPANY_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Super admin routes — require SUPER_ADMIN
  if (pathname.startsWith("/super-admin") && pathname !== "/super-admin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
    if ((session.user as { role: string }).role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // User bookings — require any login
  if (pathname.startsWith("/meus-agendamentos")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
    "/meus-agendamentos/:path*",
  ],
};
