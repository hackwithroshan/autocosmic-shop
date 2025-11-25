
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

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

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
        throw new Error(`Server Error: ${response.status}. The backend might be down.`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      setToken(data.token);
      setUser(data.user);

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

  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setForgotLoading(true);
      setForgotError('');
      setForgotMessage('');

      try {
          // Backend sends the email now
          const res = await fetch('/api/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: forgotEmail }) 
          });
          
          const data = await res.json();
          
          if (res.ok) {
              setForgotStep(2);
              setForgotMessage(`An OTP has been sent to ${forgotEmail}.`);
          } else {
              setForgotError(data.message || 'Failed to process request');
          }
      } catch (err: any) {
          setForgotError(err.message);
      } finally {
          setForgotLoading(false);
      }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setForgotLoading(true);
      setForgotError('');
      setForgotMessage('');

      try {
          const res = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: forgotEmail, otp, newPassword })
          });
          const data = await res.json();
          if (res.ok) {
              setForgotMessage('Password reset successfully! You can now login.');
              setTimeout(() => {
                  setIsForgotModalOpen(false);
                  setForgotStep(1);
                  setForgotEmail('');
                  setOtp('');
                  setNewPassword('');
                  setForgotMessage('');
              }, 3000);
          } else {
              setForgotError(data.message || 'Failed to reset password');
          }
      } catch (err: any) {
          setForgotError(err.message);
      } finally {
          setForgotLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-white">
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
                    <button type="button" onClick={() => setIsForgotModalOpen(true)} className="font-medium text-rose-600 hover:text-rose-500 transition-colors">
                        Forgot password?
                    </button>
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

      {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                  <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800">Reset Password</h3>
                      <button onClick={() => setIsForgotModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  <div className="p-6">
                      {forgotError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{forgotError}</div>}
                      {forgotMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-100">{forgotMessage}</div>}

                      {forgotStep === 1 ? (
                          <form onSubmit={handleSendOtp}>
                              <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send you an OTP to reset your password.</p>
                              <div className="mb-4">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                  <input 
                                      type="email" 
                                      required 
                                      value={forgotEmail}
                                      onChange={(e) => setForgotEmail(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                                      placeholder="name@example.com"
                                  />
                              </div>
                              <button 
                                  type="submit" 
                                  disabled={forgotLoading}
                                  className="w-full bg-rose-600 text-white font-bold py-2 rounded-md hover:bg-rose-700 disabled:opacity-50"
                              >
                                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                              </button>
                          </form>
                      ) : (
                          <form onSubmit={handleResetPassword}>
                              <p className="text-sm text-gray-600 mb-4">An OTP has been sent to <b>{forgotEmail}</b>. Enter it below.</p>
                              <div className="mb-4">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OTP</label>
                                  <input 
                                      type="text" 
                                      required 
                                      value={otp}
                                      onChange={(e) => setOtp(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-rose-500 focus:border-rose-500 tracking-widest text-center font-mono text-lg"
                                      placeholder="123456"
                                      maxLength={6}
                                  />
                              </div>
                              <div className="mb-6">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                                  <input 
                                      type="password" 
                                      required 
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                                      placeholder="New strong password"
                                  />
                              </div>
                              <button 
                                  type="submit" 
                                  disabled={forgotLoading}
                                  className="w-full bg-rose-600 text-white font-bold py-2 rounded-md hover:bg-rose-700 disabled:opacity-50"
                              >
                                  {forgotLoading ? 'Reseting...' : 'Reset Password'}
                              </button>
                              <div className="mt-4 text-center">
                                  <button type="button" onClick={() => setForgotStep(1)} className="text-xs text-gray-500 hover:underline">Back to Email</button>
                              </div>
                          </form>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default LoginPage;
