
import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: COLORS.primary }} className="text-gray-200">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <span className="text-2xl font-extrabold text-white tracking-wider block">
              Ladies<span style={{ color: '#FBCFE8' }}>SmartChoice</span>
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your ultimate destination for trendy women's fashion, accessories, and lifestyle products. Elevate your style every day.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Footwear</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Beauty & Skincare</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-pink-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300 text-center md:text-left">&copy; {new Date().getFullYear()} Ladies Smart Choice. All rights reserved.</p>
          <div className="flex space-x-4">
              {/* Social Placeholders */}
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><span className="sr-only">Facebook</span>FB</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><span className="sr-only">Instagram</span>IG</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><span className="sr-only">Twitter</span>TW</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
