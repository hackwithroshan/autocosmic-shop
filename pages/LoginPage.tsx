
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COLORS } from '../constants';
import { TailGridsLogo } from '../components/Icons';

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
        // Fallback if backend crashes and returns HTML error page
        throw new Error(`Server Error: ${response.status}. The backend might be down.`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      setToken(data.token);
      setUser(data.user);

      // Admin redirect logic
      if (data.user.isAdmin === true) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message === 'Failed to fetch') {
        setError('Network Error: Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1618932260643-030a8327707c?q=80&w=1920&auto=format&fit=crop" 
          alt="Elegant Fashion" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 transform hover:scale-105 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-rose-900/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full">
           <div className="mb-8">
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full w-fit mb-4">
                <TailGridsLogo />
             </div>
             <h1 className="text-5xl font-bold font-serif mb-4 tracking-tight">Ladies Smart Choice</h1>
             <p className="text-lg text-rose-100 max-w-md font-light leading-relaxed">
               Experience the elegance of curated fashion. Login to access your personalized dashboard, track orders, and discover exclusive collections.
             </p>
           </div>
           <div className="flex space-x-2 mb-8">
              <span className="h-1 w-12 bg-rose-500 rounded-full"></span>
              <span className="h-1 w-4 bg-white/30 rounded-full"></span>
              <span className="h-1 w-4 bg-white/30 rounded-full"></span>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-6">
               <TailGridsLogo />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Welcome Back</h2>
             <p className="mt-2 text-sm text-gray-500">
               Please enter your details to sign in.
             </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Password</label>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-rose-600 hover:text-rose-500 transition-colors">Forgot password?</a>
                  </div>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start animate-fade-in">
                <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
            </div>

            <div className="text-center">
               <Link to="/register" className="text-rose-600 hover:text-rose-700 font-bold hover:underline transition-all">
                  Create a free account
               </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
