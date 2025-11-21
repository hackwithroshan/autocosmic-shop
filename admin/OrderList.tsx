
import React, { useState, useEffect } from 'react';
import { Order } from '../types';

const OrderList: React.FC<{token: string | null}> = ({token}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter(order => {
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
  });
  
  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-2 w-full sm:w-auto">
                <input 
                    type="text" 
                    placeholder="Search order ID or customer..." 
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <select 
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
             <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">Download Report</button>
        </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Workflow</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">#{order.id.substring(0, 6)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs">{order.customerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length} items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className={`p-1 rounded-md text-xs font-semibold border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 ${
                       order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                       order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                       order.status === 'Processing' || order.status === 'Packed' ? 'bg-purple-100 text-purple-800' :
                       order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                    }`}
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Returned</option>
                    <option>Cancelled</option>
                  </select>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-600 hover:text-blue-600" title="Print Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
