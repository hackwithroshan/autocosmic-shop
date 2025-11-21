
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './contexts/CartContext';

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
    // Navigation handled by component or router redirect
    window.location.href = '/'; 
  };

  return (
    <CartProvider>
      <Router>
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
            <Route path="/cart" element={<CartPage user={user} logout={handleLogout} />} />
            <Route 
              path="/checkout" 
              element={user ? <CheckoutPage user={user} logout={handleLogout} /> : <Navigate to="/login" />} 
            />
            {/* Catch-all route: Redirect unknown paths to Home to prevent crashing on preview URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;