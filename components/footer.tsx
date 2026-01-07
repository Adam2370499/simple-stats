import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <div className="text-gray-500 text-sm">
          &copy; {currentYear} SimpleStats. All rights reserved.
        </div>

        {/* Right: Signature */}
        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
          <span>Developed with</span>
          <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
          <span>by</span>
          <a 
            href="https://github.com/adam2370499" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-bold hover:underline decoration-2 decoration-purple-500 underline-offset-2"
          >
            Zayar Htoo
          </a>
        </div>

      </div>
    </footer>
  );
}