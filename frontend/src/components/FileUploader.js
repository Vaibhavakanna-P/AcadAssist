import React, { useState } from 'react';
import api from '../services/api';
import { FiUpload } from 'react-icons/fi';

const FileUploader = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'notes');
    
    try {
      const res = await api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Uploaded! ' + res.data.chunks_added + ' chunks added to RAG');
      if (onUploadComplete) onUploadComplete(res.data);
    } catch (err) {
      setMessage('Upload failed! Try again.');
    }
    setUploading(false);
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold mb-4">Upload Study Material</h3>
      <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500">
        <FiUpload className="w-8 h-8 text-gray-400" />
        <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload PDF, DOC, PPT, TXT'}</span>
        <span className="text-xs text-gray-400">Files will be added to RAG automatically</span>
        <input type="file" onChange={handleUpload} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" disabled={uploading} />
      </label>
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default FileUploader;
