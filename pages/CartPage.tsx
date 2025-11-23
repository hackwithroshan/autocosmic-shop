
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
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-600">Your cart is empty.</p>
                <Link 
                    to="/"
                    className="mt-4 inline-block px-6 py-2 text-white rounded-md"
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
                                <li key={item.id} className="p-6 flex items-center">
                                    <img src={item.imageUrl} alt={item.name} className="h-24 w-24 object-cover rounded-md border border-gray-200" />
                                    <div className="ml-6 flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button 
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >-</button>
                                                <span className="px-3 py-1 text-gray-900 font-medium">{item.quantity}</span>
                                                <button 
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >+</button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-sm text-red-600 hover:text-red-800 font-medium"
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
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium text-gray-900">Free</span>
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
