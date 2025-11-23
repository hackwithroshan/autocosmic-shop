
import React from 'react';
import { Icons, COLORS } from '../../constants';

type AdminView = 'dashboard' | 'products' | 'orders' | 'customers' | 'marketing' | 'discounts' | 'settings' | 'slider' | 'media';

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center px-4 py-3 text-gray-200 transition-colors duration-200 transform rounded-md hover:bg-pink-900 ${
      isActive ? 'bg-pink-900' : ''
    }`}
  >
    {icon}
    <span className="mx-4 font-medium">{label}</span>
  </a>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
    const navItems: { view: AdminView; label: string; icon: React.ReactNode }[] = [
        { view: 'dashboard', label: 'Analytics & Overview', icon: Icons.dashboard },
        { view: 'products', label: 'Products & Inventory', icon: Icons.products },
        { view: 'orders', label: 'Orders & Invoices', icon: Icons.orders },
        { view: 'customers', label: 'Customers & Segments', icon: Icons.users },
        { view: 'marketing', label: 'Marketing Campaigns', icon: Icons.marketing },
        { view: 'discounts', label: 'Discounts & Offers', icon: Icons.discounts },
        { view: 'media', label: 'Media Library', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { view: 'slider', label: 'CMS & Content', icon: Icons.content },
        { view: 'settings', label: 'Settings & Pixels', icon: Icons.settings },
    ];
    
  return (
    <>
    <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: COLORS.primary }}>
        <div className="flex items-center justify-center mt-8 mb-8">
            <div className="flex flex-col items-center">
                 <span className="text-white text-xl font-bold tracking-wider text-center">
                    Ladies<span style={{color: '#FBCFE8'}}>SmartChoice</span>
                </span>
                <span className="text-xs text-pink-200 uppercase tracking-widest mt-1">Admin Portal</span>
            </div>
        </div>

        <nav className="px-2 space-y-1 admin-scroll overflow-y-auto h-[calc(100vh-150px)]">
            {navItems.map(item => (
                <NavLink 
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => {
                        setCurrentView(item.view);
                        if (window.innerWidth < 1024) {
                           setIsOpen(false);
                        }
                    }}
                />
            ))}
        </nav>
    </div>
    {isOpen && <div className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default AdminSidebar;
