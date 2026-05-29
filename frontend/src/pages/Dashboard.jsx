import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, Flame, Bike, MapPin, Sparkles, 
  AlertCircle, RefreshCw, ClipboardList, Clock, DollarSign, Wallet, Star, Award
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TRACKING_STATUSES = [
  { status: 'Order Confirmed', label: 'Confirmed', desc: 'Vendor accepted order', icon: CheckCircle2 },
  { status: 'Preparing Food', label: 'Preparing', desc: 'Cooking at UniMall kitchen', icon: Flame },
  { status: 'Rider Assigned', label: 'Rider Assigned', desc: 'Delivery partner assigned', icon: Bike },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider heading to your hostel', icon: MapPin },
  { status: 'Reached Hostel Gate', label: 'Reached Gate', desc: 'Rider at hostel gate', icon: MapPin },
  { status: 'Delivered', label: 'Delivered', desc: 'Order delivered! Enjoy your meal', icon: Sparkles }
];

const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // LPU Student Wallet Balance
  const [walletBalance, setWalletBalance] = useState(() => {
    const stored = localStorage.getItem('lpu_wallet_balance');
    return stored ? parseFloat(stored) : 1000.00;
  });

  // Fetch orders based on role
  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    setError(null);
    try {
      let res;
      if (user.role === 'customer') {
        res = await axios.get(`${API_URL}/api/orders/myorders`);
      } else {
        res = await axios.get(`${API_URL}/api/orders`);
      }
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to retrieve orders. Please check connection.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Sync wallet balance change
  useEffect(() => {
    const checkWallet = () => {
      const stored = localStorage.getItem('lpu_wallet_balance');
      if (stored) setWalletBalance(parseFloat(stored));
    };
    checkWallet();
    const interval = setInterval(checkWallet, 1500);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <LoaderSpinner />
      <p className="text-gray-400 font-bold text-sm">Authenticating user...</p>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;

  // Seller status update helper
  const handleUpdateStatus = async (orderId, currentStatus) => {
    const currentIndex = TRACKING_STATUSES.findIndex(s => s.status === currentStatus);
    if (currentIndex === -1 || currentIndex === TRACKING_STATUSES.length - 1) return;
    const nextStatus = TRACKING_STATUSES[currentIndex + 1].status;

    try {
      const res = await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: res.data.status } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Could not update status. Please try again.');
    }
  };

  const getStatusIndex = (currentStatus) => {
    return TRACKING_STATUSES.findIndex(s => s.status === currentStatus);
  };

  const customerActiveOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'cancelled');
  const customerPastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'cancelled');

  const sellerStats = {
    totalRevenue: orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.totalAmount, 0),
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status !== 'Delivered' && o.status !== 'cancelled').length,
    completedOrders: orders.filter(o => o.status === 'Delivered').length
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* Welcome Banner */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
        <div className="space-y-1.5 z-10">
          <span className="bg-[#FF6B00] text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            {user.role === 'customer' ? 'LPU Student Dashboard' : user.role === 'seller' ? 'LPU Kitchen Portal' : 'Admin Control'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome back, <span className="text-[#FF6B00]">{user.name}</span>!
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md font-medium">
            Manage your orders, track LPU hostel gate dispatch times, and check your canteen payment history.
          </p>
        </div>
        
        <button 
          onClick={fetchOrders}
          className="z-10 bg-white dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white font-extrabold text-xs px-5 py-3 rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer w-fit self-start md:self-auto border border-gray-200 dark:border-gray-700"
        >
          <RefreshCw size={14} /> Refresh Console
        </button>
      </div>

      {/* CUSTOMER VIEW */}
      {user.role === 'customer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: ORDERS AND CONSOLE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-150 dark:border-gray-800 pb-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`font-black text-sm pb-2 border-b-2 px-1 transition-all cursor-pointer uppercase tracking-wider ${
                  activeTab === 'active' 
                    ? 'border-[#FF6B00] text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Active Deliveries ({customerActiveOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`font-black text-sm pb-2 border-b-2 px-1 transition-all cursor-pointer uppercase tracking-wider ${
                  activeTab === 'history' 
                    ? 'border-[#FF6B00] text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Order History ({customerPastOrders.length})
              </button>
            </div>

            {/* List */}
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderSpinner />
                <p className="text-gray-400 text-xs font-semibold mt-2">Connecting to LPU canteens...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-6 rounded-xl border border-red-100 dark:border-red-900/30 text-xs">
                <AlertCircle size={18} />
                <div>
                  <p className="font-bold">Failed to load orders</p>
                  <p className="text-[10px] mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'active' && (
                  customerActiveOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
                      <ClipboardList className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={42} />
                      <h3 className="font-bold text-gray-800 dark:text-white text-base">No active hostel deliveries</h3>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">Feeling hungry during study prep? Select your canteens items!</p>
                    </div>
                  ) : (
                    customerActiveOrders.map(order => (
                      <OrderCard key={order._id} order={order} getStatusIndex={getStatusIndex} isHistory={false} />
                    ))
                  )
                )}

                {activeTab === 'history' && (
                  customerPastOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
                      <ClipboardList className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={42} />
                      <h3 className="font-bold text-gray-800 dark:text-white text-base">No past deliveries</h3>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">Completed orders at LPU hostel gates will appear here.</p>
                    </div>
                  ) : (
                    customerPastOrders.map(order => (
                      <OrderCard key={order._id} order={order} getStatusIndex={getStatusIndex} isHistory={true} />
                    ))
                  )
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: WALLET CARD AND FAVORITE FOOD COURTS */}
          <div className="space-y-6 text-left">
            
            {/* LPU Student Credit Card style Wallet */}
            <div className="bg-gradient-to-br from-[#111827] via-slate-900 to-[#FF6B00]/40 p-6 rounded-2xl border border-gray-850 shadow-lg text-white space-y-6 relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-28 h-28 bg-[#FF6B00]/15 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-orange-400 font-extrabold">Lovely Professional University</p>
                  <h3 className="font-black text-sm tracking-wide">STUDENT WALLET</h3>
                </div>
                <span className="text-lg">🎓</span>
              </div>

              {/* Card Chip Icon */}
              <div className="w-10 h-7 bg-amber-400/80 rounded-md relative flex items-center justify-center opacity-85 shadow-sm">
                <div className="absolute inset-x-2 border-t border-b border-amber-600/30 h-3"></div>
                <div className="absolute inset-y-1.5 border-l border-r border-amber-600/30 w-5"></div>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-extrabold">Wallet Balance</p>
                <p className="text-2xl font-black tracking-wide text-orange-50">₹{walletBalance.toFixed(2)}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold pt-2 border-t border-gray-800">
                <span className="tracking-wider">{user.name.toUpperCase()}</span>
                <span>CLASS OF 2027</span>
              </div>
            </div>

            {/* Favorite Campus Canteens Section */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} className="text-[#FF6B00]" /> Favorite Food Courts
              </h3>
              
              <div className="space-y-3">
                {/* Court 1 */}
                <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-gray-800 dark:text-gray-200">UniMall Food Court</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Pizza, Burgers & Beverages</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Star size={10} className="fill-current" /> 4.8
                  </span>
                </div>
                {/* Court 2 */}
                <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-gray-800 dark:text-gray-200">Block 32 Food Court</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Specialty Cheese Maggi</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Star size={10} className="fill-current" /> 4.7
                  </span>
                </div>
                {/* Court 3 */}
                <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-gray-800 dark:text-gray-200">Night Canteen</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Waffles, Shakes & Desserts</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Star size={10} className="fill-current" /> 4.6
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SELLER / ADMIN VIEW */}
      {(user.role === 'seller' || user.role === 'admin') && (
        <div className="space-y-10 text-left">
          
          {/* Stats Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Sales</span>
                <p className="text-xl font-black text-gray-900 dark:text-white">₹{sellerStats.totalRevenue}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-950/40 p-3 rounded-xl text-green-600">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Orders</span>
                <p className="text-xl font-black text-gray-900 dark:text-white">{sellerStats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-950/40 p-3 rounded-xl text-blue-600">
                <ClipboardList size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Active Dispatches</span>
                <p className="text-xl font-black text-gray-900 dark:text-white">{sellerStats.activeOrders}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-950/40 p-3 rounded-xl text-[#FF6B00]">
                <Clock size={20} className="animate-spin-slow" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Delivered Orders</span>
                <p className="text-xl font-black text-gray-900 dark:text-white">{sellerStats.completedOrders}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-950/40 p-3 rounded-xl text-purple-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Seller Dashboard Console */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              📋 LPU Hostel Gate Delivery Console
            </h2>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderSpinner />
                <p className="text-gray-400 text-xs font-semibold mt-2">Loading campus database...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-6 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-xs">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-8 shadow-sm">
                <ClipboardList className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={42} />
                <h3 className="font-bold text-gray-800 dark:text-white text-base">No student orders yet</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">New dispatches from UniMall will show up here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => {
                  const statusIdx = getStatusIndex(order.status);
                  const isDelivered = order.status === 'Delivered';
                  const isCancelled = order.status === 'cancelled';
                  
                  return (
                    <div 
                      key={order._id}
                      className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                          <p className="text-[10px] text-gray-450 dark:text-gray-500">Order ID: <span className="font-bold">{order._id}</span></p>
                          <p className="text-xs font-black text-gray-800 dark:text-white mt-0.5">Student: {order.customer?.name || 'LPU Student'} ({order.customer?.email || 'N/A'})</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isDelivered ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' :
                            isCancelled ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' :
                            'bg-orange-50 text-[#FF6B00] dark:bg-orange-950/40 dark:text-orange-400 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Order Items</p>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs font-semibold">
                                <span className="text-gray-650 dark:text-gray-300">
                                  {item.food?.name || 'UniMall Special'} <span className="text-orange-500 font-black">x{item.quantity}</span>
                                </span>
                                <span className="font-extrabold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between border-t border-dashed border-gray-150 dark:border-gray-800 pt-2 text-xs font-black">
                            <span>Subtotal (+ fee)</span>
                            <span className="text-[#FF6B00]">₹{order.totalAmount + 10}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Hostel Delivery Gate</p>
                            <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-1 flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#FF6B00]" />
                              {order.deliveryAddress}
                            </p>
                          </div>

                          {/* Order Progression Buttons */}
                          {!isDelivered && !isCancelled && (
                            <div className="pt-2">
                              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">Advance Rider Status</p>
                              <button
                                onClick={() => handleUpdateStatus(order._id, order.status)}
                                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold px-5 py-2.5 rounded-xl text-[10px] transition-colors shadow-sm cursor-pointer shadow-orange-500/10 flex items-center gap-1.5 uppercase tracking-wider active:scale-95"
                              >
                                Mark as: {TRACKING_STATUSES[statusIdx + 1]?.label || 'Done'} &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Order Details with tracking stepper
const OrderCard = ({ order, getStatusIndex, isHistory }) => {
  const currentIdx = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow duration-300 text-left">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="space-y-0.5">
          <p className="text-xs font-black text-[#FF6B00] flex items-center gap-1">
            🎒 LPU Order #{order._id.substring(order._id.length - 8).toUpperCase()}
          </p>
          <p className="text-[10px] text-gray-400 font-bold">Placed: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-col sm:items-end">
          <span className="text-base font-black text-gray-950 dark:text-white">₹{order.totalAmount + 10}</span>
          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Includes Convenience Fee</p>
        </div>
      </div>

      {/* Stepper Timeline Tracker */}
      {!isHistory && !isCancelled && (
        <div className="space-y-4 pt-1">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">📍 Live LPU Rider Stepper</p>
          
          <div className="relative pt-6 pb-2">
            {/* Background Line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded z-0" />
            
            {/* Filled Progress Line */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFB703] rounded z-0 transition-all duration-500" 
              style={{ width: `${(Math.max(0, currentIdx) / (TRACKING_STATUSES.length - 1)) * 100}%` }}
            />

            {/* Stepper Steps */}
            <div className="relative z-10 flex justify-between items-center">
              {TRACKING_STATUSES.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;
                const StepIcon = step.icon;

                return (
                  <div key={idx} className="flex flex-col items-center group relative">
                    {/* Node circle */}
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm' :
                        isActive ? 'bg-white dark:bg-gray-800 border-[#FF6B00] text-[#FF6B00] shadow-md scale-110 ring-4 ring-orange-500/10' :
                        'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-850 text-gray-400'
                      }`}
                    >
                      <StepIcon size={14} className={isActive ? 'animate-pulse' : ''} />
                    </div>

                    {/* Desktop labels */}
                    <p className={`hidden md:block text-[9px] font-black mt-2.5 transition-colors uppercase tracking-wider ${
                      isActive ? 'text-[#FF6B00]' : 
                      isCompleted ? 'text-gray-850 dark:text-gray-200' : 
                      'text-gray-400'
                    }`}>
                      {step.label}
                    </p>

                    {/* Floating mini info box for mobile */}
                    {isActive && (
                      <div className="absolute -top-10 bg-[#FF6B00] text-white text-[8px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap md:hidden animate-bounce">
                        {step.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Active status description block */}
          <div className="bg-orange-50/20 dark:bg-gray-850 border border-orange-100 dark:border-gray-800/80 p-3.5 rounded-xl flex items-center gap-3 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
            </span>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Current Location: <span className="font-extrabold text-[#FF6B00]">{TRACKING_STATUSES[currentIdx]?.status}</span> — <span className="text-gray-500 dark:text-gray-400 font-semibold">{TRACKING_STATUSES[currentIdx]?.desc}</span>
            </p>
          </div>
        </div>
      )}

      {/* Items and Dest Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-50 dark:border-gray-800">
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">LPU Drop-Off Location</p>
          <p className="text-xs font-black text-gray-800 dark:text-gray-250 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#FF6B00]" />
            {order.deliveryAddress}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Items Ordered</p>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.food?.name || 'UniMall Dish'} <span className="text-orange-500 font-black">x{item.quantity}</span>
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoaderSpinner = () => (
  <svg className="animate-spin h-8 w-8 text-[#FF6B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Dashboard;
