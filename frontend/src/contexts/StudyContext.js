// frontend/src/contexts/StudyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const StudyContext = createContext();

export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  const { user } = useAuth();
  const [studyStats, setStudyStats] = useState({
    totalHours: 0,
    questionsGenerated: 0,
    resourcesAccessed: 0,
    streak: 0,
    lastStudyDate: null,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);

  useEffect(() => {
    if (user) {
      const savedStats = localStorage.getItem(`studyStats_${user.id}`);
      if (savedStats) {
        setStudyStats(JSON.parse(savedStats));
      }
      
      const savedAchievements = localStorage.getItem(`achievements_${user.id}`);
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
    }
  }, [user]);

  const updateStudyStats = (updates) => {
    setStudyStats(prev => {
      const newStats = { ...prev, ...updates };
      if (user) {
        localStorage.setItem(`studyStats_${user.id}`, JSON.stringify(newStats));
      }
      return newStats;
    });
  };

  const addActivity = (activity) => {
    setRecentActivity(prev => [activity, ...prev].slice(0, 50));
  };

  const unlockAchievement = (achievement) => {
    setAchievements(prev => {
      if (prev.find(a => a.id === achievement.id)) return prev;
      const newAchievements = [...prev, { ...achievement, earnedAt: new Date().toISOString() }];
      if (user) {
        localStorage.setItem(`achievements_${user.id}`, JSON.stringify(newAchievements));
      }
      return newAchievements;
    });
  };

  const incrementPomodoro = () => {
    setPomodoroSessions(prev => prev + 1);
    updateStudyStats({ totalHours: studyStats.totalHours + 0.5 });
    
    if (pomodoroSessions + 1 >= 10) {
      unlockAchievement({
        id: 'pomodoro_master',
        title: 'Pomodoro Master',
        description: 'Complete 10 Pomodoro sessions',
        icon: '🍅'
      });
    }
  };

  return (
    <StudyContext.Provider value={{
      studyStats,
      recentActivity,
      achievements,
      pomodoroSessions,
      updateStudyStats,
      addActivity,
      unlockAchievement,
      incrementPomodoro,
    }}>
      {children}
    </StudyContext.Provider>
  );
};