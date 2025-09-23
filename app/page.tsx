import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-500 bg-clip-text text-transparent">
                Mittirang
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-stone-700 mb-4 font-light">
              Where Earth Meets Elegance
            </p>
            <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of premium footwear inspired by natural tones 
              and crafted for modern living. Each pair tells a story of comfort, style, and earthy sophistication.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/catalogue"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-amber-700" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Premium Quality</h3>
                <p className="text-stone-600 text-sm">Handpicked materials and superior craftsmanship in every pair.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Trusted Brands</h3>
                <p className="text-stone-600 text-sm">Available on leading platforms like Flipkart and Amazon.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-cyan-700" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">Easy Access</h3>
                <p className="text-stone-600 text-sm">Direct links to purchase from your favorite online stores.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200 rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-30 animate-pulse delay-1000" />
      </section>

      <Footer />
    </div>
  );
}