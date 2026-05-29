import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-150 dark:border-gray-800 bg-[#111827] text-gray-400 py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-white">
          <span className="bg-[#FF6B00] text-white p-1 rounded-lg text-xs flex items-center justify-center shadow-md">
            🎓
          </span>
          <span>
            FoodFly<span className="text-[#FF6B00]">Campus</span>
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} FoodFly Campus. Developed with ❤️ by <span className="font-bold text-[#FF6B00]">Shresth</span>.
        </p>
        <div className="flex gap-4 text-xs font-bold">
          <span className="hover:text-[#FF6B00] transition-colors cursor-pointer">LPU Staging</span>
          <span className="hover:text-[#FF6B00] transition-colors cursor-pointer">Sandbox Gate</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
