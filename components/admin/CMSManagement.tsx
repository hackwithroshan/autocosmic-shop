
import React, { useState, useEffect } from 'react';
import SliderSettings from './SliderSettings';
import BlogEditor from './BlogEditor';
import PageEditor from './PageEditor';
import VideoSettings from './VideoSettings';
import TestimonialSettings from './TestimonialSettings';
import CollectionSettings from './CollectionSettings';

type CMSTab = 'slider' | 'collections' | 'blogs' | 'pages' | 'videos' | 'reviews';

interface CMSManagementProps {
    token: string | null;
    initialTab?: CMSTab;
}

const CMSManagement: React.FC<CMSManagementProps> = ({ token, initialTab }) => {
    const [activeTab, setActiveTab] = useState<CMSTab>(initialTab || 'collections');

    // Sync if initialTab changes
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const TabButton = ({ id, label }: { id: CMSTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
            <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                    <TabButton id="collections" label="Collections (Categories)" />
                    <TabButton id="videos" label="Shop Videos" />
                    <TabButton id="slider" label="Homepage Slider" />
                    <TabButton id="reviews" label="Testimonials" />
                    <TabButton id="blogs" label="Blog Posts" />
                    <TabButton id="pages" label="Static Pages" />
                </div>
            </div>

            {/* Content */}
            <div className="pt-4">
                {activeTab === 'collections' && <CollectionSettings token={token} />}
                {activeTab === 'slider' && <SliderSettings token={token} />}
                {activeTab === 'videos' && <VideoSettings token={token} />}
                {activeTab === 'reviews' && <TestimonialSettings token={token} />}
                {activeTab === 'blogs' && <BlogEditor token={token} />}
                {activeTab === 'pages' && <PageEditor token={token} />}
            </div>
        </div>
    );
};

export default CMSManagement;
