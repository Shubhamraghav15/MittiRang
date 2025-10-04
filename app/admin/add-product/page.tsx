"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save } from "lucide-react";

function normalizeSizes(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const nums = value
    .map((v) => (typeof v === "string" ? Number(v) : v))
    .filter((v) => Number.isFinite(v)) as number[];
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

export default function AddProduct() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    flipkart_link: "",
    amazon_link: "",
    price: "",
    sellingprice:""
  });

  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const shoeSizes = useMemo<number[]>(() => [5, 6, 7, 8, 9, 10, 11, 12], []);
  const [sellingErr, setSellingErr] = useState<string>("");
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "price" || name === "sellingprice") {
        const mrp = parseFloat(name === "price" ? value : next.price);
        const sp  = parseFloat(name === "sellingprice" ? value : next.sellingprice);

        // reset error if either is empty
        if (!value || !next.price || !next.sellingprice) {
          setSellingErr("");
        } else if (Number.isFinite(mrp) && Number.isFinite(sp)) {
          if (sp >= mrp) setSellingErr("Selling price must be less than MRP.");
          else if (sp < 0 || mrp < 0) setSellingErr("Prices must be non-negative.");
          else setSellingErr("");
        } else {
          setSellingErr("");
        }
      }

      return next;
    });
  };

  // ✅ toggle uses setSizes internally; call THIS directly from onChange
  const toggleSize = (size: number) => {
    setSizes((prev) => {
      const exists = prev.includes(size);
      const next = exists ? prev.filter((s) => s !== size) : [...prev, size];
      return normalizeSizes(next);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return data.url as string;
    });

    try {
      const uploaded = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      alert("Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (!Number.isFinite(priceNum)) {
      alert("Valid price is required");
      return;
    }
    const sellingpriceNum = parseFloat(formData.sellingprice);
    if (!Number.isFinite(sellingpriceNum)) {
      alert("Valid selling price is required");
      return;
    }
     if (sellingpriceNum >= priceNum) {
      alert("Selling price must be less than MRP.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: priceNum,
        sellingprice: sellingpriceNum,
        images: Array.isArray(images) ? images : [],
        sizes: normalizeSizes(sizes), // ✅ numeric, unique, sorted
      };
      setSaving(true);
      console.log("ADD payload:", payload); // helpful to verify
      // right before fetch in handleSubmit
      console.log("ADD payload:", {
        ...formData,
        price: priceNum,
        sellingprice:sellingpriceNum,
        images,
        sizes: normalizeSizes(sizes),
      });
      // return;
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json().catch(() => ({} as any));
        alert(data?.error || "Error creating product");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const mrp = parseFloat(formData.price);
  const sp  = parseFloat(formData.sellingprice);
  const disableSubmit =
    saving ||
    uploading ||
    !formData.name.trim() ||
    !formData.price ||
    !formData.sellingprice ||
    !Number.isFinite(mrp) ||
    !Number.isFinite(sp) ||
    sp >= mrp ||
    mrp < 0 ||
    sp < 0;
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/admin/dashboard"
              className="flex items-center text-stone-600 hover:text-amber-700 font-medium mr-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-stone-800">Add New Product</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-2">
                  MRP (₹) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter product price"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-2">
                  Selling Price (₹) *
                </label>
                <input
                  id="sellingprice"
                  name="sellingprice"
                  type="number"
                  step="0.01"
                  required
                  value={formData.sellingprice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter product selling price"
                />
                {sellingErr && (
                  <p className="mt-2 text-sm text-red-600">{sellingErr}</p>
                )}
              </div>
              <div>
                <label htmlFor="short_description" className="block text-sm font-medium text-stone-700 mb-2">
                  Short Description
                </label>
                <input
                  id="short_description"
                  name="short_description"
                  type="text"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="Brief description for product cards"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
                  Full Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Detailed product description, materials, features, etc."
                />
              </div>
            </div>
          </div>

          {/* Sizes Selection */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Available Sizes</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {shoeSizes.map((size) => {
                const checked = sizes.includes(size);
                return (
                  <label
                    key={size}
                    className={`flex items-center justify-center border rounded-xl cursor-pointer p-3 transition-all
                      ${checked ? "bg-amber-500 text-white border-amber-500" : "bg-white text-stone-700 hover:border-amber-500"}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => toggleSize(size)}  
                    />
                    <span>{size}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Product Images</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Upload Images
                </label>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-amber-400 transition-colors">
                  <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-stone-600">
                      {uploading ? "Uploading..." : "Click to upload images or drag and drop"}
                    </span>
                    <br />
                    <span className="text-xs text-stone-400">PNG, JPG, JPEG up to 10MB each</span>
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-3">Uploaded Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-stone-200"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2 text-center">
                          <p className="text-xs text-stone-500">Image {index + 1}</p>
                          {index === 0 && <p className="text-xs text-amber-600 font-medium">Primary</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Links */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Purchase Links</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="flipkart_link" className="block text-sm font-medium text-stone-700 mb-2">
                  Flipkart Link
                </label>
                <input
                  id="flipkart_link"
                  name="flipkart_link"
                  type="url"
                  value={formData.flipkart_link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://www.flipkart.com/product-link"
                />
              </div>

              <div>
                <label htmlFor="amazon_link" className="block text-sm font-medium text-stone-700 mb-2">
                  Amazon Link
                </label>
                <input
                  id="amazon_link"
                  name="amazon_link"
                  type="url"
                  value={formData.amazon_link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://www.amazon.in/product-link"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={disableSubmit}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
