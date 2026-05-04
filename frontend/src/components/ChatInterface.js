// frontend/src/components/ChatInterface.js
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip, FiSmile, FiMic, FiCopy, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ messages, onSendMessage, isLoading, placeholder = "Type your message..." }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''}`}>
                {/* Avatar for bot */}
                {message.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-1 ml-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">AI</span>
                    </div>
                    <span className="text-xs text-gray-500">AI Assistant</span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                  }`}
                >
                  {message.type === 'bot' ? (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                
                {/* Actions */}
                {message.type === 'bot' && (
                  <div className="flex items-center gap-2 mt-1 ml-1">
                    <button 
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiCopy className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <FiThumbsUp className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <FiThumbsDown className="w-3 h-3 text-gray-400" />
                    </button>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
          <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
            <FiPaperclip className="w-5 h-5 text-gray-500" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-full transition-all ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FiMic className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 
                     text-white rounded-full transition-all disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;