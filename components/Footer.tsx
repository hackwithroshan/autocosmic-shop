
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';
import { FooterSettings } from '../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings/footer');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch footer settings", error);
        }
    };
    fetchSettings();
  }, []);

  const renderSocialIcon = (platform: string) => {
      switch(platform.toLowerCase()) {
          case 'facebook':
              return <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>;
          case 'twitter':
              return <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>;
          case 'instagram':
              return <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path></svg>;
          case 'linkedin':
              return <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24"><path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2" stroke="none"></circle></svg>;
          default:
              return <span className="text-xs">{platform.substring(0,2)}</span>;
      }
  };

  // Default Fallback if loading or no data
  if (!settings) {
      return (
        <footer style={{ backgroundColor: COLORS.primary }} className="text-gray-200">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                <p>Loading Footer...</p>
            </div>
        </footer>
      )
  }

  return (
    <footer style={{ backgroundColor: COLORS.primary }} className="text-gray-200">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <span className="text-2xl font-extrabold text-white tracking-wider block">
              Ladies<span style={{ color: '#FBCFE8' }}>SmartChoice</span>
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings.brandDescription}
            </p>
          </div>
          
          {/* Dynamic Columns */}
          {settings.columns.map((col, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{col.title}</h3>
                <ul className="space-y-3">
                    {col.links.map((link, lIdx) => (
                        <li key={lIdx}>
                            {link.url.startsWith('http') ? (
                                <a href={link.url} className="text-sm text-gray-300 hover:text-white transition-colors">{link.text}</a>
                            ) : (
                                <Link to={link.url} className="text-sm text-gray-300 hover:text-white transition-colors">{link.text}</Link>
                            )}
                        </li>
                    ))}
                </ul>
              </div>
          ))}
        </div>
        
        <div className="mt-12 border-t border-pink-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300 text-center md:text-left">{settings.copyrightText}</p>
          <div className="flex space-x-4">
              {settings.socialLinks.map((social, idx) => (
                  <a key={idx} href={social.url} className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                      {renderSocialIcon(social.platform)}
                  </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
