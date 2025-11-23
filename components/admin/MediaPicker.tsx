import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { COLORS } from '../../constants';

// Helper component for the internal grid
const MediaGrid: React.FC<{ onSelect: (url: string) => void; token: string | null }> = ({ onSelect, token }) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch('/api/media', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setMedia(data);
            } catch (error) {
                console.error("Failed to fetch media", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, [token]);

    if (loading) return <div className="p-4 text-center">Loading Library...</div>;

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
            {media.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => onSelect(item.url)}
                    className="cursor-pointer group relative bg-white rounded-lg border border-gray-200 overflow-hidden aspect-square hover:border-rose-500 hover:ring-2 hover:ring-rose-200"
                >
                    {item.type === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-80" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        </div>
                    ) : (
                        <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                    )}
                </div>
            ))}
            {media.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No media found. Upload in Media Library first.</div>}
        </div>
    );
}

interface MediaPickerProps {
    value: string;
    onChange: (url: string) => void;
    type?: 'image' | 'video' | 'any';
    placeholder?: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ value, onChange, type = 'any', placeholder = "Select Media" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem('token');

    const handleSelect = (url: string) => {
        onChange(url);
        setIsOpen(false);
    };

    return (
        <div>
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        className="block w-full border-gray-300 rounded-l-lg shadow-sm p-2.5 border text-sm focus:ring-rose-500 focus:border-rose-500" 
                        placeholder={placeholder || "https://..."}
                    />
                </div>
                <button 
                    type="button" 
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 text-sm font-medium text-gray-700"
                >
                    Choose
                </button>
            </div>
            
            {/* Preview */}
            {value && (
                <div className="mt-2 w-20 h-20 rounded-md border border-gray-200 overflow-hidden relative bg-gray-50">
                    {value.match(/\.(mp4|webm|ogg)$/i) ? (
                         <video src={value} className="w-full h-full object-cover" />
                    ) : (
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => onChange('')} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl hover:bg-red-600">×</button>
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800">Choose from Library</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <MediaGrid onSelect={handleSelect} token={token} />
                        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
                            Need to upload new files? Go to <strong>Media Library</strong> section.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPicker;