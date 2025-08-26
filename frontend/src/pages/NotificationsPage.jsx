import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { notificationsAPI } from '../services/api';
import { 
  Bell, 
  BellRing,
  Check, 
  CheckCheck,
  Filter,
  Search,
  Trash2,
  X,
  AlertTriangle,
  Info,
  MessageSquare,
  Calendar,
  Users,
  BookOpen,
  Award,
  Settings,
  MoreVertical
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications: wsNotifications } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, read
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    // Handle new notifications from WebSocket
    if (wsNotifications.length > 0) {
      const latestNotification = wsNotifications[wsNotifications.length - 1];
      setNotifications(prev => {
        // Avoid duplicates
        if (prev.find(n => n.id === latestNotification.id)) return prev;
        return [latestNotification, ...prev];
      });
    }
  }, [wsNotifications]);

  useEffect(() => {
    // Apply filters
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Read/Unread filter
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.read_at);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.read_at);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n.type === categoryFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterType, categoryFilter]);

  const loadNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications({ 
        page: pageNum,
        limit: 20 
      });
      
      if (pageNum === 1) {
        setNotifications(data.results || data);
      } else {
        setNotifications(prev => [...prev, ...(data.results || data)]);
      }
      
      setHasMore(data.has_more || data.next);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      await notificationsAPI.markAsRead(notificationIds);
      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) 
          ? { ...n, read_at: new Date().toISOString() }
          : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsUnread = async (notificationIds) => {
    try {
      await notificationsAPI.markAsUnread(notificationIds);
      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) 
          ? { ...n, read_at: null }
          : n
      ));
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const deleteNotifications = async (notificationIds) => {
    try {
      await notificationsAPI.deleteNotifications(notificationIds);
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      markAsRead([notification.id]);
    }
    
    // Handle navigation based on notification type
    if (notification.action_url) {
      window.location.href = notification.action_url;
    } else {
      // Default actions based on type
      switch (notification.type) {
        case 'message':
          window.location.href = '/messaging';
          break;
        case 'exam':
          window.location.href = '/student/exams';
          break;
        case 'assignment':
          window.location.href = '/student/assignments';
          break;
        case 'grade':
          window.location.href = '/student/grades';
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'exam':
      case 'assignment':
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'grade':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'attendance':
        return <Users className="h-5 w-5 text-orange-600" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-indigo-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50';
      case 'exam':
      case 'assignment':
        return 'bg-purple-50';
      case 'grade':
        return 'bg-green-50';
      case 'attendance':
        return 'bg-orange-50';
      case 'calendar':
        return 'bg-indigo-50';
      case 'system':
        return 'bg-gray-50';
      case 'warning':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellRing className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => markAsRead(selectedNotifications)}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Check className="h-4 w-4 mr-1 inline" />
                Mark Read
              </button>
              <button
                onClick={() => markAsUnread(selectedNotifications)}
                className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-4 w-4 mr-1 inline" />
                Mark Unread
              </button>
              <button
                onClick={() => deleteNotifications(selectedNotifications)}
                className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1 inline" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="message">Messages</option>
              <option value="exam">Exams</option>
              <option value="assignment">Assignments</option>
              <option value="grade">Grades</option>
              <option value="attendance">Attendance</option>
              <option value="calendar">Calendar</option>
              <option value="system">System</option>
            </select>

            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && notifications.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read_at ? 'bg-blue-25' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification.id]);
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  {/* Notification Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    getNotificationBgColor(notification.type)
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          notification.read_at ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          notification.read_at ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read_at && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read_at ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead([notification.id]);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsUnread([notification.id]);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as unread"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotifications([notification.id]);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
            <p>You're all caught up! Check back later for new notifications.</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="p-4 text-center border-t border-gray-100">
            <button
              onClick={() => loadNotifications(page + 1)}
              className="px-6 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {loading && notifications.length > 0 && (
          <div className="p-4 text-center border-t border-gray-100">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
