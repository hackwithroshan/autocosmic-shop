
import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../types';
import { COLORS } from '../../constants';

const OrderList: React.FC<{token: string | null}> = ({token}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Edit State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form State for Editing
  const [editFormData, setEditFormData] = useState<Partial<Order>>({});

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleOpenModal = (order: Order) => {
      setSelectedOrder(order);
      // Initialize form data with current order values, providing safe defaults for nested objects
      setEditFormData({
          status: order.status,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone || '',
          shippingAddress: {
              address: order.shippingAddress?.address || '',
              city: order.shippingAddress?.city || '',
              postalCode: order.shippingAddress?.postalCode || '',
              country: order.shippingAddress?.country || ''
          },
          trackingInfo: {
              carrier: order.trackingInfo?.carrier || '',
              trackingNumber: order.trackingInfo?.trackingNumber || ''
          }
      });
      setEditMode(false);
      setIsModalOpen(true);
  };

  const handleSaveChanges = async () => {
      if (!selectedOrder) return;
      setModalLoading(true);
      try {
          const response = await fetch(`/api/orders/${selectedOrder.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(editFormData)
          });
          
          if (response.ok) {
              const updatedOrder = await response.json();
              // Update local state to reflect changes immediately
              setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
              setSelectedOrder(updatedOrder);
              setEditMode(false);
              alert('Order updated successfully!');
          } else {
              alert('Failed to update order');
          }
      } catch (e) {
          console.error(e);
          alert('Error updating order');
      } finally {
          setModalLoading(false);
      }
  };

  const handleInputChange = (section: 'root' | 'shippingAddress' | 'trackingInfo', field: string, value: string) => {
      setEditFormData(prev => {
          if (section === 'root') {
              return { ...prev, [field]: value };
          }
          if (section === 'shippingAddress') {
              return { 
                  ...prev, 
                  shippingAddress: { 
                      ...prev.shippingAddress, 
                      [field]: value 
                  } as any 
              };
          }
          if (section === 'trackingInfo') {
              return { 
                  ...prev, 
                  trackingInfo: { 
                      ...prev.trackingInfo, 
                      [field]: value 
                  } as any
              };
          }
          return prev;
      });
  };

  // --- Print Packing Slip Function ---
  const handlePrintPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print packing slips.');
        return;
    }

    const itemsHtml = order.items.map(item => {
        // Safe cast/check because productId is populated in the fetch logic of this component
        const product = item.productId as unknown as Product | null; 
        
        // Check for null product (deleted item)
        const name = product ? product.name : 'Unknown Item (Deleted)';
        const sku = product ? (product.sku || 'N/A') : 'N/A';

        return `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${sku}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${name}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
        </tr>
        `;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Packing Slip - ${order.id}</title>
            <style>
                body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #f1f1f1; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -1px; }
                .logo span { color: #F97316; }
                .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #e2e8f0; }
                .info-section { display: flex; justify-content: space-between; margin-bottom: 50px; }
                .info-block { width: 45%; }
                .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px; }
                .value { font-size: 15px; line-height: 1.6; color: #1e293b; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { text-align: left; border-bottom: 2px solid #0f172a; padding: 12px 0; font-size: 12px; text-transform: uppercase; font-weight: 700; }
                .footer { text-align: center; font-size: 13px; color: #64748b; margin-top: 80px; padding-top: 20px; border-top: 1px solid #f1f1f1; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Auto<span>Cosmic</span></div>
                <div class="title">Packing Slip</div>
            </div>
            
            <div class="info-section">
                <div class="info-block">
                    <div class="label">Order Details</div>
                    <div class="value">
                        <strong>Order ID:</strong> #${order.id.substring(0, 8).toUpperCase()}<br/>
                        <strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}<br/>
                        <strong>Status:</strong> ${order.status}
                    </div>
                </div>
                <div class="info-block">
                    <div class="label">Ship To</div>
                    <div class="value">
                        <strong>${order.customerName}</strong><br/>
                        ${order.shippingAddress?.address || ''}<br/>
                        ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}<br/>
                        ${order.shippingAddress?.country || ''}<br/>
                        Phone: ${order.customerPhone || 'N/A'}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="20%">SKU</th>
                        <th width="60%">Product</th>
                        <th width="20%" style="text-align: right;">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="footer">
                <p>Thank you for your business!</p>
                <p>If you have any questions about this shipment, please contact us at support@autocosmic.com</p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
  });

  // --- Helper Components for Modal ---

  const StatusTimeline = ({ status }: { status: string }) => {
      const steps = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];
      const currentStepIndex = steps.indexOf(status);
      const isCancelled = status === 'Cancelled' || status === 'Returned';

      if (isCancelled) return <div className="w-full bg-red-100 text-red-800 p-3 rounded-md text-center font-bold border border-red-200">Order is {status}</div>;

      return (
          <div className="w-full py-4">
              <div className="relative flex items-center justify-between w-full">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                  <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-10" 
                    style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                  ></div>
                  
                  {steps.map((step, index) => {
                      const completed = index <= currentStepIndex;
                      const active = index === currentStepIndex;
                      return (
                          <div key={step} className="flex flex-col items-center bg-white px-1">
                              <div className={`w-4 h-4 rounded-full border-2 ${completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'} ${active ? 'ring-4 ring-green-100' : ''}`}></div>
                              <span className={`text-xs mt-2 font-medium ${completed ? 'text-green-600' : 'text-gray-400'}`}>{step}</span>
                          </div>
                      )
                  })}
              </div>
          </div>
      );
  };
  
  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search Order ID, Name, Email..." 
                        className="pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <select 
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
             <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
             </button>
        </div>

      {/* --- Orders Table --- */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleOpenModal(order)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600">#{order.id.substring(0, 6)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">₹{order.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                       order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                       order.status === 'Processing' || order.status === 'Packed' ? 'bg-purple-100 text-purple-800' :
                       order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                    }`}>
                    {order.status}
                  </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }} 
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                    >
                        View Details
                    </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* --- Enhanced Order Details Modal --- */}
      {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                  
                  {/* Header */}
                  <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                      <div>
                          <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-gray-800">Order #{selectedOrder.id.substring(0,8)}</h3>
                              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                                  selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                  selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                              }`}>{selectedOrder.status}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{new Date(selectedOrder.date).toLocaleString()} • {selectedOrder.items.length} Items</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handlePrintPackingSlip(selectedOrder)} 
                            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center mr-2"
                            title="Print Packing Slip"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Slip
                        </button>

                        {!editMode ? (
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center border border-blue-200">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit Details
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => {setEditMode(false); handleOpenModal(selectedOrder);}} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSaveChanges} disabled={modalLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm flex items-center">
                                    {modalLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                      
                      {/* Status Timeline */}
                      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Status</h4>
                              {editMode && (
                                  <div className="w-48">
                                      <select 
                                            value={editFormData.status} 
                                            onChange={(e) => handleInputChange('root', 'status', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1.5 border"
                                       >
                                            <option>Pending</option>
                                            <option>Processing</option>
                                            <option>Packed</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                            <option>Returned</option>
                                            <option>Cancelled</option>
                                       </select>
                                  </div>
                              )}
                          </div>
                          <StatusTimeline status={editFormData.status || selectedOrder.status} />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Left Column: Order Items & Logistics */}
                          <div className="lg:col-span-2 space-y-8">
                              {/* Items */}
                              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                      <h4 className="text-sm font-bold text-gray-800">Ordered Items</h4>
                                  </div>
                                  <div className="p-6 space-y-6">
                                      {selectedOrder.items.map((item, idx) => {
                                          // Safe Check: Product might be null if deleted
                                          const product = item.productId as unknown as Product | null;
                                          
                                          if (!product || typeof product !== 'object') {
                                              return (
                                                  <div key={idx} className="flex items-center gap-5 p-4 bg-red-50 rounded-lg border border-red-100">
                                                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                                                      <div>
                                                          <p className="text-sm font-medium text-red-600">Product Unavailable (Deleted)</p>
                                                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                      </div>
                                                  </div>
                                              )
                                          }

                                          const price = product.price || 0;
                                          const name = product.name || 'Unknown Product';
                                          const img = product.imageUrl || 'https://via.placeholder.com/150?text=No+Image';
                                          const sku = product.sku || 'N/A';
                                          
                                          return (
                                            <div key={idx} className="flex items-center gap-5">
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-1">
                                                    <img src={img} alt={name} className="h-full w-full object-contain" />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="text-base font-semibold text-gray-900">{name}</h5>
                                                            <p className="text-xs text-gray-500 mt-0.5">SKU: {sku}</p>
                                                        </div>
                                                        <p className="text-base font-bold text-gray-900">₹{(price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                                        <span className="text-sm text-gray-500">₹{price.toFixed(2)} / unit</span>
                                                    </div>
                                                </div>
                                            </div>
                                          );
                                      })}
                                  </div>
                                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                      <span className="text-gray-600 font-medium">Total Order Amount</span>
                                      <span className="text-2xl font-bold text-gray-900">₹{selectedOrder.total.toFixed(2)}</span>
                                  </div>
                              </div>

                              {/* Logistics & Tracking */}
                              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                   <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                       <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v3.28a1 1 0 00.2 2.68l.9 1.2a2 2 0 01-.9.4H4a1 1 0 000 2h1a2 2 0 012 2v2a2 2 0 002 2h6a2 2 0 002-2v-2h2l3-6v-3h-6zm-6-6h4" /></svg>
                                       Logistics & Tracking
                                   </h4>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tracking Number</label>
                                            <input 
                                                type="text" 
                                                value={editFormData.trackingInfo?.trackingNumber || ''} 
                                                disabled={!editMode}
                                                onChange={(e) => handleInputChange('trackingInfo', 'trackingNumber', e.target.value)}
                                                placeholder={editMode ? "Enter Tracking ID" : "No tracking ID"}
                                                className={`w-full border rounded-md p-2.5 text-sm transition-colors ${!editMode ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                            />
                                       </div>
                                       <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Courier Service</label>
                                            <input 
                                                type="text" 
                                                value={editFormData.trackingInfo?.carrier || ''} 
                                                disabled={!editMode}
                                                onChange={(e) => handleInputChange('trackingInfo', 'carrier', e.target.value)}
                                                placeholder={editMode ? "e.g. FedEx, BlueDart" : "No courier info"}
                                                className={`w-full border rounded-md p-2.5 text-sm transition-colors ${!editMode ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                            />
                                       </div>
                                   </div>
                              </div>
                          </div>

                          {/* Right Column: Customer & Address */}
                          <div className="space-y-8">
                              
                              {/* Customer Card */}
                              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-10">
                                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                  </div>
                                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center relative z-10">
                                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                      Customer Details
                                  </h4>
                                  <div className="space-y-4 relative z-10">
                                      <div>
                                          <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                                          <input 
                                            type="text" 
                                            value={editFormData.customerName}
                                            disabled={!editMode} 
                                            onChange={(e) => handleInputChange('root', 'customerName', e.target.value)}
                                            className={`w-full text-sm font-semibold text-gray-900 bg-transparent border-b ${editMode ? 'border-gray-300 focus:border-blue-500' : 'border-transparent'}`}
                                          />
                                      </div>
                                      <div className="flex items-center">
                                          <div className="bg-blue-50 p-2 rounded-full mr-3 text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                                          <div className="flex-1">
                                              <label className="block text-xs text-gray-400">Email</label>
                                              <input 
                                                type="text" 
                                                value={editFormData.customerEmail}
                                                disabled={!editMode} 
                                                onChange={(e) => handleInputChange('root', 'customerEmail', e.target.value)}
                                                className={`w-full text-sm text-gray-800 bg-transparent border-b ${editMode ? 'border-gray-300 focus:border-blue-500' : 'border-transparent'}`}
                                              />
                                          </div>
                                      </div>
                                      <div className="flex items-center">
                                          <div className="bg-green-50 p-2 rounded-full mr-3 text-green-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                                          <div className="flex-1">
                                              <label className="block text-xs text-gray-400">Phone</label>
                                              <input 
                                                type="text" 
                                                value={editFormData.customerPhone}
                                                disabled={!editMode} 
                                                onChange={(e) => handleInputChange('root', 'customerPhone', e.target.value)}
                                                placeholder="Add Phone Number"
                                                className={`w-full text-sm text-gray-800 bg-transparent border-b ${editMode ? 'border-gray-300 focus:border-blue-500' : 'border-transparent'}`}
                                              />
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Shipping Address Card */}
                              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                     <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                     Shipping Address
                                  </h4>
                                  <div className="space-y-3">
                                      <div>
                                          <label className="block text-xs font-semibold text-gray-400">Street</label>
                                          <input 
                                            type="text" 
                                            value={editFormData.shippingAddress?.address}
                                            disabled={!editMode} 
                                            onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                                            className={`w-full text-sm text-gray-800 py-1 rounded ${editMode ? 'border border-gray-300 px-2 bg-white' : 'bg-transparent border-none p-0'}`}
                                          />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                          <div>
                                              <label className="block text-xs font-semibold text-gray-400">City</label>
                                              <input 
                                                type="text" 
                                                value={editFormData.shippingAddress?.city}
                                                disabled={!editMode} 
                                                onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                                                className={`w-full text-sm text-gray-800 py-1 rounded ${editMode ? 'border border-gray-300 px-2 bg-white' : 'bg-transparent border-none p-0'}`}
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-semibold text-gray-400">Zip Code</label>
                                              <input 
                                                type="text" 
                                                value={editFormData.shippingAddress?.postalCode}
                                                disabled={!editMode} 
                                                onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                                                className={`w-full text-sm text-gray-800 py-1 rounded ${editMode ? 'border border-gray-300 px-2 bg-white' : 'bg-transparent border-none p-0'}`}
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-semibold text-gray-400">Country</label>
                                          <input 
                                            type="text" 
                                            value={editFormData.shippingAddress?.country}
                                            disabled={!editMode} 
                                            onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                                            className={`w-full text-sm text-gray-800 py-1 rounded ${editMode ? 'border border-gray-300 px-2 bg-white' : 'bg-transparent border-none p-0'}`}
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
              </div>
          </div>
      )}

    </div>
  );
};

export default OrderList;
