import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionData {
  userId: string;
  email: string;
  role: "promoter" | "merchant" | "admin";
  name: string;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get("inshirah_session");

  // Protected paths
  const isPromoterPath = pathname.startsWith("/promoter");
  const isMerchantPath = pathname.startsWith("/merchant");
  const isAdminPath = pathname.startsWith("/admin");

  // If trying to access protected routes without session, redirect to login
  if ((isPromoterPath || isMerchantPath || isAdminPath) && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If session exists, parse and validate role
  if (sessionCookie) {
    try {
      const sessionData: SessionData = JSON.parse(sessionCookie.value);
      const userRole = sessionData.role;

      // Role-based authorization
      if (isPromoterPath && userRole !== "promoter") {
        // Non-promoter trying to access promoter routes
        if (userRole === "merchant") {
          const dashboardUrl = new URL("/merchant/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        } else if (userRole === "admin") {
          // Admin can access all routes, allow access
          return NextResponse.next();
        }
      }

      if (isMerchantPath && userRole !== "merchant") {
        // Non-merchant trying to access merchant routes
        if (userRole === "promoter") {
          const dashboardUrl = new URL("/promoter/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        } else if (userRole === "admin") {
          // Admin can access all routes, allow access
          return NextResponse.next();
        }
      }

      if (isAdminPath && userRole !== "admin") {
        // Non-admin trying to access admin routes
        if (userRole === "promoter") {
          const dashboardUrl = new URL("/promoter/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        } else if (userRole === "merchant") {
          const dashboardUrl = new URL("/merchant/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }
    } catch (error) {
      // Invalid session cookie, redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/promoter/:path*",
    "/merchant/:path*",
    "/admin/:path*",
  ],
};
