import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/database';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const products = await allQuery('SELECT * FROM products ORDER BY created_at DESC');
    
    // Parse images JSON for each product
    const productsWithImages = products.map((product: any) => ({
  ...product,
  images: product.images ? JSON.parse(product.images) : []
}));


    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const result = await runQuery(
      `INSERT INTO products (name, description, short_description, images, flipkart_link, amazon_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, short_description, JSON.stringify(images || []), flipkart_link, amazon_link]
    );

    return NextResponse.json(
      { message: 'Product created successfully', id: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}