import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, MapPin, Clock, ArrowRight, Loader2, CreditCard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/orders/myorders`);
        const foundOrder = res.data.find(o => o._id === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order details not found.');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order confirmation details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const getDeliveryTime = (loc) => {
    if (!loc) return 15;
    const cleanLoc = loc.replace(' Gate', '');
    const times = {
      'BH1': 10, 'BH2': 11, 'BH3': 12, 'BH4': 13, 'BH5': 15, 'BH6': 16, 'BH7': 17, 'BH8': 17, 'BH9': 18,
      'GH1': 10, 'GH2': 11, 'GH3': 12, 'GH4': 13, 'GH5': 15, 'GH6': 18, 'GH7': 20,
      'Block 34 Lobby': 12, 'Block 36 CSE Hallway': 14, 'Block 38 MBA Block': 15, 'Block 56 Tech Lobby': 16, 'LPU Central Library Entrance': 11
    };
    return times[cleanLoc] || 15;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-gray-400">
        <Loader2 className="animate-spin text-[#FF6B00]" size={36} />
        <p className="font-bold text-sm">Verifying campus dispatch...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-6 rounded-2xl border border-red-150/20 text-sm">
          <p className="font-bold">Error retrieving confirmation details</p>
          <p className="text-xs mt-1">{error || 'Something went wrong.'}</p>
        </div>
        <Link to="/menu" className="inline-block bg-[#FF6B00] text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-orange-500/10">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* Success Card Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-sm text-center space-y-6">
        
        <div className="bg-green-50 dark:bg-green-950/40 p-4 rounded-full text-green-500 w-fit mx-auto border border-green-200/20">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-gray-950 dark:text-white">Order Placed Successfully!</h1>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
            Your payment is authorized. The kitchen has begun preparing your food.
          </p>
        </div>

        {/* Order ID block */}
        <div className="bg-gray-50 dark:bg-gray-800/80 py-3 px-6 rounded-xl w-fit mx-auto border border-gray-150 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Order Reference</p>
          <p className="text-sm font-black text-[#FF6B00] tracking-wider mt-0.5">#{order._id.toUpperCase()}</p>
        </div>
      </div>

      {/* Dispatch Details Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        
        <div className="space-y-6">
          <h3 className="text-xs font-extrabold text-gray-950 dark:text-white uppercase tracking-wider border-b pb-2.5 border-gray-100 dark:border-gray-800">
            Delivery Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-[#FF6B00] mt-0.5" size={16} />
              <div>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">LPU Drop-off location</p>
                <p className="text-xs font-black text-gray-850 dark:text-gray-200 mt-0.5">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-[#FF6B00] mt-0.5" size={16} />
              <div>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Estimated Handoff</p>
                <p className="text-xs font-black text-gray-850 dark:text-gray-200 mt-0.5">
                  {getDeliveryTime(order.deliveryAddress)} mins (UniMall Dispatch)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="text-[#FF6B00] mt-0.5" size={16} />
              <div>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Payment Details</p>
                <p className="text-xs font-black text-gray-850 dark:text-gray-200 mt-0.5">
                  {order.paymentMethod} — <span className="text-green-600 dark:text-green-400 font-black">{order.paymentStatus}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-gray-950 dark:text-white uppercase tracking-wider border-b pb-2.5 border-gray-100 dark:border-gray-800">
            Items Ordered
          </h3>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded text-[10px]">
                    x{item.quantity}
                  </span>
                  <span className="font-semibold text-gray-650 dark:text-gray-300 line-clamp-1">{item.food?.name || 'UniMall Special'}</span>
                </div>
                <span className="font-extrabold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-3 space-y-2 text-xs font-semibold text-gray-450 dark:text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Campus Convenience Fee</span>
              <span>₹10</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-950 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Grand Total</span>
              <span className="text-orange-500">₹{order.totalAmount + 10}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Track Buttons */}
      <div className="flex justify-center pt-2">
        <Link
          to="/dashboard"
          className="bg-[#FF6B00] text-white font-extrabold px-8 py-4 rounded-xl hover:bg-[#e05e00] transition-colors shadow-lg shadow-orange-500/10 active:scale-95 flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          Track Live Delivery <ArrowRight size={16} />
        </Link>
      </div>

    </div>
  );
};

export default OrderConfirmation;
