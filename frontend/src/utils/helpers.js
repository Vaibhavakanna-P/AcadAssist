// frontend/src/utils/helpers.js
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getRandomColor = (seed) => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-yellow-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-pink-500 to-rose-500',
  ];
  const index = (seed?.length || 0) % colors.length;
  return colors[index];
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 20) return 'Good Evening';
  return 'Good Night';
};

export const getMotivationalQuote = () => {
  const quotes = [
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Education is the passport to the future.", author: "Malcolm X" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const icons = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    ppt: '📊',
    pptx: '📊',
    xls: '📗',
    xlsx: '📗',
    txt: '📄',
    csv: '📊',
    jpg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎥',
    mp3: '🎵',
    zip: '📦',
  };
  return icons[ext] || '📁';
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    hard: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  };
  return colors[difficulty?.toLowerCase()] || colors.medium;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};