"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export default function ProductUploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    commission: "",
    stockQuantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "প্রোডাক্টের নাম আবশ্যক";
    }

    if (!formData.description.trim()) {
      newErrors.description = "প্রোডাক্টের বিবরণ আবশ্যক";
    }

    if (!formData.price.trim()) {
      newErrors.price = "মূল্য আবশ্যক";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "সঠিক মূল্য দিন";
    }

    if (!formData.commission.trim()) {
      newErrors.commission = "কমিশন আবশ্যক";
    } else if (
      isNaN(Number(formData.commission)) ||
      Number(formData.commission) < 0 ||
      Number(formData.commission) > 100
    ) {
      newErrors.commission = "কমিশন ০-১০০% এর মধ্যে হতে হবে";
    }

    if (!formData.stockQuantity.trim()) {
      newErrors.stockQuantity = "স্টক সংখ্যা আবশ্যক";
    } else if (
      isNaN(Number(formData.stockQuantity)) ||
      Number(formData.stockQuantity) < 0 ||
      !Number.isInteger(Number(formData.stockQuantity))
    ) {
      newErrors.stockQuantity = "সঠিক স্টক সংখ্যা দিন (পূর্ণসংখ্যা)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically send the data to your API
      console.log("Form submitted:", formData);
      alert("প্রোডাক্ট সফলভাবে আপলোড হয়েছে!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        commission: "",
        stockQuantity: "",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section>
        <p className="text-sm font-semibold text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          নতুন প্রোডাক্ট যুক্ত করুন
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          আপনার হালাল প্রোডাক্টের তথ্য দিয়ে মার্কেটপ্লেসে যুক্ত করুন।
        </p>
      </section>

      <section className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-300"
            >
              প্রোডাক্টের নাম <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="প্রোডাক্টের নাম লিখুন"
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                errors.title
                  ? "border-red-500/50 focus-visible:outline-red-500"
                  : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-300"
            >
              প্রোডাক্টের বিবরণ <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন"
              rows={4}
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                errors.description
                  ? "border-red-500/50 focus-visible:outline-red-500"
                  : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-zinc-300"
            >
              মূল্য (৳) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="মূল্য টাকায় লিখুন"
              min="0"
              step="0.01"
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                errors.price
                  ? "border-red-500/50 focus-visible:outline-red-500"
                  : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
              }`}
            />
            {errors.price && (
              <p className="text-sm text-red-400">{errors.price}</p>
            )}
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <label
              htmlFor="commission"
              className="block text-sm font-medium text-zinc-300"
            >
              প্রোমোটার কমিশন (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              id="commission"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
              placeholder="কমিশন শতাংশে লিখুন (যেমন: ৫, ১০)"
              min="0"
              max="100"
              step="0.1"
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                errors.commission
                  ? "border-red-500/50 focus-visible:outline-red-500"
                  : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
              }`}
            />
            {errors.commission && (
              <p className="text-sm text-red-400">{errors.commission}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label
              htmlFor="stockQuantity"
              className="block text-sm font-medium text-zinc-300"
            >
              ফিজিক্যাল স্টক সংখ্যা (পিস) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              placeholder="আপনার কাছে থাকা স্টকের সংখ্যা"
              min="0"
              step="1"
              className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                errors.stockQuantity
                  ? "border-red-500/50 focus-visible:outline-red-500"
                  : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
              }`}
            />
            {errors.stockQuantity && (
              <p className="text-sm text-red-400">{errors.stockQuantity}</p>
            )}

            {/* Shariah Compliance Warning */}
            <div className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-400">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  শতর্কতা: শারীয়াহ নীতিমালা অনুযায়ী আপনার ফিজিক্যাল স্টকে বা
                  সরাসরি মালিকানায় নেই এমন পণ্য লিস্টিং করা সম্পূর্ণ নিষিদ্ধ। স্টক
                  ০ হওয়া মাত্রই প্রোডাক্টটি স্বয়ংক্রিয়ভাবে হাইড হয়ে যাবে।
                </span>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            প্রোডাক্ট লাইভ করুন
          </button>
        </form>
      </section>
    </div>
  );
}
