import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { Spinner } from '../ui/Spinner';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, cartTotal, cartLoading, updateQuantity, removeFromCart } = useCart();
  const items = cart?.items || [];
  const deliveryFee = cartTotal >= 499 ? 0 : 40;
  const discount = cart?.coupon?.discountAmount || 0;
  const payable = cartTotal + deliveryFee - discount;

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose} />}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-dark-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-lg">My Cart</h2>
            {items.length > 0 && <span className="badge bg-primary-100 text-primary-700">{items.length}</span>}
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartLoading && <div className="flex justify-center py-8"><Spinner /></div>}
          {!cartLoading && items.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-medium text-gray-700 dark:text-dark-text">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
              <button onClick={onClose} className="btn-primary mt-4">Start Shopping</button>
            </div>
          )}
          {!cartLoading && items.map((item) => (
            <div key={item._id} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-bg">
              <img src={item.product?.thumbnail} alt={item.product?.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=100'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1 dark:text-dark-text">{item.product?.name}</p>
                <p className="text-xs text-gray-400 mb-2">{formatPrice(item.price)} each</p>
                <div className="flex items-center justify-between">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 bg-white dark:bg-dark-card rounded-lg border dark:border-dark-border">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1.5 hover:text-primary-600 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold px-1 min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1.5 hover:text-primary-600 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-primary-600">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t dark:border-dark-border p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
            </div>
            {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
            {cartTotal < 499 && <p className="text-xs text-gray-400">Add {formatPrice(499 - cartTotal)} more for free delivery</p>}
            <div className="flex justify-between font-bold text-base border-t dark:border-dark-border pt-2">
              <span>Total</span><span className="text-primary-600">{formatPrice(payable)}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn-primary w-full">Proceed to Checkout</Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
