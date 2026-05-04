# frontend/debug_chatbot.py
import os
path = r'src\pages\Chatbot.js'
content = '''import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiSend, FiArrowLeft } from 'react-icons/fi';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I am your AI academic assistant. Ask me anything about your courses, syllabus, or exams!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgEnd = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || loading) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    
    try {
      console.log('Sending to API:', userMsg);
      const res = await api.post('/chatbot/chat', { message: userMsg });
      
      console.log('API Response type:', typeof res.data);
      console.log('API Response keys:', Object.keys(res.data));
      console.log('API Response:', res.data);
      
      // Get the response text
      let botResponse = '';
      if (res.data && res.data.response) {
        botResponse = res.data.response;
        console.log('Got response from res.data.response, length:', botResponse.length);
      } else if (res.data && typeof res.data === 'string') {
        botResponse = res.data;
        console.log('Got response from res.data string');
      } else if (res.data && res.data.detail) {
        botResponse = res.data.detail;
        console.log('Got detail from res.data.detail');
      } else {
        botResponse = JSON.stringify(res.data);
        console.log('Stringified res.data');
      }
      
      if (botResponse && botResponse.length > 10) {
        setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', content: 'Response was empty. Please try again.' }]);
      }
    } catch (err) {
      console.error('Error:', err);
      console.error('Error response:', err.response);
      setMessages(prev => [...prev, { type: 'bot', content: 'Network error. Check if backend is running.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -mt-4">
      <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r p-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-4">
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <p className="text-xs text-gray-400">Ask about any academic topic. The AI will provide detailed explanations.</p>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-gray-800 border-b p-4">
          <h1 className="font-bold text-lg">AI Academic Assistant</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.type === 'user' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={msgEnd} />
        </div>

        <form onSubmit={send} className="bg-white dark:bg-gray-800 border-t p-4">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..." className="input-field" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-6">
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
'''

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Chatbot with debug logs created!')