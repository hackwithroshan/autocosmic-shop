
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
import CMSManagement from '../components/admin/CMSManagement';
import MediaLibrary from '../components/admin/MediaLibrary';
import { COLORS } from '../constants';

// Expanded view types to match Sidebar IDs
type AdminView = 'dashboard' | 'products' | 'inventory' | 'categories' | 'orders' | 'customers' | 'marketing' | 'discounts' | 'settings' | 'cms' | 'shop-videos' | 'slider' | 'media' | 'blogs' | 'pages';

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
      case 'inventory': // Reusing ProductList for now, can handle inventory specific logic inside if needed
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
      case 'media':
        return <MediaLibrary token={token} />;
      
      // Deep links into CMS Management
      case 'categories': 
        return <CMSManagement token={token} initialTab="collections" />;
      case 'shop-videos': 
        return <CMSManagement token={token} initialTab="videos" />;
      case 'slider': 
        return <CMSManagement token={token} initialTab="slider" />;
      case 'blogs': 
        return <CMSManagement token={token} initialTab="blogs" />;
      case 'pages': 
        return <CMSManagement token={token} initialTab="pages" />;
      case 'cms':
        return <CMSManagement token={token} />;
        
      default:
        return <Dashboard token={token} />;
    }
  };

  const getTitle = () => {
      const titles: Record<string, string> = {
          'products': 'Product Management',
          'inventory': 'Inventory Control',
          'categories': 'Category & Collections',
          'shop-videos': 'Shoppable Videos',
          'dashboard': 'Dashboard Overview'
      };
      return titles[currentView] || currentView.replace('-', ' ');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm z-10 h-16">
          <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden mr-4">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800 capitalize">{getTitle()}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-sm text-right hidden md:block">
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role || 'Admin'}</p>
             </div>
             <Link
                to="/"
                className="px-4 py-2 text-sm font-semibold text-white rounded-md transition duration-150 ease-in-out hover:opacity-90 shadow-sm"
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
