
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COLORS } from '../constants';

interface LoginProps {
  setToken: (token: string) => void;
  setUser: (user: any) => void;
}

const LoginPage: React.FC<LoginProps> = ({ setToken, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting login...");
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server error (${response.status}). Please check backend logs.`);
      }

      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
             throw new Error("Backend connection failed (404/405). Please REDEPLOY Vercel to update environment variables.");
        }
        throw new Error(data.message || 'Failed to login');
      }
      
      setToken(data.token);
      setUser(data.user);

      if (data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("Login error details:", err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Network Error: Open Browser Console (F12) -> Console tab. Look for lines starting with [API Proxy]. If VITE_API_URL is missing or wrong, it will fail.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-gray-600">
                Or{' '}
                <Link to="/register" className="font-medium" style={{color: COLORS.accent}}>
                    create a new account
                </Link>
            </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLORS.accent }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
