
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Product, Slide } from '../types';
import { COLORS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

interface HomePageProps {
  user: any;
  logout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, logout }) => {
  const [products, setProducts] = useState<Product[]>([]);
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
    const fetchProductsAndSlides = async () => {
      try {
        const [productResponse, slideResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/slides')
        ]);
        
        if (!productResponse.ok) throw new Error('Failed to fetch products');
        if (!slideResponse.ok) throw new Error('Failed to fetch slides');
        
        const productData = await productResponse.json();
        const slideData = await slideResponse.json();

        setProducts(productData);
        setSlides(slideData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndSlides();
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} logout={logout} />
      <main className="flex-grow">
        {/* Hero Section Slider */}
        <div className="relative bg-gray-800 h-[600px] overflow-hidden">
          {slides.length > 0 ? slides.map((slide, index) => (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img className="w-full h-full object-cover" src={slide.imageUrl} alt={slide.title}/>
              <div className="absolute inset-0 bg-gray-900 opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {slide.title}
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-100">
                        {slide.subtitle}
                    </p>
                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm hover:opacity-90" style={{backgroundColor: COLORS.accent}}>
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
            {/* Slider Controls */}
            <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 z-10">
              <ChevronLeftIcon />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 z-10">
              <ChevronRightIcon />
            </button>
            
            {/* Indicator Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>}
        </div>

        {/* Featured Products Section */}
        <div className="bg-white">
          <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
            
            {loading && <p className="mt-6 text-center">Loading products...</p>}
            {error && <p className="mt-6 text-center text-red-500">{error}</p>}

            {!loading && !error && (
              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
