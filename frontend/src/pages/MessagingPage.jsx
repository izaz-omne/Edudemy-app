import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { messagingAPI } from '../services/api';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus,
  Users,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  X,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';

export default function MessagingPage() {
  const { user } = useAuth();
  const { sendMessage, messages: wsMessages } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Handle WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const latestMessage = wsMessages[wsMessages.length - 1];
      if (selectedChat && latestMessage.group_id === selectedChat.id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === latestMessage.id)) return prev;
          return [...prev, latestMessage];
        });
      }
      // Update chat list with latest message
      setChats(prev => prev.map(chat => {
        if (chat.id === latestMessage.group_id) {
          return {
            ...chat,
            last_message: latestMessage.content,
            last_message_at: latestMessage.created_at,
            unread_count: chat.id === selectedChat?.id ? 0 : (chat.unread_count || 0) + 1
          };
        }
        return chat;
      }));
    }
  }, [wsMessages, selectedChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await messagingAPI.getChats();
      setChats(chatsData.results || chatsData);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const messagesData = await messagingAPI.getMessages(chatId);
      setMessages(messagesData.results || messagesData);
      // Mark messages as read
      await messagingAPI.markAsRead(chatId);
      // Update unread count in chat list
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unread_count: 0 } : chat
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      group_id: selectedChat.id,
      content: newMessage.trim()
    };

    try {
      const sentMessage = await messagingAPI.sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Send via WebSocket for real-time delivery
      sendMessage(messageData);
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { 
              ...chat, 
              last_message: messageData.content,
              last_message_at: new Date().toISOString()
            }
          : chat
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender_id !== user.id) return null;
    
    if (message.read_by && message.read_by.length > 1) {
      return <CheckCheck className="h-4 w-4 text-blue-600" />;
    } else if (message.delivered) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => 
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowGroupChat(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="New Group Chat"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="New Chat"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {chat.is_group ? (
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {chat.name?.charAt(0).toUpperCase() || 
                             chat.participants?.[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      {chat.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {chat.unread_count > 9 ? '9+' : chat.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.name || 
                           chat.participants?.find(p => p.id !== user.id)?.full_name || 
                           'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.last_message_at || chat.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chat.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedChat.is_group ? (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {selectedChat.name?.charAt(0).toUpperCase() || 
                         selectedChat.participants?.[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedChat.name || 
                       selectedChat.participants?.find(p => p.id !== user.id)?.full_name || 
                       'Unknown User'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedChat.is_group 
                        ? `${selectedChat.participants?.length || 0} members`
                        : 'Online'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user.id;
                const showAvatar = !isOwn && (
                  index === 0 || 
                  messages[index - 1].sender_id !== message.sender_id
                );

                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-2`}
                  >
                    {!isOwn && (
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isOwn && selectedChat.is_group && showAvatar && (
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {message.sender?.full_name || 'Unknown User'}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center mt-1 space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 bg-gray-100'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Welcome to Messages</h3>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
