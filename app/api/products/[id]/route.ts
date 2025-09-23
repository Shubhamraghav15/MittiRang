import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/database';
import { isAuthenticated } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getQuery('SELECT * FROM products WHERE id = ?', [params.id]);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse images JSON
    product.images = product.images ? JSON.parse(product.images) : [];

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
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
    const { name, description, short_description, images, flipkart_link, amazon_link } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    await runQuery(
      `UPDATE products 
       SET name = ?, description = ?, short_description = ?, images = ?, 
           flipkart_link = ?, amazon_link = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, short_description, JSON.stringify(images || []), flipkart_link, amazon_link, params.id]
    );

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}