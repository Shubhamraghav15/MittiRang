"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Search, Grid, List, Tag } from "lucide-react";

type ViewMode = "grid" | "list";
type SortKey = "newest" | "priceLow" | "priceHigh" | "discount";

interface Product {
  id: number;
  name: string;
  short_description?: string;
  images: string[];
  price?: number;            // MRP (optional – shown if provided)
  sellingprice?: number;     // optional
  created_at?: string;       // optional – used for "Newest"
}

function currency(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString()}`;
}

function getDiscount(price?: number, selling?: number) {
  const mrp = Number(price);
  const sp = Number(selling);
  const valid = Number.isFinite(mrp) && Number.isFinite(sp) && sp > 0 && mrp > sp;
  if (!valid) return { has: false, pct: 0, mrp, sp };
  const pct = Math.round(((mrp - sp) / mrp) * 100);
  return { has: true, pct, mrp, sp };
}

export default function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("catalogue:view") as ViewMode) || "grid";
  });
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("catalogue:view", viewMode);
  }, [viewMode]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = (await response.json()) as Product[];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Couldn’t load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const n = p.name?.toLowerCase() ?? "";
      const s = p.short_description?.toLowerCase() ?? "";
      return n.includes(q) || s.includes(q);
    });
  }, [products, searchTerm]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case "newest":
        // newest by created_at desc; fallback to id desc
        arr.sort((a, b) => {
          const ad = a.created_at ? Date.parse(a.created_at) : 0;
          const bd = b.created_at ? Date.parse(b.created_at) : 0;
          if (ad && bd) return bd - ad;
          return (b.id ?? 0) - (a.id ?? 0);
        });
        break;
      case "priceLow":
        arr.sort((a, b) => (a.sellingprice ?? a.price ?? Infinity) - (b.sellingprice ?? b.price ?? Infinity));
        break;
      case "priceHigh":
        arr.sort((a, b) => (b.sellingprice ?? b.price ?? -Infinity) - (a.sellingprice ?? a.price ?? -Infinity));
        break;
      case "discount":
        arr.sort((a, b) => {
          const da = getDiscount(a.price, a.sellingprice).pct;
          const db = getDiscount(b.price, b.sellingprice).pct;
          return db - da;
        });
        break;
    }
    return arr;
  }, [filtered, sortKey]);

  // ---------- Skeleton Loader ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-stone-200 rounded mb-6" />
            <div className="h-5 w-96 bg-stone-200 rounded mb-10" />

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="h-12 w-full md:w-96 bg-stone-200 rounded-xl" />
                <div className="h-10 w-56 bg-stone-200 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                  <div className="aspect-square bg-stone-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-stone-200 rounded" />
                    <div className="h-4 w-1/2 bg-stone-200 rounded" />
                    <div className="h-6 w-1/3 bg-stone-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- Empty / Error States ----------
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-stone-700">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const Controls = (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for shoes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Sort + View */}
        <div className="flex items-center gap-3">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>

          <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-white shadow-md text-amber-600" : "text-stone-500 hover:text-stone-700"
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white shadow-md text-amber-600" : "text-stone-500 hover:text-stone-700"
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-500 bg-clip-text text-transparent">
              Our Collection
            </span>
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Discover the perfect blend of comfort and style in our carefully curated footwear collection.
          </p>
        </div>

        {/* Controls */}
        {Controls}

        {/* Results */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">No products found</h3>
            <p className="text-stone-500">
              {searchTerm ? "Try adjusting your search terms" : "No products available at the moment"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sorted.map((p) => (
              <GridCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sorted.map((p, idx) => (
              <ListCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------------- Cards ---------------------------------- */

function GridCard({ product }: { product: Product }) {
  const img = product.images?.[0] || "/uploads/placeholder-shoe.jpg";
  const { has, pct, mrp, sp } = getDiscount(product.price, product.sellingprice);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-stone-100">
          <Image
            src={img}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {has && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shadow">
            <Tag className="w-3.5 h-3.5" />
            {pct}% OFF
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900 line-clamp-1">{product.name}</h3>
        {product.short_description && (
          <p className="mt-1 text-sm text-stone-600 line-clamp-2">{product.short_description}</p>
        )}

        <div className="mt-3 flex items-end gap-3">
          {has ? (
            <>
              <span className="text-xl font-extrabold text-emerald-600">{currency(sp)}</span>
              <span className="text-sm text-stone-400 line-through">{currency(mrp)}</span>
            </>
          ) : (
            <span className="text-xl font-extrabold text-amber-600">{currency(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ListCard({ product, index }: { product: Product; index: number }) {
  const img = product.images?.[0] || "/uploads/placeholder-shoe.jpg";
  const { has, pct, mrp, sp } = getDiscount(product.price, product.sellingprice);

  // Three soft palettes that cycle down the list
  const palettes = [
    "from-amber-50 via-orange-50 to-rose-50",
    "from-teal-50 via-emerald-50 to-lime-50",
    "from-indigo-50 via-sky-50 to-cyan-50",
  ];
  const palette = palettes[index % palettes.length];

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block rounded-2xl overflow-hidden border border-stone-200 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-200"
    >
      {/* Animated gradient background layer */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${palette} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Floating blurred blob */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-200 opacity-30 blur-3xl transition-transform duration-700 group-hover:translate-x-5 group-hover:-translate-y-2" />

      {/* Card content on top */}
      <div className="relative grid grid-cols-[140px_1fr] md:grid-cols-[220px_1fr] gap-0 bg-white/70 backdrop-blur-sm">
        <div className="relative">
          <Image
            src={img}
            alt={product.name}
            width={440}
            height={440}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {has && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shadow">
              {/* Tag icon inline to avoid import churn; keep your existing import if you like */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59A2 2 0 0 0 3.59 11l9.59 9.59a2 2 0 0 0 2.82 0l4.59-4.59a2 2 0 0 0 0-2.82Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
              {pct}% OFF
            </span>
          )}
        </div>

        <div className="p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-stone-900 line-clamp-1">
              {product.name}
            </h3>
            {product.short_description && (
              <p className="mt-1 text-stone-700 line-clamp-2 md:line-clamp-3">
                {product.short_description}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-end gap-3">
            {has ? (
              <>
                <span className="text-2xl font-extrabold text-emerald-700">
                  ₹{sp!.toLocaleString()}
                </span>
                <span className="text-sm text-stone-500 line-through">
                  ₹{mrp!.toLocaleString()}
                </span>
                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {pct}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-amber-700">
                ₹{(product.price ?? 0).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

