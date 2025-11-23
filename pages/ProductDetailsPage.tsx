
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants';

interface ProductDetailsPageProps {
  user: any;
  logout: () => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ user, logout }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  
  // State for Variants (e.g., { "Size": "L", "Color": "Red" })
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products`);
        const data: Product[] = await response.json();
        const found = data.find((p: Product) => p.id === id);
        
        if (found) {
            setProduct(found);
            setActiveImage(found.imageUrl);
            
            // Initialize variants if they exist
            if (found.hasVariants && found.variants) {
                const initialVariants: {[key: string]: string} = {};
                found.variants.forEach(v => {
                    if (v.options.length > 0) {
                        initialVariants[v.name] = v.options[0].value;
                    }
                });
                setSelectedVariants(initialVariants);
            }

            // Real Related Products (Same Category, excluding current)
            const related = data
                .filter(p => p.category === found.category && p.id !== found.id)
                .slice(0, 4);
            setRelatedProducts(related);

            // Real Recently Viewed Logic
            const viewedIds: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            
            // Filter out current product from history list for display, but fetch their details
            const historyProducts = viewedIds
                .filter(vid => vid !== found.id) 
                .map(vid => data.find(p => p.id === vid))
                .filter((p): p is Product => !!p)
                .slice(0, 4);
            setRecentlyViewed(historyProducts);

            // Update LocalStorage with current product
            const newViewedIds = [found.id, ...viewedIds.filter(vid => vid !== found.id)].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(newViewedIds));
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchProduct();
        window.scrollTo(0, 0);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Construct product name with selected variants
      let variantName = product.name;
      if (Object.keys(selectedVariants).length > 0) {
          const variantString = Object.entries(selectedVariants).map(([key, val]) => `${val}`).join(' / ');
          variantName = `${product.name} - ${variantString}`;
      }

      const productToAdd = { ...product, name: variantName };
      addToCart(productToAdd, quantity);
      // Optional: Add toast notification here
      alert('Added to cart!');
    }
  };

  const handleBuyNow = () => {
      handleAddToCart();
      navigate('/cart');
  };

  const handleVariantChange = (variantName: string, value: string) => {
      setSelectedVariants(prev => ({
          ...prev,
          [variantName]: value
      }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  const images = [product.imageUrl, ...(product.galleryImages || [])];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={user} logout={logout} />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
         <Link to="/" className="hover:text-black">Home</Link>
         <span className="mx-2">/</span>
         <span className="text-gray-900 truncate">{product.name}</span>
      </div>

      <main className="flex-grow container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Column: Gallery */}
            <div className="space-y-4">
                <div className="relative aspect-[3/4] md:aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                     <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="h-full w-full object-cover object-center transition-opacity duration-300"
                     />
                     {/* Badges */}
                     <div className="absolute top-4 left-4 flex flex-col gap-2">
                         {product.stock <= 0 ? (
                             <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">Out of Stock</span>
                         ) : (
                             <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">In Stock</span>
                         )}
                     </div>
                </div>
                
                {/* Thumbnails - scrollable on mobile */}
                {images.length > 1 && (
                    <div className="flex space-x-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:gap-4 md:space-x-0">
                        {images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)}
                                className={`flex-shrink-0 w-20 md:w-auto aspect-square rounded-md overflow-hidden border-2 transition-colors ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img src={img} alt={`View ${idx}`} className="h-full w-full object-cover"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col">
                <div className="mb-2">
                    <span className="text-sm text-gray-500 font-medium uppercase tracking-widest">{product.brand || "Ladies Smart Choice"}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2 leading-tight">{product.name}</h1>
                
                <div className="text-2xl font-medium text-gray-900 mb-6">
                    ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                {/* Info Blocks */}
                <div className="space-y-4 mb-8 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-start space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v3.28a1 1 0 00.2 2.68l.9 1.2a2 2 0 01-.9.4H4a1 1 0 000 2h1a2 2 0 012 2v2a2 2 0 002 2h6a2 2 0 002-2v-2h2l3-6v-3h-6zm-6-6h4" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Estimated delivery: 5-7 Working days.</p>
                        </div>
                    </div>
                     <div className="flex items-start space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Free Shipping & Returns</p>
                        </div>
                    </div>
                </div>
                
                {/* Meta */}
                <div className="text-sm text-gray-500 mb-6 space-y-1">
                    <p>SKU: {product.sku || 'N/A'}</p>
                    <p>Category: <span className="font-medium text-gray-900">{product.category}</span></p>
                </div>

                {/* Dynamic Variants */}
                {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="mb-6 space-y-4">
                        {product.variants.map((variant, idx) => (
                            <div key={idx}>
                                <p className="text-sm font-medium text-gray-900 mb-2">{variant.name}: <span className="text-gray-500">{selectedVariants[variant.name]}</span></p>
                                <div className="flex flex-wrap gap-2">
                                    {variant.options.map((option, optIdx) => (
                                        <button 
                                            key={optIdx}
                                            onClick={() => handleVariantChange(variant.name, option.value)}
                                            className={`px-4 py-2 border text-sm font-medium transition-all rounded-md ${
                                                selectedVariants[variant.name] === option.value 
                                                ? 'border-black bg-black text-white' 
                                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {option.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Actions */}
                <div className="space-y-4 mb-8">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center border border-gray-300 h-12 w-full sm:w-32 rounded-md">
                            <button 
                                className="px-3 text-gray-600 hover:bg-gray-100 h-full w-full rounded-l-md text-xl"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >−</button>
                            <span className="flex-1 text-center font-medium">{quantity}</span>
                            <button 
                                className="px-3 text-gray-600 hover:bg-gray-100 h-full w-full rounded-r-md text-xl"
                                onClick={() => setQuantity(quantity + 1)}
                            >+</button>
                        </div>
                        
                        {product.stock > 0 ? (
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 h-12 bg-gray-900 text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-md"
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <button disabled className="flex-1 h-12 bg-gray-300 text-gray-500 font-bold uppercase tracking-widest cursor-not-allowed rounded-md">
                                Out of Stock
                            </button>
                        )}
                     </div>
                     
                     {product.stock > 0 && (
                        <button 
                            onClick={handleBuyNow}
                            className="w-full h-12 border-2 font-bold uppercase tracking-widest transition-colors rounded-md text-pink-600 border-pink-600 hover:bg-pink-50"
                        >
                            Buy It Now
                        </button>
                     )}
                     
                     <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                         </svg>
                         <span>Guaranteed Safe Checkout</span>
                     </div>
                </div>

                {/* Accordions */}
                <div className="border-t border-gray-200">
                    <Accordion title="Description" defaultOpen={true}>
                        <div className="mb-4 whitespace-pre-wrap">{product.description}</div>
                    </Accordion>
                    <Accordion title="Shipping Policy">
                        <p>We offer free shipping on all orders above ₹999. Orders are typically processed within 1-2 business days. Standard delivery takes 5-7 business days.</p>
                    </Accordion>
                    <Accordion title="Return Policies">
                        <p>No Return No Exchange available on this item unless damaged upon arrival. Please check the product upon delivery.</p>
                    </Accordion>
                </div>
            </div>
        </div>

        {/* Feature Banner */}
        <div className="bg-black text-white py-4 px-4 mt-12 mb-12 overflow-hidden rounded-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-widest max-w-6xl mx-auto text-center md:text-left">
                <div className="flex items-center gap-2"><span className="text-gray-500">((o))</span> COD Available</div>
                <div className="flex items-center gap-2"><span className="text-gray-500">((o))</span> No Return No Exchange</div>
                <div className="flex items-center gap-2"><span className="text-gray-500">((o))</span> Free delivery</div>
            </div>
        </div>

        {/* People Also Bought */}
        {relatedProducts.length > 0 && (
            <section className="mb-16">
                <h2 className="text-2xl font-serif text-center mb-2">People Also Bought</h2>
                <p className="text-center text-gray-500 text-sm mb-8">Similar items in {product.category}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map(p => (
                        <ProductCard key={p.id} product={p} onProductClick={(id) => navigate(`/product/${id}`)} />
                    ))}
                </div>
            </section>
        )}
        
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
            <section className="mb-12">
                <h2 className="text-2xl font-serif text-center mb-2">Recently Viewed</h2>
                <p className="text-center text-gray-500 text-sm mb-8">Pick up where you left off.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {recentlyViewed.map(p => (
                        <div key={p.id} className="relative group cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                                 <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"/>
                                 <span className="absolute top-2 left-2 bg-gray-600 text-white text-[10px] uppercase font-bold px-2 py-1">Recently Viewed</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-600">₹{p.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
