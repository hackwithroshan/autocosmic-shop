
import React, { useState, useEffect } from 'react';
import { Order, Product, User } from '../../types';
import { Icons, COLORS } from '../../constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; subtext?: string }> = ({ title, value, icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {subtext && <p className="text-xs text-green-500 mt-1 flex items-center">{subtext}</p>}
    </div>
    <div className="rounded-full p-3 shadow-sm" style={{ backgroundColor: `${color}20`, color: color }}>
      {icon}
    </div>
  </div>
);

const COLORS_PIE = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC<{token: string | null}> = ({token}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/products'),
          fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        setOrders(await ordersRes.json());
        setProducts(await productsRes.json());
        setUsers(await usersRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --- Data Calculation Logic ---
  
  // 1. Revenue Chart Data (Last 7 Days)
  const getRevenueData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toDateString();
        
        const dailyOrders = orders.filter(o => new Date(o.date).toDateString() === dateStr);
        const revenue = dailyOrders.reduce((sum, o) => sum + o.total, 0);
        
        data.push({
            name: dayName,
            revenue: revenue,
            orders: dailyOrders.length
        });
    }
    return data;
  };
  
  // 2. Funnel Data (Approximated from Order Status)
  const getFunnelData = () => {
      const total = orders.length;
      const pending = orders.filter(o => o.status === 'Pending').length;
      const shipped = orders.filter(o => o.status === 'Shipped').length;
      const delivered = orders.filter(o => o.status === 'Delivered').length;
      
      return [
          { name: 'Total Orders', value: total },
          { name: 'Pending', value: pending },
          { name: 'Shipped', value: shipped },
          { name: 'Delivered', value: delivered }
      ];
  };

  // 3. Product Category Distribution (for Pie Chart instead of traffic source which we don't track)
  const getCategoryData = () => {
      const categoryCounts: {[key: string]: number} = {};
      products.forEach(p => {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      });
      return Object.keys(categoryCounts).map(key => ({
          name: key,
          value: categoryCounts[key]
      }));
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading Analytics...</div>;

  const revenueData = getRevenueData();
  const funnelData = getFunnelData();
  const categoryData = getCategoryData();

  const totalRevenue = orders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.total : sum, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const newCustomers = users.filter(u => {
      const joinDate = new Date(u.joinDate);
      const today = new Date();
      return (today.getTime() - joinDate.getTime()) / (1000 * 3600 * 24) < 7;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
        <div className="flex space-x-2">
            <select className="bg-white border border-gray-300 rounded-md text-sm px-3 py-1">
                <option>Last 7 Days</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={Icons.orders} color={COLORS.accent} />
        <StatCard title="Pending Orders" value={pendingOrders} icon={Icons.orders} color="#3B82F6" subtext="Needs attention" />
        <StatCard title="Total Products" value={products.length} icon={Icons.products} color="#10B981" />
        <StatCard title="New Customers" value={newCustomers} icon={Icons.users} color="#8B5CF6" subtext="Last 7 days" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue & Orders (Last 7 Days)</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" yAxisId="left" dataKey="revenue" stroke="#F97316" fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" yAxisId="right" dataKey="orders" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Status Funnel</h3>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#8884d8" barSize={20} radius={[0, 10, 10, 0]}>
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Categories</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
             </div>
             
             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.slice(0, 4).map(order => (
                        <tr key={order.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id.substring(0,6)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{order.customerName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">${order.total.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status.includes('Pending') ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>
        </div>
    </div>
  );
};

export default Dashboard;
