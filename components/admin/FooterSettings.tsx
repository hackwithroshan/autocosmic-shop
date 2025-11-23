
import React, { useState, useEffect, useRef } from 'react';
import { FooterSettings, FooterColumn, FooterLink, SocialLink, Product, BlogPost, ContentPage } from '../../types';
import { COLORS } from '../../constants';

const initialSettings: FooterSettings = {
    brandDescription: '',
    copyrightText: '',
    socialLinks: [],
    columns: []
};

// --- Link Picker Component (Local Definition) ---
interface LinkPickerProps {
    value: string;
    onChange: (value: string) => void;
    data: {
        products: Product[];
        blogs: BlogPost[];
        pages: ContentPage[];
    };
    className?: string;
}

const LinkPicker: React.FC<LinkPickerProps> = ({ value, onChange, data, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'root' | 'products' | 'blogs' | 'pages'>('root');
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('root');
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
        const itemClass = "px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center";

        if (view === 'root') {
            return (
                <div className="py-1">
                    <div className={itemClass} onClick={() => setView('pages')}>
                        <span>Pages</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className={itemClass} onClick={() => setView('blogs')}>
                        <span>Blogs</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className={itemClass} onClick={() => setView('products')}>
                        <span>Products</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className="border-t my-1"></div>
                    <div className="px-3 py-2">
                        <label className="text-[10px] text-gray-500 block mb-1">Custom URL</label>
                        <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-xs focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>
            );
        }

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

        const Header = () => (
            <div className={headerClass} onClick={() => { setView('root'); setSearchTerm(''); }}>
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
            </div>
        );

        const Search = () => (
            <div className="p-2 border-b">
                <input 
                    type="text" 
                    autoFocus
                    placeholder={`Search ${title}...`}
                    className="w-full border-gray-200 rounded-md text-xs p-1 focus:ring-0 focus:border-blue-400"
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
                            onClick={() => handleSelect(`${linkPrefix}${item.slug || item.id}`)}
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
        <div className={`relative w-full ${className}`} ref={wrapperRef}>
            <div className="flex">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 min-w-0 block w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
                    placeholder="Select Link..."
                />
                <button 
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-2 py-1 border border-l-0 border-gray-300 rounded-r bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-64 bg-white shadow-xl rounded-md border border-gray-200 animate-fade-in-up left-0">
                    {renderContent()}
                </div>
            )}
        </div>
    );
};


const FooterSettingsComponent: React.FC<{ token: string | null }> = ({ token }) => {
    const [settings, setSettings] = useState<FooterSettings>(initialSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Picker Data
    const [pickerData, setPickerData] = useState<{products: Product[], blogs: BlogPost[], pages: ContentPage[]}>({
        products: [], blogs: [], pages: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [settingsRes, productsRes, blogsRes, pagesRes] = await Promise.all([
                    fetch('/api/settings/footer'),
                    fetch('/api/products'),
                    fetch('/api/blogs', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/pages', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!settingsRes.ok) throw new Error('Failed to fetch footer settings.');
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/settings/footer', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            if (!response.ok) throw new Error('Failed to save settings.');
            setSuccess('Footer settings saved successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    // --- Column Management ---
    const addColumn = () => {
        setSettings(prev => ({
            ...prev,
            columns: [...prev.columns, { title: 'New Column', links: [] }]
        }));
    };

    const removeColumn = (index: number) => {
        if(!window.confirm('Delete this entire column?')) return;
        setSettings(prev => ({
            ...prev,
            columns: prev.columns.filter((_, i) => i !== index)
        }));
    };

    const updateColumnTitle = (index: number, value: string) => {
        const newColumns = [...settings.columns];
        newColumns[index].title = value;
        setSettings(prev => ({ ...prev, columns: newColumns }));
    };

    // --- Link Management (Inside Columns) ---
    const addLinkToColumn = (colIndex: number) => {
        const newColumns = [...settings.columns];
        newColumns[colIndex].links.push({ text: 'New Link', url: '#' });
        setSettings(prev => ({ ...prev, columns: newColumns }));
    };

    const removeLinkFromColumn = (colIndex: number, linkIndex: number) => {
        const newColumns = [...settings.columns];
        newColumns[colIndex].links = newColumns[colIndex].links.filter((_, i) => i !== linkIndex);
        setSettings(prev => ({ ...prev, columns: newColumns }));
    };

    const updateLink = (colIndex: number, linkIndex: number, field: keyof FooterLink, value: string) => {
        const newColumns = [...settings.columns];
        newColumns[colIndex].links[linkIndex] = { 
            ...newColumns[colIndex].links[linkIndex], 
            [field]: value 
        };
        setSettings(prev => ({ ...prev, columns: newColumns }));
    };

    // --- Social Media Management ---
    const addSocial = () => {
        setSettings(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: 'Instagram', url: '' }]
        }));
    };

    const removeSocial = (index: number) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
        const newSocials = [...settings.socialLinks];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setSettings(prev => ({ ...prev, socialLinks: newSocials }));
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Footer Settings</h2>
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
                
                {/* 1. Branding & Copyright */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Branding & Copyright</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Description (About)</label>
                            <textarea 
                                name="brandDescription" 
                                value={settings.brandDescription} 
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                            <input 
                                type="text" 
                                name="copyrightText" 
                                value={settings.copyrightText} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Social Media */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h3 className="text-lg font-bold text-gray-800">Social Media Links</h3>
                        <button onClick={addSocial} className="text-sm text-blue-600 font-medium hover:underline">+ Add Social</button>
                    </div>
                    <div className="space-y-3">
                        {settings.socialLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <select 
                                    value={link.platform}
                                    onChange={(e) => updateSocial(idx, 'platform', e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Twitter">Twitter</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="YouTube">YouTube</option>
                                </select>
                                <input 
                                    type="text" 
                                    value={link.url}
                                    onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="https://..."
                                />
                                <button onClick={() => removeSocial(idx)} className="text-red-500 hover:text-red-700">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        {settings.socialLinks.length === 0 && <p className="text-gray-500 text-sm italic">No social links added.</p>}
                    </div>
                </div>

                {/* 3. Navigation Columns */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Navigation Columns</h3>
                        <button 
                            onClick={addColumn}
                            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                        >
                            + Add Column
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {settings.columns.map((col, colIdx) => (
                            <div key={colIdx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <input 
                                        type="text" 
                                        value={col.title} 
                                        onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                                        className="font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent w-full mr-2"
                                        placeholder="Column Title"
                                    />
                                    <button onClick={() => removeColumn(colIdx)} className="text-red-400 hover:text-red-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                
                                <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pr-1">
                                    {col.links.map((link, linkIdx) => (
                                        <div key={linkIdx} className="flex gap-2 items-start bg-gray-50 p-2 rounded-md border border-gray-100">
                                            <div className="flex-1 space-y-1 min-w-0">
                                                <input 
                                                    type="text" 
                                                    value={link.text}
                                                    onChange={(e) => updateLink(colIdx, linkIdx, 'text', e.target.value)}
                                                    className="w-full text-xs font-medium border-gray-200 rounded px-1 py-0.5 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Label"
                                                />
                                                <LinkPicker 
                                                    value={link.url}
                                                    onChange={(val) => updateLink(colIdx, linkIdx, 'url', val)}
                                                    data={pickerData}
                                                />
                                            </div>
                                            <button onClick={() => removeLinkFromColumn(colIdx, linkIdx)} className="text-gray-400 hover:text-red-500 mt-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => addLinkToColumn(colIdx)}
                                    className="mt-3 w-full py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs font-medium rounded hover:bg-gray-50 hover:text-gray-700"
                                >
                                    + Add Link
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FooterSettingsComponent;
