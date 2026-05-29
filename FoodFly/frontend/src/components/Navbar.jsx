import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dynamic cart count sync from localStorage
  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('foodfly_cart');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          const count = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 800);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#111827] border-b border-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Branding */}
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 group">
            <span className="bg-[#FF6B00] text-white p-1.5 rounded-xl text-sm sm:text-base flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              🎓
            </span>
            <div className="flex flex-col text-left">
              <span className="text-white hover:text-gray-100 transition-colors leading-none">
                FoodFly<span className="text-[#FF6B00]">Campus</span>
              </span>
              <span className="text-[9px] text-gray-400 font-normal tracking-wide mt-0.5">
                developed by Shresth
              </span>
            </div>
          </Link>
          
          {/* Nav Links */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link 
              to="/" 
              className="text-sm font-bold text-gray-300 hover:text-[#FF6B00] transition-colors py-2 px-2.5 rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className="text-sm font-bold text-gray-300 hover:text-[#FF6B00] transition-colors py-2 px-2.5 rounded-lg hover:bg-white/5"
            >
              Menu
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-bold text-gray-300 hover:text-[#FF6B00] transition-colors py-2 px-2.5 rounded-lg hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout} 
                  className="text-sm font-bold text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all py-2 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In
              </Link>
            )}
            
            {/* Action Group */}
            <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-800 pl-3 sm:pl-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="text-gray-400 hover:text-[#FF6B00] transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
              
              <Link 
                to="/menu" 
                className="relative text-gray-400 hover:text-[#FF6B00] transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center justify-center"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#FF6B00] text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center ring-2 ring-[#111827] animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
