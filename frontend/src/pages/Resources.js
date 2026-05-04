import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import FileUploader from '../components/FileUploader';
import LoadingSpinner from '../components/LoadingSpinner';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = () => {
    api.get('/resources/')
      .then(r => setResources(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, []);

  const handleUploadComplete = (data) => {
    fetchResources(); // Refresh list after upload
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Academic Resources</h1>
      <FileUploader onUploadComplete={handleUploadComplete} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
        {resources.length === 0 && <p className="text-gray-500">No resources yet. Upload some!</p>}
      </div>
    </div>
  );
};

export default Resources;
