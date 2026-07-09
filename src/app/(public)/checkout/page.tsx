"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type CartItem = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stockQuantity: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    shippingAddress: "",
    paymentMethod: "cod",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedCart = localStorage.getItem("inshirah_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "নাম আবশ্যক";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "ফোন নম্বর আবশ্যক";
    } else if (!/^[0-9]{11}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "সঠিক ১১ ডিজিট ফোন নম্বর দিন";
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "ডেলিভারি ঠিকানা আবশ্যক";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cartItems.length === 0) {
      alert("কার্ট খালি");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          shippingAddress: formData.shippingAddress,
          totalAmount,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("inshirah_cart");
        alert(data.message || "অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
        router.push("/");
      } else {
        alert(data.error || "অর্ডারে সমস্যা হয়েছে");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("অর্ডারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-zinc-950`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-zinc-950 px-6`}>
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-50">কার্ট খালি</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            প্রোডাক্ট দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            চেকআউট
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            আপনার অর্ডার সম্পন্ন করতে তথ্য প্রদান করুন
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold text-zinc-50">কাস্টমার তথ্য</h2>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="customerName" className="block text-sm font-medium text-zinc-300">
                    নাম <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="আপনার নাম"
                    disabled={isSubmitting}
                    className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.customerName
                        ? "border-red-500/50 focus-visible:outline-red-500"
                        : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-400">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-zinc-300">
                    ফোন নম্বর <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    disabled={isSubmitting}
                    className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.customerPhone
                        ? "border-red-500/50 focus-visible:outline-red-500"
                        : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                    }`}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-400">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-zinc-300">
                    ডেলিভারি ঠিকানা <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা"
                    rows={3}
                    disabled={isSubmitting}
                    className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.shippingAddress
                        ? "border-red-500/50 focus-visible:outline-red-500"
                        : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                    }`}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-red-400">{errors.shippingAddress}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold text-zinc-50">পেমেন্ট পদ্ধতি</h2>

              <div className="mt-6 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">ক্যাশ অন ডেলিভারি (COD)</p>
                    <p className="mt-1 text-xs text-zinc-400">প্রোডাক্ট হাতে পেয়ে টাকা দিন</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={formData.paymentMethod === "bkash"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">বিকাশ</p>
                    <p className="mt-1 text-xs text-zinc-400">বিকাশ পেমেন্ট</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nagad"
                    checked={formData.paymentMethod === "nagad"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">নগদ</p>
                    <p className="mt-1 text-xs text-zinc-400">নগদ পেমেন্ট</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === "bank_transfer"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">ব্যাংক ট্রান্সফার</p>
                    <p className="mt-1 text-xs text-zinc-400">ব্যাংক অ্যাকাউন্টে টাকা পাঠান</p>
                  </div>
                </label>
              </div>

              {formData.paymentMethod !== "cod" && (
                <div className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
                  <p className="flex items-start gap-2 text-sm font-medium text-amber-400">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span>
                      অনলাইন পেমেন্ট শীঘ্রই যুক্ত করা হবে। বর্তমানে ক্যাশ অন ডেলিভারি সিলেক্ট করুন।
                    </span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  অর্ডার হচ্ছে…
                </>
              ) : (
                "অর্ডার কনফার্ম করুন"
              )}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold text-zinc-50">অর্ডার সারসংক্ষেপ</h2>

            <div className="mt-6 space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-medium text-zinc-50">
                    {formatBdt(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-zinc-800 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">সাবটোটাল</span>
                  <span className="font-medium text-zinc-50">
                    {formatBdt(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">ডেলিভারি চার্জ</span>
                  <span className="font-medium text-emerald-400">ফ্রি</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-base font-semibold text-zinc-50">
                    মোট
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatBdt(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-400">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>
                  শারীয়াহ-সম্মত লেনদেন। কোনো সুদ বা অনৈতিক শর্ত নেই। অর্ডার কনফার্ম করার পর মার্চেন্ট আপনាឰ সাথে যোগাযোগ করবেন।
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
