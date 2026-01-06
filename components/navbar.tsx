import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import { LayoutDashboard, UserCircle, LogOut, LogIn } from 'lucide-react';

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo & Home */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            SimpleStats
          </Link>
          
          <Link 
            href="/" 
            className="text-gray-500 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-lg"
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
        </div>

        {/* Right: Profile & Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/profile" 
                className="text-gray-500 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-lg"
                title="Profile Settings"
              >
                <UserCircle className="w-6 h-6" />
              </Link>
              
              <form action={signOut}>
                <button 
                  className="text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}