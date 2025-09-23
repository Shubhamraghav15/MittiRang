import { Footprints, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-stone-900 to-amber-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg">
                <Footprints className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mittirang</h2>
                <p className="text-amber-200 text-sm">Premium Footwear</p>
              </div>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Crafted with earthy elegance and natural style. Discover our collection of premium footwear that combines comfort with contemporary design.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-stone-300 hover:text-amber-200 transition-colors">Home</a></li>
              <li><a href="/catalogue" className="text-stone-300 hover:text-amber-200 transition-colors">Catalogue</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">Contact</h3>
            <div className="text-stone-300 text-sm space-y-1">
              <p>Email: hello@mittirang.com</p>
              <p>Phone: +91 12345 67890</p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-8 pt-8 text-center">
          <p className="text-stone-400 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-400" /> for premium footwear lovers
          </p>
        </div>
      </div>
    </footer>
  );
}