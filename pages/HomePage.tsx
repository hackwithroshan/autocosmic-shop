
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Product, Slide, Category } from '../types';
import { COLORS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

interface HomePageProps {
  user: any;
  logout: () => void;
}

// Static mapping for category images since API only returns names
const categoryImages: Record<string, string> = {
  'Clothing': 'https://images.unsplash.com/photo-1550614000-4b9519e025b9?q=80&w=300&auto=format&fit=crop',
  'Footwear': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=300&auto=format&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=300&auto=format&fit=crop',
  'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=300&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop'
};

const videoShoppableData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    title: 'Summer Vibes',
    price: '₹1,499'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1529139574466-a302c27524ed?q=80&w=600&auto=format&fit=crop',
    title: 'Evening Elegance',
    price: '₹2,999'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop',
    title: 'Casual Chic',
    price: '₹999'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
    title: 'Party Ready',
    price: '₹1,899'
  }
];

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    comment: "Absolutely love the quality of the dresses! Delivery was super fast.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "Anjali Verma",
    comment: "The jewelry collection is stunning. Bought a necklace and got so many compliments.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: 3,
    name: "Sneha Gupta",
    comment: "Great customer service and returns policy. Will definitely shop again.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/17.jpg"
  }
];

const HomePage: React.FC<HomePageProps> = ({ user, logout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  }

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(slideInterval);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, slideResponse, categoryResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/slides'),
          fetch('/api/products/categories')
        ]);
        
        if (!productResponse.ok) throw new Error('Failed to fetch products');
        if (!slideResponse.ok) throw new Error('Failed to fetch slides');
        
        const productData = await productResponse.json();
        const slideData = await slideResponse.json();
        // Handle category fetch safely as it might fail if endpoint isn't fully ready
        let categoryData = [];
        if(categoryResponse.ok) {
            categoryData = await categoryResponse.json();
        }

        setProducts(productData);
        setSlides(slideData);
        setCategories(categoryData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  // Derived Lists
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.length > 4 ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={user} logout={logout} />
      <main className="flex-grow">
        
        {/* 1. HERO SECTION SLIDER */}
        <div className="relative bg-gray-800 h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          {slides.length > 0 ? slides.map((slide, index) => (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img className="w-full h-full object-cover" src={slide.imageUrl} alt={slide.title}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-7xl mb-6 drop-shadow-lg animate-fade-in-up">
                        {slide.title}
                    </h1>
                    <p className="mt-4 max-w-xl mx-auto text-lg sm:text-xl text-gray-100 drop-shadow-md font-light mb-8">
                        {slide.subtitle}
                    </p>
                    <div className="mt-8 sm:mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <button className="px-8 py-3.5 border border-transparent text-base font-semibold rounded-full text-white shadow-lg hover:opacity-90 transition-transform transform hover:scale-105" style={{backgroundColor: COLORS.accent}}>
                            {slide.buttonText}
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full text-white">
                <p>Loading slides...</p>
            </div>
          )}
          
          {slides.length > 1 && <>
            <button onClick={prevSlide} className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 z-10 transition-all border border-white/30">
              <ChevronLeftIcon />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 z-10 transition-all border border-white/30">
              <ChevronRightIcon />
            </button>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>}
        </div>

        {/* 2. SHOP BY CATEGORIES */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 text-center mb-8">Shop By Category</h2>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
                {categories.length > 0 ? categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-rose-500 transition-all shadow-md">
                            <img 
                                src={categoryImages[cat.name] || categoryImages['default']} 
                                alt={cat.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <span className="mt-3 text-sm sm:text-base font-medium text-gray-800 group-hover:text-rose-600 transition-colors">{cat.name}</span>
                    </div>
                )) : (
                    <p className="text-gray-500">Loading categories...</p>
                )}
            </div>
        </div>

        {/* 3. NEW ARRIVALS */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">New Arrivals</h2>
                    <p className="text-gray-500 mt-1">Fresh styles just for you</p>
                </div>
                <a href="#" className="text-rose-600 font-medium hover:underline hidden sm:block">View All</a>
            </div>
            
            {loading ? <p className="text-center">Loading...</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
                ))}
              </div>
            )}
            <div className="mt-8 text-center sm:hidden">
                 <a href="#" className="text-rose-600 font-medium hover:underline">View All New Arrivals</a>
            </div>
          </div>
        </div>

        {/* 4. SHOP FROM VIDEO (REELS STYLE) */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-10">Shop From Video</h2>
            
            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-hidden">
                {videoShoppableData.map((video) => (
                    <div key={video.id} className="relative flex-shrink-0 w-64 sm:w-auto aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                        <img src={video.image} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                        
                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>

                        {/* Overlay Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h4 className="font-bold text-lg">{video.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-medium">{video.price}</span>
                                <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 5. BEST SELLERS */}
        <div className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold text-gray-900">Best Sellers</h2>
                <p className="text-gray-500 mt-2">Our most loved styles this season</p>
            </div>
            
            {loading ? <p className="text-center">Loading...</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. HAPPY CUSTOMERS (TESTIMONIALS) */}
        <div className="bg-rose-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">Happy Customers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-sm border border-rose-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-rose-200"/>
                            <div className="flex mb-4 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                ))}
                            </div>
                            <p className="text-gray-600 italic mb-6 leading-relaxed">"{testimonial.comment}"</p>
                            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                            <span className="text-xs text-gray-400 uppercase tracking-wide mt-1">Verified Buyer</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 7. CTA / NEWSLETTER */}
        <div className="bg-gray-900 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">Join the Smart Choice Club</h2>
                <p className="text-gray-300 text-lg mb-8">Subscribe to our newsletter and get 10% off your first purchase, plus early access to new arrivals and sales.</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                    <input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="w-full px-5 py-3.5 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-white transition-colors bg-rose-600 hover:bg-rose-700">
                        Subscribe
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">By subscribing you agree to our Terms & Conditions and Privacy Policy.</p>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
