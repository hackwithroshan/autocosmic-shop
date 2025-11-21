
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: COLORS.primary }} className="text-gray-300">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="text-2xl font-extrabold text-white tracking-wider">
              Auto<span style={{ color: COLORS.accent }}>Cosmic</span>
            </span>
            <p className="text-gray-400 text-base">
              Your one-stop shop for high-quality performance car parts and accessories.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Shop</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Performance</Link></li>
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Exterior</Link></li>
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Interior</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Contact</Link></li>
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">FAQ</Link></li>
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Shipping</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">About Us</Link></li>
                  <li><Link to="/" className="text-base text-gray-400 hover:text-white">Careers</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">&copy; 2024 AutoCosmic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
