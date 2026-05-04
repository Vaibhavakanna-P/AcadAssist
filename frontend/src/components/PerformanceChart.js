// frontend/src/components/PerformanceChart.js
import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const PerformanceChart = ({ data, type = 'line' }) => {
  const [timeRange, setTimeRange] = useState('week');
  
  const weeklyData = [
    { day: 'Mon', score: 75, questions: 20, accuracy: 80 },
    { day: 'Tue', score: 82, questions: 25, accuracy: 85 },
    { day: 'Wed', score: 78, questions: 18, accuracy: 82 },
    { day: 'Thu', score: 90, questions: 30, accuracy: 92 },
    { day: 'Fri', score: 85, questions: 22, accuracy: 88 },
    { day: 'Sat', score: 95, questions: 35, accuracy: 95 },
    { day: 'Sun', score: 88, questions: 28, accuracy: 90 },
  ];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={weeklyData}>
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
            <Legend />
            <Bar dataKey="score" fill="url(#colorScore)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="accuracy" fill="url(#colorAccuracy)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>
            </defs>
          </BarChart>
        );
      
      case 'area':
        return (
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
            <Legend />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              fill="url(#colorArea)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        );
      
      default:
        return (
          <LineChart data={weeklyData}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#3B82F6' }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#10B981' }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">📈 Performance Analytics</h3>
        <div className="flex gap-2">
          {['week', 'month', 'semester'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
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
      
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-green-600">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-lg font-bold">+12%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Improvement</p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="text-lg font-bold text-blue-600">85%</div>
          <p className="text-xs text-gray-500 mt-1">Accuracy</p>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="text-lg font-bold text-purple-600">178</div>
          <p className="text-xs text-gray-500 mt-1">Questions Solved</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;