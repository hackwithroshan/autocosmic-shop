
import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { COLORS } from '../constants';

const Marketing: React.FC<{token: string | null}> = ({token}) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', type: 'Email' });

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            console.error("Error fetching campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [token]);

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCampaign)
            });
            if (response.ok) {
                setIsModalOpen(false);
                fetchCampaigns();
                setNewCampaign({ name: '', type: 'Email' });
            }
        } catch (error) {
            console.error('Error creating campaign', error);
        }
    };

    if (loading) return <div>Loading campaigns...</div>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Marketing Campaigns</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm flex items-center"
                    style={{backgroundColor: COLORS.accent}}
                >
                    <span className="mr-2">+</span> Create Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white shadow-md">
                    <h3 className="text-lg font-semibold">Email Credits</h3>
                    <p className="text-3xl font-bold mt-2">12,450</p>
                    <p className="text-sm opacity-80 mt-1">Remaining out of 20,000</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white shadow-md">
                    <h3 className="text-lg font-semibold">SMS Credits</h3>
                    <p className="text-3xl font-bold mt-2">850</p>
                    <p className="text-sm opacity-80 mt-1">Auto-recharge enabled</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 flex flex-col justify-center items-center text-center">
                    <h3 className="text-gray-600 font-medium">AI Content Generator</h3>
                    <button className="mt-3 text-indigo-600 font-semibold text-sm border border-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-50">Try AI Assistant</button>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Recent Campaigns</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {campaigns.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500">No campaigns found.</td></tr>
                        ) : (
                            campaigns.map(campaign => (
                                <tr key={campaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            campaign.status === 'Sent' ? 'bg-green-100 text-green-800' :
                                            campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.status === 'Sent' ? (
                                            <div className="flex space-x-4">
                                                <div><span className="font-bold">{campaign.openRate}%</span> Open</div>
                                                <div><span className="font-bold">{campaign.clickRate}%</span> Click</div>
                                            </div>
                                        ) : '-'}
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
                        <h3 className="text-lg font-bold mb-4">Create New Campaign</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                                <input 
                                    type="text" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Channel</label>
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                                    value={newCampaign.type}
                                    onChange={e => setNewCampaign({...newCampaign, type: e.target.value})}
                                >
                                    <option value="Email">Email Broadcast</option>
                                    <option value="SMS">SMS Blast</option>
                                    <option value="WhatsApp">WhatsApp Message</option>
                                    <option value="Push">Mobile Push Notification</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-gray-200 rounded-md">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 text-sm text-white rounded-md" style={{backgroundColor: COLORS.accent}}>Draft Campaign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marketing;
