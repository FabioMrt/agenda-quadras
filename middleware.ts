import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Admin routes — require COMPANY_ADMIN
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (token.role !== "COMPANY_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Super admin routes — require SUPER_ADMIN
  if (pathname.startsWith("/super-admin") && pathname !== "/super-admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
    if (token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
  ],
};
