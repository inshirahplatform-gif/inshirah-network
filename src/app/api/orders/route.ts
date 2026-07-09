import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Order, Product, Promoter } from "@/models";

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch product details for each order item
    const ordersWithProductDetails = await Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item: any) => {
            const product = await Product.findById(item.productId).select(
              "title imageUrl"
            );
            return {
              ...item,
              title: product?.title || "Unknown Product",
              imageUrl: product?.imageUrl || "",
            };
          })
        );
        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithProductDetails }, { status: 200 });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "অর্ডার লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { items, customerName, customerPhone, shippingAddress, totalAmount, paymentMethod } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "কমপক্ষে একটি প্রোডাক্ট নির্বাচন করুন" },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Read the referrer tracking cookie for promoter attribution
    const cookieStore = await cookies();
    const referrerCookie = cookieStore.get("inshirah_ref");
    const promoterId: string | undefined = referrerCookie?.value || undefined;

    // Get current session to check for self-purchase
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

    // Rule 3: Self-Purchase Block - If logged-in user is the promoter, no commission
    let finalPromoterId = promoterId;
    if (session && promoterId && session.userId === promoterId) {
      finalPromoterId = undefined; // Self-purchase blocked
    }

    // Validate all products and calculate commission
    const orderItems = [];
    let calculatedTotal = 0;
    let totalCommission = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `প্রোডাক্ট পাওয়া যায়নি: ${item.productId}` },
          { status: 404 }
        );
      }

      // Stock validation
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `পর্যাপ্ত স্টক নেই: ${product.title}` },
          { status: 400 }
        );
      }

      // Deduct stock
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity === 0) {
        product.status = "hidden";
      }
      await product.save();

      const itemTotal = product.price * item.quantity;
      const itemCommission = finalPromoterId
        ? (itemTotal * product.commissionPercentage) / 100
        : 0;

      orderItems.push({
        productId: product._id,
        merchantId: product.merchantId,
        quantity: item.quantity,
        price: product.price,
        commissionPercentage: product.commissionPercentage,
        commissionAmount: itemCommission,
      });

      calculatedTotal += itemTotal;
      totalCommission += itemCommission;
    }

    // Validate total amount matches
    if (totalAmount !== calculatedTotal) {
      return NextResponse.json(
        { error: "মোট পরিমাণ মিলছে না" },
        { status: 400 }
      );
    }

    // Create the order (group by merchant if needed, for now create single order)
    const order = await Order.create({
      userId: session?.userId,
      items: orderItems,
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      totalAmount: calculatedTotal,
      commissionAmount: totalCommission,
      promoterId: finalPromoterId,
      status: "Pending",
    });

    // Credit the promoter's pendingBalance
    if (finalPromoterId && totalCommission > 0) {
      const promoter = await Promoter.findById(finalPromoterId);
      if (promoter) {
        promoter.pendingBalance += totalCommission;
        await promoter.save();
      }
    }

    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      { error: "অর্ডার গ্রহণে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
