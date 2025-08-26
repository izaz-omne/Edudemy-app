import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function DashboardAdmin() {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  const stats = [
    { title: 'Total Students', value: '1,247', icon: Users, color: 'blue', trend: 'up', trendValue: '+12%' },
    { title: 'Active Teachers', value: '89', icon: UserCheck, color: 'green', trend: 'up', trendValue: '+5%' },
    { title: 'Total Batches', value: '24', icon: BookOpen, color: 'purple', trend: 'up', trendValue: '+8%' },
    { title: 'Monthly Revenue', value: '$45,230', icon: TrendingUp, color: 'orange', trend: 'up', trendValue: '+15%' },
  ];

  const enrollmentData = [
    { month: 'Jan', students: 120, teachers: 8 },
    { month: 'Feb', students: 150, teachers: 12 },
    { month: 'Mar', students: 180, teachers: 15 },
    { month: 'Apr', students: 220, teachers: 18 },
    { month: 'May', students: 280, teachers: 22 },
    { month: 'Jun', students: 320, teachers: 25 },
  ];

  const batchDistribution = [
    { name: 'Computer Science', value: 340, color: '#3B82F6' },
    { name: 'Mathematics', value: 280, color: '#10B981' },
    { name: 'Physics', value: 220, color: '#8B5CF6' },
    { name: 'Chemistry', value: 180, color: '#F59E0B' },
    { name: 'Biology', value: 150, color: '#EF4444' },
  ];

  const recentActivityData = [
    { id: 1, type: 'student', action: 'New student enrolled', user: 'John Doe', time: '2 minutes ago', color: 'text-green-600' },
    { id: 2, type: 'teacher', action: 'Teacher profile updated', user: 'Sarah Wilson', time: '15 minutes ago', color: 'text-blue-600' },
    { id: 3, type: 'batch', action: 'New batch created', user: 'Physics Advanced', time: '1 hour ago', color: 'text-purple-600' },
    { id: 4, type: 'payment', action: 'Payment received', user: 'Emma Johnson', time: '2 hours ago', color: 'text-orange-600' },
    { id: 5, type: 'alert', action: 'System maintenance scheduled', user: 'System', time: '3 hours ago', color: 'text-red-600' },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRecentActivities(recentActivityData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student': return Users;
      case 'teacher': return UserCheck;
      case 'batch': return BookOpen;
      case 'payment': return TrendingUp;
      case 'alert': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
              <p className="text-blue-100">Here's what's happening with your educational platform today.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BarChart3 size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3B82F6" name="Students" />
                <Bar dataKey="teachers" fill="#10B981" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Batch Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={batchDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {batchDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))
              ) : (
                recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                        <IconComponent size={16} className={activity.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left py-3 px-4 flex items-center justify-between group">
                <div className="flex items-center">
                  <Users size={20} className="mr-3" />
                  Add Student
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="w-full btn-success text-left py-3 px-4 flex items-center justify-between group">
                <div className="flex items-center">
                  <UserCheck size={20} className="mr-3" />
                  Add Teacher
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="w-full btn-secondary text-left py-3 px-4 flex items-center justify-between group">
                <div className="flex items-center">
                  <BookOpen size={20} className="mr-3" />
                  Create Batch
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-left py-3 px-4 rounded-md transition-colors duration-200 font-medium flex items-center justify-between group">
                <div className="flex items-center">
                  <BarChart3 size={20} className="mr-3" />
                  View Reports
                </div>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Calendar size={24} className="text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Parent-Teacher Meeting</p>
                <p className="text-sm text-gray-600">Tomorrow at 10:00 AM</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Award size={24} className="text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Academic Awards Ceremony</p>
                <p className="text-sm text-gray-600">Friday at 2:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-orange-50 rounded-lg">
              <BookOpen size={24} className="text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">New Batch Orientation</p>
                <p className="text-sm text-gray-600">Next Monday at 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
