import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, deliverySlots } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery', icon: '💵' },
  { id: 'UPI', label: 'UPI Payment', icon: '📱' },
  { id: 'Card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'Wallet', label: 'Wallet', icon: '👛' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, refetchCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newAddress, setNewAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setAddresses(data.data.addresses || []);
      const def = data.data.addresses?.find((a) => a.isDefault);
      if (def) setSelectedAddress(def);
    });
  }, []);

  const addAddress = async () => {
    try {
      const { data } = await api.post('/users/addresses', newAddress);
      setAddresses(data.data);
      const last = data.data[data.data.length - 1];
      setSelectedAddress(last);
      setShowAddressForm(false);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    if (!selectedSlot) { toast.error('Please select a delivery slot'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: { fullName: selectedAddress.fullName, phone: selectedAddress.phone, street: selectedAddress.street, city: selectedAddress.city, state: selectedAddress.state, pincode: selectedAddress.pincode },
        paymentMethod,
        deliverySlot: selectedSlot,
      });
      await refetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items || [];
  const deliveryFee = cartTotal >= 499 ? 0 : 40;
  const discount = cart?.coupon?.discountAmount || 0;
  const total = cartTotal + deliveryFee - discount;

  const STEPS = ['Address', 'Delivery Slot', 'Payment', 'Review'];

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button onClick={() => i + 1 < step && setStep(i + 1)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${step === i + 1 ? 'bg-primary-600 text-white' : step > i + 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-dark-border text-gray-500'}`}>
              {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-current text-white dark:text-dark-bg text-xs flex items-center justify-center font-bold">{i+1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-dark-border'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">

          {/* Step 1 — Address */}
          {step === 1 && (
            <div className="card p-5 animate-fade-in">
              <h2 className="font-semibold flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary-600" /> Delivery Address</h2>
              {addresses.map((addr, i) => (
                <div key={i} onClick={() => setSelectedAddress(addr)}
                  className={`border-2 rounded-xl p-4 mb-3 cursor-pointer transition-all ${selectedAddress === addr ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-dark-border hover:border-primary-200'}`}>
                  <div className="flex justify-between">
                    <span className="badge bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted text-xs">{addr.label}</span>
                    {selectedAddress === addr && <CheckCircle className="w-4 h-4 text-primary-600" />}
                  </div>
                  <p className="font-semibold mt-1">{addr.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-dark-muted">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>
              ))}
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary w-full text-sm">
                <Plus className="w-4 h-4" /> Add New Address
              </button>
              {showAddressForm && (
                <div className="mt-4 grid grid-cols-2 gap-3 animate-slide-up">
                  {[['fullName','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([field, label]) => (
                    <div key={field} className={field === 'street' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium mb-1">{label}</label>
                      <input value={newAddress[field]} onChange={(e) => setNewAddress({...newAddress,[field]:e.target.value})} className="input text-sm py-2" />
                    </div>
                  ))}
                  <div className="col-span-2 flex gap-2">
                    <button onClick={addAddress} className="btn-primary flex-1">Save Address</button>
                    <button onClick={() => setShowAddressForm(false)} className="btn-secondary px-4">Cancel</button>
                  </div>
                </div>
              )}
              <button onClick={() => { if (!selectedAddress) { toast.error('Select an address'); return; } setStep(2); }} className="btn-primary w-full mt-4">Continue →</button>
            </div>
          )}

          {/* Step 2 — Delivery Slot */}
          {step === 2 && (
            <div className="card p-5 animate-fade-in">
              <h2 className="font-semibold flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-primary-600" /> Select Delivery Slot</h2>
              {deliverySlots.map((day) => (
                <div key={day.date} className="mb-4">
                  <p className="font-medium text-sm mb-2">{day.date}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {day.slots.map((slot) => {
                      const isSelected = selectedSlot?.date === day.date && selectedSlot?.slot === slot;
                      return (
                        <button key={slot} onClick={() => setSelectedSlot({ date: day.date, slot })}
                          className={`border-2 rounded-xl p-3 text-sm transition-all flex items-center gap-2 ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-700' : 'border-gray-200 dark:border-dark-border hover:border-primary-200'}`}>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs">{slot}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => { if (!selectedSlot) { toast.error('Select a slot'); return; } setStep(3); }} className="btn-primary flex-1">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <div className="card p-5 animate-fade-in">
              <h2 className="font-semibold flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-primary-600" /> Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === pm.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-dark-border hover:border-primary-200'}`}>
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="font-medium">{pm.label}</span>
                    {paymentMethod === pm.id && <CheckCircle className="w-5 h-5 text-primary-600 ml-auto" />}
                  </div>
                ))}
              </div>
              {paymentMethod !== 'COD' && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-600">
                  💡 This is a simulation. No real payment will be processed.
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="card p-5 animate-fade-in">
              <h2 className="font-semibold mb-4">Review Your Order</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.product?.thumbnail} alt={item.product?.name} className="w-12 h-12 rounded-lg object-cover" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1506617420156-8e4536971650?w=60';}} />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-dark-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>📍 Address</span><span className="text-right text-gray-600 dark:text-dark-muted max-w-[55%]">{selectedAddress?.fullName}, {selectedAddress?.city}</span></div>
                <div className="flex justify-between"><span>🕐 Slot</span><span className="text-gray-600 dark:text-dark-muted">{selectedSlot?.date} {selectedSlot?.slot}</span></div>
                <div className="flex justify-between"><span>💳 Payment</span><span className="text-gray-600 dark:text-dark-muted">{paymentMethod}</span></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1">← Back</button>
                <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? <Spinner size="sm" /> : `Place Order — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-muted truncate max-w-[60%]">{item.product?.name} ×{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t dark:border-dark-border mt-3 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(discount)}</span></div>}
            <div className="border-t dark:border-dark-border pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
