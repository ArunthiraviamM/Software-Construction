import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { formatPrice, formatDate, statusColor } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  if (orders.length === 0) {
    return (
      <div className="page-container text-center py-24">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-500 dark:text-dark-muted mb-6">When you place an order, it will appear here.</p>
        <Link to="/products" className="btn-primary inline-flex">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6 dark:text-dark-text">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 flex items-start justify-between gap-4 hover:border-primary-200 hover:border dark:hover:border-primary-700 transition-all animate-fade-in">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="font-bold text-sm">{order.orderNumber}</span>
                <span className={`badge ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                <span className={`badge ${statusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
              </div>
              <div className="flex gap-2 mb-2 overflow-x-auto hide-scrollbar">
                {order.items?.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=60'; }} />
                ))}
                {order.items?.length > 4 && <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-border flex items-center justify-center text-xs font-bold">+{order.items.length - 4}</div>}
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">{order.items?.length} item(s) • {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-primary-600 text-lg">{formatPrice(order.totalPrice)}</p>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
