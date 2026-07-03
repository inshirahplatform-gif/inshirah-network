import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

// Public paths that start with /promoter or /merchant but must NOT require a session
const PUBLIC_PATHS = new Set([
  "/promoter/register",
  "/merchant/register",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow registration pages through without a session
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Protected path flags
  const isPromoterPath = pathname.startsWith("/promoter");
  const isMerchantPath = pathname.startsWith("/merchant");
  const isAdminPath    = pathname.startsWith("/admin");

  const sessionCookie = request.cookies.get("inshirah_session");

  // No cookie → redirect to login for protected routes
  if ((isPromoterPath || isMerchantPath || isAdminPath) && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie) {
    // Verify JWT signature — returns null on tamper or expiry
    const session = await verifySession(sessionCookie.value);

    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("inshirah_session");
      return response;
    }

    const { role } = session;

    if (isPromoterPath && role !== "promoter") {
      if (role === "admin") return NextResponse.next();
      const target = role === "merchant" ? "/merchant/dashboard" : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isMerchantPath && role !== "merchant") {
      if (role === "admin") return NextResponse.next();
      const target = role === "promoter" ? "/promoter/dashboard" : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isAdminPath && role !== "admin") {
      const target =
        role === "promoter"
          ? "/promoter/dashboard"
          : role === "merchant"
          ? "/merchant/dashboard"
          : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/promoter/:path*", "/merchant/:path*", "/admin/:path*"],
};
