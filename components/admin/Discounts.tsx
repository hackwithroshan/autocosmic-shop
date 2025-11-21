
import React, { useState, useEffect } from 'react';
import { Discount } from '../../types';
import { COLORS } from '../../constants';

const Discounts: React.FC<{token: string | null}> = ({token}) => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'Percentage',
        value: 0,
        maxUsage: 100,
        expiry: ''
    });

    const fetchDiscounts = async () => {
        try {
            const response = await fetch('/api/discounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            setDiscounts(data);
        } catch (error) {
            console.error("Error fetching discounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, [token]);

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsModalOpen(false);
                fetchDiscounts();
                setFormData({ code: '', type: 'Percentage', value: 0, maxUsage: 100, expiry: '' });
            }
        } catch (error) {
            console.error("Error saving discount", error);
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await fetch(`/api/discounts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDiscounts();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading discounts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Discounts & Coupons</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm"
                    style={{backgroundColor: COLORS.accent}}
                >
                    Create Discount
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discounts.length === 0 ? (
                             <tr><td colSpan={6} className="text-center py-4 text-gray-500">No discounts created yet.</td></tr>
                        ) : (
                            discounts.map(discount => (
                                <tr key={discount.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 border border-gray-300">{discount.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discount.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {discount.type === 'Percentage' ? `${discount.value}%` : discount.type === 'Flat' ? `$${discount.value}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {discount.usageCount} / {discount.maxUsage}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(discount.expiry).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleDelete(discount.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Create Discount Code</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Code</label>
                                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 uppercase" placeholder="e.g. SUMMER20"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3">
                                        <option value="Percentage">Percentage</option>
                                        <option value="Flat">Fixed Amount</option>
                                        <option value="Free Shipping">Free Shipping</option>
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Value</label>
                                <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
                                <input type="number" value={formData.maxUsage} onChange={e => setFormData({...formData, maxUsage: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"/>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-gray-200 rounded-md">Cancel</button>
                            <button onClick={handleSubmit} className="px-4 py-2 text-sm text-white rounded-md" style={{backgroundColor: COLORS.accent}}>Save Discount</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Discounts;
