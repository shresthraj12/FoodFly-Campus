import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, Wallet, Banknote, Smartphone, MapPin, 
  Clock, ArrowLeft, Lock, Loader2, Sparkles, CheckCircle2, Copy, Check
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LPU_HOSTELS = [
  'BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9',
  'GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7',
  'Block 34 Lobby', 'Block 36 CSE Hallway', 'Block 38 MBA Block', 'Block 56 Tech Lobby', 'LPU Central Library Entrance'
];

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load checkout payload
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, cod, wallet
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // gpay, phonepe, paytm, bhim
  const [copied, setCopied] = useState(false);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // LPU Student Wallet Balance
  const [walletBalance, setWalletBalance] = useState(() => {
    const stored = localStorage.getItem('lpu_wallet_balance');
    if (stored) return parseFloat(stored);
    localStorage.setItem('lpu_wallet_balance', '1000.00');
    return 1000.00;
  });

  useEffect(() => {
    const payload = localStorage.getItem('foodfly_checkout_payload');
    if (!payload) {
      navigate('/menu');
      return;
    }
    setCheckoutPayload(JSON.parse(payload));
  }, [navigate]);

  useEffect(() => {
    if (user && !upiId) {
      setUpiId(user.name.toLowerCase().replace(/\s/g, '') + '@okaxis');
    }
  }, [user, upiId]);

  if (!user) return <div className="text-center py-20 font-bold text-gray-700 dark:text-gray-200">Please log in to checkout.</div>;
  if (!checkoutPayload) return <div className="text-center py-20 flex justify-center items-center gap-2 font-bold text-gray-750"><Loader2 className="animate-spin text-[#FF6B00]" /> Loading Checkout...</div>;

  const totalWithCess = checkoutPayload.totalAmount + 10;

  const getDeliveryTime = (loc) => {
    const cleanLoc = loc.replace(' Gate', '');
    const times = {
      'BH1': 10, 'BH2': 11, 'BH3': 12, 'BH4': 13, 'BH5': 15, 'BH6': 16, 'BH7': 17, 'BH8': 17, 'BH9': 18,
      'GH1': 10, 'GH2': 11, 'GH3': 12, 'GH4': 13, 'GH5': 15, 'GH6': 18, 'GH7': 20,
      'Block 34 Lobby': 12, 'Block 36 CSE Hallway': 14, 'Block 38 MBA Block': 15, 'Block 56 Tech Lobby': 16, 'LPU Central Library Entrance': 11
    };
    return times[cleanLoc] || 15;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('aman@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validations
    if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. yourname@upi)');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number.');
        return;
      }
      if (!expiry || !expiry.includes('/')) {
        alert('Please enter expiry in MM/YY format.');
        return;
      }
      if (cvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV.');
        return;
      }
      if (!cardName.trim()) {
        alert('Please enter the cardholder name.');
        return;
      }
    } else if (paymentMethod === 'wallet') {
      if (walletBalance < totalWithCess) {
        alert('Insufficient LPU Student Wallet Balance! Choose another payment method.');
        return;
      }
    }

    setLoading(true);

    try {
      const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Paid';

      if (paymentMethod === 'wallet') {
        const newBalance = walletBalance - totalWithCess;
        setWalletBalance(newBalance);
        localStorage.setItem('lpu_wallet_balance', newBalance.toFixed(2));
      }

      const orderData = {
        items: checkoutPayload.items.map(item => ({
          food: item.food._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: checkoutPayload.totalAmount,
        deliveryAddress: checkoutPayload.deliveryAddress,
        paymentMethod: paymentMethod === 'upi' ? 'UPI' :
                       paymentMethod === 'card' ? 'Credit/Debit Card' :
                       paymentMethod === 'wallet' ? 'Student Wallet' : 'Cash on Delivery',
        paymentStatus
      };

      const res = await axios.post(`${API_URL}/api/orders`, orderData);
      
      localStorage.removeItem('foodfly_cart');
      localStorage.removeItem('foodfly_checkout_payload');
      
      setPlacedOrderId(res.data._id);
      setShowAnimation(true);

    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const handleFinishAnimation = () => {
    setShowAnimation(false);
    navigate(`/order-confirmation/${placedOrderId}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 relative text-[#0F172A] dark:text-[#F8FAFC]">
      
      {/* Navigation link */}
      <Link to="/menu" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF6B00] transition-colors font-bold text-xs uppercase tracking-wider">
        <ArrowLeft size={14} /> Back to Menu
      </Link>

      {/* Sandbox Banner */}
      <div className="bg-amber-50 dark:bg-gray-800/40 border border-amber-200/30 dark:border-gray-700/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-sm">
            <Lock size={16} />
          </div>
          <div className="text-left">
            <p className="font-black text-sm text-amber-800 dark:text-amber-300">Demo Payment Gateway</p>
            <p className="text-xs text-amber-600 dark:text-gray-450 font-semibold mt-0.5">No real transaction is processed. Built for academic/demonstration purposes only.</p>
          </div>
        </div>
        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-200/20">
          Sandbox Mode
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PAYMENT OPTIONS */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              💳 Select Payment Method
            </h2>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-orange-50/30 dark:bg-gray-850 border-[#FF6B00] text-[#FF6B00] ring-4 ring-[#FF6B00]/10'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Smartphone size={22} />
                <span className="text-xs font-black">UPI Scan / VPA</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-orange-50/30 dark:bg-gray-850 border-[#FF6B00] text-[#FF6B00] ring-4 ring-[#FF6B00]/10'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <CreditCard size={22} />
                <span className="text-xs font-black">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'bg-orange-50/30 dark:bg-gray-850 border-[#FF6B00] text-[#FF6B00] ring-4 ring-[#FF6B00]/10'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Wallet size={22} />
                <span className="text-xs font-black">Student Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'bg-orange-50/30 dark:bg-gray-850 border-[#FF6B00] text-[#FF6B00] ring-4 ring-[#FF6B00]/10'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Banknote size={22} />
                <span className="text-xs font-black">Cash on Gate</span>
              </button>
            </div>

            {/* Detailed Forms */}
            <form onSubmit={handlePlaceOrder} className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-6">
              
              {/* UPI Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-6">
                  
                  {/* Selector list */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Choose UPI App to pay</p>
                    <div className="grid grid-cols-4 gap-3">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map(app => {
                        const appLabels = { gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm', bhim: 'BHIM UPI' };
                        const appColors = { gpay: 'text-blue-500 border-blue-500 bg-blue-50/10', phonepe: 'text-purple-500 border-purple-500 bg-purple-50/10', paytm: 'text-sky-500 border-sky-500 bg-sky-50/10', bhim: 'text-emerald-500 border-emerald-500 bg-emerald-50/10' };
                        const isSelected = selectedUpiApp === app;
                        return (
                          <button
                            key={app}
                            type="button"
                            onClick={() => {
                              setSelectedUpiApp(app);
                              setUpiId(user.name.toLowerCase().replace(/\s/g, '') + '@' + (app === 'gpay' ? 'okaxis' : app === 'phonepe' ? 'ybl' : app === 'paytm' ? 'paytm' : 'upi'));
                            }}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected 
                                ? `${appColors[app]} ring-2 ring-current/20 font-black text-xs` 
                                : 'border-gray-250 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold'
                            }`}
                          >
                            {appLabels[app]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Enter Your UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. name@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-gray-850 dark:text-gray-100 font-semibold"
                        required={paymentMethod === 'upi'}
                      />
                    </div>
                  </div>
                  
                  {/* QR Scan Section */}
                  <div className="bg-white dark:bg-gray-900 border border-orange-200/50 dark:border-orange-950/40 rounded-2xl p-6 flex flex-col items-center border border-gray-150 dark:border-gray-800 shadow-md max-w-sm mx-auto text-center">
                    {/* Top branded header */}
                    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 w-full text-white text-center py-3.5 px-4 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
                        <Sparkles size={16} className="animate-pulse text-yellow-300" />
                        <span>FoodFly Campus Pay</span>
                      </div>
                      <p className="text-[9px] font-extrabold opacity-95 tracking-wider uppercase">Demo Campus Payment</p>
                    </div>

                    {/* Scan & Pay title */}
                    <div className="py-4 text-center">
                      <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Scan & Pay</h3>
                      <p className="text-[11px] text-gray-400 font-bold">Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
                    </div>

                    {/* QR Box */}
                    <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-orange-500/20 w-44 h-44 flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-orange-500 rounded-tl-sm"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-orange-500 rounded-tr-sm"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-orange-500 rounded-bl-sm"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-orange-500 rounded-br-sm"></div>

                      <img 
                        src="/qr_code.png" 
                        alt="UPI Payment QR Code" 
                        className="w-full h-full object-contain rounded-lg select-none"
                      />
                      
                      <div className="absolute inset-0 m-auto bg-orange-500 text-white rounded-lg h-7 w-7 flex items-center justify-center font-black text-xs shadow-md border border-white">
                        🎓
                      </div>
                    </div>

                    {/* Merchant ID details */}
                    <div className="w-full pt-4 space-y-3.5">
                      <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-150 dark:border-gray-700/80 rounded-xl p-2.5 flex items-center justify-between text-xs w-full shadow-inner">
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">Merchant VPA</span>
                          <span className="font-extrabold text-gray-800 dark:text-gray-200 text-xs">aman@okaxis</span>
                        </div>
                        <button 
                          type="button"
                          onClick={copyUpiId}
                          className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 font-bold text-[10px] shadow-sm transition-all active:scale-95"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250/20 px-3 py-2 rounded-xl text-[9px] text-amber-700 dark:text-amber-350 font-bold uppercase tracking-wider leading-relaxed">
                        ⚠️ Demo Gateway — For Project Demonstration Only
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-gray-850 dark:text-gray-100 font-bold"
                      required={paymentMethod === 'card'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Card Number</label>
                    <input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => {
                        // Card formatting
                        const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-gray-850 dark:text-gray-100 font-bold tracking-widest"
                      required={paymentMethod === 'card'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                          setExpiry(val);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-gray-850 dark:text-gray-100 font-bold"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength="3"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-gray-850 dark:text-gray-100 font-bold"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Student Wallet Form */}
              {paymentMethod === 'wallet' && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-2xl border border-orange-200/30 dark:border-gray-700/80 space-y-4 max-w-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">LPU Student Wallet Balance</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">₹{walletBalance.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#FF6B00] text-white p-3 rounded-xl shadow-md shadow-orange-500/10">
                      <Wallet size={24} />
                    </div>
                  </div>
                  <div className="border-t border-orange-200/30 dark:border-gray-700 pt-3">
                    {walletBalance >= totalWithCess ? (
                      <p className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                        ✅ Balance covers total amount. Ready to pay!
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 font-bold">
                        ❌ Insufficient balance! (Need ₹{(totalWithCess - walletBalance).toFixed(2)} more).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cash on Delivery COD */}
              {paymentMethod === 'cod' && (
                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/80 space-y-3 max-w-md">
                  <div className="flex items-center gap-3 text-[#FF6B00]">
                    <Banknote size={24} />
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Hostel Gate Handoff Instructions</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Our rider will text you upon reaching the hostel gates. Please hand over the exact cash amount (₹{totalWithCess}) to the rider during drop-off handovers.
                  </p>
                </div>
              )}

              {/* Place Order Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Authorizing...
                    </>
                  ) : (
                    `Pay & Place Campus Order (₹${totalWithCess})`
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY CARD (Swiggy inspired) */}
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Order Summary
            </h3>

            {/* Hostel Gate / Time */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#FF6B00] mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">LPU Drop-off Gate</p>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">{checkoutPayload.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-[#FF6B00] mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Estimated Delivery Time</p>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">
                    {getDeliveryTime(checkoutPayload.deliveryAddress)} mins (from UniMall canteens)
                  </p>
                </div>
              </div>
            </div>

            {/* Items summary */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Your Dishes</p>
              
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {checkoutPayload.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded text-[10px]">
                        x{item.quantity}
                      </span>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 line-clamp-1">{item.food.name}</span>
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing breakdown */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-gray-450 dark:text-gray-500">
                <span>Food Subtotal</span>
                <span>₹{checkoutPayload.totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-450 dark:text-gray-500">
                <span>Campus Delivery Fee</span>
                <span className="text-green-600 dark:text-green-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-450 dark:text-gray-500">
                <span>Campus Convenience Fee</span>
                <span>₹10</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2.5 text-gray-950 dark:text-white border-t border-gray-100 dark:border-gray-800">
                <span>Grand Total</span>
                <span className="text-base text-[#FF6B00]">₹{totalWithCess}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Success Animation Modal Overlay */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-2xl text-center max-w-sm w-full mx-4 space-y-6 transform scale-100 transition-transform">
            
            <div className="h-16 w-16 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-200/20">
              <CheckCircle2 size={40} className="text-green-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-black text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-green-200/20">
                Payment Authorized
              </span>
              <h3 className="text-xl font-black text-gray-950 dark:text-white">Order Confirmed!</h3>
              <p className="text-xs text-gray-450 dark:text-gray-500 leading-relaxed font-medium">
                Mock payment authorized successfully via sandbox merchant gateway. Your UniMall order is dispatching to your gate.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinishAnimation}
              className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-md shadow-orange-500/10 cursor-pointer text-xs uppercase tracking-wider"
            >
              Track Your Order &rarr;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
