
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { TailGridsLogo, PhoneIcon, UserIcon, HeartIcon, CartIcon, SearchIcon, ChevronDownIcon, MenuIcon } from './Icons';
import { HeaderSettings } from '../types';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  user: any;
  logout: () => void;
}

const initialSettings: HeaderSettings = {
    logoText: 'Loading...',
    phoneNumber: 'Loading...',
    topBarLinks: [],
    mainNavLinks: [],
};

const Header: React.FC<HeaderProps> = ({ user, logout }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<HeaderSettings>(initialSettings);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/header');
            if (!response.ok) {
              console.error('Failed to fetch header settings.');
              setSettings({ // Fallback settings
                 logoText: 'AutoCosmic',
                 phoneNumber: '+001 123 456 789',
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

  return (
    <header className="bg-white text-sm text-gray-600">
      {/* Top Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
          <div className="flex items-center space-x-6">
            {settings.topBarLinks.map(link => (
                <a key={link._id || link.text} href={link.url} className="hover:text-blue-600">{link.text}</a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center hover:text-blue-600">
                English <ChevronDownIcon />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center hover:text-blue-600">
                USD <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-24">
          <Link to="/" className="flex items-center space-x-2">
            <TailGridsLogo />
            <span className="text-3xl font-bold text-gray-800">{settings.logoText}</span>
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="flex items-center border border-gray-200 rounded-md">
              <div className="relative">
                 <select className="pl-4 pr-10 py-2.5 text-gray-600 bg-gray-100 rounded-l-md appearance-none focus:outline-none cursor-pointer">
                    <option>All categories</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon />
                </div>
              </div>
              <input type="text" placeholder="I'm shopping for..." className="w-full px-4 py-2.5 focus:outline-none" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-r-md">
                <SearchIcon />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <PhoneIcon />
              <div>
                <p className="text-xs">Need Help?</p>
                <p className="font-semibold text-gray-800">{settings.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => user ? setIsProfileMenuOpen(!isProfileMenuOpen) : navigate('/login')} className="p-2 rounded-full hover:bg-gray-100">
                        <UserIcon />
                    </button>
                    {user && isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3">
                                <p className="text-sm">Signed in as</p>
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

                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <HeartIcon />
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 bg-blue-600 text-white text-xs rounded-full">3</span>
                </button>
                <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100">
                    <CartIcon />
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 bg-blue-600 text-white text-xs rounded-full">{cartCount}</span>
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14">
        <div className="flex items-center space-x-8">
            <div 
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <button className="flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-md font-semibold">
                    <MenuIcon /> All categories <ChevronDownIcon className="h-5 w-5 ml-2 text-white" />
                </button>
                <MegaMenu isOpen={isMegaMenuOpen} />
            </div>
          <nav className="hidden md:flex items-center space-x-6 font-semibold text-gray-800">
            {settings.mainNavLinks.map(link => (
                <a key={link._id || link.text} href={link.url} className="hover:text-blue-600">{link.text}</a>
            ))}
          </nav>
        </div>
        <a href="#" className="font-semibold text-gray-800 hover:text-blue-600">Contact Us</a>
      </div>
    </header>
  );
};

export default Header;
