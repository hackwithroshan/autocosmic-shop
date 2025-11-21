
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserSidebar from '../components/UserSidebar';
import UserProfile from '../components/UserProfile';
import UserOrderHistory from '../components/UserOrderHistory';
import { User } from '../types';

type UserDashboardView = 'profile' | 'orders';

interface UserDashboardPageProps {
  user: User;
  logout: () => void;
}

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ user, logout }) => {
  const [currentView, setCurrentView] = useState<UserDashboardView>('profile');
  const token = localStorage.getItem('token');

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <UserProfile user={user} />;
      case 'orders':
        return <UserOrderHistory token={token} />;
      default:
        return <UserProfile user={user} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} logout={logout} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <UserSidebar currentView={currentView} setCurrentView={setCurrentView} />
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboardPage;
