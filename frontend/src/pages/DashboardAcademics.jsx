import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicsAPI, dashboardAPI } from '../services/api';
import { 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  TrendingUp,
  Users,
  GraduationCap,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Target,
  BookOpenCheck
} from 'lucide-react';

export default function DashboardAcademics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [curriculumProgress, setCurriculumProgress] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, examsData, calendarData] = await Promise.all([
        dashboardAPI.getAcademicsStats(),
        academicsAPI.getExams({ limit: 6, status: 'upcoming' }),
        academicsAPI.getAcademicCalendar({ limit: 8 })
      ]);

      setStats(statsData);
      setUpcomingExams(examsData.results || []);
      setAcademicCalendar(calendarData);

      // Load additional academic data
      if (statsData) {
        const [curriculumData, performanceData, resultsData] = await Promise.all([
          academicsAPI.getCurriculumProgress(),
          dashboardAPI.getPerformanceMetrics(),
          academicsAPI.getExamResults({ limit: 8, recent: true })
        ]);
        setCurriculumProgress(curriculumData);
        setPerformanceMetrics(performanceData);
        setRecentResults(resultsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'upcoming':
        return 'text-purple-600 bg-purple-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Academic Management</h1>
        <p className="text-indigo-100">Welcome {user?.full_name || user?.username}! Monitor academic progress and curriculum</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_courses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled Exams</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.scheduled_exams || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Performance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceMetrics.average_score ? `${performanceMetrics.average_score.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Curriculum Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceMetrics.curriculum_completion ? `${performanceMetrics.curriculum_completion.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-purple-600" />
                Upcoming Exams
              </h2>
              <button 
                onClick={() => window.location.href = '/academics/exams'}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Manage Exams
              </button>
            </div>
          </div>
          <div className="p-6">
            {upcomingExams.length > 0 ? (
              <div className="space-y-4">
                {upcomingExams.map((exam, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{exam.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(exam.status)
                      }`}>
                        {exam.status || 'Upcoming'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(exam.exam_date)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {exam.student_count || 0} students
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {exam.subject} • {exam.max_marks} marks • {exam.duration} min
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => window.location.href = `/academics/exams/${exam.id}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => window.location.href = `/academics/exams/${exam.id}/edit`}
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
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming exams scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Academic Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Academic Calendar
              </h2>
              <button 
                onClick={() => window.location.href = '/academics/calendar'}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View Full Calendar
              </button>
            </div>
          </div>
          <div className="p-6">
            {academicCalendar.length > 0 ? (
              <div className="space-y-4">
                {academicCalendar.slice(0, 6).map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(event.start_date)}
                          {event.end_date && event.end_date !== event.start_date && 
                            ` - ${formatDate(event.end_date)}`
                          }
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(event.status)
                        }`}>
                          {event.status || event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming academic events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Progress */}
      {curriculumProgress.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenCheck className="h-5 w-5 mr-2 text-green-600" />
              Curriculum Progress
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {curriculumProgress.map((subject, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{subject.subject_name || subject.name}</h3>
                    <span className="text-sm font-medium text-gray-600">
                      {subject.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(subject.progress_percentage || 0)}`}
                      style={{ width: `${Math.min(subject.progress_percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{subject.completed_topics || 0} of {subject.total_topics || 0} topics</span>
                    <span>{subject.batch_name || 'All Batches'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Exam Results */}
      {recentResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Recent Exam Results
              </h2>
              <button 
                onClick={() => window.location.href = '/academics/results'}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                View All Results
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Exam</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Subject</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Average Score</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Students</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentResults.slice(0, 5).map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4">
                        <p className="text-sm font-medium text-gray-900">{result.exam?.title || 'Exam'}</p>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {result.exam?.subject}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getGradeColor(result.average_grade)
                          }`}>
                            {result.average_grade}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            ({result.average_score?.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {result.total_students} students
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {formatDate(result.exam?.exam_date)}
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => window.location.href = `/academics/results/${result.exam?.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Academic Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/academics/exams/create'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Plus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-600">Create Exam</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/academics/curriculum'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">Curriculum</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/academics/calendar/event'}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600">Add Event</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/academics/reports'}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
