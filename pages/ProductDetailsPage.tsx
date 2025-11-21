
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS } from '../constants';

interface ProductDetailsPageProps {
  user: any;
  logout: () => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ user, logout }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products`);
        const data = await response.json();
        const found = data.find((p: Product) => p.id === id);
        setProduct(found || null);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert('Added to cart!');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} logout={logout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link to="/" className="text-gray-500 hover:text-gray-700 mb-6 flex items-center">
           &larr; Back to Shop
        </Link>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4">
              <img src={product.imageUrl} alt={product.name} className="max-h-96 object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm text-orange-600 font-semibold uppercase tracking-wide">{product.category}</span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{product.name}</h1>
              <p className="text-4xl font-bold text-gray-900 mt-4">${product.price.toFixed(2)}</p>
              
              <div className="mt-6">
                 <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4">
                   <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >-</button>
                      <span className="px-3 py-2 text-gray-900 font-medium">{quantity}</span>
                      <button 
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setQuantity(quantity + 1)}
                      >+</button>
                   </div>
                   <button 
                      onClick={handleAddToCart}
                      className="flex-1 px-8 py-3 text-base font-medium text-white rounded-md shadow-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: COLORS.accent }}
                   >
                      Add to Cart
                   </button>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {product.stock > 0 ? <span className="text-green-600">In Stock ({product.stock} available)</span> : <span className="text-red-600">Out of Stock</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
