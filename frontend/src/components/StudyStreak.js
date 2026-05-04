// frontend/src/components/StudyStreak.js
import React from 'react';
import { motion } from 'framer-motion';

const StudyStreak = ({ streak = 7, visible = true }) => {
  if (!visible) return null;
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = [true, true, true, true, true, true, true];
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 
                 rounded-full px-3 py-1.5"
    >
      <span className="text-lg">🔥</span>
      <div className="flex gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              completedDays[index]
                ? 'bg-gradient-to-b from-orange-400 to-red-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
        {streak} days
      </span>
    </motion.div>
  );
};

export default StudyStreak;