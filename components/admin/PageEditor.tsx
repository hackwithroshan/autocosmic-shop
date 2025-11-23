
import React, { useState, useEffect } from 'react';
import { ContentPage } from '../../types';
import { COLORS } from '../../constants';

const PageEditor: React.FC<{ token: string | null }> = ({ token }) => {
    const [pages, setPages] = useState<ContentPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Partial<ContentPage>>({});

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/pages?admin=true', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                setPages(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPages(); }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const isNew = !editingPage.id;
        const url = isNew ? '/api/pages' : `/api/pages/${editingPage.id}`;
        const method = isNew ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editingPage)
            });
            if (res.ok) {
                fetchPages();
                setIsEditorOpen(false);
                setEditingPage({});
            } else {
                alert('Failed to save page');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await fetch(`/api/pages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            fetchPages();
        } catch (err) { console.error(err); }
    };

    const handleTitleChange = (val: string) => {
        setEditingPage(prev => ({
            ...prev,
            title: val,
            slug: !prev.id ? val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : prev.slug
        }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Content Pages</h3>
                <button 
                    onClick={() => { setEditingPage({ status: 'Hidden' }); setIsEditorOpen(true); }}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm"
                    style={{ backgroundColor: COLORS.accent }}
                >
                    + Create Page
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pages.length === 0 ? <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pages created yet.</td></tr> : 
                        pages.map(page => (
                            <tr key={page.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setEditingPage(page); setIsEditorOpen(true); }}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                    <div className="text-xs text-gray-500">/{page.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {page.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Editor Overlay */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-fade-in-right">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">{editingPage.id ? 'Edit Page' : 'New Page'}</h2>
                            <button onClick={() => setIsEditorOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Page Title</label>
                                <input type="text" required value={editingPage.title || ''} onChange={e => handleTitleChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input type="text" required value={editingPage.slug || ''} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Visibility</label>
                                    <select value={editingPage.status} onChange={e => setEditingPage({...editingPage, status: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        <option value="Hidden">Hidden</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Page Content (HTML)</label>
                                <textarea required rows={20} value={editingPage.content || ''} onChange={e => setEditingPage({...editingPage, content: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"/>
                            </div>
                        </form>
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: COLORS.accent }}>Save Page</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageEditor;
