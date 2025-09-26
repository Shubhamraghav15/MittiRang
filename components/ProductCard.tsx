import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  id: number;
  name: string;
  short_description?: string;
  images: string[];
}

export default function ProductCard({ id, name, short_description, images }: ProductCardProps) {
  const primaryImage = images[0] || '/MRLogo.png';

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-100">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50">
        <Image
          src={primaryImage}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            +{images.length - 1} more
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors">
          {name}
        </h3>
        
        {short_description && (
          <p className="text-stone-600 text-sm mb-4 leading-relaxed">
            {short_description}
          </p>
        )}
        
        <Link 
          href={`/product/${id}`}
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          View Details
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}