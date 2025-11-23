import React, { useState, useEffect } from 'react';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';

interface Video {
    _id?: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    price: string;
}

const VideoSettings: React.FC<{ token: string | null }> = ({ token }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [editingVideo, setEditingVideo] = useState<Partial<Video>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchVideos = async () => {
        const res = await fetch('/api/content/videos');
        setVideos(await res.json());
    };

    useEffect(() => { fetchVideos(); }, []);

    const handleSave = async () => {
        const url = '/api/content/videos';
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(editingVideo)
        });
        if(res.ok) { fetchVideos(); setIsModalOpen(false); setEditingVideo({}); }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete video?")) return;
        await fetch(`/api/content/videos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        fetchVideos();
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-gray-700">Shoppable Videos (Reels)</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm">Add Video</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {videos.map(vid => (
                    <div key={vid._id} className="relative group rounded-lg overflow-hidden border">
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-full aspect-[9/16] object-cover"/>
                        <div className="absolute bottom-0 bg-black/70 text-white w-full p-2 text-xs">
                            <p className="truncate font-bold">{vid.title}</p>
                            <p>{vid.price}</p>
                        </div>
                        <button onClick={() => handleDelete(vid._id!)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100">Del</button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="font-bold">Add Shoppable Video</h3>
                        <input type="text" placeholder="Title" className="w-full border p-2 rounded" value={editingVideo.title || ''} onChange={e => setEditingVideo({...editingVideo, title: e.target.value})}/>
                        <input type="text" placeholder="Price Label (e.g. ₹999)" className="w-full border p-2 rounded" value={editingVideo.price || ''} onChange={e => setEditingVideo({...editingVideo, price: e.target.value})}/>
                        
                        <div>
                            <label className="text-xs text-gray-500">Thumbnail Image</label>
                            <MediaPicker value={editingVideo.thumbnailUrl || ''} onChange={url => setEditingVideo({...editingVideo, thumbnailUrl: url})} type="image" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Video File</label>
                            <MediaPicker value={editingVideo.videoUrl || ''} onChange={url => setEditingVideo({...editingVideo, videoUrl: url})} type="video" />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-rose-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSettings;