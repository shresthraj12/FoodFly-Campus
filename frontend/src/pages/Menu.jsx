import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Loader2, AlertCircle, ShoppingBag, Star, X, 
  Plus, Minus, Brain, Trash2, MapPin, CheckCircle2, ShoppingCart, Percent, Tag
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const categories = ['All', 'Pizza', 'Burgers', 'Salads', 'Noodles', 'Ramen', 'Desserts', 'Drinks', 'Maggi'];

const LPU_HOSTELS = [
  'BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9',
  'GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7',
  'Block 34 Lobby', 'Block 36 CSE Hallway', 'Block 38 MBA Block', 'Block 56 Tech Lobby', 'LPU Central Library Entrance'
];

const Menu = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // LPU Hostel specialized filters
  const [showMidnightCombos, setShowMidnightCombos] = useState(false);
  const [showBHSpecials, setShowBHSpecials] = useState(false);
  const [showGHHealthy, setShowGHHealthy] = useState(false);
  const [showExamMaggi, setShowExamMaggi] = useState(false);

  // Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('foodfly_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('BH3');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('foodfly_cart', JSON.stringify(cart));
  }, [cart]);

  // Load LPU delivery location
  useEffect(() => {
    const campusAddr = localStorage.getItem('campus_delivery_address');
    if (campusAddr && LPU_HOSTELS.includes(campusAddr)) {
      setDeliveryAddress(campusAddr);
    } else {
      setDeliveryAddress('BH3');
    }
  }, []);

  // Fetch foods
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/food`;
      const res = await axios.get(url);
      setFoods(res.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.response?.data?.message || 'Failed to fetch menu items. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Handle routing state filters from Home page clicks
  useEffect(() => {
    if (location.state) {
      const { filterType } = location.state;
      if (filterType === 'midnight_combo') {
        setShowMidnightCombos(true);
        setShowBHSpecials(false);
        setShowGHHealthy(false);
        setShowExamMaggi(false);
      } else if (filterType === 'bh_snack') {
        setShowMidnightCombos(false);
        setShowBHSpecials(true);
        setShowGHHealthy(false);
        setShowExamMaggi(false);
      } else if (filterType === 'gh_healthy') {
        setShowMidnightCombos(false);
        setShowBHSpecials(false);
        setShowGHHealthy(true);
        setShowExamMaggi(false);
      } else if (filterType === 'exam_maggi') {
        setShowMidnightCombos(false);
        setShowBHSpecials(false);
        setShowGHHealthy(false);
        setShowExamMaggi(true);
      }
      // Clear navigation state to allow manual filter changes later
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Cart operations
  const addToCart = (food) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.food._id === food._id);
      if (existing) {
        return prevCart.map(item => 
          item.food._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { food, quantity: 1, price: food.price }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (foodId, delta) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.food._id === foodId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (foodId) => {
    setCart((prevCart) => prevCart.filter(item => item.food._id !== foodId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Redirect to Checkout page
  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      setIsCartOpen(false);
      navigate('/login', { state: { from: '/menu' } });
      return;
    }

    if (cart.length === 0) return;
    if (!deliveryAddress) {
      alert('Please select your LPU hostel drop-off point!');
      return;
    }

    // Cache cart details to localStorage for Checkout page retrieval
    localStorage.setItem('foodfly_checkout_payload', JSON.stringify({
      items: cart.map(item => ({
        food: item.food,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: getCartTotal(),
      deliveryAddress: `${deliveryAddress} Gate`
    }));

    setIsCartOpen(false);
    navigate('/checkout');
  };

  // LPU specific delivery timings
  const getDeliveryTime = (loc) => {
    const times = {
      'BH1': 10, 'BH2': 11, 'BH3': 12, 'BH4': 13, 'BH5': 15, 'BH6': 16, 'BH7': 17, 'BH8': 17, 'BH9': 18,
      'GH1': 10, 'GH2': 11, 'GH3': 12, 'GH4': 13, 'GH5': 15, 'GH6': 18, 'GH7': 20,
      'Block 34 Lobby': 12, 'Block 36 CSE Hallway': 14, 'Block 38 MBA Block': 15, 'Block 56 Tech Lobby': 16, 'LPU Central Library Entrance': 11
    };
    return times[loc] || 15;
  };

  // Filtering Logic
  const filteredFoods = foods.filter(food => {
    const matchesSearch = 
      (food.name || food.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
    
    // LPU specialized tags
    const matchesMidnightCombo = !showMidnightCombos || food.isHostelMidnightCombo;
    const matchesBHSpecials = !showBHSpecials || food.isBHSnackSpecial;
    const matchesGHHealthy = !showGHHealthy || food.isGHHealthyMeal;
    const matchesExamMaggi = !showExamMaggi || food.isExamNightMaggi;
    
    return matchesSearch && matchesCategory && matchesMidnightCombo && matchesBHSpecials && matchesGHHealthy && matchesExamMaggi;
  });

  // Heuristics for LPU Smart Recommendations
  const aiRecommendedFoods = foods
    .filter(f => f.rating >= 4.7)
    .slice(0, 3); // Top 3 rated foods

  // Dynamic recommendation title based on active hostel selection
  const getRecommendationTitle = (hostel) => {
    if (hostel === 'BH3') return '🔥 Popular in BH3';
    if (hostel === 'GH2') return '📈 Trending in GH2';
    if (hostel === 'BH7') return '🌙 Late Night Orders in BH7';
    return `✨ Popular in ${hostel}`;
  };

  return (
    <div className="space-y-12 py-6 px-4 max-w-7xl mx-auto relative text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
        <span className="text-[#FF6B00] font-bold uppercase tracking-wider text-xs bg-orange-50 dark:bg-orange-950/40 px-4 py-2 rounded-full inline-flex items-center gap-1.5">
          🏫 Lovely Professional University
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          LPU Campus <span className="text-[#FF6B00]">Student Menu</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Select your hostel drop-off point to see estimated delivery times. Fast dispatch from UniMall food courts to BH1-9 and GH1-7.
        </p>
      </div>

      {/* ==================================================== */}
      {/* SWIGGY-STYLE CAMPUS OFFER CARDS */}
      {/* ==================================================== */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-left flex items-center gap-2">
          <Percent size={18} className="text-[#FF6B00]" /> Campus Offers for You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 p-5 rounded-2xl border border-orange-200/40 dark:border-orange-900/30 flex items-start gap-4 text-left shadow-sm">
            <div className="bg-[#FF6B00] text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">FLAT ₹50 OFF</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use code <span className="font-black text-[#FF6B00]">UNIMALL50</span> on orders above ₹199</p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 p-5 rounded-2xl border border-blue-200/40 dark:border-blue-900/30 flex items-start gap-4 text-left shadow-sm">
            <div className="bg-blue-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">FREE GATE HANDOFF</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Free delivery directly to all BH1-9 and GH1-7 gates canteens</p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 p-5 rounded-2xl border border-indigo-200/40 dark:border-indigo-900/30 flex items-start gap-4 text-left shadow-sm">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">EXAM NIGHT MAGGI COMBO</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get a double cheese Maggi & soft drink under <span className="font-black text-indigo-600 dark:text-indigo-400">₹99</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* 🤖 LPU Smart Recommendations Section */}
      {!loading && !error && aiRecommendedFoods.length > 0 && (
        <section className="bg-gradient-to-r from-violet-600/5 to-indigo-600/5 dark:from-violet-950/10 dark:to-indigo-950/5 border border-indigo-500/20 dark:border-indigo-900/30 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden text-left shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-650/25">
                <Brain size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {getRecommendationTitle(deliveryAddress)}
                </h2>
                <p className="text-xs text-indigo-600 dark:text-indigo-450 font-extrabold">
                  Recommended based on popular student canteens cravings at LPU
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold px-3 py-1.5 rounded-full border border-indigo-150 dark:border-indigo-900/50 w-fit">
              📍 LPU Student Picks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendedFoods.map(food => {
              return (
                <div 
                  key={`ai-${food._id}`}
                  className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-250 relative group"
                >
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
                    Popular
                  </div>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-sm line-clamp-1">{food.name}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{food.description}</p>
                      <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 mt-1">
                        <span>⏱️ {getDeliveryTime(deliveryAddress)} mins to {deliveryAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-4">
                    <span className="font-black text-gray-950 dark:text-white text-base">₹{food.price}</span>
                    <button 
                      onClick={() => addToCart(food)}
                      className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer shadow-indigo-500/20 active:scale-95"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Filter and Search Controls */}
      <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-none w-full xl:w-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setShowMidnightCombos(false);
                  setShowBHSpecials(false);
                  setShowGHHealthy(false);
                  setShowExamMaggi(false);
                }}
                className={`px-5 py-2.5 rounded-xl font-extrabold transition-all duration-300 text-xs cursor-pointer whitespace-nowrap ${
                  activeCategory === category && !showMidnightCombos && !showBHSpecials && !showGHHealthy && !showExamMaggi
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search butter chicken roll, egg Maggi, cold coffee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white dark:focus:bg-gray-900 transition-all placeholder-gray-400 text-xs text-gray-800 dark:text-gray-100 font-semibold"
            />
          </div>
        </div>

        {/* LPU Specialized Hostel Food Sections */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-5 text-left">
          <span className="text-[10px] text-gray-450 dark:text-gray-500 font-extrabold uppercase tracking-wider mr-2">Hostel Sections:</span>
          
          <button
            onClick={() => {
              setShowMidnightCombos(!showMidnightCombos);
              setShowBHSpecials(false);
              setShowGHHealthy(false);
              setShowExamMaggi(false);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              showMidnightCombos 
                ? 'bg-indigo-650 border-indigo-650 text-white shadow-sm' 
                : 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300'
            }`}
          >
            🌙 Hostel Midnight Combos
          </button>

          <button
            onClick={() => {
              setShowBHSpecials(!showBHSpecials);
              setShowMidnightCombos(false);
              setShowGHHealthy(false);
              setShowExamMaggi(false);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              showBHSpecials 
                ? 'bg-blue-650 border-blue-650 text-white shadow-sm' 
                : 'bg-blue-50/50 hover:bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300'
            }`}
          >
            🧔 BH Snack Specials
          </button>

          <button
            onClick={() => {
              setShowGHHealthy(!showGHHealthy);
              setShowMidnightCombos(false);
              setShowBHSpecials(false);
              setShowExamMaggi(false);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              showGHHealthy 
                ? 'bg-emerald-650 border-emerald-650 text-white shadow-sm' 
                : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300'
            }`}
          >
            👩 GH Healthy Meals
          </button>

          <button
            onClick={() => {
              setShowExamMaggi(!showExamMaggi);
              setShowMidnightCombos(false);
              setShowBHSpecials(false);
              setShowGHHealthy(false);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
              showExamMaggi 
                ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm' 
                : 'bg-orange-50/50 hover:bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900 dark:text-[#FFB703]'
            }`}
          >
            🍜 Exam Night Maggi
          </button>
        </div>
      </section>

      {/* Main Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden p-4 space-y-4 h-[350px]">
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              <div className="flex justify-between items-center pt-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="text-red-500" size={42} />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Connection Error</h3>
          <p className="text-red-650 dark:text-red-300 text-xs">{error}</p>
          <button
            onClick={fetchFoods}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
          <ShoppingBag className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <h3 className="text-lg font-bold mb-1">No Campus Items Found</h3>
          <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto text-xs font-medium">
            Try adjusting your search queries, selecting another category or toggling sections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredFoods.map(food => {
            const time = getDeliveryTime(deliveryAddress);
            return (
              <div
                key={food._id}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-500/20 transition-all duration-350 flex flex-col h-full relative"
              >
                {/* Category & Combo Tag Badge */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex justify-between items-center">
                  <span className="bg-[#111827]/90 text-white font-extrabold px-3 py-1 rounded-full text-[9px] shadow-sm">
                    {food.category}
                  </span>
                  
                  <div className="flex gap-1">
                    {food.isHostelMidnightCombo && (
                      <span className="bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[8px] shadow-sm">
                        Combo
                      </span>
                    )}
                    {food.isBHSnackSpecial && (
                      <span className="bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[8px] shadow-sm">
                        BH Spec
                      </span>
                    )}
                    {food.isGHHealthyMeal && (
                      <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[8px] shadow-sm">
                        Healthy
                      </span>
                    )}
                    {food.isExamNightMaggi && (
                      <span className="bg-[#FF6B00] text-white font-extrabold px-2 py-0.5 rounded-full text-[8px] shadow-sm">
                        Maggi
                      </span>
                    )}
                  </div>
                </div>

                {/* Food Image */}
                <div className="h-44 overflow-hidden relative bg-gray-100 dark:bg-gray-950">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  
                  {/* Rating Badge Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-black text-gray-800 dark:text-gray-100 flex items-center gap-0.5 shadow-sm">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{food.rating || '4.5'}</span>
                  </div>
                </div>

                {/* Card details */}
                <div className="p-5 flex flex-col flex-grow space-y-2.5 justify-between text-left">
                  <div className="space-y-1.5">
                    {/* Food court source */}
                    <span className="text-[9px] text-[#FFB703] font-extrabold uppercase tracking-wider">
                      {food.category === 'Maggi' ? 'Block 32 Food Court' : food.category === 'Desserts' ? 'Night Canteen' : 'UniMall Food Court'}
                    </span>
                    
                    <h3 className="text-sm font-black text-gray-950 dark:text-white group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                      {food.name}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">
                      {food.description}
                    </p>
                    
                    {/* Hostel drop-off gate timing */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-450 dark:text-gray-500 border-t pt-2 border-gray-100 dark:border-gray-800">
                      <span>⏱️ {time} mins</span>
                      <span>•</span>
                      <span>Gate Handoff</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="text-base font-black text-gray-950 dark:text-white">
                      ₹{food.price}
                    </span>
                    <button 
                      onClick={() => addToCart(food)}
                      className="bg-white hover:bg-orange-50 border-2 border-[#FF6B00] text-[#FF6B00] font-black px-4 py-1.5 rounded-xl text-xs transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md hover:shadow-orange-500/5"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#FF6B00] hover:bg-[#e05e00] text-white p-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer border border-white/20"
        >
          <ShoppingCart size={22} />
          <span className="bg-white text-[#FF6B00] text-[10px] font-black rounded-full h-5.5 w-5.5 flex items-center justify-center shadow-inner">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
          <span className="font-extrabold text-sm hidden md:inline pr-1">Cart (₹{getCartTotal()})</span>
        </button>
      )}

      {/* ==================================================== */}
      {/* SLIDE-OVER CART DRAWER */}
      {/* ==================================================== */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <div className={`w-screen max-w-md transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-150 dark:border-gray-800">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-[#FF6B00]" />
                  <h2 className="text-base font-black text-gray-950 dark:text-white">Campus Order Cart</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Success Screen */}
              {orderSuccess ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="bg-emerald-100 dark:bg-emerald-950 p-4 rounded-full text-emerald-500 animate-bounce">
                    <CheckCircle2 size={52} />
                  </div>
                  <h3 className="text-xl font-black text-gray-950 dark:text-white">Order Confirmed!</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs max-w-xs">
                    Your order was successfully sent to the UniMall kitchen. Redirecting to LPU hostel tracking console...
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-orange-500 font-extrabold animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Preparing tracking dashboard
                  </div>
                </div>
              ) : cart.length === 0 ? (
                /* Empty state */
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full text-gray-300 dark:text-gray-650">
                    <ShoppingBag size={42} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-800 dark:text-white">Your cart is empty</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-xs max-w-xs font-medium">
                    Add delicious student combos, midnight noodles or drinks to get started.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#FF6B00] text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-[#e05e00] transition-colors shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                /* Cart Items List */
                <div className="flex-grow overflow-y-auto p-6 space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-450 font-extrabold uppercase">{cart.length} items selected</span>
                    <button 
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Clear all
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cart.map(item => (
                      <div key={`cart-${item.food._id}`} className="py-4 flex gap-4 first:pt-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 flex-shrink-0">
                          <img src={item.food.image} alt={item.food.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{item.food.name}</h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{item.food.category}</p>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                              <button 
                                onClick={() => updateQuantity(item.food._id, -1)}
                                className="px-2.5 py-1 text-gray-500 hover:text-[#FF6B00] hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-xs font-bold text-gray-700 dark:text-gray-300">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.food._id, 1)}
                                className="px-2.5 py-1 text-gray-500 hover:text-[#FF6B00] hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.food._id)}
                          className="text-gray-300 hover:text-red-500 flex-shrink-0 self-start p-1 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Footer */}
              {!orderSuccess && cart.length > 0 && (
                <div className="p-6 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20 space-y-6">
                  {/* Delivery Location Section */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={12} className="text-[#FF6B00]" /> Select LPU Drop-Off Hostel Gate
                    </label>
                    <select
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        localStorage.setItem('campus_delivery_address', e.target.value);
                      }}
                      className="w-full text-xs font-extrabold px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-1 focus:ring-[#FF6B00] focus:outline-none text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                      {LPU_HOSTELS.map(hostel => (
                        <option key={hostel} value={hostel}>{hostel} Gate ({getDeliveryTime(hostel)} mins)</option>
                      ))}
                    </select>
                  </div>

                  {/* Summary math */}
                  <div className="space-y-2 border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 text-xs font-semibold">
                    <div className="flex justify-between text-gray-450 dark:text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-450 dark:text-gray-500">
                      <span>Campus Delivery Fee</span>
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    </div>
                    <div className="flex justify-between text-gray-450 dark:text-gray-500">
                      <span>Campus Convenience Fee</span>
                      <span>₹10</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2 text-gray-950 dark:text-white border-t border-gray-100 dark:border-gray-800">
                      <span>Total Amount</span>
                      <span className="text-base text-[#FF6B00]">₹{getCartTotal() + 10}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={orderPlacing}
                    className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {orderPlacing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Dispatching...
                      </>
                    ) : user ? (
                      `Place Campus Order (₹${getCartTotal() + 10})`
                    ) : (
                      'Log in to Place Order'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Menu;
