// frontend/src/components/ResourceCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiEye, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import { getFileIcon, formatDate, truncateText } from '../utils/helpers';

const ResourceCard = ({ resource, onView, onDownload }) => {
  const fileIcon = getFileIcon(resource.file_url || resource.title);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-5 cursor-pointer group"
      onClick={() => onView?.(resource)}
    >
      {/* File Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 
                      dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl 
                      flex items-center justify-center text-2xl">
          {fileIcon}
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full ${
          resource.resource_type === 'syllabus' ? 'bg-blue-100 text-blue-700' :
          resource.resource_type === 'notes' ? 'bg-green-100 text-green-700' :
          resource.resource_type === 'question_paper' ? 'bg-purple-100 text-purple-700' :
          resource.resource_type === 'lab_schedule' ? 'bg-orange-100 text-orange-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {resource.resource_type?.replace('_', ' ')}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
        {truncateText(resource.title, 50)}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {truncateText(resource.description, 80)}
      </p>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <FiCalendar className="w-3 h-3" />
          {formatDate(resource.created_at)}
        </span>
        {resource.subject && (
          <span className="flex items-center gap-1">
            <FiTag className="w-3 h-3" />
            {resource.subject}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FiDownload className="w-3 h-3" />
          {resource.download_count || 0}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onView?.(resource); }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                   bg-gray-100 dark:bg-gray-700 rounded-lg text-sm
                   hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiEye className="w-4 h-4" /> View
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload?.(resource); }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                   bg-primary-500 text-white rounded-lg text-sm
                   hover:bg-primary-600 transition-colors"
        >
          <FiDownload className="w-4 h-4" /> Download
        </button>
      </div>
    </motion.div>
  );
};

export default ResourceCard;