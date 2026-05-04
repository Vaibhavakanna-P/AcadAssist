// frontend/src/pages/Achievements.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrendingUp, FiLock, FiCheck } from 'react-icons/fi';
import { useStudy } from '../contexts/StudyContext';
import { ACHIEVEMENTS } from '../utils/constants';
import Confetti from 'react-confetti';

const Achievements = () => {
  const { achievements, studyStats } = useStudy();
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'streak', label: 'Streaks', icon: '🔥' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'social', label: 'Social', icon: '💬' },
  ];

  const earnedAchievements = achievements.map(a => a.id);
  
  const totalPoints = achievements.reduce((acc, a) => {
    const achDef = ACHIEVEMENTS.find(def => def.id === a.id);
    return acc + (achDef?.points || 0);
  }, 0);

  const nextAchievement = ACHIEVEMENTS.find(a => !earnedAchievements.includes(a.id));

  return (
    <div className="space-y-6 animate-fade-in">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4 inline-block"
        >
          🏆
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Achievements</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your progress and unlock rewards!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Points', value: totalPoints, icon: FiStar, color: 'from-yellow-500 to-orange-500' },
          { label: 'Achievements', value: `${earnedAchievements.length}/${ACHIEVEMENTS.length}`, icon: FiAward, color: 'from-purple-500 to-pink-500' },
          { label: 'Study Streak', value: `${studyStats.streak || 0} days`, icon: FiTrendingUp, color: 'from-green-500 to-emerald-500' },
          { label: 'Next Rank', value: getRank(totalPoints), icon: FiAward, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 text-center"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl 
                          flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement, index) => {
          const isEarned = earnedAchievements.includes(achievement.id);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={isEarned ? { scale: 1.02 } : {}}
              className={`card p-5 relative overflow-hidden ${
                !isEarned ? 'opacity-60 grayscale' : ''
              }`}
            >
              {/* Shine effect for earned achievements */}
              {isEarned && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
              )}

              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  isEarned
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {isEarned ? achievement.icon : <FiLock className="w-6 h-6 text-gray-400" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{achievement.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      ⭐ {achievement.points} points
                    </span>
                    {isEarned ? (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <FiCheck className="w-3 h-3" /> Earned
                      </span>
                    ) : (
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gray-400" style={{ width: '30%' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Achievement */}
      {nextAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 
                   dark:from-primary-900/20 dark:to-purple-900/20 text-center"
        >
          <p className="text-lg font-semibold mb-2">
            🎯 Next Achievement: {nextAchievement.title}
          </p>
          <p className="text-gray-500 mb-3">{nextAchievement.description}</p>
          <div className="w-48 mx-auto bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500" 
                 style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">60% complete</p>
        </motion.div>
      )}
    </div>
  );
};

const getRank = (points) => {
  if (points >= 500) return '🏅 Legend';
  if (points >= 300) return '🥇 Gold';
  if (points >= 200) return '🥈 Silver';
  if (points >= 100) return '🥉 Bronze';
  return '🌱 Beginner';
};

export default Achievements;