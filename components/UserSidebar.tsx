import React from 'react';

type UserDashboardView = 'profile' | 'orders';

interface UserSidebarProps {
  currentView: UserDashboardView;
  setCurrentView: (view: UserDashboardView) => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ currentView, setCurrentView }) => {
  // Fix: Explicitly type navItems to ensure item.view is of type UserDashboardView
  const navItems: { view: UserDashboardView; label: string }[] = [
    { view: 'profile', label: 'My Profile' },
    { view: 'orders', label: 'Order History' },
  ];

  return (
    <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md md:flex-shrink-0 h-fit">
      <nav className="space-y-1">
        {navItems.map(item => (
          <a
            key={item.view}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView(item.view);
            }}
            className={`block px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ${
              currentView === item.view
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default UserSidebar;