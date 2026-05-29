import { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Moon, GraduationCap, Coffee, Sparkles, Clock, Compass, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ScooterSVG = () => (
  <svg viewBox="0 0 200 150" className="w-full max-w-[280px] sm:max-w-[340px] h-auto drop-shadow-2xl select-none group-hover:translate-x-4 transition-transform duration-500 ease-out" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road */}
    <line x1="10" y1="130" x2="190" y2="130" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
    
    {/* Scooter Body Back Panel */}
    <path d="M120 120H55c-8 0-15-7-15-15v-5c0-11 9-20 20-20h60v40z" fill="#FF6B00" />
    
    {/* Food Box (Zepto/Blinkit style box on back) */}
    <rect x="42" y="55" width="46" height="42" rx="8" fill="#111827" stroke="#334155" strokeWidth="1" />
    {/* Food Box Logo (mortarboard / cap) */}
    <circle cx="65" cy="76" r="10" fill="#FF6B00" />
    <path d="M65 71l5 2.5-5 2.5-5-2.5 5-2.5z" fill="white" />
    <path d="M62 74.5v3.5c0 .5.7 1 1.5 1s1.5-.5 1.5-1v-3.5" fill="white" />
    <text x="65" y="93" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">FOODFLY</text>

    {/* Scooter Neck & Front panel */}
    <path d="M115 120l12-48c2-6 8-10 14-10h12v10h-8c-3 0-6 2-7 5l-10 43h-13z" fill="#E2E8F0" />
    <path d="M132 80l6-24c1-4 5-7 9-7h15v31h-30z" fill="#FF6B00" />
    
    {/* Windshield */}
    <path d="M147 49l5-22h12l-7 22H147z" fill="#93C5FD" opacity="0.6" />
    
    {/* Headlight */}
    <circle cx="163" cy="53" r="5" fill="#FFB703" />
    <path d="M165 53l15-5v10l-15-5z" fill="#FEF3C7" opacity="0.4" />
    
    {/* Handlebar */}
    <rect x="138" y="45" width="16" height="4" rx="2" fill="#374151" />
    
    {/* Wheels */}
    {/* Back Wheel */}
    <circle cx="60" cy="120" r="17" fill="#1E293B" stroke="#E2E8F0" strokeWidth="4" />
    <circle cx="60" cy="120" r="6" fill="#94A3B8" />
    {/* Front Wheel */}
    <circle cx="140" cy="120" r="17" fill="#1E293B" stroke="#E2E8F0" strokeWidth="4" />
    <circle cx="140" cy="120" r="6" fill="#94A3B8" />
    
    {/* Speed Lines */}
    <line x1="12" y1="70" x2="28" y2="70" stroke="#FFB703" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
    <line x1="18" y1="85" x2="33" y2="85" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState('boysHostel');
  const [selectedSubLocation, setSelectedSubLocation] = useState('BH3');
  const [notificationIdx, setNotificationIdx] = useState(0);

  // Load selected location from cache on startup
  useEffect(() => {
    const cachedAddr = localStorage.getItem('campus_delivery_address');
    if (cachedAddr) {
      setSelectedSubLocation(cachedAddr);
      // Determine zone
      if (cachedAddr.startsWith('BH')) {
        setSelectedZone('boysHostel');
      } else if (cachedAddr.startsWith('GH')) {
        setSelectedZone('girlsHostel');
      } else {
        setSelectedZone('academic');
      }
    }
  }, []);

  const campusZones = {
    boysHostel: {
      label: 'Boys Hostels (BH)',
      icon: GraduationCap,
      description: 'Quick delivery outside hostel lobby gates',
      options: ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9']
    },
    girlsHostel: {
      label: 'Girls Hostels (GH)',
      icon: Compass,
      description: 'Delivery at main security turnstiles',
      options: ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7']
    },
    academic: {
      label: 'Academic Blocks',
      icon: Coffee,
      description: 'Drop-off outside block halls & UniMall',
      options: ['Block 34 Lobby', 'Block 36 CSE Hallway', 'Block 38 MBA Block', 'Block 56 Tech Lobby', 'LPU Central Library Entrance']
    }
  };

  const getDeliveryTime = (loc) => {
    const times = {
      'BH1': 10, 'BH2': 11, 'BH3': 12, 'BH4': 13, 'BH5': 15, 'BH6': 16, 'BH7': 17, 'BH8': 17, 'BH9': 18,
      'GH1': 10, 'GH2': 11, 'GH3': 12, 'GH4': 13, 'GH5': 15, 'GH6': 18, 'GH7': 20,
      'Block 34 Lobby': 12, 'Block 36 CSE Hallway': 14, 'Block 38 MBA Block': 15, 'Block 56 Tech Lobby': 16, 'LPU Central Library Entrance': 11
    };
    return times[loc] || 15;
  };

  const campusNotifications = [
    "🚚 Delivery partner reached BH4 Gate",
    "☕ Warm chai arriving outside GH1 Gate",
    "🍕 Hot pizza dispatched near Block 34 Lobby",
    "🍟 Midnight cravings delivered to BH7 Lobby",
    "🥤 Mango Shake dispatched outside GH3 Turnstile",
    "🍜 Hot Egg Maggi arriving at BH3 Gate canteens"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationIdx((prev) => (prev + 1) % campusNotifications.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Update default sub-location when zone changes, unless matched
  const handleZoneChange = (zoneKey) => {
    setSelectedZone(zoneKey);
    const defaults = { boysHostel: 'BH3', girlsHostel: 'GH2', academic: 'Block 34 Lobby' };
    setSelectedSubLocation(defaults[zoneKey]);
  };

  const saveLocation = () => {
    localStorage.setItem('campus_delivery_address', selectedSubLocation);
    localStorage.setItem('campus_delivery_time', getDeliveryTime(selectedSubLocation));
    navigate('/menu');
  };

  const navigateWithFilter = (filterType) => {
    navigate('/menu', { state: { filterType } });
  };

  return (
    <div className="space-y-16 py-6 px-4 max-w-7xl mx-auto text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* Live Campus Alerts Ticker */}
      <div className="bg-orange-50 dark:bg-gray-800/40 border border-orange-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00] text-white p-2.5 rounded-xl flex items-center justify-center animate-bounce shadow-md shadow-orange-500/10">
            <Bell size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest">Live Campus Feed</p>
            <p className="text-sm font-extrabold text-gray-850 dark:text-gray-200">
              {campusNotifications[notificationIdx]}
            </p>
          </div>
        </div>
        <span className="text-[9px] bg-orange-100 text-[#FF6B00] dark:bg-orange-950/40 dark:text-orange-400 font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Active
        </span>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-4">
        <div className="flex-1 space-y-8 text-left">
          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-[#FF6B00] dark:bg-orange-950/40 dark:text-orange-400 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-[#FFB703]" />
            LPU Student Delivery Network
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
            Late Night Cravings<br />
            at <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB703] underline decoration-[#FFB703]/40">{selectedSubLocation}</span>?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-lg leading-relaxed font-medium">
            Delicious snacks, midnight combos, and hot Maggi from UniMall and Block 32 delivered straight to your LPU boys and girls hostels. Quick, secure, and hostel-friendly.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/menu"
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-8 py-4 rounded-2xl font-extrabold transition-all duration-300 shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:-translate-y-1 transform active:translate-y-0"
            >
              Order Food Now <ArrowRight size={18} />
            </Link>
            <a 
              href="#lpu-hostel-selector"
              className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white px-8 py-4 rounded-2xl font-extrabold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transform active:translate-y-0"
            >
              Select Hostel Gate
            </a>
          </div>
        </div>
        
        {/* Floating scooter hero card graphics */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-[#FFB703]/5 rounded-[3rem] blur-3xl opacity-30"></div>
          
          <div className="relative bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-xl max-w-sm w-full flex flex-col items-center justify-center hover:shadow-2xl transition-all duration-300">
            {/* Swiggy/Zepto style graphic overlay */}
            <ScooterSVG />
            
            {/* Live Timing Tag */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 w-full flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-950 p-2.5 rounded-xl text-[#FF6B00] flex-shrink-0">
                <Clock size={20} className="animate-spin-slow" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">UniMall Dispatch to {selectedSubLocation}</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{getDeliveryTime(selectedSubLocation)} Mins Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LPU Hostel Delivery Selector */}
      <section id="lpu-hostel-selector" className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-[#FF6B00] font-bold uppercase tracking-wider text-xs bg-orange-100/50 dark:bg-orange-950/20 px-3.5 py-1.5 rounded-full">
            📍 Select Delivery Gate
          </span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">
            Where should we drop off your order?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Select your specific Boys Hostel (BH), Girls Hostel (GH), or Academic Block to unlock localized delivery times and targeted food recommendations.
          </p>
        </div>

        {/* Zone Cards Selection (Swiggy style layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Object.entries(campusZones).map(([key, zone]) => {
            const IconComponent = zone.icon;
            const isSelected = selectedZone === key;
            return (
              <button
                key={key}
                onClick={() => handleZoneChange(key)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer h-40 hover:shadow-md ${
                  isSelected 
                    ? 'bg-orange-50/20 dark:bg-gray-800/50 border-[#FF6B00] dark:border-[#FF6B00] shadow-sm ring-4 ring-[#FF6B00]/10' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}
              >
                <div className={`p-3 rounded-xl w-fit ${isSelected ? 'bg-[#FF6B00] text-white' : 'bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00]'}`}>
                  <IconComponent size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-0.5">{zone.label}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{zone.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dropdown selector and Confirm action */}
        <div className="mt-8 max-w-xl mx-auto bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-150 dark:border-gray-800/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B00]" size={18} />
            <select
              value={selectedSubLocation}
              onChange={(e) => setSelectedSubLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] font-extrabold text-sm text-gray-800 dark:text-gray-250 cursor-pointer"
            >
              {campusZones[selectedZone].options.map(opt => (
                <option key={opt} value={opt}>{opt} ({getDeliveryTime(opt)} mins delivery)</option>
              ))}
            </select>
          </div>
          <button
            onClick={saveLocation}
            className="w-full sm:w-auto bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold px-6 py-3 rounded-xl whitespace-nowrap transition-colors duration-200 cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 flex items-center justify-center gap-1.5"
          >
            Confirm Location &rarr;
          </button>
        </div>
      </section>

      {/* LPU Student Specialized Sections (Swiggy style categories) */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[#FF6B00] font-bold uppercase tracking-wider text-xs">
            ⚡ Student Curated Categories
          </span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">
            Designed for Campus Life
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Filter our canteens instantly to find meals tailored to your current semester situation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hostel Midnight Combos */}
          <div 
            onClick={() => navigateWithFilter('midnight_combo')}
            className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[200px]"
          >
            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl w-fit">
              <Moon size={22} className="animate-bounce" />
            </div>
            <div className="space-y-2 mt-4 text-left">
              <h3 className="text-base font-black text-gray-900 dark:text-white">Hostel Midnight Combos</h3>
              <p className="text-gray-450 dark:text-gray-500 text-xs font-medium">
                Pizza & waffle boxes to power late-night study and coding marathons.
              </p>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] group-hover:gap-2 transition-all">
                Browse Combos <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* BH Snack Specials */}
          <div 
            onClick={() => navigateWithFilter('bh_snack')}
            className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[200px]"
          >
            <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-3 rounded-xl w-fit">
              <GraduationCap size={22} />
            </div>
            <div className="space-y-2 mt-4 text-left">
              <h3 className="text-base font-black text-gray-900 dark:text-white">BH Snack Specials</h3>
              <p className="text-gray-450 dark:text-gray-500 text-xs font-medium">
                Hearty rolls, double patties, and samosa packs for hungry boys.
              </p>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] group-hover:gap-2 transition-all">
                Browse BH Specials <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* GH Healthy Meals */}
          <div 
            onClick={() => navigateWithFilter('gh_healthy')}
            className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[200px]"
          >
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl w-fit">
              <Compass size={22} />
            </div>
            <div className="space-y-2 mt-4 text-left">
              <h3 className="text-base font-black text-gray-900 dark:text-white">GH Healthy Meals</h3>
              <p className="text-gray-450 dark:text-gray-500 text-xs font-medium">
                Super salads, fresh juice cups, and low-carb high-protein paneer burgers.
              </p>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] group-hover:gap-2 transition-all">
                Browse GH Healthy <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* Exam Night Maggi */}
          <div 
            onClick={() => navigateWithFilter('exam_maggi')}
            className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:border-[#FFB703]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[200px]"
          >
            <div className="bg-amber-50 dark:bg-amber-950/40 text-[#FFB703] p-3 rounded-xl w-fit">
              <Coffee size={22} />
            </div>
            <div className="space-y-2 mt-4 text-left">
              <h3 className="text-base font-black text-gray-900 dark:text-white">Exam Night Maggi</h3>
              <p className="text-gray-450 dark:text-gray-500 text-xs font-medium">
                LPU's signature double cheese and egg-loaded warm Maggi bowls.
              </p>
              <div className="flex items-center gap-1 text-[#FFB703] font-extrabold text-[11px] group-hover:gap-2 transition-all">
                Browse Maggi Bowls <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-gray-150 dark:border-gray-800">
        <div className="flex gap-4">
          <div className="bg-orange-50 dark:bg-gray-800/80 text-[#FF6B00] p-3 rounded-xl flex-shrink-0 h-fit">
            <Clock size={20} />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Quick Hostel Gate Handoff</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Our riders are stationed right outside UniMall, knowing every shortcut to BH1-9 and GH1-7 gates.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-orange-50 dark:bg-gray-800/80 text-[#FF6B00] p-3 rounded-xl flex-shrink-0 h-fit">
            <GraduationCap size={20} />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">LPU Community Backed</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Order food from LPU campus canteens and partner student kitchens at LPU.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-orange-50 dark:bg-gray-800/80 text-[#FF6B00] p-3 rounded-xl flex-shrink-0 h-fit">
            <Moon size={20} />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Midnight Deliveries</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Deliveries operate until 3:00 AM, matching hostel study and assignment hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
