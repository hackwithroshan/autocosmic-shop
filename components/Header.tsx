
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { TailGridsLogo, PhoneIcon, UserIcon, HeartIcon, CartIcon, SearchIcon, ChevronDownIcon, MenuIcon } from './Icons';
import { HeaderSettings } from '../types';
import { useCart } from '../contexts/CartContext';
import { COLORS } from '../constants';

interface HeaderProps {
  user: any;
  logout: () => void;
}

const initialSettings: HeaderSettings = {
    logoText: 'Loading...',
    logoUrl: '',
    brandColor: COLORS.primary,
    phoneNumber: 'Loading...',
    topBarLinks: [],
    mainNavLinks: [],
};

const Header: React.FC<HeaderProps> = ({ user, logout }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile nav
  const [settings, setSettings] = useState<HeaderSettings>(initialSettings);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/header');
            if (!response.ok) {
              setSettings({ 
                 logoText: 'Ladies Smart Choice',
                 phoneNumber: '+91 987 654 3210',
                 topBarLinks: [{text: 'Home', url: '/'}],
                 mainNavLinks: [{text: 'Shop', url: '/'}]
              });
              return;
            }
            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const brandColor = settings.brandColor || COLORS.primary;

  return (
    <header className="bg-white text-sm text-gray-600 relative z-50">
      {/* Top Bar - Hidden on mobile */}
      <div className="border-b hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
          <div className="flex items-center space-x-6">
            {settings.topBarLinks.map(link => (
                <a key={link._id || link.text} href={link.url} className="hover:text-pink-600 transition-colors">{link.text}</a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center hover:text-pink-600 transition-colors">
                English <ChevronDownIcon />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center hover:text-pink-600 transition-colors">
                INR <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center py-4 lg:py-0 lg:h-24 gap-4">
          
          {/* Logo & Mobile Icons Row */}
          <div className="flex justify-between items-center w-full lg:w-auto">
              <Link to="/" className="flex items-center space-x-2">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt={settings.logoText} className="h-10 md:h-12 object-contain" />
                ) : (
                    <>
                        <TailGridsLogo />
                        <span className="text-2xl md:text-3xl font-bold" style={{color: brandColor}}>{settings.logoText}</span>
                    </>
                )}
              </Link>

              {/* Mobile Action Icons */}
              <div className="flex items-center space-x-4 lg:hidden">
                  <Link to="/cart" className="relative p-2">
                    <CartIcon />
                    {cartCount > 0 && <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-white text-[10px] rounded-full" style={{backgroundColor: COLORS.accent}}>{cartCount}</span>}
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                      <MenuIcon />
                  </button>
              </div>
          </div>

          {/* Search Bar - Full width on mobile */}
          <div className="flex-1 w-full lg:max-w-xl lg:mx-8">
            <div className="flex items-center border border-gray-200 rounded-md w-full">
              <div className="relative hidden sm:block">
                 <select className="pl-4 pr-10 py-2.5 text-gray-600 bg-gray-100 rounded-l-md appearance-none focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors h-full">
                    <option>All categories</option>
                    <option>Clothing</option>
                    <option>Accessories</option>
                    <option>Beauty</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon />
                </div>
              </div>
              <input type="text" placeholder="Search for products..." className="w-full px-4 py-2.5 focus:outline-none rounded-l-md sm:rounded-l-none" />
              <button className="text-white px-6 py-2.5 rounded-r-md transition-colors hover:opacity-90" style={{backgroundColor: COLORS.accent}}>
                <SearchIcon />
              </button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <PhoneIcon />
              <div>
                <p className="text-xs">Need Help?</p>
                <p className="font-semibold text-gray-800">{settings.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => user ? setIsProfileMenuOpen(!isProfileMenuOpen) : navigate('/login')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <UserIcon />
                    </button>
                    {user && isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b">
                                <p className="text-xs text-gray-500">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            </div>
                            {user.isAdmin ? (
                                <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>
                            ) : (
                               <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                            )}
                            <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </div>
                    )}
                </div>

                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <HeartIcon />
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-white text-xs rounded-full" style={{backgroundColor: COLORS.accent}}>0</span>
                </button>
                <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <CartIcon />
                    {cartCount > 0 && <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-white text-xs rounded-full" style={{backgroundColor: COLORS.accent}}>{cartCount}</span>}
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Desktop */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 hidden lg:flex justify-between items-center h-14">
        <div className="flex items-center space-x-8">
            <div 
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <button className="flex items-center text-white px-4 py-2.5 rounded-md font-semibold hover:opacity-90 transition-colors" style={{backgroundColor: brandColor}}>
                    <MenuIcon /> <span className="ml-2">Shop Categories</span> <ChevronDownIcon className="h-5 w-5 ml-2 text-white" />
                </button>
                <MegaMenu isOpen={isMegaMenuOpen} />
            </div>
          <nav className="flex items-center space-x-6 font-semibold text-gray-800">
            {settings.mainNavLinks.map(link => (
                <a key={link._id || link.text} href={link.url} className="hover:text-pink-600 transition-colors">{link.text}</a>
            ))}
          </nav>
        </div>
        <a href="#" className="font-semibold text-gray-800 hover:text-pink-600 transition-colors">Contact Us</a>
      </div>

      {/* Mobile Navigation Menu (Slide/Dropdown) */}
      {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-2 shadow-lg absolute w-full">
              <nav className="flex flex-col space-y-3 py-2">
                  {settings.mainNavLinks.map(link => (
                      <a key={link._id || link.text} href={link.url} className="block text-gray-800 font-medium hover:text-pink-600 py-2 border-b border-gray-100">{link.text}</a>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">My Account</p>
                      {user ? (
                          <>
                            <p className="font-medium text-gray-800 mb-2">{user.name}</p>
                            <Link to={user.isAdmin ? "/admin" : "/dashboard"} className="block text-pink-600 py-1">Dashboard</Link>
                            <button onClick={logout} className="block text-red-600 py-1">Logout</button>
                          </>
                      ) : (
                          <Link to="/login" className="block text-pink-600 font-bold py-2">Login / Register</Link>
                      )}
                  </div>
              </nav>
          </div>
      )}
    </header>
  );
};

export default Header;
