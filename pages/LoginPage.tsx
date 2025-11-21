
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
        // Fallback if server sends plain text error
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
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
      console.error("Login error:", err);
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to the server. Please try again later.');
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
          {error && <p className="text-sm text-red-600">{error}</p>}
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
