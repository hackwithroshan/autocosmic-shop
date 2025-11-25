
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants';
import { StarIcon, PlayIcon } from '../components/Icons';
import { trackEvent } from '../utils/metaPixel';

interface ProductDetailsPageProps {
  user: any;
  logout: () => void;
}

interface ShopVideo {
    _id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    price: string;
    productLink?: string;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ user, logout }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [shopVideos, setShopVideos] = useState<ShopVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  
  // Video Playback State
  const [selectedVideo, setSelectedVideo] = useState<ShopVideo | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showStickyATC, setShowStickyATC] = useState(false);
  const mainButtonRef = useRef<HTMLDivElement>(null);
  
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Product Data
        const response = await fetch(`/api/products`);
        const data: Product[] = await response.json();
        const found = data.find((p: Product) => p.id === id);
        
        if (found) {
            setProduct(found);
            setActiveImage(found.imageUrl);
            
            // Load Reviews
            if (found.reviews) {
                setReviews(found.reviews);
            }
            
            // Meta Pixel: Track ViewContent
            trackEvent('ViewContent', {
              content_name: found.name,
              content_ids: [found.id],
              content_type: 'product',
              value: found.price,
              currency: 'INR'
            });

            if (found.hasVariants && found.variants) {
                const initialVariants: {[key: string]: string} = {};
                found.variants.forEach(v => {
                    if (v.options.length > 0) {
                        initialVariants[v.name] = v.options[0].value;
                    }
                });
                setSelectedVariants(initialVariants);
            }

            const related = data
                .filter(p => p.category === found.category && p.id !== found.id)
                .slice(0, 8); 
            setRelatedProducts(related);

            const viewedIds: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const historyProducts = viewedIds
                .filter(vid => vid !== found.id) 
                .map(vid => data.find(p => p.id === vid))
                .filter((p): p is Product => !!p);
            setRecentlyViewed(historyProducts);

            const newViewedIds = [found.id, ...viewedIds.filter(vid => vid !== found.id)].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(newViewedIds));
        }

        // Fetch Real Videos (Admin Managed)
        const videoRes = await fetch('/api/content/videos');
        if (videoRes.ok) {
            setShopVideos(await videoRes.json());
        }

      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchData();
        window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
      const observer = new IntersectionObserver(
          ([entry]) => {
              setShowStickyATC(!entry.isIntersecting && entry.boundingClientRect.top < 0);
          },
          { threshold: 0 }
      );

      if (mainButtonRef.current) {
          observer.observe(mainButtonRef.current);
      }

      return () => {
          if (mainButtonRef.current) observer.unobserve(mainButtonRef.current);
      };
  }, [loading, product]);

  const handleAddToCart = () => {
    if (product) {
      let variantName = product.name;
      if (Object.keys(selectedVariants).length > 0) {
          const variantString = Object.entries(selectedVariants).map(([key, val]) => `${val}`).join(' / ');
          variantName = `${product.name} - ${variantString}`;
      }

      const productToAdd = { ...product, name: variantName };
      addToCart(productToAdd, quantity);

      // Meta Pixel: Track AddToCart
      trackEvent('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'INR'
      });

      alert('Added to cart!');
    }
  };

  const handleBuyNow = () => {
      handleAddToCart();
      navigate('/cart');
  };

  const handleVariantChange = (variantName: string, value: string) => {
      setSelectedVariants(prev => ({ ...prev, [variantName]: value }));
  };

  // Video Handler
  const handleVideoClick = (video: ShopVideo) => {
      setSelectedVideo(video);
  };

  const handleVideoRedirect = (link?: string) => {
      if (!link) return;
      if (link.startsWith('http')) {
          window.open(link, '_blank');
      } else {
          const target = link.startsWith('/') ? link : `/product/${link}`;
          navigate(target);
      }
      setSelectedVideo(null);
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
              const savedReview = await res.json();
              setReviews([savedReview, ...reviews]);
              setNewReview({ rating: 5, comment: '', name: '' });
              alert('Review submitted successfully!');
          } else {
              alert('Failed to submit review.');
          }
      } catch (error) {
          console.error(error);
          alert('Error submitting review');
      } finally {
          setSubmittingReview(false);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  const images = [product.imageUrl, ...(product.galleryImages || [])];
  const discountPercentage = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
      : '0';

  const ScrollableProductList = ({ products }: { products: Product[] }) => (
      <div className="flex space-x-4 overflow-x-auto pb-4 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {products.map(p => (
              <div key={p.id} className="min-w-[180px] md:min-w-[240px] snap-center flex-shrink-0">
                  <ProductCard product={p} onProductClick={(id) => navigate(`/product/${id}`)} />
              </div>
          ))}
      </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24"> 
      <Header user={user} logout={logout} />
      
      <div className="container mx-auto px-4 py-4 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
         <Link to="/" className="hover:text-black">Home</Link>
         <span className="mx-2">/</span>
         <span className="text-gray-900 truncate">{product.name}</span>
      </div>

      <main className="flex-grow container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            
            {/* Left Column: Gallery */}
            <div className="space-y-4">
                <div className="relative aspect-[3/4] md:aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                     <img src={activeImage} alt={product.name} className="h-full w-full object-cover object-center transition-opacity duration-300" />
                     <div className="absolute top-4 left-4 flex flex-col gap-2">
                         {product.stock <= 0 ? <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">Out of Stock</span> : <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">In Stock</span>}
                         {discountPercentage > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">{discountPercentage}% OFF</span>}
                     </div>
                </div>
                {images.length > 1 && (
                    <div className="flex space-x-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:gap-4 md:space-x-0 scrollbar-hide">
                        {images.map((img, idx) => (
                            <button key={idx} onClick={() => setActiveImage(img)} className={`flex-shrink-0 w-20 md:w-auto aspect-square rounded-md overflow-hidden border-2 transition-colors ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}>
                                <img src={img} alt={`View ${idx}`} className="h-full w-full object-cover"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col">
                <div className="mb-2"><span className="text-sm text-gray-500 font-medium uppercase tracking-widest">{product.brand || "Ladies Smart Choice"}</span></div>
                <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2 leading-tight">{product.name}</h1>
                
                {/* Rating Summary */}
                <div className="flex items-center mb-4 space-x-2 cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({behavior: 'smooth'})}>
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />)}
                    </div>
                    <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>

                <div className="mb-6">
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        {product.mrp && product.mrp > product.price && (
                            <>
                                <span className="text-xl text-gray-500 line-through mb-1">₹{product.mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span className="text-lg font-bold text-green-600 mb-1">{discountPercentage}% OFF</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>

                {/* Variants */}
                {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="mb-6 space-y-4">
                        {product.variants.map((variant, idx) => (
                            <div key={idx}>
                                <p className="text-sm font-medium text-gray-900 mb-2">{variant.name}: <span className="text-gray-500">{selectedVariants[variant.name]}</span></p>
                                <div className="flex flex-wrap gap-2">
                                    {variant.options.map((option, optIdx) => (
                                        <button key={optIdx} onClick={() => handleVariantChange(variant.name, option.value)} className={`px-4 py-2 border text-sm font-medium transition-all rounded-md ${selectedVariants[variant.name] === option.value ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                                            {option.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Actions */}
                <div className="space-y-4 mb-8" ref={mainButtonRef}>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center border border-gray-300 h-12 w-full sm:w-32 rounded-md">
                            <button className="px-3 text-gray-600 hover:bg-gray-100 h-full w-full rounded-l-md text-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <span className="flex-1 text-center font-medium">{quantity}</span>
                            <button className="px-3 text-gray-600 hover:bg-gray-100 h-full w-full rounded-r-md text-xl" onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        {product.stock > 0 ? (
                            <button onClick={handleAddToCart} className="flex-1 h-12 bg-gray-900 text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-md">
                                Add to Cart
                            </button>
                        ) : (
                            <button disabled className="flex-1 h-12 bg-gray-300 text-gray-500 font-bold uppercase tracking-widest cursor-not-allowed rounded-md">Out of Stock</button>
                        )}
                     </div>
                     {product.stock > 0 && (
                        <button onClick={handleBuyNow} className="w-full h-12 border-2 font-bold uppercase tracking-widest transition-colors rounded-md text-pink-600 border-pink-600 hover:bg-pink-50">
                            Buy It Now
                        </button>
                     )}
                </div>

                {/* Accordions */}
                <div className="border-t border-gray-200">
                    <Accordion title="Description" defaultOpen={true}><div className="mb-4 whitespace-pre-wrap">{product.description}</div></Accordion>
                    <Accordion title="Shipping Policy"><p>We offer free shipping on all orders above ₹999. Orders are typically processed within 1-2 business days.</p></Accordion>
                    <Accordion title="Return Policies"><p>No Return No Exchange available on this item unless damaged upon arrival.</p></Accordion>
                </div>
            </div>
        </div>

        {/* SHOP FROM VIDEOS (Real Data with Playback) */}
        {shopVideos.length > 0 && (
            <section className="mb-16">
                <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                    Shop From Videos <PlayIcon className="h-6 w-6 text-rose-600"/>
                </h2>
                <div className="flex space-x-4 overflow-x-auto pb-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {shopVideos.map(video => (
                        <div 
                            key={video._id} 
                            onClick={() => handleVideoClick(video)}
                            className="relative flex-shrink-0 w-36 md:w-48 aspect-[9/16] rounded-xl overflow-hidden snap-center group cursor-pointer shadow-md"
                        >
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/60">
                                    <PlayIcon className="h-5 w-5 text-white ml-1"/>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm font-medium truncate">{video.title}</p>
                                {video.price && <p className="text-white/90 text-xs mt-0.5 font-light">{video.price}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* REVIEWS SECTION (Real Data) */}
        <section id="reviews-section" className="mb-16 bg-gray-50 p-6 md:p-10 rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Customer Reviews</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5" fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"}/>)}
                        </div>
                        <span className="font-bold text-gray-900">{averageRating}</span>
                        <span className="text-gray-500">based on {reviews.length} reviews</span>
                    </div>
                </div>
                <button onClick={() => document.getElementById('review-form')?.scrollIntoView({behavior: 'smooth'})} className="text-rose-600 font-bold hover:underline">
                    Write a Review
                </button>
            </div>
            
            {/* Review List */}
            <div className="space-y-6 mb-10">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to write one!</p>
                ) : (
                    reviews.slice(0, 5).map((rev, idx) => (
                        <div key={rev._id || idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 capitalize">{rev.name}</span>
                                <span className="text-xs text-gray-500">{new Date(rev.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3 w-3" fill={i < rev.rating ? "currentColor" : "none"} />)}
                            </div>
                            <p className="text-gray-600 text-sm">{rev.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Review Form */}
            <div id="review-form" className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Write a Review</h3>
                <form onSubmit={submitReview}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input 
                            type="text" 
                            required
                            value={newReview.name}
                            onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-rose-500"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({...newReview, rating: star})}
                                    className="focus:outline-none"
                                >
                                    <StarIcon className="h-6 w-6 text-yellow-400" fill={star <= newReview.rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                        <textarea 
                            required
                            rows={4}
                            value={newReview.comment}
                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-rose-500"
                            placeholder="Share your experience..."
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="bg-gray-900 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </section>

        {/* People Also Bought */}
        {relatedProducts.length > 0 && (
            <section className="mb-16">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">People Also Bought</h2>
                <ScrollableProductList products={relatedProducts} />
            </section>
        )}
        
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
            <section className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Recently Viewed</h2>
                <ScrollableProductList products={recentlyViewed} />
            </section>
        )}

      </main>
      
      {/* STICKY ADD TO CART BAR */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] py-3 px-4 z-40 transform transition-transform duration-500 ease-out ${showStickyATC ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="container mx-auto flex justify-between items-center gap-4 max-w-7xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 md:h-14 md:w-14 rounded-md object-cover border border-gray-100 shadow-sm"/>
                  <div className="flex flex-col justify-center min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm md:text-base truncate leading-tight">{product.name}</h4>
                      <p className="text-rose-600 font-bold text-sm md:text-lg leading-tight">
                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                  {product.stock > 0 ? (
                      <button onClick={handleAddToCart} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 md:px-8 rounded-full shadow-lg flex items-center gap-2 text-sm md:text-base">
                          <span>Add to Cart</span>
                      </button>
                  ) : (
                      <button disabled className="bg-gray-100 text-gray-400 font-bold py-3 px-6 rounded-full cursor-not-allowed border border-gray-200">Out of Stock</button>
                  )}
              </div>
          </div>
      </div>

      {/* FULL SCREEN VIDEO MODAL */}
      {selectedVideo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                <div className="absolute inset-0" onClick={() => setSelectedVideo(null)}></div>
                
                <div className="relative w-full max-w-md h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <video 
                        src={selectedVideo.videoUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        playsInline 
                        loop
                        onClick={(e) => {
                            const v = e.target as HTMLVideoElement;
                            v.paused ? v.play() : v.pause();
                        }}
                    />
                    
                    {/* Overlay Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pointer-events-none">
                        <div className="pointer-events-auto">
                            <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-md">{selectedVideo.title}</h3>
                            <p className="text-white/90 font-medium text-xl mb-6 drop-shadow-sm">{selectedVideo.price}</p>
                            
                            <button 
                                onClick={() => handleVideoRedirect(selectedVideo.productLink)}
                                className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-100 transition-transform transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                            >
                                <span>View Product</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
