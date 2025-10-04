// /api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/database';
import { isAuthenticated } from '@/lib/auth';

// function normalizeSizes(maybeSizes: unknown): number[] {
//   if (!Array.isArray(maybeSizes)) return [];
//   const nums = maybeSizes
//     .map((v) => (typeof v === 'string' ? Number(v) : v))
//     .filter((v) => Number.isFinite(v)) as number[];
//   // unique + sort ASC
//   return Array.from(new Set(nums)).sort((a, b) => a - b);
// }
function normalizeSizes(maybeSizes: unknown): number[] {
  if (!Array.isArray(maybeSizes)) return [];
  const nums = maybeSizes
    .map((v) => (typeof v === "string" ? Number(v) : v))
    .filter((v) => Number.isFinite(v)) as number[];
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getQuery('SELECT * FROM products WHERE id = ?', [params.id]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.images = product.images ? JSON.parse(product.images) : [];
    const parsedSizes = product.sizes ? JSON.parse(product.sizes) : [];
    product.sizes = normalizeSizes(parsedSizes);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      short_description,
      images,
      flipkart_link,
      amazon_link,
      price,
      sellingprice,
      sizes,
    } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 });
    }

    const normalizedSizes = normalizeSizes(sizes);
    const normalizedImages = Array.isArray(images) ? images : [];

    await runQuery(
      `UPDATE products 
       SET name = ?, description = ?, short_description = ?, images = ?, 
           flipkart_link = ?, amazon_link = ?, price = ? ,sellingprice = ?, sizes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        description ?? null,
        short_description ?? null,
        JSON.stringify(normalizedImages),
        flipkart_link ?? null,
        amazon_link ?? null,
        Number(price),
        Number(sellingprice),
        JSON.stringify(normalizedSizes),
        params.id,
      ]
    );

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await runQuery('DELETE FROM products WHERE id = ?', [params.id]);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
