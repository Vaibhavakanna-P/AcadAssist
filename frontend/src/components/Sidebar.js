import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiMessageSquare, FiBook, FiEdit3, FiUsers, FiClock, FiAward, FiBarChart2, FiX, FiUpload, FiFile, FiFolder, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDocs, setUserDocs] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('notes');
  const [expandedCat, setExpandedCat] = useState(null);

  const categories = [
    { id: 'syllabus', label: 'Syllabus', icon: '📋' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'question_papers', label: 'Question Papers', icon: '📄' },
    { id: 'lab_manuals', label: 'Lab Manuals', icon: '🔬' },
  ];

  useEffect(() => {
    if (user) fetchAllDocs();
  }, [user]);

  const fetchAllDocs = async () => {
    try {
      const res = await api.get('/upload/documents');
      const grouped = {};
      (res.data.documents || []).forEach(doc => {
        if (!grouped[doc.category]) grouped[doc.category] = [];
        grouped[doc.category].push(doc);
      });
      setUserDocs(grouped);
    } catch (err) {}
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);
    try {
      await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAllDocs();
      setShowUpload(false);
    } catch (err) {}
    setUploading(false);
  };

  const handleDelete = async (filename, category) => {
    try {
      await api.delete('/upload/document', { params: { filename, category } });
      fetchAllDocs();
    } catch (err) {}
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/chatbot', icon: FiMessageSquare, label: 'AI Assistant' },
    { path: '/resources', icon: FiBook, label: 'Resources' },
    { path: '/generate', icon: FiEdit3, label: 'Question Generator' },
    { path: '/discussions', icon: FiUsers, label: 'Discussions' },
    { path: '/study-room', icon: FiClock, label: 'Study Room' },
    { path: '/achievements', icon: FiAward, label: 'Achievements' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.aside initial={false} animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 0 }}
        className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 lg:translate-x-0 lg:opacity-100 border-r border-gray-200 dark:border-gray-700 overflow-y-auto pt-16">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
          <FiX className="w-5 h-5" />
        </button>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">{user.full_name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.department}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600'
                }`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Upload Section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center justify-between w-full p-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium">
            <span className="flex items-center gap-2">
              <FiUpload className="w-4 h-4" />
              Upload Document
            </span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${showUpload ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showUpload && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2 rounded-lg text-xs transition-all ${
                        selectedCategory === cat.id ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                      }`}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 text-xs text-gray-500">
                  {uploading ? 'Uploading...' : `Click to upload ${selectedCategory}`}
                  <input type="file" onChange={handleUpload} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Documents by Category */}
        <div className="p-3 flex-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <FiFolder className="w-3 h-3" /> My Documents
          </h3>
          {Object.keys(userDocs).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No documents uploaded</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(userDocs).map(([category, docs]) => (
                <div key={category}>
                  <button onClick={() => setExpandedCat(expandedCat === category ? null : category)}
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-xs">
                    <span className="flex items-center gap-2">
                      {categories.find(c => c.id === category)?.icon} {categories.find(c => c.id === category)?.label || category}
                    </span>
                    <span className="text-gray-400">{docs.length}</span>
                  </button>
                  <AnimatePresence>
                    {expandedCat === category && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden ml-4 space-y-1">
                        {docs.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-xs">
                            <span className="flex items-center gap-1 truncate">
                              <FiFile className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{doc.filename}</span>
                            </span>
                            <button onClick={() => handleDelete(doc.filename, category)} className="p-1 hover:text-red-500">
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full p-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
