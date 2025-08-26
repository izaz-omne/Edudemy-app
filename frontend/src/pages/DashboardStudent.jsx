import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI, dashboardAPI } from '../services/api';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle2,
  Star,
  Users,
  BarChart3
} from 'lucide-react';

export default function DashboardStudent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, classesData, resultsData] = await Promise.all([
        dashboardAPI.getStudentStats(),
        academicsAPI.getUpcomingClasses(7),
        academicsAPI.getExamResults({ limit: 5 })
      ]);

      setStats(statsData);
      setUpcomingClasses(classesData);
      setRecentResults(resultsData);

      // Load attendance summary if we have student data
      if (statsData.student_id) {
        const attendanceData = await academicsAPI.getAttendanceSummary(statsData.student_id);
        setAttendanceSummary(attendanceData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-50';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-50';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-50';
      case 'D':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-red-600 bg-red-50';
    }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || user?.username}!</h1>
        <p className="text-blue-100">Here's your academic overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall GPA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.overall_percentage ? (stats.overall_percentage / 20).toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceSummary.attendance_percentage ? 
                  `${attendanceSummary.attendance_percentage}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Classes This Week</p>
              <p className="text-2xl font-semibold text-gray-900">{upcomingClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Exams</p>
              <p className="text-2xl font-semibold text-gray-900">{recentResults.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Classes
            </h2>
          </div>
          <div className="p-6">
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.slice(0, 5).map((classItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classItem.subject}</p>
                        <p className="text-sm text-gray-500">{formatDate(classItem.scheduled_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{classItem.classroom || 'Online'}</p>
                      <p className="text-xs text-gray-400">{classItem.duration_minutes || 60} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming classes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600" />
              Recent Exam Results
            </h2>
          </div>
          <div className="p-6">
            {recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{result.exam?.title || 'Exam'}</p>
                        <p className="text-sm text-gray-500">{result.exam?.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getGradeColor(result.grade)
                      }`}>
                        {result.grade}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {result.marks_obtained}/{result.exam?.max_marks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent exam results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      {attendanceSummary.subject_wise && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Subject-wise Attendance
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(attendanceSummary.subject_wise).map(([subject, data]) => (
                <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{subject}</h3>
                    <span className={`text-sm font-medium ${
                      data.percentage >= 90 ? 'text-green-600' :
                      data.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {data.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        data.percentage >= 90 ? 'bg-green-500' :
                        data.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {data.present} of {data.total} classes attended
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/student/grades'}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600">View Grades</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/student/attendance'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">Attendance</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/student/feedback'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-600">Submit Feedback</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/messaging'}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Messages</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
