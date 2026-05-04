// frontend/src/components/LiveChatBox.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSend, FiX, FiMessageCircle, FiMinus, FiMaximize2 } from 'react-icons/fi';
import websocketService from '../services/websocket';

const LiveChatBox = ({ roomId, roomName, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.connect(roomId, token);
      
      websocketService.on('chat', (data) => {
        setMessages(prev => [...prev, { ...data, id: Date.now() }]);
        if (isMinimized && data.userId !== currentUser?.id) {
          setUnreadCount(prev => prev + 1);
        }
      });
      
      websocketService.on('system', (data) => {
        setMessages(prev => [...prev, { ...data, id: Date.now(), type: 'system' }]);
      });
      
      websocketService.on('users', (data) => {
        setOnlineUsers(data.users || []);
      });
      
      websocketService.on('typing', (data) => {
        // Handle typing indicator
        console.log(`${data.username} is typing...`);
      });
    }
    
    return () => {
      websocketService.disconnect();
    };
  }, [roomId, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const messageData = {
      type: 'chat',
      content: input.trim(),
      userId: currentUser?.id,
      username: currentUser?.full_name || currentUser?.username,
      timestamp: new Date().toISOString(),
      roomId: roomId
    };
    
    websocketService.send(messageData);
    
    // Add message locally for immediate feedback
    setMessages(prev => [...prev, { ...messageData, id: Date.now(), local: true }]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-yellow-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
    ];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {isMinimized && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMinimize}
          className="relative bg-gradient-to-r from-primary-500 to-primary-600 
                   text-white p-4 rounded-full shadow-2xl hover:shadow-primary-500/40"
        >
          <FiMessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                           text-xs flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                     border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold text-sm">{roomName || 'Discussion Room'}</h3>
                    <p className="text-xs text-white/80">
                      {onlineUsers.length} online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => websocketService.disconnect()}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Online Users */}
              {onlineUsers.length > 0 && (
                <div className="flex -space-x-2 mt-2">
                  {onlineUsers.slice(0, 5).map((user, index) => (
                    <div
                      key={index}
                      className={`w-7 h-7 bg-gradient-to-br ${getAvatarColor(user.name || user)} 
                                 rounded-full border-2 border-white flex items-center justify-center`}
                      title={user.name || user}
                    >
                      <span className="text-white text-xs font-medium">
                        {getInitials(user.name || user)}
                      </span>
                    </div>
                  ))}
                  {onlineUsers.length > 5 && (
                    <div className="w-7 h-7 bg-gray-400 rounded-full border-2 border-white 
                                  flex items-center justify-center">
                      <span className="text-white text-xs">+{onlineUsers.length - 5}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.userId === currentUser?.id ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.type === 'system' ? 'justify-center' : 
                      message.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'system' ? (
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{message.content}</p>
                      </div>
                    ) : (
                      <div className={`max-w-[80%] ${message.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                        {/* Username for others */}
                        {message.userId !== currentUser?.id && (
                          <p className="text-xs text-gray-500 ml-1 mb-1">{message.username}</p>
                        )}
                        
                        {/* Message Bubble */}
                        <div
                          className={`px-3 py-2 rounded-2xl ${
                            message.userId === currentUser?.id
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.userId === currentUser?.id ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Emit typing event
                    websocketService.send({
                      type: 'typing',
                      userId: currentUser?.id,
                      username: currentUser?.full_name
                    });
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl 
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 
                           text-white rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveChatBox;