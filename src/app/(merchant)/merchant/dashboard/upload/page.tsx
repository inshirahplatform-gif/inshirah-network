"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

// ── Types ─────────────────────────────────────────────────────────────────────
type ImageMode = "file" | "url";
type Banner = { type: "success" | "error"; text: string } | null;

// ── Alert banner ──────────────────────────────────────────────────────────────
function AlertBanner({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const styles =
    banner.type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300";
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      <span className="mt-0.5 shrink-0">{banner.type === "success" ? "✓" : "✕"}</span>
      <span>{banner.text}</span>
    </div>
  );
}

// ── Helper: read File → base64 data URI ───────────────────────────────────────
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("ফাইল পড়তে সমস্যা হয়েছে"));
    reader.readAsDataURL(file);
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductUploadPage() {
  // form fields
  const [title,                setTitle]                = useState("");
  const [description,          setDescription]          = useState("");
  const [price,                setPrice]                = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [stockQuantity,        setStockQuantity]        = useState("");

  // image state
  const [imageMode,    setImageMode]    = useState<ImageMode>("file");
  const [imageFile,    setImageFile]    = useState<string>(""); // base64 data URI
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");   // shown in <img>
  const [isDragging,   setIsDragging]   = useState(false);
  
  // gallery images state
  const [galleryMode,  setGalleryMode]  = useState<ImageMode>("file");
  const [galleryFiles, setGalleryFiles] = useState<string[]>([]); // base64 data URIs
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // form meta
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner,    setBanner]    = useState<Banner>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // ── Gallery file handler ─────────────────────────────────────────────────────
  const handleGalleryFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, gallery: "শুধুমাত্র ইমেজ ফাইল গ্রহণযোগ্য (JPG, PNG, WEBP)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, gallery: "ফাইলের আকার সর্বোচ্চ ৫ MB হতে হবে" }));
      return;
    }
    if (galleryFiles.length >= 5) {
      setErrors((p) => ({ ...p, gallery: "সর্বোচ্চ ৫টি গ্যালারি ইমেজ যোগ করতে পারবেন" }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setGalleryFiles((prev) => [...prev, dataUrl]);
      setGalleryPreviews((prev) => [...prev, dataUrl]);
      setErrors((p) => { const n = { ...p }; delete n.gallery; return n; });
    } catch {
      setErrors((p) => ({ ...p, gallery: "ফাইল প্রক্রিয়াকরণে সমস্যা হয়েছে" }));
    }
  }, [galleryFiles.length]);

  const handleGalleryUrlAdd = () => {
    if (!galleryUrlInput.trim().startsWith("http")) {
      setErrors((p) => ({ ...p, gallery: "সঠিক URL দিন" }));
      return;
    }
    if (galleryPreviews.length >= 5) {
      setErrors((p) => ({ ...p, gallery: "সর্বোচ্চ ৫টি গ্যালারি ইমেজ যোগ করতে পারবেন" }));
      return;
    }
    setGalleryPreviews((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
    setErrors((p) => { const n = { ...p }; delete n.gallery; return n; });
  };

  const handleGalleryRemove = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Image file handler ─────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "শুধুমাত্র ইমেজ ফাইল গ্রহণযোগ্য (JPG, PNG, WEBP)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "ফাইলের আকার সর্বোচ্চ ৫ MB হতে হবে" }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageFile(dataUrl);
      setImagePreview(dataUrl);
      setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    } catch {
      setErrors((p) => ({ ...p, image: "ফাইল প্রক্রিয়াকরণে সমস্যা হয়েছে" }));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ── URL input handler ──────────────────────────────────────────────────────
  const handleUrlChange = (val: string) => {
    setImageUrlInput(val);
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    // Show preview immediately for valid-looking URLs
    if (val.trim().startsWith("http")) setImagePreview(val.trim());
    else setImagePreview("");
  };

  // Switch mode — clear image state
  const switchMode = (mode: ImageMode) => {
    setImageMode(mode);
    setImageFile("");
    setImageUrlInput("");
    setImagePreview("");
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "প্রোডাক্টের নাম আবশ্যক";
    if (!description.trim()) e.description = "প্রোডাক্টের বিবরণ আবশ্যক";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      e.price = "সঠিক মূল্য দিন";
    if (
      !commissionPercentage.trim() ||
      isNaN(Number(commissionPercentage)) ||
      Number(commissionPercentage) <= 0 ||
      Number(commissionPercentage) > 100
    )
      e.commissionPercentage = "কমিশন ০–১০০% এর মধ্যে হতে হবে";
    if (
      !stockQuantity.trim() ||
      isNaN(Number(stockQuantity)) ||
      Number(stockQuantity) < 1 ||
      !Number.isInteger(Number(stockQuantity))
    )
      e.stockQuantity = "ন্যূনতম ১ পিস পূর্ণসংখ্যা হতে হবে";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        commissionPercentage: Number(commissionPercentage),
        stockQuantity: Number(stockQuantity),
      };

      if (imageMode === "file" && imageFile) {
        payload.imageFile = imageFile;
      } else if (imageMode === "url" && imageUrlInput.trim().startsWith("http")) {
        payload.imageUrl = imageUrlInput.trim();
      }

      // Add gallery images
      if (galleryFiles.length > 0) {
        payload.galleryFiles = galleryFiles;
      }
      if (galleryPreviews.length > galleryFiles.length) {
        // URL-based gallery images
        payload.galleryUrls = galleryPreviews.slice(galleryFiles.length);
      }

      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setBanner({ type: "success", text: data.message ?? "প্রোডাক্ট সফলভাবে লাইভ হয়েছে!" });
        // Reset everything
        setTitle(""); setDescription(""); setPrice("");
        setCommissionPercentage(""); setStockQuantity("");
        setImageFile(""); setImageUrlInput(""); setImagePreview("");
        setGalleryFiles([]); setGalleryUrlInput(""); setGalleryPreviews([]);
        setErrors({});
      } else {
        setBanner({ type: "error", text: data.error ?? "প্রোডাক্ট আপলোডে সমস্যা হয়েছে" });
      }
    } catch {
      setBanner({ type: "error", text: "নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-50";
  const inputOk  = "border-zinc-300 focus-visible:border-emerald-500 focus-visible:outline-emerald-500 dark:border-zinc-700";
  const inputErr = "border-red-400 focus-visible:outline-red-500 dark:border-red-500/50";

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      {/* Header */}
      <section>
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          নতুন প্রোডাক্ট যুক্ত করুন
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          আপনার হালাল প্রোডাক্টের তথ্য দিয়ে মার্কেটপ্লেসে যুক্ত করুন।
        </p>
      </section>

      <section className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── Title ── */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              প্রোডাক্টের নাম <span className="text-red-500">*</span>
            </label>
            <input type="text" id="title" value={title}
              onChange={(e) => { setTitle(e.target.value); setBanner(null); setErrors((p) => { const n={...p}; delete n.title; return n; }); }}
              placeholder="প্রোডাক্টের নাম লিখুন" disabled={isLoading}
              className={`${inputBase} ${errors.title ? inputErr : inputOk}`} />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* ── Description ── */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              প্রোডাক্টের বিবরণ <span className="text-red-500">*</span>
            </label>
            <textarea id="description" value={description} rows={4}
              onChange={(e) => { setDescription(e.target.value); setBanner(null); setErrors((p) => { const n={...p}; delete n.description; return n; }); }}
              placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন" disabled={isLoading}
              className={`${inputBase} resize-none ${errors.description ? inputErr : inputOk}`} />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* ── Price + Commission row ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                মূল্য (৳) <span className="text-red-500">*</span>
              </label>
              <input type="number" id="price" value={price} min="0" step="0.01"
                onChange={(e) => { setPrice(e.target.value); setBanner(null); setErrors((p) => { const n={...p}; delete n.price; return n; }); }}
                placeholder="মূল্য টাকায়" disabled={isLoading}
                className={`${inputBase} ${errors.price ? inputErr : inputOk}`} />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="commission" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                প্রোমোটার কমিশন (%) <span className="text-red-500">*</span>
              </label>
              <input type="number" id="commission" value={commissionPercentage} min="0" max="100" step="0.1"
                onChange={(e) => { setCommissionPercentage(e.target.value); setBanner(null); setErrors((p) => { const n={...p}; delete n.commissionPercentage; return n; }); }}
                placeholder="যেমন: ১০" disabled={isLoading}
                className={`${inputBase} ${errors.commissionPercentage ? inputErr : inputOk}`} />
              {errors.commissionPercentage && <p className="text-sm text-red-500">{errors.commissionPercentage}</p>}
            </div>
          </div>

          {/* ── Stock ── */}
          <div className="space-y-2">
            <label htmlFor="stock" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ফিজিক্যাল স্টক (পিস) <span className="text-red-500">*</span>
            </label>
            <input type="number" id="stock" value={stockQuantity} min="1" step="1"
              onChange={(e) => { setStockQuantity(e.target.value); setBanner(null); setErrors((p) => { const n={...p}; delete n.stockQuantity; return n; }); }}
              placeholder="আপনার কাছে থাকা পিস" disabled={isLoading}
              className={`${inputBase} ${errors.stockQuantity ? inputErr : inputOk}`} />
            {errors.stockQuantity && <p className="text-sm text-red-500">{errors.stockQuantity}</p>}

            {/* Shariah reminder */}
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs leading-5 text-amber-700 dark:text-amber-400">
                শারীয়াহ নীতিমালা অনুযায়ী শুধুমাত্র ফিজিক্যাল স্টকে থাকা পণ্য লিস্টিং করুন। স্টক ০ হলে পণ্য স্বয়ংক্রিয়ভাবে হাইড হবে।
              </p>
            </div>
          </div>

          {/* ── Image section ── */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              পণ্যের ছবি <span className="text-xs font-normal text-zinc-400">(ঐচ্ছিক)</span>
            </p>

            {/* Mode toggle */}
            <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              {(["file", "url"] as ImageMode[]).map((mode) => (
                <button key={mode} type="button"
                  onClick={() => switchMode(mode)} disabled={isLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    imageMode === mode
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  {mode === "file" ? (
                    <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>ফাইল আপলোড করুন</>
                  ) : (
                    <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>ইমেজ লিংক দিন</>
                  )}
                </button>
              ))}
            </div>

            {/* File upload mode */}
            {imageMode === "file" && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/20"
                    : errors.image
                    ? "border-red-400 bg-red-50/50 dark:border-red-600/50 dark:bg-red-950/10"
                    : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/10"
                }`}
              >
                <input
                  ref={fileInputRef} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                  disabled={isLoading}
                />
                {imagePreview ? (
                  <div className="relative h-36 w-full overflow-hidden rounded-xl">
                    <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                      <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900">পরিবর্তন করুন</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-200 dark:bg-zinc-800">
                      <svg className="h-6 w-6 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        ড্র্যাগ করুন বা ক্লিক করে ফাইল বেছে নিন
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">JPG, PNG, WEBP — সর্বোচ্চ ৫ MB</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* URL mode */}
            {imageMode === "url" && (
              <div className="space-y-3">
                <input
                  type="url" value={imageUrlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                  className={`${inputBase} ${errors.image ? inputErr : inputOk}`}
                />
                {imagePreview && (
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview} alt="URL preview"
                      className="h-full w-full object-contain"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}
              </div>
            )}

            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
          </div>

          {/* ── Gallery Images section ── */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              গ্যালারি ইমেজ <span className="text-xs font-normal text-zinc-400">(ঐচ্ছিক, সর্বোচ্চ ৫টি)</span>
            </p>

            {/* Gallery mode toggle */}
            <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              {(["file", "url"] as ImageMode[]).map((mode) => (
                <button key={mode} type="button"
                  onClick={() => { setGalleryMode(mode); setGalleryUrlInput(""); }}
                  disabled={isLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    galleryMode === mode
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  {mode === "file" ? "ফাইল আপলোড" : "ইমেজ লিংক"}
                </button>
              ))}
            </div>

            {/* Gallery file upload */}
            {galleryMode === "file" && (
              <div
                onClick={() => galleryFileInputRef.current?.click()}
                className={`relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
                  errors.gallery
                    ? "border-red-400 bg-red-50/50 dark:border-red-600/50 dark:bg-red-950/10"
                    : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/10"
                }`}
              >
                <input
                  ref={galleryFileInputRef} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryFileSelect(f); }}
                  disabled={isLoading}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    ক্লিক করে গ্যালারি ইমেজ যোগ করুন
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">JPG, PNG, WEBP — সর্বোচ্চ ৫ MB</p>
                </div>
              </div>
            )}

            {/* Gallery URL input */}
            {galleryMode === "url" && (
              <div className="flex gap-2">
                <input
                  type="url" value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                  className={`${inputBase} flex-1 ${errors.gallery ? inputErr : inputOk}`}
                />
                <button
                  type="button"
                  onClick={handleGalleryUrlAdd}
                  disabled={isLoading || !galleryUrlInput.trim()}
                  className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  যোগ করুন
                </button>
              </div>
            )}

            {/* Gallery previews */}
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <Image
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleGalleryRemove(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.gallery && <p className="text-sm text-red-500">{errors.gallery}</p>}
          </div>

          {/* ── Banner + Submit ── */}
          <AlertBanner banner={banner} />

          <button type="submit" disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                আপলোড হচ্ছে…
              </>
            ) : "প্রোডাক্ট লাইভ করুন"}
          </button>
        </form>
      </section>
    </div>
  );
}
