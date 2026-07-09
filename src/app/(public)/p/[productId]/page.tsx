import { redirect } from "next/navigation";

// Next.js 15/16: params and searchParams are Promises
interface PageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function ProductReferralPage({
  params,
  searchParams,
}: PageProps) {
  const { productId } = await params;
  const { ref: promoterId } = await searchParams;

  // Redirect to the Route Handler that will set the cookie and then redirect to product
  if (promoterId) {
    redirect(`/api/referral?productId=${productId}&ref=${promoterId}`);
  }

  // No referrer, redirect directly to product
  redirect(`/products/${productId}`);
}
