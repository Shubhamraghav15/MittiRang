// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { allQuery, runQuery, getQuery } from "@/lib/database";
import { isAuthenticated } from "@/lib/auth";

function normalizeSizes(maybeSizes: unknown): number[] {
  if (!Array.isArray(maybeSizes)) return [];
  const nums = maybeSizes
    .map((v) => (typeof v === "string" ? Number(v) : v))
    .filter((v) => Number.isFinite(v)) as number[];
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

// GET /api/products -> list all products (parsed/normalized)
export async function GET() {
  try {
    const products = await allQuery(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    const normalized = (Array.isArray(products) ? products : []).map((p: any) => {
      const images = p.images ? JSON.parse(p.images) : [];
      const parsedSizes = p.sizes ? JSON.parse(p.sizes) : [];
      const sizes = normalizeSizes(parsedSizes);
      return { ...p, images, sizes };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products -> create a product (SQLite/libsql)
export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[POST /api/products] raw body:", body);

    const {
      name,
      description,
      short_description,
      images,
      flipkart_link,
      amazon_link,
      price,
      sizes,
    } = body ?? {};

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice)) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    const normalizedImages = Array.isArray(images) ? images : [];
    const normalizedSizes = normalizeSizes(sizes);

    // SQLite placeholders are '?', and CURRENT_TIMESTAMP works in SQLite.
    await runQuery(
      `INSERT INTO products
        (name, description, short_description, images, flipkart_link, amazon_link, price, sizes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        name,
        description ?? null,
        short_description ?? null,
        JSON.stringify(normalizedImages),
        flipkart_link ?? null,
        amazon_link ?? null,
        numPrice,
        JSON.stringify(normalizedSizes), // store as JSON string in TEXT/JSON column
      ]
    );

    // Fetch the inserted row using SQLite's last_insert_rowid()
    const created = await getQuery(
      `SELECT * FROM products WHERE id = last_insert_rowid()`
    );

    if (created) {
      created.images = created.images ? JSON.parse(created.images) : [];
      const parsedSizes = created.sizes ? JSON.parse(created.sizes) : [];
      created.sizes = normalizeSizes(parsedSizes);
      return NextResponse.json(created, { status: 201 });
    }

    // Fallback (shouldn't happen with getQuery)
    return NextResponse.json({ message: "Product created" }, { status: 201 });
  } catch (e) {
    console.error("Error creating product:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
