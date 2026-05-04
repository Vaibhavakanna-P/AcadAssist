// frontend/src/components/SyllabusViewer.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiClock, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

const SyllabusViewer = ({ syllabus }) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);

  const toggleTopic = (topicId) => {
    setCompletedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const calculateProgress = (unit) => {
    if (!unit?.topics?.length) return 0;
    const completed = unit.topics.filter(t => completedTopics.includes(t.id)).length;
    return Math.round((completed / unit.topics.length) * 100);
  };

  // Sample syllabus data
  const syllabusData = syllabus || {
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    units: [
      {
        id: 1,
        title: 'Introduction to Data Structures',
        topics: [
          { id: '1.1', title: 'What are Data Structures?', duration: '2 hours' },
          { id: '1.2', title: 'Types of Data Structures', duration: '3 hours' },
          { id: '1.3', title: 'Algorithm Analysis', duration: '4 hours' },
        ]
      },
      {
        id: 2,
        title: 'Arrays and Linked Lists',
        topics: [
          { id: '2.1', title: 'Array Operations', duration: '3 hours' },
          { id: '2.2', title: 'Singly Linked Lists', duration: '4 hours' },
          { id: '2.3', title: 'Doubly Linked Lists', duration: '3 hours' },
        ]
      },
    ]
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 
                      rounded-xl flex items-center justify-center">
          <FiBook className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{syllabusData.subject}</h3>
          <p className="text-sm text-gray-500">Course Code: {syllabusData.code}</p>
        </div>
      </div>

      {/* Units */}
      <div className="space-y-3">
        {syllabusData.units.map((unit) => (
          <motion.div
            key={unit.id}
            whileHover={{ scale: 1.01 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 
                       dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  calculateProgress(unit) === 100 ? 'bg-green-500' : 
                  calculateProgress(unit) > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                <div className="text-left">
                  <p className="font-medium">Unit {unit.id}: {unit.title}</p>
                  <p className="text-xs text-gray-500">
                    {unit.topics.length} topics • {calculateProgress(unit)}% complete
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: selectedUnit === unit.id ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {selectedUnit === unit.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
                    {unit.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className="flex items-center justify-between p-3 rounded-lg 
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 
                                 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center 
                                        justify-center transition-all ${
                            completedTopics.includes(topic.id)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {completedTopics.includes(topic.id) && (
                              <FiCheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={completedTopics.includes(topic.id) ? 
                            'line-through text-gray-400' : ''}>
                            {topic.title}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          {topic.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 
                    dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-sm text-primary-600 font-semibold">
            {Math.round(completedTopics.length / 
              syllabusData.units.reduce((acc, u) => acc + u.topics.length, 0) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all"
            style={{ width: `${Math.round(completedTopics.length / 
              syllabusData.units.reduce((acc, u) => acc + u.topics.length, 0) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SyllabusViewer;