import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  trendValue,
  className = '' 
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    green: 'from-green-500 to-green-600 text-green-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    orange: 'from-orange-500 to-orange-600 text-orange-600',
    red: 'from-red-500 to-red-600 text-red-600',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600',
  };

  const bgGradient = colorClasses[color]?.split(' text-')[0] || colorClasses.blue.split(' text-')[0];
  const textColor = colorClasses[color]?.split('text-')[1] || colorClasses.blue.split('text-')[1];

  return (
    <div className={`dashboard-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp size={16} className="text-green-500 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 bg-gradient-to-br ${bgGradient} rounded-lg flex items-center justify-center text-white shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
