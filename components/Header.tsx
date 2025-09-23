"use client";

import Link from 'next/link';
import { Footprints } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg group-hover:from-amber-200 group-hover:to-orange-200 transition-all duration-300">
              <Footprints className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-500 bg-clip-text text-transparent">
                Mittirang
              </h1>
              <p className="text-xs text-stone-500 -mt-1">Premium Footwear</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-stone-600 hover:text-amber-700 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/catalogue" 
              className="text-stone-600 hover:text-amber-700 font-medium transition-colors duration-200"
            >
              Catalogue
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}