import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get("productId");
  const ref = searchParams.get("ref");

  // Set referrer tracking cookie
  if (ref) {
    const cookieStore = await cookies();
    cookieStore.set("inshirah_ref", ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  // Redirect to the product page
  if (productId) {
    return NextResponse.redirect(new URL(`/products/${productId}`, request.url));
  }

  // Fallback to home if no productId
  return NextResponse.redirect(new URL("/", request.url));
}
