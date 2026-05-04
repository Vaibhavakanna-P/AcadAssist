import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { FiArrowRight, FiStar, FiShield, FiZap, FiUsers, FiTrendingUp, FiBookOpen, FiMessageCircle, FiEdit3, FiAward, FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    
    // Block second question if not logged in
    if (hasAsked && !user) {
      setChatMessages(prev => [...prev, 
        { type: 'user', content: userMsg },
        { type: 'bot', content: 'You have used your free question. Please register or login to ask unlimited questions!' }
      ]);
      return;
    }

    // Add user message immediately
    setChatMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      // Send with optional auth header
      const res = await api.post('/chatbot/chat', { message: userMsg }).catch(() => null);
      
      if (res && res.data && res.data.response) {
        setChatMessages(prev => [...prev, { type: 'bot', content: res.data.response }]);
        setHasAsked(true);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'I received your question about "' + userMsg + '". For detailed academic answers, please register or login to access the full AI assistant with your course materials!' 
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'I understand you are asking about "' + userMsg + '". For comprehensive academic answers, please register or login!' 
      }]);
    }
    setChatLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e);
    }
  };

  const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
    const [ref, inView] = useInView({ triggerOnce: true });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay }}
        className="card p-8 hover:scale-[1.02] cursor-pointer group"
      >
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </motion.div>
    );
  };

  const stats = [
    { icon: FiUsers, value: 10000, suffix: '+', label: 'Active Students' },
    { icon: FiBookOpen, value: 5000, suffix: '+', label: 'Study Resources' },
    { icon: FiMessageCircle, value: 100000, suffix: '+', label: 'Questions Answered' },
    { icon: FiTrendingUp, value: 95, suffix: '%', label: 'Success Rate' },
  ];

  return (
    <div className="-mt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-1/2 left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-accent-500/20 via-primary-500/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">AI-Powered Learning Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="gradient-text">Smart Learning</span>
              <br />
              <span className="text-gray-800 dark:text-white">Made Simple</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Empowering students with AI-driven learning. Access syllabi, generate questions, chat with AI tutors, and collaborate with peers—all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/register" className="btn-gradient text-lg px-8 py-4 inline-flex items-center gap-2">
                Get Started Free <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-8 justify-center mt-12"
            >
              <div className="flex items-center gap-2"><FiShield className="w-5 h-5 text-green-500" /><span className="text-sm text-gray-600 dark:text-gray-400">100% Free</span></div>
              <div className="flex items-center gap-2"><FiZap className="w-5 h-5 text-yellow-500" /><span className="text-sm text-gray-600 dark:text-gray-400">AI-Powered</span></div>
              <div className="flex items-center gap-2"><FiStar className="w-5 h-5 text-purple-500" /><span className="text-sm text-gray-600 dark:text-gray-400">4.9 Rating</span></div>
              <div className="flex items-center gap-2"><FiUsers className="w-5 h-5 text-blue-500" /><span className="text-sm text-gray-600 dark:text-gray-400">10,000+ Users</span></div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20"
          >
            <div className="glass rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-500" />
                    <div className="text-3xl font-bold mb-1">
                      <CountUp end={stat.value} duration={2.5} />
                      {stat.suffix}
                    </div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-all animate-glow"
        style={{ border: 'none', cursor: 'pointer' }}
      >
        {showChat ? <FiX size={24} /> : <span>AI</span>}
      </button>

      {/* AI Chat Popup */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-8 z-50 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">AI</div>
                  <div>
                    <p className="font-semibold text-sm">AI Study Assistant</p>
                    <p className="text-xs text-white/70">{!user ? 'Try 1 free question!' : 'Ask me anything!'}</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/20 rounded-lg">
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Ask me about syllabus, exams, or any academic topic!
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.type === 'user' 
                      ? 'bg-primary-500 text-white rounded-br-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasAsked && !user ? "Login to ask more..." : "Type your question..."}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm outline-none border-none"
                  disabled={hasAsked && !user}
                />
                <button 
                  onClick={handleChatSubmit}
                  disabled={chatLoading || !chatInput.trim() || (hasAsked && !user)}
                  className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <FiSend size={16} />
                </button>
              </div>
              {hasAsked && !user && (
                <div className="mt-3 text-center">
                  <button onClick={() => navigate('/register')} className="text-xs text-primary-500 hover:underline font-medium bg-transparent border-none cursor-pointer">
                    Register
                  </button>
                  <span className="text-xs text-gray-400"> or </span>
                  <button onClick={() => navigate('/login')} className="text-xs text-primary-500 hover:underline font-medium bg-transparent border-none cursor-pointer">
                    Login
                  </button>
                  <span className="text-xs text-gray-400"> for unlimited questions!</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">AcadAssist?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to excel in your academic journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={FiMessageCircle} title="AI Chatbot" description="Get instant answers with our Qwen LLM-powered chatbot" color="from-blue-500 to-cyan-500" delay={0} />
            <FeatureCard icon={FiEdit3} title="Question Generator" description="Auto-generate practice questions from your study materials" color="from-purple-500 to-pink-500" delay={0.1} />
            <FeatureCard icon={FiBookOpen} title="Centralized Resources" description="Access syllabi, notes, previous papers in one place" color="from-green-500 to-emerald-500" delay={0.2} />
            <FeatureCard icon={FiUsers} title="Live Discussions" description="Collaborate with peers in real-time chat rooms" color="from-orange-500 to-yellow-500" delay={0.3} />
            <FeatureCard icon={FiAward} title="Achievements" description="Earn badges and track your progress" color="from-red-500 to-rose-500" delay={0.4} />
            <FeatureCard icon={FiTrendingUp} title="Analytics" description="Track study patterns and optimize learning" color="from-indigo-500 to-purple-500" delay={0.5} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Join thousands of students already using AcadAssist</p>
            <Link to="/register" className="btn-gradient text-lg px-10 py-4 inline-flex items-center gap-2">
              Start Learning Now <FiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
