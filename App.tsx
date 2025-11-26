
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DynamicPage from './pages/DynamicPage';
import CollectionPage from './pages/CollectionPage';
import { CartProvider } from './contexts/CartContext';
import { initFacebookPixel, trackEvent } from './utils/metaPixel';

// Component to handle Pixel initialization and route changes
const PixelTracker: React.FC = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initialize Pixel ONCE on first load
  useEffect(() => {
    if (isInitialized) return;

    const initPixel = async () => {
      try {
        console.log(" M-Pixel: Fetching Pixel ID from settings...");
        const res = await fetch('/api/settings/site');
        if (res.ok) {
          const settings = await res.json();
          if (settings.facebookPixelId) {
            initFacebookPixel(settings.facebookPixelId);
            setIsInitialized(true);
          } else {
             console.error("❌ M-Pixel: 'facebookPixelId' not found in site settings from API.");
          }
        } else {
           console.error("❌ M-Pixel: Failed to fetch site settings from API.");
        }
      } catch (e) {
        console.error("❌ M-Pixel: Network error while fetching settings.", e);
      }
    };
    initPixel();
  }, [isInitialized]);

  // 2. Track PageView on subsequent route changes
  useEffect(() => {
    // Only track if initialized and it's not the initial page load (init handles that)
    if (isInitialized) {
      trackEvent('PageView');
    }
  }, [location, isInitialized]);

  return null;
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    window.location.href = '/'; 
  };

  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <PixelTracker />
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage user={user} logout={handleLogout} />} />
              <Route 
                path="/login" 
                element={!user ? <LoginPage setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/register" 
                element={!user ? <RegisterPage setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/admin/*" 
                element={user?.isAdmin ? <AdminDashboardPage user={user} logout={handleLogout} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <UserDashboardPage user={user} logout={handleLogout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/product/:id" 
                element={<ProductDetailsPage user={user} logout={handleLogout} />} 
              />
              <Route 
                path="/collections/:id" 
                element={<CollectionPage user={user} logout={handleLogout} />} 
              />
              <Route path="/pages/:slug" element={<DynamicPage user={user} logout={handleLogout} />} />
              <Route path="/cart" element={<CartPage user={user} logout={handleLogout} />} />
              <Route 
                path="/checkout" 
                element={<CheckoutPage user={user} logout={handleLogout} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </HelmetProvider>
  );
};

export default App;