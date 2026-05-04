import React, { useState } from 'react';
import { FiUsers, FiMessageCircle, FiHash, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LiveDiscussion = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState({
    1: [
      { user: 'System', text: 'Welcome to General Discussion!', time: '10:00 AM' },
      { user: 'Rahul', text: 'Does anyone have notes for CS301 Unit 3?', time: '10:15 AM' },
      { user: 'Priya', text: 'Yes, I can share them in the Resources section!', time: '10:16 AM' },
    ],
    2: [
      { user: 'System', text: 'Welcome to Data Structures Help!', time: '09:00 AM' },
      { user: 'Arun', text: 'Can someone explain AVL tree rotations?', time: '09:30 AM' },
    ],
    3: [
      { user: 'System', text: 'Welcome to Exam Preparation!', time: '08:00 AM' },
      { user: 'Sneha', text: 'When is the CS301 end semester exam?', time: '08:15 AM' },
    ],
  });
  const [newMessage, setNewMessage] = useState('');

  const rooms = [
    { 
      id: 1, 
      name: 'General Discussion', 
      online: 12, 
      topic: 'All Topics',
      color: 'from-blue-500 to-cyan-500',
      description: 'Chat about anything academic!'
    },
    { 
      id: 2, 
      name: 'Data Structures Help', 
      online: 5, 
      topic: 'CS301',
      color: 'from-purple-500 to-pink-500',
      description: 'Get help with DSA concepts and problems'
    },
    { 
      id: 3, 
      name: 'Exam Preparation', 
      online: 8, 
      topic: 'All Subjects',
      color: 'from-green-500 to-emerald-500',
      description: 'Discuss exam strategies and share tips'
    },
    { 
      id: 4, 
      name: 'Project Discussion', 
      online: 3, 
      topic: 'Projects',
      color: 'from-orange-500 to-yellow-500',
      description: 'Collaborate on projects and assignments'
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;
    
    const msg = {
      user: user?.full_name || 'You',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), msg]
    }));
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Live Discussion Forum</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rooms List */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiHash className="w-5 h-5 text-primary-500" />
              Discussion Rooms
            </h2>
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedRoom === room.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{room.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {room.online}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{room.description}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${room.color} text-white`}>
                    {room.topic}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Create Room Button */}
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2">
              <FiUserPlus className="w-4 h-4" />
              Create New Room
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <div className="card flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg">
                      {rooms.find(r => r.id === selectedRoom)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {rooms.find(r => r.id === selectedRoom)?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-green-600">
                      {rooms.find(r => r.id === selectedRoom)?.online} online
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(messages[selectedRoom] || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.user === 'System' ? 'justify-center' : ''}`}>
                    {msg.user === 'System' ? (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
                        <p className="text-xs text-gray-500">{msg.text}</p>
                      </div>
                    ) : (
                      <div className={`flex gap-3 max-w-[80%] ${msg.user === (user?.full_name || 'You') ? 'ml-auto' : ''}`}>
                        {msg.user !== (user?.full_name || 'You') && (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{msg.user[0]}</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{msg.user}</span>
                            <span className="text-xs text-gray-400">{msg.time}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl ${
                            msg.user === (user?.full_name || 'You')
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm outline-none border-2 border-transparent focus:border-primary-500"
                  />
                  <button type="submit" disabled={!newMessage.trim()}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors font-medium">
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-12 text-center flex flex-col items-center justify-center h-[600px]">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6">
                <FiMessageCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Select a Discussion Room</h2>
              <p className="text-gray-500 max-w-md">
                Choose a room from the left to start chatting with your peers. Discuss topics, share notes, and collaborate in real-time!
              </p>
              <div className="flex items-center gap-4 mt-6">
                <FiUsers className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {rooms.reduce((sum, r) => sum + r.online, 0)} students online across all rooms
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDiscussion;
