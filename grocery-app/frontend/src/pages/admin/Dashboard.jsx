import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';
import { formatPrice } from '../../utils/helpers';
import { Spinner } from '../../components/ui/Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>;

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  const revenueChartData = {
    labels: stats.last7Days.map((d) => d._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: stats.last7Days.map((d) => d.revenue),
      fill: true,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.1)',
      tension: 0.4,
    }],
  };

  const statusChartData = {
    labels: stats.ordersByStatus.map((s) => s._id),
    datasets: [{
      data: stats.ordersByStatus.map((s) => s.count),
      backgroundColor: ['#16a34a','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4'],
    }],
  };

  const categoryChartData = {
    labels: stats.categorySales.slice(0, 6).map((c) => c._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: stats.categorySales.slice(0, 6).map((c) => c.revenue),
      backgroundColor: '#16a34a',
      borderRadius: 6,
    }],
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-dark-text">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="👤" color="blue" trend="up" trendValue={12} />
        <StatsCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon="📦" color="purple" trend="up" trendValue={8} />
        <StatsCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} icon="💰" color="primary" trend="up" trendValue={15} />
        <StatsCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon="🛒" color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold mb-4">Revenue (Last 7 Days)</h2>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <div className="h-64">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category sales */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Sales by Category</h2>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">🔥 Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <div className="w-full bg-gray-100 dark:bg-dark-border h-1.5 rounded-full mt-1">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (p.totalSold / stats.topProducts[0].totalSold) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right text-xs flex-shrink-0">
                  <p className="font-bold">{p.totalSold} sold</p>
                  <p className="text-gray-400">{formatPrice(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
