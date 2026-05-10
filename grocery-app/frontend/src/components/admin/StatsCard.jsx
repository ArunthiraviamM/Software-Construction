import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Stats card for admin dashboard
 */
const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">{title}</p>
          <p className="text-2xl font-extrabold mt-1 dark:text-dark-text">{value}</p>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}% this week
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
