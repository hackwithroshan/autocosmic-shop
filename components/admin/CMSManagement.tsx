
import React, { useState } from 'react';
import SliderSettings from './SliderSettings';
import BlogEditor from './BlogEditor';
import PageEditor from './PageEditor';

type CMSTab = 'slider' | 'blogs' | 'pages';

const CMSManagement: React.FC<{ token: string | null }> = ({ token }) => {
    const [activeTab, setActiveTab] = useState<CMSTab>('slider');

    const TabButton = ({ id, label }: { id: CMSTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-4">
                    <TabButton id="slider" label="Homepage Slider" />
                    <TabButton id="blogs" label="Blog Posts" />
                    <TabButton id="pages" label="Pages" />
                </div>
            </div>

            {/* Content */}
            <div className="pt-4">
                {activeTab === 'slider' && <SliderSettings token={token} />}
                {activeTab === 'blogs' && <BlogEditor token={token} />}
                {activeTab === 'pages' && <PageEditor token={token} />}
            </div>
        </div>
    );
};

export default CMSManagement;
