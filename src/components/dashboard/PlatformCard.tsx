import React from 'react';

interface PlatformCardProps {
  icon: React.ReactNode;
  platformName: string;
  totalPosts: number;
  importantInfo: string;
}

export default function PlatformCard({ icon, platformName, totalPosts, importantInfo }: PlatformCardProps) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl rounded-2xl p-6 flex items-center space-x-5 transition-all duration-300 hover:scale-[1.00] border border-pink-100/50 overflow-hidden">
      {/* Gradient shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-transparent to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      
      <div className="relative z-10 flex items-center space-x-5 w-full">
        {/* Icon container with gradient background */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-pink-300/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800 mb-1 group-hover:text-pink-500 transition-colors duration-300">
            {platformName}
          </div>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-1">
            {totalPosts}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {importantInfo}
          </div>
        </div>
        
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200/40 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
}