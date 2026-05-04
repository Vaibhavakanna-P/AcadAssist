// frontend/src/pages/Analytics.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiClock, FiBook, FiTarget,
  FiCalendar, FiBarChart2, FiPieChart
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import PerformanceChart from '../components/PerformanceChart';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  const weeklyData = [
    { day: 'Mon', studyHours: 2.5, questions: 15, accuracy: 80, focus: 85 },
    { day: 'Tue', studyHours: 3.0, questions: 20, accuracy: 85, focus: 90 },
    { day: 'Wed', studyHours: 1.5, questions: 10, accuracy: 75, focus: 70 },
    { day: 'Thu', studyHours: 4.0, questions: 25, accuracy: 92, focus: 95 },
    { day: 'Fri', studyHours: 2.0, questions: 18, accuracy: 88, focus: 82 },
    { day: 'Sat', studyHours: 5.0, questions: 30, accuracy: 95, focus: 98 },
    { day: 'Sun', studyHours: 3.5, questions: 22, accuracy: 90, focus: 88 },
  ];

  const subjectData = [
    { subject: 'Math', score: 85, fullMark: 100 },
    { subject: 'Physics', score: 78, fullMark: 100 },
    { subject: 'Chemistry', score: 72, fullMark: 100 },
    { subject: 'CS', score: 92, fullMark: 100 },
    { subject: 'English', score: 88, fullMark: 100 },
  ];

  const topicDistribution = [
    { name: 'Algorithms', value: 30, color: '#3B82F6' },
    { name: 'Data Structures', value: 25, color: '#8B5CF6' },
    { name: 'Database', value: 20, color: '#10B981' },
    { name: 'Networking', value: 15, color: '#F59E0B' },
    { name: 'OS', value: 10, color: '#EF4444' },
  ];

  const studyPatternData = [
    { time: '6AM', hours: 0.5 },
    { time: '8AM', hours: 1.0 },
    { time: '10AM', hours: 2.5 },
    { time: '12PM', hours: 1.5 },
    { time: '2PM', hours: 2.0 },
    { time: '4PM', hours: 3.0 },
    { time: '6PM', hours: 2.5 },
    { time: '8PM', hours: 1.5 },
    { time: '10PM', hours: 1.0 },
  ];

  const stats = [
    { label: 'Total Study Hours', value: '45.5 hrs', change: '+12%', icon: FiClock, color: 'from-blue-500 to-cyan-500' },
    { label: 'Questions Solved', value: '178', change: '+25%', icon: FiBook, color: 'from-purple-500 to-pink-500' },
    { label: 'Avg Accuracy', value: '87%', change: '+8%', icon: FiTarget, color: 'from-green-500 to-emerald-500' },
    { label: 'Focus Score', value: '92/100', change: '+15%', icon: FiTrendingUp, color: 'from-orange-500 to-yellow-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">📊 Learning Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your progress and optimize your learning
        </p>
        
        {/* Time Range Selector */}
        <div className="flex justify-center gap-2 mt-4">
          {['week', 'month', 'semester'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl 
                            flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">{stat.value}</span>
                  <span className="text-xs text-green-500">{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Study Hours Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5" /> Study Hours Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="studyHours"
                stroke="#3B82F6"
                fill="url(#colorStudy)"
                strokeWidth={3}
              />
              <defs>
                <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Performance Radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiPieChart className="w-5 h-5" /> Subject Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={subjectData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
              <PolarRadiusAxis stroke="#9ca3af" fontSize={10} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5" /> Topic Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Study Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiClock className="w-5 h-5" /> Daily Study Pattern
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyPatternData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="hours" fill="url(#colorPattern)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="colorPattern" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Chart Component */}
      <PerformanceChart type="line" />

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 
                 dark:from-primary-900/20 dark:to-purple-900/20"
      >
        <h3 className="text-lg font-bold mb-4">💡 Personalized Recommendations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '🎯',
              title: 'Focus on Chemistry',
              description: 'Your chemistry scores are 15% below average. Try dedicating 2 extra hours this week.',
            },
            {
              icon: '⏰',
              title: 'Best Study Time',
              description: 'You perform best during 4PM-6PM. Schedule important topics during this window.',
            },
            {
              icon: '📈',
              title: 'Improvement Trend',
              description: 'Your overall accuracy improved by 8% this week. Keep up the consistent practice!',
            },
          ].map((rec, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <span className="text-2xl">{rec.icon}</span>
              <h4 className="font-semibold mt-2 mb-1">{rec.title}</h4>
              <p className="text-sm text-gray-500">{rec.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;