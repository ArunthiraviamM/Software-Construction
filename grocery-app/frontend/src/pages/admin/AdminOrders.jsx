import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import { formatPrice, formatDate, statusColor } from '../../utils/helpers';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUSES = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/orders?page=${page}&limit=15${filterStatus ? '&status=' + filterStatus : ''}`);
      setOrders(data.data);
      setTotalPages(data.pagination.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const updateStatus = async (orderId, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to "${newStatus}"`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdatingId(null); }
  };

  const getNextStatuses = (current) => {
    const transitions = {
      Placed: ['Confirmed', 'Cancelled'],
      Confirmed: ['Packed', 'Cancelled'],
      Packed: ['Out for Delivery'],
      'Out for Delivery': ['Delivered'],
    };
    return transitions[current] || [];
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold dark:text-dark-text">Orders Management</h1>
        {/* Status filter */}
        <div className="relative">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="input text-sm py-2 pr-8 appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b dark:border-dark-border">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Date', 'Payment', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><Spinner className="mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-primary-600">{formatPrice(order.totalPrice)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    {updatingId === order._id ? (
                      <Spinner size="sm" />
                    ) : getNextStatuses(order.orderStatus).length > 0 ? (
                      <div className="relative">
                        <select
                          onChange={(e) => updateStatus(order._id, order.orderStatus, e.target.value)}
                          defaultValue=""
                          className="text-xs border dark:border-dark-border rounded-lg px-2 py-1.5 bg-white dark:bg-dark-card cursor-pointer"
                        >
                          <option value="" disabled>Move to…</option>
                          {getNextStatuses(order.orderStatus).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex gap-2 justify-center flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-border hover:bg-primary-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
