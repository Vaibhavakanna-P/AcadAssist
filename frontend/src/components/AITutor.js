// frontend/src/components/AITutor.js
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiBookOpen, FiHelpCircle, FiRefreshCw, FiStar } from 'react-icons/fi';

const AITutor = ({ subject = 'General' }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'tutor', 
      content: `Hello! I'm your AI Tutor for **${subject}**. I can help you with:
- 📚 Explaining concepts
- ✍️ Solving problems
- 📝 Reviewing answers
- 🎯 Practice questions

What would you like to learn today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState('explain');
  const messagesEndRef = useRef(null);

  const modes = [
    { id: 'explain', icon: FiBookOpen, label: 'Explain', color: 'from-blue-500 to-cyan-500' },
    { id: 'solve', icon: FiHelpCircle, label: 'Solve', color: 'from-purple-500 to-pink-500' },
    { id: 'practice', icon: FiStar, label: 'Practice', color: 'from-green-500 to-emerald-500' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        explain: `Here's an explanation of **${input}**:

This concept is fundamental to understanding ${subject}. Let me break it down:

1. **Key Definition**: ${input} refers to...
2. **Why it matters**: Understanding this helps with...
3. **Related concepts**: It connects to...

Would you like me to elaborate on any part?`,

        solve: `Let's solve this step by step:

**Problem**: ${input}

**Step 1**: Identify what we know
**Step 2**: Apply the formula
**Step 3**: Calculate the result

**Final Answer**: The solution is...

Would you like to see more examples?`,

        practice: `Great! Here are some practice questions about **${input}**:

1. **Easy**: Basic application of the concept
2. **Medium**: Requires combining multiple concepts
3. **Hard**: Complex problem-solving needed

Try solving these and I'll check your answers!`
      };

      setMessages(prev => [...prev, { 
        type: 'tutor', 
        content: responses[tutorMode] || responses.explain 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="card h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl 
                        flex items-center justify-center">
            <span className="text-white text-xl">🧠</span>
          </div>
          <div>
            <h3 className="font-bold">AI Tutor</h3>
            <p className="text-xs text-gray-500">{subject}</p>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTutorMode(mode.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tutorMode === mode.id
                  ? `bg-white dark:bg-gray-600 shadow-sm text-primary-600`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <mode.icon className="w-3 h-3" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.type === 'user'
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask me to ${tutorMode} something...`}
            className="flex-1 input-field text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AITutor;