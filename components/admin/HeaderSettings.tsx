import React, { useState, useEffect, useRef } from 'react';
import { HeaderSettings, Product, BlogPost, ContentPage } from '../../types';
import { COLORS } from '../../constants';

const initialSettings: HeaderSettings = {
    logoText: '',
    logoUrl: '',
    brandColor: '#E11D48',
    phoneNumber: '',
    topBarLinks: [],
    mainNavLinks: [],
};

// Cloudinary config (Reused from MediaLibrary for simplicity)
const CLOUDINARY_UPLOAD_PRESET = 'ladiesh';
const CLOUDINARY_CLOUD_NAME = 'djbv48acj';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

// --- Link Picker Component ---
interface LinkPickerProps {
    value: string;
    onChange: (value: string) => void;
    data: {
        products: Product[];
        blogs: BlogPost[];
        pages: ContentPage[];
    };
}

const LinkPicker: React.FC<LinkPickerProps> = ({ value, onChange, data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'root' | 'products' | 'blogs' | 'pages'>('root');
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('root'); // Reset view on close
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (url: string) => {
        onChange(url);
        setIsOpen(false);
        setView('root');
        setSearchTerm('');
    };

    const filterItems = (items: any[], key: string) => {
        return items.filter(item => item[key].toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const renderContent = () => {
        const headerClass = "px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b flex items-center cursor-pointer hover:bg-gray-100";
        const listClass = "max-h-48 overflow-y-auto";
        const itemClass = "px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center";

        // --- Root View ---
        if (view === 'root') {
            return (
                <div className="py-1">
                    <div className={itemClass} onClick={() => setView('pages')}>
                        <span>Pages</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className={itemClass} onClick={() => setView('blogs')}>
                        <span>Blogs</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className={itemClass} onClick={() => setView('products')}>
                        <span>Products</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className="border-t my-1"></div>
                    <div className="px-4 py-2">
                        <label className="text-xs text-gray-500 block mb-1">Paste Custom URL</label>
                        <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https:// or /path"
                        />
                    </div>
                </div>
            );
        }

        // --- Sub Views (Lists) ---
        let title = "";
        let items: any[] = [];
        let linkPrefix = "";
        let nameKey = "";

        if (view === 'products') {
            title = "Products";
            items = data.products;
            linkPrefix = "/product/";
            nameKey = "name";
        } else if (view === 'blogs') {
            title = "Blogs";
            items = data.blogs;
            linkPrefix = "/blogs/";
            nameKey = "title";
        } else if (view === 'pages') {
            title = "Pages";
            items = data.pages;
            linkPrefix = "/pages/";
            nameKey = "title";
        }

        // Helper for Back Button
        const Header = () => (
            <div className={headerClass} onClick={() => { setView('root'); setSearchTerm(''); }}>
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Categories
            </div>
        );

        // Helper for Search
        const Search = () => (
            <div className="p-2 border-b">
                <input 
                    type="text" 
                    autoFocus
                    placeholder={`Search ${title}...`}
                    className="w-full border-gray-200 rounded-md text-xs p-1.5 focus:ring-0 focus:border-blue-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        );

        const filtered = filterItems(items, nameKey);

        return (
            <>
                <Header />
                <Search />
                <div className={listClass}>
                    {filtered.length > 0 ? filtered.map((item: any) => (
                        <div 
                            key={item.id || item._id} 
                            className={itemClass}
                            onClick={() => handleSelect(`${linkPrefix}${item.slug}`)}
                        >
                            <span className="truncate pr-2">{item[nameKey]}</span>
                        </div>
                    )) : (
                        <div className="px-4 py-3 text-xs text-gray-500 text-center">No items found</div>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="flex shadow-sm rounded-md">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Search or paste link..."
                />
                <button 
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 animate-fade-in-up min-w-[250px]">
                    {renderContent()}
                </div>
            )}
        </div>
    );
};


const HeaderSettingsComponent: React.FC<{ token: string | null }> = ({ token }) => {
    const [settings, setSettings] = useState<HeaderSettings>(initialSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Data cache for picker
    const [pickerData, setPickerData] = useState<{products: Product[], blogs: BlogPost[], pages: ContentPage[]}>({
        products: [], blogs: [], pages: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch everything in parallel
                const [settingsRes, productsRes, blogsRes, pagesRes] = await Promise.all([
                    fetch('/api/settings/header'),
                    fetch('/api/products'),
                    fetch('/api/blogs', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/pages', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!settingsRes.ok) throw new Error('Failed to fetch header settings.');
                
                setSettings(await settingsRes.json());
                
                setPickerData({
                    products: productsRes.ok ? await productsRes.json() : [],
                    blogs: blogsRes.ok ? await blogsRes.json() : [],
                    pages: pagesRes.ok ? await pagesRes.json() : []
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);
    
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            try {
                const res = await fetch(CLOUDINARY_UPLOAD_URL, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.secure_url) {
                    setSettings(prev => ({ ...prev, logoUrl: data.secure_url }));
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Logo upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const removeLogo = () => {
        setSettings(prev => ({ ...prev, logoUrl: '' }));
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
                <div key={link._id || index} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-start bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Menu Label</label>
                        <input
                            type="text"
                            value={link.text}
                            onChange={(e) => handleLinkChange(index, 'text', e.target.value, type)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            placeholder="e.g. Shop"
                        />
                    </div>
                     <div className="md:col-span-5">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Destination</label>
                        <LinkPicker 
                            value={link.url} 
                            onChange={(val) => handleLinkChange(index, 'url', val, type)}
                            data={pickerData}
                        />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center h-full pt-5">
                         <button onClick={() => removeLink(index, type)} className="text-red-500 hover:text-red-700 p-2 transition-colors" title="Remove Link">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
            <button
                onClick={() => addLink(type)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add New Menu Item
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
                    className="px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 hover:shadow-md transform active:scale-95"
                    style={{ backgroundColor: COLORS.accent }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">{success}</div>}

            <div className="space-y-8">
                {/* General Settings Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Brand & Contact</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Logo & Branding Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">Logo & Branding</label>
                            
                            {/* Brand Color */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
                                <input 
                                    type="color" 
                                    name="brandColor"
                                    value={settings.brandColor || '#E11D48'}
                                    onChange={handleInputChange}
                                    className="w-10 h-10 rounded cursor-pointer border-none"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">Brand Color</p>
                                    <p className="text-xs text-gray-500">Used for logo text and highlights.</p>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3">
                                {settings.logoUrl ? (
                                    <div className="relative">
                                        <img src={settings.logoUrl} alt="Logo Preview" className="h-16 object-contain" />
                                        <button 
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <p className="mt-1 text-xs text-gray-500">Upload a logo (PNG recommended)</p>
                                    </div>
                                )}
                                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    {isUploading ? 'Uploading...' : 'Change Logo'}
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Text & Contact Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">Text & Contact</label>
                            
                            <div>
                                <label htmlFor="logoText" className="block text-sm font-medium text-gray-700 mb-1">Logo Text (Fallback)</label>
                                <input
                                    id="logoText"
                                    name="logoText"
                                    type="text"
                                    value={settings.logoText}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="My Store Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="text"
                                    value={settings.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Bar Links Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center justify-between">
                        <span>Top Bar Links</span>
                        <span className="text-xs font-normal text-gray-500">Small text links at the very top</span>
                    </h3>
                    <LinkEditor type="topBarLinks" />
                </div>

                {/* Main Navigation Links Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center justify-between">
                        <span>Main Navigation</span>
                        <span className="text-xs font-normal text-gray-500">Primary menu items next to categories</span>
                    </h3>
                    <LinkEditor type="mainNavLinks" />
                </div>
            </div>
        </div>
    );
};

export default HeaderSettingsComponent;