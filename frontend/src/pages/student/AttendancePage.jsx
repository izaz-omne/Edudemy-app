import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicsAPI } from '../../services/api';
import { 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  AlertTriangle,
  Filter,
  Download,
  Eye
} from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear, selectedSubject]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [attendanceRecords, summary] = await Promise.all([
        academicsAPI.getStudentAttendance({
          month: selectedMonth + 1,
          year: selectedYear,
          subject: selectedSubject !== 'all' ? selectedSubject : undefined
        }),
        academicsAPI.getAttendanceSummary()
      ]);

      setAttendanceData(attendanceRecords.results || attendanceRecords);
      setAttendanceSummary(summary);

      // Extract unique subjects
      const uniqueSubjects = [...new Set((attendanceRecords.results || attendanceRecords).map(a => a.subject))];
      setSubjects(uniqueSubjects);

      // Organize data for calendar view
      const calendarMap = {};
      (attendanceRecords.results || attendanceRecords).forEach(record => {
        const date = new Date(record.date).getDate();
        if (!calendarMap[date]) {
          calendarMap[date] = [];
        }
        calendarMap[date].push(record);
      });
      setCalendarData(calendarMap);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return { icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200', text: 'Present' };
      case 'absent':
        return { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', text: 'Absent' };
      case 'late':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', text: 'Late' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-50 border-gray-200', text: 'Unknown' };
    }
  };

  const getAttendancePercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDay = (day) => {
    const dayAttendance = calendarData[day] || [];
    const hasClasses = dayAttendance.length > 0;
    
    if (!hasClasses) {
      return (
        <div className="h-20 p-2 border border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-400">{day}</div>
        </div>
      );
    }

    const presentCount = dayAttendance.filter(a => a.status === 'present').length;
    const totalCount = dayAttendance.length;
    const attendanceRate = (presentCount / totalCount) * 100;

    return (
      <div className={`h-20 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
        attendanceRate === 100 ? 'bg-green-25' : 
        attendanceRate >= 50 ? 'bg-yellow-25' : 'bg-red-25'
      }`}>
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium text-gray-900">{day}</div>
          <div className={`text-xs px-1.5 py-0.5 rounded-full ${
            attendanceRate === 100 ? 'bg-green-100 text-green-700' :
            attendanceRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {presentCount}/{totalCount}
          </div>
        </div>
        <div className="mt-1">
          <div className="flex flex-wrap gap-1">
            {dayAttendance.slice(0, 3).map((record, idx) => {
              const status = getAttendanceStatus(record.status);
              return (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  title={`${record.subject} - ${status.text}`}
                ></div>
              );
            })}
            {dayAttendance.length > 3 && (
              <div className="text-xs text-gray-500">+{dayAttendance.length - 3}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">My Attendance</h1>
        <p className="text-green-100">Track your class attendance and maintain good academic standing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
              <p className={`text-2xl font-semibold ${
                getAttendancePercentageColor(attendanceSummary.attendance_percentage || 0)
              }`}>
                {attendanceSummary.attendance_percentage ? 
                  `${attendanceSummary.attendance_percentage.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Classes Attended</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceSummary.total_present || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Classes Missed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceSummary.total_absent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Late Arrivals</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceSummary.total_late || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Warning */}
      {attendanceSummary.attendance_percentage < 75 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Low Attendance Warning</h3>
              <p className="text-sm text-red-700 mt-1">
                Your attendance is below the required 75% threshold. Please ensure regular attendance to avoid academic penalties.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Attendance Calendar - {months[selectedMonth]} {selectedYear}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 bg-gray-50"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, index) => (
              <div key={index + 1}>
                {renderCalendarDay(index + 1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      {attendanceSummary.subject_wise && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Subject-wise Attendance
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(attendanceSummary.subject_wise).map(([subject, data]) => (
                <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{subject}</h3>
                    <span className={`text-sm font-medium ${
                      getAttendancePercentageColor(data.percentage)
                    }`}>
                      {data.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${
                        data.percentage >= 90 ? 'bg-green-500' :
                        data.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className="font-medium text-green-600">{data.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent:</span>
                      <span className="font-medium text-red-600">{data.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Classes:</span>
                      <span className="font-medium">{data.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h2>
        </div>
        
        {attendanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.slice(0, 10).map((record, index) => {
                  const status = getAttendanceStatus(record.status);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {record.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.class_time || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No attendance records found</h3>
            <p>No attendance records match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
