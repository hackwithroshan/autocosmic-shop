
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { COLORS } from '../constants';
import { trackEvent } from '../utils/metaPixel';

interface CheckoutPageProps {
  user: any;
  logout: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, logout }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Initialize form with user data if available, otherwise empty
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
      if (cart.length > 0) {
          // Meta Pixel: Initiate Checkout
          trackEvent('InitiateCheckout', {
              content_ids: cart.map(item => item.id),
              content_type: 'product',
              value: cartTotal,
              currency: 'INR',
              num_items: cart.reduce((acc, item) => acc + item.quantity, 0)
          });
      }
  }, [cart, cartTotal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Create Order on Backend (Get Order ID and Key)
        const orderResponse = await fetch('/api/orders/razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: cartTotal,
                currency: 'INR' 
            })
        });

        if (!orderResponse.ok) {
            const errData = await orderResponse.json();
            throw new Error(errData.message || 'Failed to initiate payment');
        }

        const { order_id, amount, currency, key_id } = await orderResponse.json();

        // 2. Options for Razorpay Modal
        const options = {
            key: key_id, 
            amount: amount,
            currency: currency,
            name: "Ladies Smart Choice",
            description: "Payment for Order",
            image: "https://cdn-icons-png.flaticon.com/512/4440/4440935.png", 
            order_id: order_id,
            handler: async function (response: any) {
                // 3. Payment Success
                // Meta Pixel: Track Purchase
                trackEvent('Purchase', {
                    value: cartTotal,
                    currency: 'INR',
                    content_ids: cart.map(item => item.id),
                    content_type: 'product',
                    order_id: order_id // Use Razorpay order ID for matching
                });

                await verifyAndPlaceOrder({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                });
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                contact: formData.phone
            },
            notes: {
                address: `${formData.address}, ${formData.city}`
            },
            theme: {
                color: COLORS.accent
            }
        };

        // 4. Open Razorpay
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
            alert(`Payment Failed: ${response.error.description}`);
            setLoading(false);
        });
        rzp1.open();

    } catch (error: any) {
        console.error('Payment initiation failed:', error);
        alert(`Could not start payment process: ${error.message}`);
        setLoading(false);
    }
  };

  const verifyAndPlaceOrder = async (paymentInfo: any) => {
      const orderData = {
        userId: user?.id, // Might be undefined if guest
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country
        },
        items: cart,
        total: cartTotal,
        paymentInfo: paymentInfo // Send payment details for verification
      };

      try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Order verification failed');
        }

        const responseData = await response.json();
        clearCart();
        
        // Success Feedback
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;">
                <div style="background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 400px;">
                    <svg style="width: 60px; height: 60px; color: green; margin: 0 auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <h2 style="margin-top: 20px; font-size: 24px; color: #333;">Order Placed!</h2>
                    <p style="color: #666; margin-top: 10px;">A confirmation email has been sent to <b>${formData.email}</b>.</p>
                    ${responseData.accountCreated ? `<div style="margin-top:15px; padding: 10px; background: #f0fdf4; color: #166534; border-radius: 5px; font-size: 14px;">An account has been created for you.<br/>Password: Your Mobile Number</div>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            document.body.removeChild(successDiv);
            if (user) {
                navigate('/dashboard');
            } else {
                // If guest, maybe redirect to login or home
                navigate('/');
            }
        }, 4000);

      } catch (error: any) {
          console.error('Order placement error:', error);
          alert(`Order failed: ${error.message}`);
      } finally {
          setLoading(false);
      }
  };

  if (cart.length === 0) {
      return (
          <div className="flex flex-col min-h-screen">
              <Header user={user} logout={logout} />
              <main className="flex-grow flex items-center justify-center bg-gray-50 px-4">
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                      <button onClick={() => navigate('/')} className="mt-4 text-pink-600 hover:underline">Go shopping</button>
                  </div>
              </main>
              <Footer />
          </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} logout={logout} />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center sm:text-left mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
            {!user && <p className="text-sm text-gray-500 mt-1">Checking out as Guest. An account will be created for you automatically.</p>}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Shipping Form */}
          <div className="order-2 lg:order-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handleRazorpayPayment} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="Required for password" />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" name="country" required value={formData.country} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-1 lg:order-2 bg-white p-6 rounded-lg shadow-md h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <ul className="divide-y divide-gray-200 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center flex-1 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded object-cover border border-gray-100 mr-3" />
                    <div className="truncate">
                        <span className="text-gray-600 font-medium text-sm mr-2">{item.quantity}x</span>
                        <span className="text-gray-900 text-sm truncate">{item.name}</span>
                    </div>
                  </div>
                  <span className="text-gray-900 text-sm font-medium whitespace-nowrap ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                <div className="flex flex-col space-y-3 mb-6">
                    <div className="border-2 border-blue-600 bg-blue-50 p-4 rounded-lg flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                            <span className="w-4 h-4 bg-blue-600 rounded-full mr-3"></span>
                            <span className="text-blue-800 font-bold">Razorpay (UPI, Cards, NetBanking)</span>
                        </div>
                        <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Razorpay" className="h-5 opacity-80"/>
                    </div>
                </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-bold rounded-md shadow hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#3399cc' }} 
            >
              {loading ? 'Processing...' : 'Pay & Place Order'}
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Payments are secure and encrypted by Razorpay.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
