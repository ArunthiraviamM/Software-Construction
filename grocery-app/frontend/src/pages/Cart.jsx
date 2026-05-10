import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';

const Cart = () => {
  const { cart, cartTotal, cartLoading, updateQuantity, removeFromCart, applyCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const items = cart?.items || [];
  const deliveryFee = cartTotal >= 499 ? 0 : 40;
  const discount = cart?.coupon?.discountAmount || 0;
  const total = cartTotal + deliveryFee - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode);
    setApplyingCoupon(false);
    setCouponCode('');
  };

  if (cartLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  if (items.length === 0) {
    return (
      <div className="page-container text-center py-24">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-dark-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-flex"><ShoppingBag className="w-4 h-4" /> Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6 dark:text-dark-text">My Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-start animate-fade-in">
              <img src={item.product?.thumbnail} alt={item.product?.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=100'; }} />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-semibold hover:text-primary-600 transition-colors line-clamp-2">{item.product?.name}</Link>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{formatPrice(item.price)} each</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border dark:border-dark-border rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="px-3 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary-600">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-600" /> Apply Coupon</h3>
            {cart?.coupon?.code ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-700 text-sm">{cart.coupon.code}</p>
                  <p className="text-xs text-green-600">Saving {formatPrice(discount)}</p>
                </div>
                <span className="text-green-600 text-xl">✓</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="input text-sm flex-1" />
                <button onClick={handleApplyCoupon} disabled={applyingCoupon} className="btn-primary px-4 text-sm">
                  {applyingCoupon ? <Spinner size="sm" /> : 'Apply'}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Try: WELCOME10, FLAT50</p>
          </div>

          {/* Price breakdown */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE 🎉' : formatPrice(deliveryFee)}</span>
              </div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
            </div>
            {cartTotal < 499 && (
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 rounded-xl p-2.5 text-xs text-orange-600">
                🎉 Add {formatPrice(499 - cartTotal)} more to get FREE delivery!
              </div>
            )}
            <div className="border-t dark:border-dark-border pt-3 flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-primary-600">{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full py-3 text-center">Proceed to Checkout →</Link>
            <Link to="/products" className="btn-secondary w-full py-2.5 text-center text-sm">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
