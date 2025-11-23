
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';

interface Collection {
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
    products: Product[]; // Populated products
    isActive: boolean;
}

const CollectionSettings: React.FC<{ token: string | null }> = ({ token }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Partial<Collection>>({ isActive: true, products: [] });
    const [productSearch, setProductSearch] = useState('');

    const fetchData = async () => {
        const [collRes, prodRes] = await Promise.all([
            fetch('/api/collections/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/products')
        ]);
        setCollections(await collRes.json());
        setAllProducts(await prodRes.json());
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleSave = async () => {
        const method = editingCollection.id ? 'PUT' : 'POST';
        const url = editingCollection.id ? `/api/collections/${editingCollection.id}` : '/api/collections';
        
        // Convert product objects to IDs for saving
        const payload = {
            ...editingCollection,
            products: editingCollection.products?.map(p => p.id) || []
        };

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchData();
            setIsModalOpen(false);
            setEditingCollection({ isActive: true, products: [] });
        } else {
            alert('Failed to save collection');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this collection?")) return;
        await fetch(`/api/collections/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        fetchData();
    };

    const toggleProduct = (product: Product) => {
        const current = editingCollection.products || [];
        const exists = current.find(p => p.id === product.id);
        
        let updated;
        if (exists) {
            updated = current.filter(p => p.id !== product.id);
        } else {
            updated = [...current, product];
        }
        setEditingCollection({ ...editingCollection, products: updated });
    };

    const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 text-lg">Collections (Shop By Category)</h3>
                <button 
                    onClick={() => { setEditingCollection({ isActive: true, products: [] }); setIsModalOpen(true); }}
                    className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm"
                >
                    + New Collection
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.map(col => (
                    <div key={col.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group relative">
                        <img src={col.imageUrl || 'https://via.placeholder.com/300x150'} alt={col.title} className="w-full h-40 object-cover"/>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{col.title}</h4>
                                    <p className="text-xs text-gray-500">{col.products?.length || 0} products linked</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${col.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {col.isActive ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{col.description}</p>
                            <div className="mt-4 flex gap-2 justify-end">
                                <button onClick={() => { setEditingCollection(col); setIsModalOpen(true); }} className="text-blue-600 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(col.id!)} className="text-red-600 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-fade-in-right">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingCollection.id ? 'Edit Collection' : 'New Collection'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">Close</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Title</label>
                                <input type="text" value={editingCollection.title || ''} onChange={e => setEditingCollection({...editingCollection, title: e.target.value})} className="w-full border p-2 rounded"/>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <MediaPicker value={editingCollection.imageUrl || ''} onChange={url => setEditingCollection({...editingCollection, imageUrl: url})} type="image"/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={3} value={editingCollection.description || ''} onChange={e => setEditingCollection({...editingCollection, description: e.target.value})} className="w-full border p-2 rounded"/>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={editingCollection.isActive} onChange={e => setEditingCollection({...editingCollection, isActive: e.target.checked})} className="h-4 w-4"/>
                                <label>Visible on Homepage</label>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="font-bold text-gray-800 mb-2">Manage Products</h4>
                                <p className="text-xs text-gray-500 mb-4">Select products to include in this collection.</p>
                                
                                <input 
                                    type="text" 
                                    placeholder="Search products to add..." 
                                    className="w-full border p-2 rounded mb-3 text-sm"
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />

                                <div className="h-64 overflow-y-auto border rounded bg-gray-50 p-2 space-y-1">
                                    {filteredProducts.map(prod => {
                                        const isSelected = editingCollection.products?.some(p => p.id === prod.id);
                                        return (
                                            <div key={prod.id} onClick={() => toggleProduct(prod)} className={`p-2 rounded flex items-center gap-3 cursor-pointer ${isSelected ? 'bg-rose-50 border border-rose-200' : 'bg-white border border-transparent hover:border-gray-200'}`}>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-rose-600 border-rose-600' : 'border-gray-400'}`}>
                                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                                                </div>
                                                <img src={prod.imageUrl} className="w-8 h-8 object-cover rounded"/>
                                                <span className="text-sm truncate flex-1">{prod.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 text-right">
                                    {editingCollection.products?.length} products selected
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border bg-white rounded">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-rose-600 text-white rounded hover:bg-rose-700">Save Collection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionSettings;
