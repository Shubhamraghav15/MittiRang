"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  short_description?: string;
  description?: string;
  images: string[];
  flipkart_link?: string;
  amazon_link?: string;
}

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    flipkart_link: '',
    amazon_link: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setFormData({
          name: data.name || '',
          short_description: data.short_description || '',
          description: data.description || '',
          flipkart_link: data.flipkart_link || '',
          amazon_link: data.amazon_link || ''
        });
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.filename;
      }
      throw new Error('Upload failed');
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Error updating product');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white shadow-sm border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-stone-600 hover:text-amber-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">Product Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-stone-800">Edit Product</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Basic Information</h2>
            
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
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-all resize-none"
                  placeholder="Detailed product description, materials, features, etc."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-stone-800 mb-6">Product Images</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Upload Additional Images
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
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer"
                  >
                    <span className="text-sm text-stone-600">
                      {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                    </span>
                    <br />
                    <span className="text-xs text-stone-400">PNG, JPG, JPEG up to 10MB each</span>
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-3">Current Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-stone-200"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2 text-center">
                          <p className="text-xs text-stone-500">Image {index + 1}</p>
                          {index === 0 && (
                            <p className="text-xs text-amber-600 font-medium">Primary</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Gallery Management:</strong>
                    </p>
                    <ul className="text-xs text-amber-700 mt-2 space-y-1">
                      <li>• First image is the primary image shown in product cards</li>
                      <li>• Drag and drop to reorder images (coming soon)</li>
                      <li>• Click X to remove unwanted images</li>
                      <li>• Add more images using the upload area above</li>
                    </ul>
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
              disabled={saving || uploading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}