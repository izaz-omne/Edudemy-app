import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const WS_BASE_URL = 'ws://localhost:8000';

export const useWebSocket = () => {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/messaging/ws/${user.id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [user?.id]);

  const handleIncomingMessage = useCallback((data) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, {
          id: data.message_id,
          sender_id: data.sender_id,
          sender_name: data.sender_name,
          content: data.content,
          sent_at: data.sent_at,
          type: 'direct'
        }]);
        break;
        
      case 'new_group_message':
        setMessages(prev => [...prev, {
          id: data.message_id,
          group_id: data.group_id,
          sender_id: data.sender_id,
          sender_name: data.sender_name,
          content: data.content,
          sent_at: data.sent_at,
          type: 'group'
        }]);
        break;
        
      case 'notification':
        setNotifications(prev => [...prev, {
          id: data.notification_id || Date.now(),
          title: data.title,
          message: data.message,
          type: data.notification_type,
          created_at: data.created_at || new Date().toISOString(),
          is_read: false
        }]);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const sendMessage = useCallback((messageData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
  }, []);

  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    messages,
    notifications,
    sendMessage,
    clearMessages,
    clearNotifications,
    markNotificationAsRead,
    reconnect: connect
  };
};

export default useWebSocket;
