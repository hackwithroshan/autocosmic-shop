
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS } from '../constants';

interface CartPageProps {
  user: any;
  logout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ user, logout }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} logout={logout} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-4 text-lg text-gray-600">Your cart is empty.</p>
                <Link 
                    to="/"
                    className="mt-6 inline-block px-6 py-3 text-white rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: COLORS.accent }}
                >
                    Continue Shopping
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {cart.map((item) => (
                                <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <img src={item.imageUrl} alt={item.name} className="h-24 w-24 object-cover rounded-md border border-gray-200 flex-shrink-0 self-start sm:self-center" />
                                    
                                    <div className="flex-1 flex flex-col justify-between h-full">
                                        <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category}</p>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 mt-1 sm:mt-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-4 sm:mt-0">
                                            <div className="flex items-center border border-gray-300 rounded-md h-8 sm:h-10">
                                                <button 
                                                    className="px-3 text-gray-600 hover:bg-gray-100 h-full rounded-l-md"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >−</button>
                                                <span className="px-2 text-gray-900 font-medium min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                                                <button 
                                                    className="px-3 text-gray-600 hover:bg-gray-100 h-full rounded-r-md"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >+</button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium text-green-600">Free</span>
                        </div>
                        <div className="border-t border-gray-200 my-4 pt-4 flex justify-between">
                            <span className="text-xl font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full py-3 px-4 text-white font-medium rounded-md shadow hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: COLORS.accent }}
                        >
                            Proceed to Checkout
                        </button>
                        <div className="mt-4 text-center">
                             <Link to="/" className="text-sm text-blue-600 hover:underline">or Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
