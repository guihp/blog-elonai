import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/admin-auth";

// Gatekeeper for the admin area. The dashboard also re-checks the session itself (defense in depth).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (["/admin/login", "/api/admin/login", "/api/admin/logout"].includes(pathname)) return NextResponse.next();
  if (verifySession(request.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
