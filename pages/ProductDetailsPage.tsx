
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import { StarIcon, PlayIcon } from '../components/Icons';
import { trackEvent } from '../utils/metaPixel';

interface ShopVideo {
    _id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    price: string;
    productLink?: string;
}

const ProductDetailsPage: React.FC<{ user: any; logout: () => void }> = ({ user, logout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- Data State ---
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [shopVideos, setShopVideos] = useState<ShopVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Interaction State ---
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [selectedVideo, setSelectedVideo] = useState<ShopVideo | null>(null);
  
  // --- Reviews State ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, videosRes] = await Promise.all([
            fetch(`/api/products`),
            fetch('/api/content/videos')
        ]);
        
        const allProducts: Product[] = await productsRes.json();
        const foundProduct = allProducts.find((p: Product) => p.id === id);
        
        if (foundProduct) {
            setProduct(foundProduct);
            setActiveImage(foundProduct.imageUrl);
            setReviews(foundProduct.reviews || []);
            
            // Initialize Variants (Default to first option)
            if (foundProduct.hasVariants && foundProduct.variants) {
                const defaults: {[key: string]: string} = {};
                foundProduct.variants.forEach(v => {
                    if (v.options.length > 0) defaults[v.name] = v.options[0].value;
                });
                setSelectedVariants(defaults);
            }

            // Related Products Logic
            setRelatedProducts(allProducts.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 4));

            // Recently Viewed Logic
            const viewedIds: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const history = viewedIds.map(vid => allProducts.find(p => p.id === vid)).filter((p): p is Product => !!p && p.id !== foundProduct.id);
            setRecentlyViewed(history);
            
            // Update Local Storage
            const newHistory = [foundProduct.id, ...viewedIds.filter(vid => vid !== foundProduct.id)].slice(0, 8);
            localStorage.setItem('recentlyViewed', JSON.stringify(newHistory));

            // Pixel Tracking
            trackEvent('ViewContent', { 
                content_name: foundProduct.name, 
                content_ids: [foundProduct.id], 
                value: foundProduct.price, 
                currency: 'INR' 
            });
        }

        if (videosRes.ok) {
            setShopVideos(await videosRes.json());
        }

      } catch (error) {
        console.error('Failed to fetch product data', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
        fetchData();
        window.scrollTo(0, 0);
    }
  }, [id]);

  // --- Handlers ---

  const handleVariantChange = (name: string, value: string) => {
      setSelectedVariants(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = (isBuyNow = false) => {
      if (!product) return;

      // Construct Variant Name
      let variantLabel = "";
      if (Object.keys(selectedVariants).length > 0) {
          variantLabel = Object.values(selectedVariants).join(' / ');
      }
      
      // Create a specific item for the cart
      const cartItem = {
          ...product,
          name: variantLabel ? `${product.name} - ${variantLabel}` : product.name,
          selectedOptions: selectedVariants // Pass metadata if cart supports it later
      };

      addToCart(cartItem, quantity);

      trackEvent('AddToCart', {
        content_name: cartItem.name,
        content_ids: [product.id],
        value: product.price * quantity,
        currency: 'INR'
      });

      if (isBuyNow) {
          navigate('/cart');
      } else {
          // Optional: Toast notification here
          alert(`Added ${quantity} item(s) to cart`); 
      }
  };

  const submitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      setSubmittingReview(true);
      try {
          const res = await fetch(`/api/products/${product.id}/reviews`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newReview)
          });
          if (res.ok) {
              const saved = await res.json();
              setReviews([saved, ...reviews]);
              setNewReview({ rating: 5, comment: '', name: '' });
          } else {
              alert("Failed to submit review. Please try again.");
          }
      } catch(e) {
          console.error(e);
      } finally {
          setSubmittingReview(false);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center bg-white">Product not found</div>;

  const images = [product.imageUrl, ...(product.galleryImages || [])];
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      <Header user={user} logout={logout} />

      {/* --- Breadcrumbs --- */}
      <div className="container mx-auto px-4 py-4 max-w-[1400px]">
          <nav className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Link to="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
      </div>

      <main className="container mx-auto px-4 max-w-[1400px] pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* --- LEFT COLUMN: GALLERY (7/12) --- */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Main Image */}
                <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden rounded-sm group cursor-zoom-in">
                    <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discount > 0 && <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">-{discount}% Sale</span>}
                        {product.stock < 5 && product.stock > 0 && <span className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">Low Stock</span>}
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="grid grid-cols-5 gap-4">
                        {images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)}
                                className={`relative aspect-[3/4] overflow-hidden rounded-sm border transition-all ${activeImage === img ? 'border-black ring-1 ring-black' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: DETAILS (5/12) --- */}
            <div className="lg:col-span-5 relative">
                <div className="sticky top-8 space-y-8">
                    
                    {/* Title Block */}
                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">{product.brand || 'LADIES SMART CHOICE'}</h2>
                        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight mb-4">{product.name}</h1>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-4">
                                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                {product.mrp && product.mrp > product.price && (
                                    <span className="text-lg text-gray-400 line-through decoration-1">₹{product.mrp.toLocaleString()}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <StarIcon className="w-4 h-4 text-yellow-500" fill="currentColor"/>
                                <span className="font-bold">{avgRating}</span>
                                <span className="text-gray-400 underline cursor-pointer hover:text-gray-600">({reviews.length} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {product.shortDescription || product.description.substring(0, 150) + "..."}
                    </p>

                    {/* Selectors */}
                    <div className="space-y-6">
                        {product.hasVariants && product.variants?.map((variant, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900">{variant.name}</span>
                                    <span className="text-xs text-gray-500">{selectedVariants[variant.name]}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {variant.options.map((opt, oIdx) => {
                                        const isSelected = selectedVariants[variant.name] === opt.value;
                                        return (
                                            <button 
                                                key={oIdx}
                                                onClick={() => handleVariantChange(variant.name, opt.value)}
                                                className={`px-6 py-2 text-sm border transition-all min-w-[3rem] ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                                            >
                                                {opt.value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Quantity */}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 block">Quantity</span>
                            <div className="flex items-center border border-gray-300 w-32 h-10">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-gray-50">-</button>
                                <span className="flex-1 text-center font-medium text-sm">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50">+</button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            onClick={() => handleAddToCart(false)}
                            disabled={product.stock <= 0}
                            className="w-full bg-black text-white h-12 text-sm font-bold uppercase tracking-widest hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-opacity"
                        >
                            {product.stock > 0 ? `Add to Cart - ₹${(product.price * quantity).toLocaleString()}` : 'Out of Stock'}
                        </button>
                        {product.stock > 0 && (
                            <button 
                                onClick={() => handleAddToCart(true)}
                                className="w-full bg-white border border-black text-black h-12 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Buy Now
                            </button>
                        )}
                    </div>

                    {/* Policies / Info */}
                    <div className="pt-6 border-t border-gray-100">
                        <Accordion title="Product Description" defaultOpen>
                            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                                {product.description}
                            </div>
                        </Accordion>
                        <Accordion title="Shipping & Delivery">
                            <p>Free shipping on orders over ₹999. Standard delivery takes 3-5 business days.</p>
                        </Accordion>
                        <Accordion title="Returns & Exchanges">
                            <p>Easy 7-day returns on unworn items with original tags attached.</p>
                        </Accordion>
                    </div>

                </div>
            </div>
        </div>

        {/* --- SECTION: STYLE INSPIRATION (VIDEOS) --- */}
        {shopVideos.length > 0 && (
            <div className="mt-24 border-t border-gray-100 pt-16">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Style Inspiration</h3>
                    <Link to="/" className="text-sm font-bold text-gray-900 border-b border-black pb-0.5">View All Stories</Link>
                </div>
                
                {/* Modified to Grid Layout: 4 Videos Full Width */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {shopVideos.slice(0, 4).map(video => (
                        <div 
                            key={video._id}
                            onClick={() => setSelectedVideo(video)}
                            className="relative aspect-[9/16] bg-gray-100 cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
                        >
                            <video 
                                src={video.videoUrl} 
                                muted 
                                loop 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-110 shadow-lg">
                                    <PlayIcon className="w-5 h-5 text-black ml-0.5"/>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <p className="text-white font-bold truncate mb-1">{video.title}</p>
                                <p className="text-white/80 text-xs">{video.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SECTION: CUSTOMER REVIEWS --- */}
        <div className="mt-24 border-t border-gray-100 pt-16 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left: Write Review Form */}
                <div className="lg:col-span-4">
                    <div className="bg-gray-50 p-8 rounded-xl">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Write a Review</h3>
                        <p className="text-sm text-gray-500 mb-6">Share your thoughts with other customers.</p>
                        
                        <form onSubmit={submitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            onClick={() => setNewReview({...newReview, rating: star})}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <StarIcon className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newReview.name}
                                    onChange={e => setNewReview({...newReview, name: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-black focus:border-black"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Review</label>
                                <textarea 
                                    required 
                                    rows={4}
                                    value={newReview.comment}
                                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-black focus:border-black"
                                    placeholder="How was the fit? Material quality?"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submittingReview}
                                className="w-full bg-black text-white font-bold py-3 rounded-md uppercase text-xs tracking-widest hover:bg-gray-900 disabled:opacity-50 transition-colors"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Review List */}
                <div className="lg:col-span-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900">Customer Reviews</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <StarIcon key={s} className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-500' : 'text-gray-200'}`} fill="currentColor"/>
                                    ))}
                                </div>
                                <span className="text-lg font-bold text-gray-900">{avgRating}</span>
                                <span className="text-gray-500">Based on {reviews.length} reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 italic">No reviews yet. Be the first to write one!</p>
                        ) : (
                            reviews.map((rev, idx) => (
                                <div key={idx} className="border-b border-gray-100 pb-8 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                                {rev.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{rev.name}</h4>
                                                <span className="text-xs text-gray-400">{new Date(rev.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-yellow-500' : 'text-gray-200'}`} fill="currentColor"/>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mt-3 pl-13">{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>

        {/* --- SECTION: RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
            <div className="mt-24">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8 text-center">You May Also Like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {relatedProducts.map(p => (
                        <ProductCard key={p.id} product={p} onProductClick={(pid) => navigate(`/product/${pid}`)} />
                    ))}
                </div>
            </div>
        )}

        {/* --- SECTION: RECENTLY VIEWED --- */}
        {recentlyViewed.length > 0 && (
            <div className="mt-24 mb-12">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Recently Viewed</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {recentlyViewed.map(p => (
                        <div key={p.id} className="min-w-[200px] w-[200px]">
                            <ProductCard product={p} onProductClick={(pid) => navigate(`/product/${pid}`)} />
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedVideo(null)}>
            <div className="relative h-[80vh] aspect-[9/16] bg-black rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <video src={selectedVideo.videoUrl} controls autoPlay className="w-full h-full object-contain"/>
                <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/40">✕</button>
                {selectedVideo.productLink && (
                    <div className="absolute bottom-8 left-4 right-4">
                        <Link 
                            to={selectedVideo.productLink.startsWith('http') ? selectedVideo.productLink : `/product/${selectedVideo.productLink}`} 
                            className="block w-full bg-white text-black font-bold text-center py-3 rounded-full uppercase text-sm tracking-wider hover:bg-gray-100"
                        >
                            Shop Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
