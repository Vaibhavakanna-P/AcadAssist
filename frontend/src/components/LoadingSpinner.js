// frontend/src/components/LoadingSpinner.js
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full`}
      />
      {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;