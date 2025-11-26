import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface Collection {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    products: Product[];
}

const CollectionPage: React.FC<{ user: any; logout: () => void }> = ({ user, logout }) => {
    const { id } = useParams<{ id: string }>();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`/api/collections/${id}`);
                if (!res.ok) throw new Error('Collection not found');
                const data = await res.json();
                setCollection(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCollection();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Collection...</div>;
    if (!collection) return <div className="min-h-screen flex items-center justify-center">Collection Not Found</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header user={user} logout={logout} />
            
            {/* Banner */}
            <div className="relative w-full h-64 md:h-80 overflow-hidden">
                <img src={collection.imageUrl} alt={collection.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{collection.title}</h1>
                    {collection.description && <p className="text-white text-lg max-w-2xl">{collection.description}</p>}
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{collection.products.length} Products Found</h2>
                
                {collection.products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No products added to this collection yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collection.products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onProductClick={(slug) => navigate(`/product/${slug}`)} 
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CollectionPage;