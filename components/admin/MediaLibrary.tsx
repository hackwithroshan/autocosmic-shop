
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { COLORS } from '../../constants';

const CLOUDINARY_UPLOAD_PRESET = 'ladiesh';
const CLOUDINARY_CLOUD_NAME = 'djbv48acj';
const CLOUDINARY_API_KEY = '985258492834513';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

const MediaLibrary: React.FC<{ token: string | null }> = ({ token }) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

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

    useEffect(() => {
        fetchMedia();
    }, [token]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        const uploads = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('api_key', CLOUDINARY_API_KEY);

            try {
                // 1. Upload to Cloudinary
                const res = await fetch(CLOUDINARY_UPLOAD_URL, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (data.secure_url) {
                    // 2. Save to Backend
                    const mediaData = {
                        url: data.secure_url,
                        public_id: data.public_id,
                        format: data.format,
                        type: data.resource_type // 'image' or 'video'
                    };

                    await fetch('/api/media', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(mediaData)
                    });
                } else {
                    console.error("Cloudinary upload error:", data);
                    alert(`Upload failed: ${data.error?.message || "Unknown error"}`);
                }
            } catch (error) {
                console.error("Upload failed for file", file.name, error);
            }
        });

        await Promise.all(uploads);
        setUploading(false);
        fetchMedia();
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleUpload(e.target.files);
    };

    const deleteMedia = async (id: string) => {
        if (!window.confirm("Delete this file from library?")) return;
        try {
            await fetch(`/api/media/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMedia(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopyFeedback(url);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    if (loading) return <div>Loading Library...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Media Library</h2>
                <div className="relative">
                    <input 
                        type="file" 
                        multiple 
                        onChange={handleFileSelect} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,video/*"
                    />
                    <button className="px-6 py-2 bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 transition-colors shadow-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Files
                    </button>
                </div>
            </div>

            {/* Drag Drop Area */}
            <div 
                className={`relative border-2 border-dashed rounded-xl p-8 mb-8 transition-all flex flex-col items-center justify-center text-center ${dragActive ? 'border-rose-500 bg-rose-50 scale-[1.01]' : 'border-gray-300 bg-gray-50'}`}
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-rose-600 font-medium">Uploading to Cloudinary...</p>
                    </div>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 font-medium">Drag & Drop images or videos here</p>
                        <p className="text-gray-400 text-xs mt-1">Supports JPG, PNG, MP4</p>
                    </>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10">
                {media.map((item) => (
                    <div key={item.id} className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden aspect-square hover:shadow-md transition-shadow">
                        {item.type === 'video' ? (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                <video src={item.url} className="w-full h-full object-cover opacity-80" muted />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white absolute" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        ) : (
                            <img src={item.url} alt="Uploaded" className="w-full h-full object-cover bg-gray-50" />
                        )}
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => copyToClipboard(item.url)}
                                    className="flex-1 bg-white text-gray-800 py-1.5 rounded text-xs font-bold hover:bg-gray-100"
                                >
                                    {copyFeedback === item.url ? 'Copied!' : 'Copy URL'}
                                </button>
                                <button 
                                    onClick={() => deleteMedia(item.id)}
                                    className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {media.length === 0 && !uploading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p>No files uploaded yet.</p>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
