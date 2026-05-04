// frontend/src/components/AchievementBadge.js
import React from 'react';
import { motion } from 'framer-motion';

const AchievementBadge = ({ title, description, icon, color, earned = true, progress = 100 }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        earned
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
          : 'bg-gray-50 dark:bg-gray-700/50 opacity-60'
      }`}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-2xl ${
        earned ? 'shadow-lg' : 'grayscale'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
        {progress < 100 && (
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {earned && <span className="text-lg">✅</span>}
    </motion.div>
  );
};

export default AchievementBadge;