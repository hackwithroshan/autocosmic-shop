import React from 'react';
import { User } from '../types';

const UserProfile: React.FC<{ user: User | null }> = ({ user }) => {
  if (!user) return <div className="bg-white p-6 rounded-lg shadow-md">Loading profile...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">My Profile</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Full Name</label>
          <p className="mt-1 text-lg text-gray-900">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email Address</label>
          <p className="mt-1 text-lg text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Member Since</label>
          <p className="mt-1 text-lg text-gray-900">{new Date(user.joinDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
