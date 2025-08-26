import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI, dashboardAPI } from '../services/api';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  BookOpen,
  UserCheck,
  GraduationCap,
  BarChart3,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

export default function DashboardManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [batchOverview, setBatchOverview] = useState([]);
  const [staffOverview, setStaffOverview] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, batchData, activitiesData] = await Promise.all([
        dashboardAPI.getManagementStats(),
        academicsAPI.getBatches({ limit: 6 }),
        academicsAPI.getRecentActivities({ limit: 8 })
      ]);

      setStats(statsData);
      setBatchOverview(batchData.results || []);
      setRecentActivities(activitiesData);

      // Load additional management data
      if (statsData) {
        const [staffData, financialData] = await Promise.all([
          academicsAPI.getStaffOverview(),
          dashboardAPI.getFinancialSummary()
        ]);
        setStaffOverview(staffData);
        setFinancialSummary(financialData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCapacityColor = (currentCount, maxCapacity) => {
    const percentage = (currentCount / maxCapacity) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Management Overview</h1>
        <p className="text-teal-100">Welcome {user?.full_name || user?.username}! Here's your institutional overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Batches</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_batches || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_students || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Staff Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_staff || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(financialSummary.monthly_revenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
                Batch Overview
              </h2>
              <button 
                onClick={() => window.location.href = '/management/batches'}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {batchOverview.length > 0 ? (
              <div className="space-y-4">
                {batchOverview.map((batch, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{batch.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(batch.status)
                      }`}>
                        {batch.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {batch.current_students || 0}/{batch.max_capacity || 30} students
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                        getCapacityColor(batch.current_students || 0, batch.max_capacity || 30)
                      }`}>
                        {batch.max_capacity ? 
                          `${Math.round(((batch.current_students || 0) / batch.max_capacity) * 100)}% full` : 
                          'N/A'
                        }
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Start: {formatDate(batch.start_date)}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => window.location.href = `/management/batches/${batch.id}`}
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => window.location.href = `/management/batches/${batch.id}/edit`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No batches to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Staff Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                Staff Overview
              </h2>
              <button 
                onClick={() => window.location.href = '/management/staff'}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Manage Staff
              </button>
            </div>
          </div>
          <div className="p-6">
            {staffOverview.length > 0 ? (
              <div className="space-y-4">
                {staffOverview.slice(0, 5).map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {(staff.full_name || staff.name || 'S').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.full_name || staff.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{staff.role || staff.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (staff.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {staff.classes_count || 0} classes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No staff data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
            Financial Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialSummary.total_revenue)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(financialSummary.pending_payments)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Pending Payments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(financialSummary.monthly_expenses)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Monthly Expenses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency((financialSummary.monthly_revenue || 0) - (financialSummary.monthly_expenses || 0))}
              </div>
              <p className="text-sm text-gray-500 mt-1">Net Profit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Management Activities
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Management Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/management/batches/create'}
              className="p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Plus className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-teal-600">Create Batch</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/management/staff/hire'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">Hire Staff</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/management/finance'}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Financial Reports</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/management/analytics'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-600">Analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
