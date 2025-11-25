
import React, { useState, useEffect } from 'react';
import { Icons, COLORS } from '../../constants';

type AdminView = 'dashboard' | 'products' | 'inventory' | 'categories' | 'orders' | 'customers' | 'marketing' | 'discounts' | 'settings' | 'cms' | 'shop-videos' | 'slider' | 'media' | 'blogs' | 'pages';

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  view?: AdminView;
  children?: MenuItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  // Manage open/close state of parent menus
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['catalog', 'content']);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (view?: AdminView) => {
    if (view) {
      setCurrentView(view);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  // --- Hierarchical Menu Structure ---
  const menuStructure: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Overview', 
      icon: Icons.dashboard, 
      view: 'dashboard' 
    },
    {
      id: 'catalog',
      label: 'Products & Inventory',
      icon: Icons.products,
      children: [
        { id: 'products-list', label: 'All Products', view: 'products' },
        { id: 'categories', label: 'Category Management', view: 'categories' },
        { id: 'inventory', label: 'Inventory Management', view: 'inventory' },
        { id: 'shop-videos', label: 'Shop-by-Videos', view: 'shop-videos' },
      ]
    },
    {
      id: 'sales',
      label: 'Sales & Orders',
      icon: Icons.orders,
      children: [
        { id: 'orders-list', label: 'All Orders', view: 'orders' },
        { id: 'customers', label: 'Customers', view: 'customers' },
        { id: 'discounts', label: 'Coupons & Discounts', view: 'discounts' },
      ]
    },
    {
      id: 'cms',
      label: 'Content & Marketing',
      icon: Icons.marketing, // Reusing marketing icon for CMS group
      children: [
        { id: 'marketing-campaigns', label: 'Campaigns', view: 'marketing' },
        { id: 'slider', label: 'Home Sliders', view: 'slider' },
        { id: 'blogs', label: 'Blog Posts', view: 'blogs' },
        { id: 'pages', label: 'Static Pages', view: 'pages' },
        { id: 'media', label: 'Media Library', view: 'media' },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Icons.settings,
      view: 'settings'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-[#0f172a] text-gray-300 
          transition-transform duration-300 ease-in-out transform 
          lg:static lg:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          flex flex-col border-r border-gray-800 shadow-2xl
        `}
      >
        
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0f172a] flex-shrink-0">
            <div className="flex flex-col">
                 <span className="text-white text-2xl font-serif font-extrabold tracking-wide">
                    Ladies<span className="text-rose-500">Choice</span>
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em] mt-1 font-semibold">Admin Panel</span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 admin-scroll">
          {menuStructure.map((item) => {
            // Check if this item or any of its children are active
            const isChildActive = item.children?.some(child => child.view === currentView);
            const isActive = item.view === currentView || isChildActive;
            const isExpanded = expandedMenus.includes(item.id);

            return (
              <div key={item.id} className="mb-1">
                {item.children ? (
                  // --- Parent Menu Item ---
                  <div className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                        isActive || isExpanded ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors ${isActive ? 'text-rose-500' : 'text-gray-500 group-hover:text-rose-400'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 text-gray-500 ${isExpanded ? 'rotate-180 text-rose-500' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* --- Child Items --- */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-gray-900/30 py-1 space-y-0.5">
                        {item.children.map((child) => {
                          const isChildSelected = currentView === child.view;
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleItemClick(child.view)}
                              className={`w-full flex items-center pl-12 pr-4 py-2.5 text-sm transition-colors border-l-2 ${
                                isChildSelected
                                  ? 'border-rose-500 text-rose-400 bg-rose-500/5 font-medium'
                                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- Single Menu Item ---
                  <button
                    onClick={() => handleItemClick(item.view)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className={`flex-shrink-0 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-rose-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0f172a]">
            <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    AD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Admin User</p>
                    <p className="text-xs text-gray-500 truncate">Super Administrator</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
