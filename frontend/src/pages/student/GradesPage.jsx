import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicsAPI } from '../../services/api';
import { 
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Calendar,
  Target,
  BarChart3,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';

export default function GradesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [gradesSummary, setGradesSummary] = useState({});
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    loadGradesData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [grades, selectedSemester, selectedSubject, searchQuery]);

  const loadGradesData = async () => {
    try {
      setLoading(true);
      const [gradesData, summaryData] = await Promise.all([
        academicsAPI.getStudentGrades(),
        academicsAPI.getGradesSummary()
      ]);

      setGrades(gradesData.results || gradesData);
      setGradesSummary(summaryData);

      // Extract unique subjects and semesters for filters
      const uniqueSubjects = [...new Set((gradesData.results || gradesData).map(g => g.subject))];
      const uniqueSemesters = [...new Set((gradesData.results || gradesData).map(g => g.semester))];
      
      setSubjects(uniqueSubjects);
      setSemesters(uniqueSemesters);
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = grades;

    if (selectedSemester !== 'all') {
      filtered = filtered.filter(g => g.semester === selectedSemester);
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(g => g.subject === selectedSubject);
    }

    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.exam_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGrades(filtered);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getPerformanceTrend = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 5) return { icon: TrendingUp, color: 'text-green-600', text: 'Improving' };
    if (diff < -5) return { icon: TrendingDown, color: 'text-red-600', text: 'Declining' };
    return { icon: Target, color: 'text-gray-600', text: 'Stable' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0
    };
    const total = grades.reduce((sum, g) => sum + (gradePoints[g.grade] || 0), 0);
    return (total / grades.length).toFixed(2);
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">My Grades</h1>
        <p className="text-blue-100">Track your academic performance across all subjects</p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall GPA</p>
              <p className="text-2xl font-semibold text-gray-900">
                {gradesSummary.overall_gpa || calculateGPA(grades) || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {gradesSummary.average_percentage ? 
                  `${gradesSummary.average_percentage.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subjects</p>
              <p className="text-2xl font-semibold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Exams</p>
              <p className="text-2xl font-semibold text-gray-900">{grades.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      {gradesSummary.subject_wise && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Subject-wise Performance
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(gradesSummary.subject_wise).map(([subject, data]) => {
                const trend = getPerformanceTrend(data.current_average, data.previous_average);
                return (
                  <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{subject}</h3>
                      {trend && (
                        <div className={`flex items-center ${trend.color}`}>
                          <trend.icon className="h-4 w-4 mr-1" />
                          <span className="text-xs">{trend.text}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium">{data.average_percentage?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Best Grade:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          getGradeColor(data.best_grade)
                        }`}>
                          {data.best_grade}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Exams:</span>
                        <span className="font-medium">{data.exam_count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Grades</h2>
        </div>
        
        {filteredGrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.exam_title || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.exam_type || 'Exam'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {grade.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(grade.exam_date || grade.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.marks_obtained || 0}/{grade.max_marks || 100}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.percentage ? `${grade.percentage.toFixed(1)}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        getGradeColor(grade.grade)
                      }`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.location.href = `/student/grades/${grade.id}`}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/api/grades/${grade.id}/report`, '_blank')}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No grades found</h3>
            <p>No grades match your current filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
