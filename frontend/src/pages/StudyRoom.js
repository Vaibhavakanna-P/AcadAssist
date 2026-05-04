// frontend/src/pages/StudyRoom.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMusic, FiBook, FiTarget, FiCoffee, FiVolume2 } from 'react-icons/fi';
import PomodoroTimer from '../components/PomodoroTimer';
import AITutor from '../components/AITutor';
import { STUDY_TIPS } from '../utils/constants';
import { getMotivationalQuote } from '../utils/helpers';

const StudyRoom = () => {
  const [activeTab, setActiveTab] = useState('pomodoro');
  const [quote] = useState(getMotivationalQuote());
  const [selectedAmbience, setSelectedAmbience] = useState(null);

  const tabs = [
    { id: 'pomodoro', icon: FiClock, label: 'Pomodoro' },
    { id: 'tutor', icon: FiBook, label: 'AI Tutor' },
    { id: 'tips', icon: FiTarget, label: 'Study Tips' },
  ];

  const ambienceSounds = [
    { id: 'rain', name: 'Rain', icon: '🌧️' },
    { id: 'cafe', name: 'Cafe', icon: '☕' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'lofi', name: 'Lo-fi', icon: '🎵' },
    { id: 'whitenoise', name: 'White Noise', icon: '📡' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">📚 Focus Study Room</h1>
        <p className="text-gray-500 dark:text-gray-400 italic">"{quote.text}" — {quote.author}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'pomodoro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PomodoroTimer />
              </div>
              
              {/* Ambience Sounds */}
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiMusic className="w-5 h-5" /> Ambience
                </h3>
                <div className="space-y-2">
                  {ambienceSounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setSelectedAmbience(
                        selectedAmbience === sound.id ? null : sound.id
                      )}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        selectedAmbience === sound.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-2xl">{sound.icon}</span>
                      <span className="font-medium">{sound.name}</span>
                      {selectedAmbience === sound.id && (
                        <FiVolume2 className="w-4 h-4 ml-auto animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 
                              dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <h4 className="font-semibold mb-3">Today's Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Focus Sessions</span>
                      <span className="font-bold">3/4</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                           style={{ width: '75%' }} />
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                      <span>Study Time</span>
                      <span className="font-bold">2.5 hrs</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" 
                           style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tutor' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AITutor subject="General" />
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <FiTarget className="w-5 h-5" /> Effective Study Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {STUDY_TIPS.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 
                             rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 
                                  rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyRoom;