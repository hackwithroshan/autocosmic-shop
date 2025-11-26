import React, { useState, useEffect } from 'react';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';
import { Product } from '../../types';

interface VideoTarget {
    type: 'product' | 'category' | 'custom';
    id: string; // Product Slug, Collection ID, or URL path
    name: string;
}

interface Video {
    id?: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    price: string;
    targets?: VideoTarget[];
    sortOrder?: number;
}

interface Collection {
    id: string;
    title: string;
    imageUrl: string;
}

interface GlobalVideoSettings {
    videoAutoplay: boolean;
    videoMuted: boolean;
    videoGridColumns: number;
}

const VideoSettings: React.FC<{ token: string | null }> = ({ token }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [editingVideo, setEditingVideo] = useState<Partial<Video>>({ targets: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'targeting' | 'preview'>('general');
    
    // Global Settings State
    const [globalSettings, setGlobalSettings] = useState<GlobalVideoSettings>({
        videoAutoplay: false,
        videoMuted: true,
        videoGridColumns: 4
    });
    const [savingGlobal, setSavingGlobal] = useState(false);

    // Data for Linking
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    
    const [linkSearch, setLinkSearch] = useState('');
    const [targetType, setTargetType] = useState<'product' | 'category' | 'custom'>('product');
    const [customUrl, setCustomUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/content/videos');
            if (res.ok) setVideos(await res.json());
        } catch (e) { console.error("Fetch videos failed", e); }
    };

    const fetchData = async () => {
        try {
            const [prodRes, collRes, settingsRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/collections'),
                fetch('/api/settings/site')
            ]);
            if (prodRes.ok) setProducts(await prodRes.json());
            if (collRes.ok) setCollections(await collRes.json());
            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                setGlobalSettings({
                    videoAutoplay: settings.videoAutoplay || false,
                    videoMuted: settings.videoMuted !== undefined ? settings.videoMuted : true,
                    videoGridColumns: settings.videoGridColumns || 4
                });
            }
        } catch (e) {
            console.error("Failed to fetch data");
        }
    };

    useEffect(() => { 
        fetchVideos(); 
        fetchData();
    }, []);

    // --- Global Settings Handlers ---
    const handleGlobalSettingChange = (key: keyof GlobalVideoSettings, value: any) => {
        setGlobalSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveGlobalSettings = async () => {
        setSavingGlobal(true);
        try {
            await fetch('/api/settings/site', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(globalSettings)
            });
            alert("Display settings updated!");
        } catch (e) {
            console.error(e);
        } finally {
            setSavingGlobal(false);
        }
    };

    // --- Video CRUD Handlers ---
    const handleCreate = () => {
        setEditingVideo({ targets: [] });
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleEdit = (video: Video) => {
        setEditingVideo({ ...video, targets: video.targets || [] });
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleSaveVideo = async () => {
        if (!editingVideo.title || !editingVideo.videoUrl) {
            alert("Title and Video File are required.");
            return;
        }

        setLoading(true);
        const isEditing = !!editingVideo.id;
        const url = isEditing ? `/api/content/videos/${editingVideo.id}` : '/api/content/videos';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editingVideo)
            });
            
            if(res.ok) { 
                fetchVideos(); 
                setIsModalOpen(false); 
            } else {
                alert(`Failed to save.`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete this video?")) return;
        try {
            const res = await fetch(`/api/content/videos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) fetchVideos();
        } catch (e) { console.error(e); }
    };

    // --- Targeting Logic ---
    const addTarget = (target: VideoTarget) => {
        // Check for duplicates
        const exists = editingVideo.targets?.some(t => t.id === target.id && t.type === target.type);
        if (exists) return;

        setEditingVideo(prev => ({
            ...prev,
            targets: [...(prev.targets || []), target]
        }));
        setLinkSearch('');
    };

    const removeTarget = (index: number) => {
        setEditingVideo(prev => ({
            ...prev,
            targets: prev.targets?.filter((_, i) => i !== index)
        }));
    };

    // Filter items for targeting search
    const getFilteredItems = () => {
        const term = linkSearch.toLowerCase();
        if (targetType === 'product') {
            return products.filter(p => p.name.toLowerCase().includes(term)).slice(0, 5);
        } else if (targetType === 'category') {
            return collections.filter(c => c.title.toLowerCase().includes(term)).slice(0, 5);
        }
        return [];
    };

    return (
        <div className="space-y-8">
            {/* 1. Global Configuration Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Storefront Display Settings</h3>
                        <p className="text-sm text-gray-500">Control how videos appear to your customers.</p>
                    </div>
                    <button 
                        onClick={saveGlobalSettings}
                        disabled={savingGlobal}
                        className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {savingGlobal ? 'Saving...' : 'Save Config'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Grid Columns */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Layout Grid</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleGlobalSettingChange('videoGridColumns', num)}
                                    className={`w-10 h-8 text-sm font-bold rounded-md transition-all ${globalSettings.videoGridColumns === num ? 'bg-white shadow text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {num}x
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">Videos per row</p>
                    </div>

                    {/* Autoplay */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Autoplay Behavior</label>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleGlobalSettingChange('videoAutoplay', !globalSettings.videoAutoplay)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${globalSettings.videoAutoplay ? 'bg-rose-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${globalSettings.videoAutoplay ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm font-medium text-gray-700">{globalSettings.videoAutoplay ? 'Autoplay ON' : 'Click to Play'}</span>
                        </div>
                    </div>

                    {/* Mute */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Audio Settings</label>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleGlobalSettingChange('videoMuted', !globalSettings.videoMuted)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${globalSettings.videoMuted ? 'bg-rose-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${globalSettings.videoMuted ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm font-medium text-gray-700">{globalSettings.videoMuted ? 'Muted by Default' : 'Sound ON'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Video Management List */}
            <div>
                <div className="flex justify-between mb-6 items-center">
                    <h3 className="font-bold text-gray-800 text-lg">Video Library ({videos.length})</h3>
                    <button onClick={handleCreate} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Video
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {videos.map(vid => (
                        <div key={vid.id} className="relative group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            {/* Thumbnail */}
                            <div className="aspect-[9/16] relative bg-gray-100 group-hover:scale-105 transition-transform duration-500">
                                {vid.thumbnailUrl ? (
                                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover"/>
                                ) : (
                                    <video src={vid.videoUrl} className="w-full h-full object-cover" muted />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80"></div>
                                
                                {/* Linked Badge */}
                                {vid.targets && vid.targets.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md border border-white/20 shadow-sm">
                                        {vid.targets.length === 1 ? (
                                            <span className="truncate max-w-[80px] block">{vid.targets[0].name}</span>
                                        ) : (
                                            <span>{vid.targets.length} Linked Pages</span>
                                        )}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                                    <p className="font-bold text-sm truncate leading-tight mb-1">{vid.title}</p>
                                    <p className="text-xs opacity-80 font-light">{vid.price}</p>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-200">
                                    <button onClick={() => handleEdit(vid)} className="bg-white text-gray-800 p-2 rounded-full hover:text-blue-600 shadow-md">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(vid.id!)} className="bg-white text-gray-800 p-2 rounded-full hover:text-red-600 shadow-md">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button onClick={handleCreate} className="flex flex-col items-center justify-center aspect-[9/16] rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50 transition-all text-gray-400 hover:text-rose-600">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-white">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-sm font-medium">Add New Video</span>
                    </button>
                </div>
            </div>

            {/* 3. Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b bg-white flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800">{editingVideo.id ? 'Edit Video' : 'Add New Video'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Tabs */}
                            <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
                                <button onClick={() => setActiveTab('general')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>General Info</button>
                                <button onClick={() => setActiveTab('targeting')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'targeting' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>Targeting</button>
                                <button onClick={() => setActiveTab('preview')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>Preview</button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                
                                {/* GENERAL TAB */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Video Title <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-rose-500 focus:border-rose-500" value={editingVideo.title || ''} onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} placeholder="e.g. Summer Collection Teaser" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Price / Overlay Label</label>
                                            <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-rose-500 focus:border-rose-500" value={editingVideo.price || ''} onChange={e => setEditingVideo({...editingVideo, price: e.target.value})} placeholder="e.g. ₹1,499 or 'New Arrival'" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Video File (MP4) <span className="text-red-500">*</span></label>
                                                <MediaPicker value={editingVideo.videoUrl || ''} onChange={url => setEditingVideo({...editingVideo, videoUrl: url})} type="video" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Poster Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                                                <MediaPicker value={editingVideo.thumbnailUrl || ''} onChange={url => setEditingVideo({...editingVideo, thumbnailUrl: url})} type="image" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TARGETING TAB */}
                                {activeTab === 'targeting' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                                            Select where this video should appear. You can target multiple specific products, categories, or custom pages.
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex gap-4 mb-4 border-b pb-4">
                                                <button onClick={() => {setTargetType('product'); setLinkSearch('');}} className={`text-sm font-medium ${targetType === 'product' ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>Product</button>
                                                <button onClick={() => {setTargetType('category'); setLinkSearch('');}} className={`text-sm font-medium ${targetType === 'category' ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>Category</button>
                                                <button onClick={() => {setTargetType('custom'); setLinkSearch('');}} className={`text-sm font-medium ${targetType === 'custom' ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>Custom URL</button>
                                            </div>

                                            <div className="flex gap-2">
                                                {targetType === 'custom' ? (
                                                    <input type="text" placeholder="/pages/about-us" className="flex-1 border rounded-md px-3 py-2 text-sm" value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
                                                ) : (
                                                    <div className="relative flex-1">
                                                        <input type="text" placeholder={`Search ${targetType}...`} className="w-full border rounded-md px-3 py-2 text-sm" value={linkSearch} onChange={e => setLinkSearch(e.target.value)} />
                                                        {linkSearch && (
                                                            <div className="absolute z-10 w-full bg-white border shadow-lg mt-1 rounded-md max-h-48 overflow-y-auto">
                                                                {getFilteredItems().map((item: any) => (
                                                                    <div key={item.id} onClick={() => addTarget({ type: targetType, id: item.slug || item.id, name: item.name || item.title })} className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b">{item.name || item.title}</div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {targetType === 'custom' && <button onClick={() => { if(customUrl) { addTarget({ type: 'custom', id: customUrl, name: 'Custom Page' }); setCustomUrl(''); } }} className="bg-gray-900 text-white px-4 rounded-md text-sm">Add</button>}
                                            </div>
                                        </div>

                                        {/* Selected Targets List */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Active Targets</label>
                                            <div className="flex flex-wrap gap-2">
                                                {editingVideo.targets?.map((t, idx) => (
                                                    <div key={idx} className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm">
                                                        <span className="font-bold text-xs uppercase mr-2 text-gray-500">{t.type}</span>
                                                        <span className="mr-2 text-gray-800">{t.name}</span>
                                                        <button onClick={() => removeTarget(idx)} className="text-gray-400 hover:text-red-500">×</button>
                                                    </div>
                                                ))}
                                                {(!editingVideo.targets || editingVideo.targets.length === 0) && (
                                                    <p className="text-sm text-gray-400 italic">No pages targeted yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PREVIEW TAB */}
                                {activeTab === 'preview' && (
                                    <div className="flex justify-center h-full items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8">
                                        <div className="relative w-[280px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-200">
                                            {editingVideo.videoUrl ? (
                                                <video src={editingVideo.videoUrl} poster={editingVideo.thumbnailUrl} className="w-full h-full object-cover" controls={false} autoPlay muted loop />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/50">No Video Source</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <p className="font-bold text-lg leading-tight mb-1">{editingVideo.title || 'Video Title'}</p>
                                                <p className="text-sm font-light opacity-90">{editingVideo.price || 'Price Label'}</p>
                                                <button className="mt-3 w-full bg-white text-black font-bold py-2 rounded-full text-sm">View Product</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium transition-colors">Cancel</button>
                            <button onClick={handleSaveVideo} disabled={loading} className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-bold shadow-sm transition-colors disabled:opacity-50">{loading ? 'Saving...' : 'Save Video'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSettings;