// components/Layout.tsx
import React, {PropsWithChildren} from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-pink-50 to-pink-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-pink-100/50 shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">1C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                1ClikPost
              </span>
            </div>
            
            {/* Navigation Links */}
            <ul className="hidden md:flex items-center space-x-8">
              <li>
                <a href="#" className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 relative group">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-200"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 relative group">
                  Generate Post
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-200"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 relative group">
                  My Posts
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-200"></span>
                </a>
              </li>
              <li>
                <button className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-md  border transition-all duration-200">
                  Sign Out
                </button>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-pink-100 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Optional Footer */}
      <footer className="backdrop-blur-xl bg-white/50 border-t border-pink-100/50 py-6 mt-auto">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2025 1ClikPost. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}