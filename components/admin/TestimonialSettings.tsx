import React, { useState, useEffect } from 'react';
import MediaPicker from './MediaPicker';

interface Review {
    _id?: string;
    name: string;
    comment: string;
    rating: number;
    imageUrl: string;
}

const TestimonialSettings: React.FC<{ token: string | null }> = ({ token }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [editingReview, setEditingReview] = useState<Partial<Review>>({ rating: 5 });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReviews = async () => {
        const res = await fetch('/api/content/testimonials');
        setReviews(await res.json());
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleSave = async () => {
        const res = await fetch('/api/content/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(editingReview)
        });
        if(res.ok) { fetchReviews(); setIsModalOpen(false); setEditingReview({ rating: 5 }); }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete review?")) return;
        await fetch(`/api/content/testimonials/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        fetchReviews();
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-gray-700">Customer Reviews</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm">Add Review</button>
            </div>
            <div className="space-y-2">
                {reviews.map(rev => (
                    <div key={rev._id} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div className="flex gap-3 items-center">
                            <img src={rev.imageUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-sm">{rev.name} <span className="text-yellow-500">★ {rev.rating}</span></p>
                                <p className="text-xs text-gray-500 truncate w-64">{rev.comment}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(rev._id!)} className="text-red-500 text-sm">Delete</button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="font-bold">Add Testimonial</h3>
                        <input type="text" placeholder="Customer Name" className="w-full border p-2 rounded" value={editingReview.name || ''} onChange={e => setEditingReview({...editingReview, name: e.target.value})}/>
                        <textarea placeholder="Comment" className="w-full border p-2 rounded" rows={3} value={editingReview.comment || ''} onChange={e => setEditingReview({...editingReview, comment: e.target.value})}/>
                        <div className="flex gap-4">
                            <label>Rating:</label>
                            <input type="number" max={5} min={1} className="border p-1 w-16" value={editingReview.rating} onChange={e => setEditingReview({...editingReview, rating: Number(e.target.value)})}/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Customer Photo</label>
                            <MediaPicker value={editingReview.imageUrl || ''} onChange={url => setEditingReview({...editingReview, imageUrl: url})} type="image" />
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

export default TestimonialSettings;