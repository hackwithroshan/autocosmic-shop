
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { COLORS } from '../../constants';

const Customers: React.FC<{token: string | null}> = ({token}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
          <div className="flex space-x-2">
            <input type="text" placeholder="Search customers..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"/>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm">Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {['VIP', 'New', 'Returning', 'High-Value'].map(segment => (
                <div key={segment} className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:border-orange-500 transition-colors">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">{segment}</h4>
                    <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.segment === segment).length}</p>
                </div>
            ))}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                        </div>
                        <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.segment === 'VIP' ? 'bg-purple-100 text-purple-800' : 
                            user.segment === 'High-Value' ? 'bg-yellow-100 text-yellow-800' :
                            user.segment === 'Returning' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {user.segment}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-center">{user.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Details</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default Customers;
