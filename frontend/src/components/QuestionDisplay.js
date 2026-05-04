// frontend/src/components/QuestionDisplay.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiCopy, FiCheckCircle } from 'react-icons/fi';

const QuestionDisplay = ({ question, index, showAnswer = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-4 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Question Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 
                         dark:text-primary-300 text-xs font-bold px-2 py-1 rounded-full">
              Q{index + 1}
            </span>
            {question.type && (
              <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                {question.type.toUpperCase()}
              </span>
            )}
            {question.difficulty && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {question.difficulty}
              </span>
            )}
          </div>

          {/* Question Text */}
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-3">
            {question.question}
          </p>

          {/* MCQ Options */}
          {question.options && (
            <div className="space-y-2 mb-3">
              {question.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => setSelectedAnswer(optIndex)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedAnswer === optIndex
                      ? option === question.correct_answer
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                        : 'bg-red-100 dark:bg-red-900/30 border-red-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } border-2 ${
                    selectedAnswer === null ? 'border-transparent' : ''
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Answer Section */}
          <AnimatePresence>
            {isExpanded && question.answer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      Answer
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {question.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleCopy(question.question)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Copy question"
          >
            {copied ? <FiCheckCircle className="w-4 h-4 text-green-500" /> : 
                      <FiCopy className="w-4 h-4 text-gray-400" />}
          </button>
          {question.answer && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle answer"
            >
              {isExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : 
                           <FiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionDisplay;