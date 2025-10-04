"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShoppingCart, Tag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  images: string[];
  flipkart_link?: string;
  amazon_link?: string;
  price: number;           // MRP
  sellingprice?: number;   // New: Selling Price (optional)
  sizes: number[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">Product Not Found</h1>
            <Link
              href="/catalogue"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['/uploads/placeholder-shoe.jpg'];

  // ---- Pricing logic -------------------------------------------------------
  const mrp = Number(product.price);
  const sp = product.sellingprice != null ? Number(product.sellingprice) : NaN;

  const hasValidSP =
    Number.isFinite(mrp) &&
    Number.isFinite(sp) &&
    mrp > 0 &&
    sp >= 0 &&
    sp < mrp;

  const discountPercent = hasValidSP
    ? Math.round(((mrp - sp) / mrp) * 100)
    : 0;

  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/catalogue"
            className="inline-flex items-center text-stone-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalogue
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl relative">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-3">Product Gallery</p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === index
                          ? 'border-amber-500 shadow-lg ring-2 ring-amber-200'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-stone-800 mb-4">{product.name}</h1>

              {/* Pricing UI */}
              {hasValidSP ? (
                <div className="mb-4 flex items-end gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-extrabold text-emerald-600">
                      ₹{sp.toLocaleString()}
                    </span>
                    <span className="text-lg text-stone-400 line-through">
                      ₹{mrp.toLocaleString()}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                    <Tag className="w-4 h-4" />
                    {discountPercent}% OFF
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-semibold text-amber-600 mb-4">
                  ₹{mrp.toLocaleString()}
                </p>
              )}

              {product.short_description && (
                <p className="text-xl text-stone-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-stone-800 mb-4">Available Sizes</h2>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border text-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-amber-600 text-white border-amber-600 shadow-lg scale-105'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-amber-500 hover:text-amber-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div>
                <h2 className="text-2xl font-semibold text-stone-800 mb-4">Description</h2>
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {/* Purchase Links */}
            <div>
              <h2 className="text-2xl font-semibold text-stone-800 mb-4">Available On</h2>
              <div className="grid gap-4">
                {product.flipkart_link && (
                  <a
                    href={product.flipkart_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      <span className="font-semibold">Buy on Flipkart</span>
                    </div>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}

                {product.amazon_link && (
                  <a
                    href={product.amazon_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      <span className="font-semibold">Buy on Amazon</span>
                    </div>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
