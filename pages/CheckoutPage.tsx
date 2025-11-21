
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS } from '../constants';

interface CheckoutPageProps {
  user: any;
  logout: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, logout }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      userId: user?.id,
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      items: cart,
      total: cartTotal,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Order failed');
      }

      clearCart();
      alert('Order placed successfully!');
      if (user) {
          navigate('/dashboard');
      } else {
          navigate('/');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
      return (
          <div className="flex flex-col min-h-screen">
              <Header user={user} logout={logout} />
              <main className="flex-grow flex items-center justify-center">
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                      <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">Go shopping</button>
                  </div>
              </main>
              <Footer />
          </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} logout={logout} />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Shipping Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" name="country" required value={formData.country} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <ul className="divide-y divide-gray-200 mb-4">
              {cart.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium">{item.quantity}x</span>
                    <span className="ml-2 text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                <div className="flex space-x-4 mb-6">
                    <div className="border border-orange-500 bg-orange-50 p-3 rounded-md flex-1 text-center cursor-pointer text-orange-700 font-medium">
                        Credit Card
                    </div>
                     <div className="border border-gray-200 p-3 rounded-md flex-1 text-center cursor-pointer text-gray-600 hover:bg-gray-50">
                        PayPal
                    </div>
                </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-bold rounded-md shadow hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: COLORS.accent }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
