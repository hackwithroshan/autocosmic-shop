
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import ProductList from '../components/admin/ProductList';
import OrderList from '../components/admin/OrderList';
import Customers from '../components/admin/Customers';
import Marketing from '../components/admin/Marketing';
import Discounts from '../components/admin/Discounts';
import Settings from '../components/admin/Settings';
import SliderSettings from '../components/admin/SliderSettings';
import { COLORS } from '../constants';

type AdminView = 'dashboard' | 'products' | 'orders' | 'customers' | 'marketing' | 'discounts' | 'settings' | 'slider';

interface AdminDashboardPageProps {
  user: any;
  logout: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ user, logout }) => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const token = localStorage.getItem('token');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard token={token} />;
      case 'products':
        return <ProductList token={token} />;
      case 'orders':
        return <OrderList token={token} />;
      case 'customers':
        return <Customers token={token} />;
      case 'marketing':
        return <Marketing token={token} />;
      case 'discounts':
        return <Discounts token={token} />;
      case 'settings':
        return <Settings token={token} />;
      case 'slider':
        return <SliderSettings token={token} />;
      default:
        return <Dashboard token={token} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm z-10">
          <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800 ml-4 capitalize">{currentView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-sm text-right hidden md:block">
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role || 'Admin'}</p>
             </div>
             <Link
                to="/"
                className="px-4 py-2 text-sm font-semibold text-white rounded-md transition duration-150 ease-in-out hover:opacity-90"
                style={{backgroundColor: COLORS.accent}}
            >
                View Store
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 admin-scroll">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
