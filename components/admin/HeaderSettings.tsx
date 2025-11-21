
import React, { useState, useEffect } from 'react';
import { HeaderSettings, HeaderLink } from '../../types';
import { COLORS } from '../../constants';

const initialSettings: HeaderSettings = {
    logoText: '',
    phoneNumber: '',
    topBarLinks: [],
    mainNavLinks: [],
};

const HeaderSettingsComponent: React.FC<{ token: string | null }> = ({ token }) => {
    const [settings, setSettings] = useState<HeaderSettings>(initialSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/header');
                if (!response.ok) {
                    throw new Error('Failed to fetch header settings.');
                }
                const data = await response.json();
                setSettings(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({...prev, [name]: value}));
    };
    
    const handleLinkChange = (index: number, field: 'text' | 'url', value: string, type: 'topBarLinks' | 'mainNavLinks') => {
        const newLinks = [...settings[type]];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSettings(prev => ({ ...prev, [type]: newLinks }));
    };

    const addLink = (type: 'topBarLinks' | 'mainNavLinks') => {
        const newLinks = [...settings[type], { text: '', url: '' }];
        setSettings(prev => ({ ...prev, [type]: newLinks }));
    };

    const removeLink = (index: number, type: 'topBarLinks' | 'mainNavLinks') => {
        const newLinks = settings[type].filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, [type]: newLinks }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/settings/header', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to save settings.');
            }
            setSuccess('Settings saved successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    const LinkEditor: React.FC<{ type: 'topBarLinks' | 'mainNavLinks' }> = ({ type }) => (
        <div className="space-y-4">
            {settings[type].map((link, index) => (
                <div key={link._id || index} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center">
                    <div className="md:col-span-4">
                        <label className="text-sm font-medium text-gray-700">Link Text</label>
                        <input
                            type="text"
                            value={link.text}
                            onChange={(e) => handleLinkChange(index, 'text', e.target.value, type)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                     <div className="md:col-span-5">
                        <label className="text-sm font-medium text-gray-700">URL</label>
                        <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value, type)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div className="md:col-span-1 flex items-end h-full">
                         <button onClick={() => removeLink(index, type)} className="text-red-600 hover:text-red-800 p-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
            <button
                onClick={() => addLink(type)}
                className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm"
                style={{ backgroundColor: COLORS.primary }}
            >
                Add Link
            </button>
        </div>
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Header Settings</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-opacity duration-200 disabled:opacity-50"
                    style={{ backgroundColor: COLORS.accent }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

            <div className="space-y-8">
                {/* General Settings Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="logoText" className="text-sm font-medium text-gray-700">Logo Text</label>
                            <input
                                id="logoText"
                                name="logoText"
                                type="text"
                                value={settings.logoText}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                value={settings.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Top Bar Links Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Top Bar Links</h3>
                    <LinkEditor type="topBarLinks" />
                </div>

                {/* Main Navigation Links Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Main Navigation Links</h3>
                    <LinkEditor type="mainNavLinks" />
                </div>
            </div>
        </div>
    );
};

export default HeaderSettingsComponent;
