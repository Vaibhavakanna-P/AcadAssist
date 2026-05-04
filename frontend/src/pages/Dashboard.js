import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useStudy } from '../contexts/StudyContext';
import {
  FiBook, FiClock, FiTrendingUp, FiAward,
  FiArrowRight, FiCalendar, FiTarget
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import PomodoroTimer from '../components/PomodoroTimer';
import StudyStreak from '../components/StudyStreak';
import AchievementBadge from '../components/AchievementBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const { studyStats, recentActivity } = useStudy();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const weeklyData = [
    { day: 'Mon', hours: 2.5, questions: 15 },
    { day: 'Tue', hours: 3.0, questions: 20 },
    { day: 'Wed', hours: 1.5, questions: 10 },
    { day: 'Thu', hours: 4.0, questions: 25 },
    { day: 'Fri', hours: 2.0, questions: 18 },
    { day: 'Sat', hours: 5.0, questions: 30 },
    { day: 'Sun', hours: 3.5, questions: 22 },
  ];

  const subjectData = [
    { name: 'Mathematics', value: 35, color: '#3B82F6' },
    { name: 'Physics', value: 25, color: '#8B5CF6' },
    { name: 'Chemistry', value: 20, color: '#10B981' },
    { name: 'Computer Science', value: 20, color: '#F59E0B' },
  ];

  const quickActions = [
    { icon: '🤖', label: 'Ask AI', path: '/chatbot', color: 'from-blue-500 to-cyan-500' },
    { icon: '📝', label: 'Generate Quiz', path: '/generate', color: 'from-purple-500 to-pink-500' },
    { icon: '📚', label: 'Browse Notes', path: '/resources', color: 'from-green-500 to-emerald-500' },
    { icon: '💬', label: 'Discuss', path: '/discussions', color: 'from-orange-500 to-yellow-500' },
  ];

  const upcomingTasks = [
    { title: 'Mathematics Assignment', due: 'Tomorrow', priority: 'high', color: 'red' },
    { title: 'Physics Lab Report', due: 'In 2 days', priority: 'medium', color: 'yellow' },
    { title: 'CS Project Review', due: 'Next week', priority: 'low', color: 'green' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-white/80 text-lg">
              Ready to learn something new today?
            </p>
            <div className="flex gap-4 mt-4">
              <StudyStreak />
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <FiTarget className="w-4 h-4" />
                <span className="text-sm">Daily Goal: 3 hours</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {[
              { icon: '📚', value: '12', label: 'Resources' },
              { icon: '❓', value: '45', label: 'Questions' },
              { icon: '🔥', value: '7', label: 'Day Streak' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.path}
              className="card p-6 text-center hover:scale-105 transition-transform block group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl 
                           flex items-center justify-center mx-auto mb-3 text-2xl
                           group-hover:shadow-lg transition-all`}>
                {action.icon}
              </div>
              <p className="font-medium text-sm">{action.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Study Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">📈 Weekly Study Progress</h3>
            <select className="text-sm border rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-700">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="questions"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pomodoro Timer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <PomodoroTimer />
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Subject Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold mb-4">📊 Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {subjectData.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm">{subject.name}</span>
                </div>
                <span className="text-sm font-medium">{subject.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">📋 Upcoming Tasks</h3>
            <FiCalendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full bg-${task.color}-500`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">Due: {task.due}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full bg-${task.color}-100 text-${task.color}-700`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600 font-medium">
            View All Tasks →
          </button>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">🏆 Recent Achievements</h3>
            <Link to="/achievements" className="text-sm text-primary-500 hover:text-primary-600">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <AchievementBadge
              title="7-Day Streak"
              description="Consistent learning for a week!"
              icon="🔥"
              color="from-orange-500 to-red-500"
            />
            <AchievementBadge
              title="Question Master"
              description="Generated 100+ questions"
              icon="⭐"
              color="from-yellow-500 to-orange-500"
            />
            <AchievementBadge
              title="Knowledge Seeker"
              description="Accessed 50+ resources"
              icon="📚"
              color="from-blue-500 to-purple-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;