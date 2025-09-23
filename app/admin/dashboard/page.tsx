"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, LogOut, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  short_description?: string;
  images: string[];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-stone-800">Mittirang Admin</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-stone-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Products</h2>
          <Link
            href="/admin/add-product"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-700 mb-2">No Products Yet</h3>
              <p className="text-stone-500 mb-6">Start by adding your first product to the catalogue</p>
              <Link
                href="/admin/add-product"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700">Images</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-800">{product.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-stone-600 text-sm line-clamp-2">
                          {product.short_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-stone-600 text-sm">
                            {product.images.length} image{product.images.length !== 1 ? 's' : ''}
                          </div>
                          {product.images.length > 0 && (
                            <div className="flex -space-x-1">
                              {product.images.slice(0, 3).map((image, idx) => (
                                <img
                                  key={idx}
                                  src={image}
                                  alt=""
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                />
                              ))}
                              {product.images.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-xs text-stone-600">
                                  +{product.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/edit-product/${product.id}`}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}