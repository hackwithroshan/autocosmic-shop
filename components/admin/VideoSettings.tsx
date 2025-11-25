
import React, { useState, useEffect } from 'react';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';
import { Product } from '../../types';

interface Video {
    id?: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    price: string;
    productLink?: string; // ID (for product) or /path (for category/others)
}

interface Collection {
    id: string;
    title: string;
    imageUrl: string;
    products: any[];
}

const VideoSettings: React.FC<{ token: string | null }> = ({ token }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [editingVideo, setEditingVideo] = useState<Partial<Video>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Data for Linking
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    
    const [linkSearch, setLinkSearch] = useState('');
    const [linkType, setLinkType] = useState<'product' | 'category'>('product');
    const [loading, setLoading] = useState(false);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/content/videos');
            if (res.ok) setVideos(await res.json());
        } catch (e) { console.error("Fetch videos failed", e); }
    };

    const fetchData = async () => {
        try {
            const [prodRes, collRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/collections')
            ]);
            if (prodRes.ok) setProducts(await prodRes.json());
            if (collRes.ok) setCollections(await collRes.json());
        } catch (e) {
            console.error("Failed to fetch data for linking");
        }
    };

    useEffect(() => { 
        fetchVideos(); 
        fetchData();
    }, []);

    const handleCreate = () => {
        setEditingVideo({});
        setLinkSearch('');
        setLinkType('product');
        setIsModalOpen(true);
    };

    const handleEdit = (video: Video) => {
        setEditingVideo(video);
        setLinkSearch('');
        
        // Determine link type based on existing link
        if (video.productLink && video.productLink.startsWith('/collections/')) {
            setLinkType('category');
        } else {
            setLinkType('product');
        }
        
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // Thumbnail is now optional
        if (!editingVideo.title || !editingVideo.videoUrl) {
            alert("Please fill required fields (Title, Video File)");
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
                setEditingVideo({}); 
            } else {
                const err = await res.json();
                alert(`Failed to save: ${err.message}`);
            }
        } catch (e) {
            console.error(e);
            alert('Error saving video');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            const res = await fetch(`/api/content/videos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                fetchVideos();
            } else {
                alert("Failed to delete video");
            }
        } catch (e) { console.error(e); }
    };

    const handleLinkSelect = (item: Product | Collection, type: 'product' | 'category') => {
        if (type === 'product') {
            const p = item as Product;
            setEditingVideo({
                ...editingVideo,
                productLink: p.id, // Homepage assumes ID is product
                price: `₹${p.price}`,
                title: editingVideo.title || p.name
            });
        } else {
            const c = item as Collection;
            setEditingVideo({
                ...editingVideo,
                productLink: `/collections/${c.id}`, // Explicit path for collection
                price: '', // Categories usually don't have a single price
                title: editingVideo.title || c.title
            });
        }
        setLinkSearch('');
    };

    const handleRemoveLink = () => {
        setEditingVideo(prev => ({ ...prev, productLink: undefined, price: '' }));
    };

    // Helper to get linked item name for display
    const getLinkedItemName = (link?: string) => {
        if (!link) return null;
        if (link.startsWith('/collections/')) {
            const id = link.split('/')[2];
            const c = collections.find(col => col.id === id);
            return c ? { name: c.title, type: 'Collection' } : { name: 'Unknown Collection', type: 'Collection' };
        } else {
            const id = link.replace('/product/', '');
            const p = products.find(prod => prod.id === id);
            return p ? { name: p.name, type: 'Product' } : null; // If product deleted or not found
        }
    };

    // --- Derived State for Rendering Modal ---
    
    // 1. Resolve Linked Item for Modal
    let linkedItem: { name: string; image: string; type: string; detail: string } | null = null;
    if (editingVideo.productLink) {
        if (editingVideo.productLink.startsWith('/collections/')) {
            // It's a collection
            const id = editingVideo.productLink.split('/')[2];
            const coll = collections.find(c => c.id === id);
            if (coll) {
                linkedItem = { name: coll.title, image: coll.imageUrl, type: 'Category', detail: `${coll.products.length} products` };
            }
        } else {
            // It's a product (ID or /product/ID)
            const id = editingVideo.productLink.replace('/product/', '');
            const prod = products.find(p => p.id === id || p.slug === id);
            if (prod) {
                linkedItem = { name: prod.name, image: prod.imageUrl, type: 'Product', detail: `₹${prod.price}` };
            }
        }
    }

    // 2. Filtered List for Search
    const getFilteredItems = () => {
        const term = linkSearch.toLowerCase();
        if (linkType === 'product') {
            return products.filter(p => p.name.toLowerCase().includes(term));
        } else {
            return collections.filter(c => c.title.toLowerCase().includes(term));
        }
    };
    const filteredItems = getFilteredItems();

    return (
        <div>
            <div className="flex justify-between mb-6 items-center">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Shoppable Videos</h3>
                    <p className="text-xs text-gray-500">Manage homepage video reels</p>
                </div>
                <button onClick={handleCreate} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
                    + Add Video
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {videos.map(vid => {
                    const linkInfo = getLinkedItemName(vid.productLink);
                    return (
                        <div key={vid.id} className="relative group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            {/* Thumbnail */}
                            <div className="aspect-[9/16] relative bg-gray-100">
                                {vid.thumbnailUrl ? (
                                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                        <span className="text-xs">No Thumb</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90"></div>
                                
                                {/* Linked Product Badge */}
                                {linkInfo && (
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 max-w-[90%]">
                                        <div className={`w-1.5 h-1.5 rounded-full ${linkInfo.type === 'Product' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                                        <span className="truncate">{linkInfo.name}</span>
                                    </div>
                                )}

                                {/* Video Info Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                                    <p className="font-bold text-sm truncate leading-tight mb-0.5">{vid.title}</p>
                                    <p className="text-xs opacity-80 font-light">{vid.price}</p>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(vid)} 
                                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-50 hover:text-blue-600 shadow-md"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(vid.id!)} 
                                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-red-50 hover:text-red-600 shadow-md"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Add New Placeholder */}
                <button 
                    onClick={handleCreate}
                    className="flex flex-col items-center justify-center aspect-[9/16] rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50 transition-colors text-gray-400 hover:text-rose-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-sm font-medium">Add Video</span>
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800">
                                {editingVideo.id ? 'Edit Video' : 'Add New Video'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 p-6 space-y-6">
                            
                            {/* Dynamic Linking Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Linked Content</label>
                                
                                {linkedItem ? (
                                    // Selected State
                                    <div className="flex items-start gap-4 bg-white p-3 rounded border border-blue-200 shadow-sm">
                                        <img src={linkedItem.image} alt={linkedItem.name} className="w-12 h-12 rounded object-cover bg-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-blue-600 uppercase mb-0.5">{linkedItem.type}</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{linkedItem.name}</p>
                                            <p className="text-xs text-gray-500">{linkedItem.detail}</p>
                                        </div>
                                        <button 
                                            onClick={handleRemoveLink}
                                            className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    // Selection State
                                    <div>
                                        {/* Toggle Type */}
                                        <div className="flex space-x-4 border-b border-gray-200 mb-3">
                                            <button 
                                                className={`pb-2 text-sm font-medium ${linkType === 'product' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500'}`}
                                                onClick={() => { setLinkType('product'); setLinkSearch(''); }}
                                            >
                                                Link Product
                                            </button>
                                            <button 
                                                className={`pb-2 text-sm font-medium ${linkType === 'category' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500'}`}
                                                onClick={() => { setLinkType('category'); setLinkSearch(''); }}
                                            >
                                                Link Category
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder={`Search ${linkType === 'product' ? 'product' : 'collection'}...`}
                                                className="w-full pl-9 border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm" 
                                                value={linkSearch} 
                                                onChange={e => setLinkSearch(e.target.value)}
                                            />
                                            {linkSearch && (
                                                <div className="absolute z-20 w-full bg-white border border-gray-200 shadow-xl max-h-48 overflow-y-auto mt-1 rounded-md">
                                                    {filteredItems.length > 0 ? filteredItems.map((item: any) => (
                                                        <div 
                                                            key={item.id} 
                                                            className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b last:border-0 transition-colors"
                                                            onClick={() => handleLinkSelect(item, linkType)}
                                                        >
                                                            <img src={item.imageUrl} className="w-8 h-8 object-cover rounded bg-gray-100"/>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{item.name || item.title}</p>
                                                                <p className="text-xs text-gray-500">{item.price ? `₹${item.price}` : 'Collection'}</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="p-3 text-xs text-gray-500 text-center">No items found.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Video Details Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-rose-500 focus:border-rose-500 text-sm" 
                                        value={editingVideo.title || ''} 
                                        onChange={e => setEditingVideo({...editingVideo, title: e.target.value})}
                                        placeholder="Catchy title"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Price/Label</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. ₹1,499 or 'New Arrival'" 
                                        className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-rose-500 focus:border-rose-500 text-sm" 
                                        value={editingVideo.price || ''} 
                                        onChange={e => setEditingVideo({...editingVideo, price: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <MediaPicker 
                                        value={editingVideo.thumbnailUrl || ''} 
                                        onChange={url => setEditingVideo({...editingVideo, thumbnailUrl: url})} 
                                        type="image" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Video File (MP4) <span className="text-red-500">*</span></label>
                                    <MediaPicker 
                                        value={editingVideo.videoUrl || ''} 
                                        onChange={url => setEditingVideo({...editingVideo, videoUrl: url})} 
                                        type="video" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors">Cancel</button>
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingVideo.id ? 'Update Video' : 'Create Video')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSettings;
