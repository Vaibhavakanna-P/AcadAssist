import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h1 className="text-3xl font-bold mb-6">👤 Profile</h1>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Name</span><span>{user?.full_name}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Email</span><span>{user?.email}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Department</span><span>{user?.department}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Role</span><span className="capitalize">{user?.role}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
