import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard, X } from 'lucide-react';
import api from '../api/axios';
import { formatPrice, formatDateTime, statusColor } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason });
      setOrder(data.data);
      setCancelModal(false);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!order) return <div className="page-container text-center py-12"><p>Order not found</p></div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const canCancel = !['Delivered', 'Cancelled'].includes(order.orderStatus);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-bold dark:text-dark-text">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        {canCancel && (
          <button onClick={() => setCancelModal(true)} className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
            <X className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Status Tracker */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="card p-5">
              <h2 className="font-semibold mb-5">Order Tracking</h2>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-dark-border" />
                {STATUS_STEPS.map((status, i) => (
                  <div key={status} className="relative flex items-start gap-4 mb-4 last:mb-0">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-border'}`}>
                      {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
                    </div>
                    <div className="pt-1">
                      <p className={`font-medium ${i <= currentStep ? 'text-gray-900 dark:text-dark-text' : 'text-gray-400'}`}>{status}</p>
                      {order.statusHistory?.find((h) => h.status === status) && (
                        <p className="text-xs text-gray-400">{formatDateTime(order.statusHistory.find((h) => h.status === status).timestamp)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Items Ordered ({order.items?.length})</h2>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=60'; }} />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-4">
          {/* Price Breakdown */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={order.deliveryFee === 0 ? 'text-green-600' : ''}>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({order.couponCode})</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="border-t dark:border-dark-border pt-2 flex justify-between font-bold">
                <span>Total Paid</span><span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary-600" /> Delivery Address</h2>
            <p className="text-sm font-medium">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-dark-muted">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
          </div>

          {/* Delivery Slot */}
          {order.deliverySlot && (
            <div className="card p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-primary-600" /> Delivery Slot</h2>
              <p className="text-sm"><span className="font-medium">{order.deliverySlot.date}</span> • {order.deliverySlot.slot}</p>
            </div>
          )}

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-primary-600" /> Payment</h2>
            <div className="flex justify-between text-sm">
              <span>{order.paymentMethod}</span>
              <span className={`badge ${statusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" size="sm">
        <p className="text-gray-600 dark:text-dark-muted mb-4">Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for cancellation (optional)" rows={3} className="input mb-4 resize-none" />
        <div className="flex gap-3">
          <button onClick={() => setCancelModal(false)} className="btn-secondary flex-1">Keep Order</button>
          <button onClick={cancelOrder} disabled={cancelling} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors">
            {cancelling ? <Spinner size="sm" /> : 'Cancel Order'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
