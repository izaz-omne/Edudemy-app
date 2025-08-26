import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen,
  Calendar,
  Clock,
  X,
  Save,
  User,
  GraduationCap,
  MapPin
} from 'lucide-react';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    teacherId: '',
    maxCapacity: '',
    schedule: '',
    startDate: '',
    endDate: '',
    room: '',
    fees: '',
    status: 'Active'
  });

  // Mock data - replace with real API calls
  const mockBatches = [
    {
      id: 1,
      name: 'Computer Science A',
      subject: 'Computer Science',
      description: 'Advanced computer science concepts including algorithms and data structures',
      teacher: 'Dr. Sarah Wilson',
      teacherId: 1,
      currentStudents: 24,
      maxCapacity: 30,
      schedule: 'Mon, Wed, Fri - 09:00 AM',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      room: 'Room 101',
      fees: 5000,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mathematics B',
      subject: 'Mathematics',
      description: 'Calculus and advanced mathematical concepts',
      teacher: 'Prof. John Smith',
      teacherId: 2,
      currentStudents: 22,
      maxCapacity: 25,
      schedule: 'Tue, Thu - 11:00 AM',
      startDate: '2024-02-01',
      endDate: '2024-07-01',
      room: 'Room 203',
      fees: 4500,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Physics C',
      subject: 'Physics',
      description: 'Quantum physics and modern physics concepts',
      teacher: 'Dr. Emily Davis',
      teacherId: 3,
      currentStudents: 18,
      maxCapacity: 20,
      schedule: 'Mon, Wed - 02:00 PM',
      startDate: '2024-01-20',
      endDate: '2024-06-20',
      room: 'Lab 205',
      fees: 5500,
      status: 'Active'
    },
    {
      id: 4,
      name: 'Chemistry D',
      subject: 'Chemistry',
      description: 'Organic chemistry fundamentals',
      teacher: 'Prof. Michael Brown',
      teacherId: 4,
      currentStudents: 0,
      maxCapacity: 25,
      schedule: 'Tue, Fri - 03:00 PM',
      startDate: '2024-03-01',
      endDate: '2024-08-01',
      room: 'Lab 301',
      fees: 4800,
      status: 'Draft'
    }
  ];

  const mockTeachers = [
    { id: 1, name: 'Dr. Sarah Wilson', subject: 'Computer Science' },
    { id: 2, name: 'Prof. John Smith', subject: 'Mathematics' },
    { id: 3, name: 'Dr. Emily Davis', subject: 'Physics' },
    { id: 4, name: 'Prof. Michael Brown', subject: 'Chemistry' },
    { id: 5, name: 'Dr. Lisa Johnson', subject: 'Biology' },
  ];

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBatches(mockBatches);
      setTeachers(mockTeachers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBatch = () => {
    setEditingBatch(null);
    setFormData({
      name: '',
      subject: '',
      description: '',
      teacherId: '',
      maxCapacity: '',
      schedule: '',
      startDate: '',
      endDate: '',
      room: '',
      fees: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setFormData({
      ...batch,
      teacherId: batch.teacherId.toString()
    });
    setShowModal(true);
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      setBatches(batches.filter(b => b.id !== batchId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedTeacher = teachers.find(t => t.id === parseInt(formData.teacherId));
    
    if (editingBatch) {
      // Update existing batch
      setBatches(batches.map(b => 
        b.id === editingBatch.id 
          ? { 
              ...formData, 
              id: editingBatch.id, 
              teacher: selectedTeacher?.name || '',
              teacherId: parseInt(formData.teacherId),
              currentStudents: editingBatch.currentStudents,
              maxCapacity: parseInt(formData.maxCapacity),
              fees: parseFloat(formData.fees)
            } 
          : b
      ));
    } else {
      // Add new batch
      const newBatch = {
        ...formData,
        id: Date.now(),
        teacher: selectedTeacher?.name || '',
        teacherId: parseInt(formData.teacherId),
        currentStudents: 0,
        maxCapacity: parseInt(formData.maxCapacity),
        fees: parseFloat(formData.fees)
      };
      setBatches([...batches, newBatch]);
    }
    
    setShowModal(false);
    setEditingBatch(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Draft': return 'status-pending';
      case 'Completed': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const getCapacityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
            <p className="text-gray-600">Create and manage student batches and classes</p>
          </div>
          <button
            onClick={handleAddBatch}
            className="btn-primary inline-flex items-center px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Create New Batch
          </button>
        </div>

        {/* Search */}
        <div className="card p-6">
          <div className="relative max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches by name, subject, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            filteredBatches.map((batch) => (
              <div key={batch.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{batch.name}</h3>
                    <p className="text-sm text-gray-600">{batch.subject}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{batch.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-2" />
                    {batch.teacher}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    {batch.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    {batch.room}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Students: </span>
                    <span className={`font-medium ${getCapacityColor(batch.currentStudents, batch.maxCapacity)}`}>
                      {batch.currentStudents}/{batch.maxCapacity}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${batch.fees.toLocaleString()}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full ${
                      (batch.currentStudents / batch.maxCapacity) * 100 >= 90
                        ? 'bg-red-500'
                        : (batch.currentStudents / batch.maxCapacity) * 100 >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(batch.currentStudents / batch.maxCapacity) * 100}%` }}
                  ></div>
                </div>

                <div className="flex space-x-2">
                  <button className="btn-primary text-sm flex-1 py-2">
                    <Users size={16} className="mr-1" />
                    View Students
                  </button>
                  <button
                    onClick={() => handleEditBatch(batch)}
                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batch.id)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredBatches.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first batch.'
              }
            </p>
            {!searchTerm && (
              <button onClick={handleAddBatch} className="btn-primary">
                <Plus size={20} className="mr-2" />
                Create First Batch
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="e.g., Computer Science A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-field"
                      placeholder="Brief description of the batch curriculum and objectives"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher *</label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                    <input
                      type="number"
                      name="maxCapacity"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule *</label>
                    <input
                      type="text"
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="e.g., Mon, Wed, Fri - 09:00 AM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room/Location *</label>
                    <input
                      type="text"
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="e.g., Room 101 or Lab 205"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Fees *</label>
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary inline-flex items-center">
                    <Save size={20} className="mr-2" />
                    {editingBatch ? 'Update Batch' : 'Create Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
