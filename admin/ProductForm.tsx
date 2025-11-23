
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { COLORS } from '../../constants';

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const initialFormData: Omit<Product, 'id'> = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  brand: '',
  sku: '',
  barcode: '',
  category: 'Performance',
  subCategory: '',
  tags: [],
  status: 'Active',
  price: 0,
  mrp: 0,
  costPrice: 0,
  taxRate: 0,
  stock: 0,
  lowStockThreshold: 5,
  allowBackorders: false,
  imageUrl: '',
  galleryImages: [],
  videoUrl: '',
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [],
  hasVariants: false,
  variants: [],
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormData);
  const [currentTab, setCurrentTab] = useState<'general' | 'inventory' | 'shipping' | 'seo' | 'variants'>('general');
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...initialFormData, // Defaults
        ...product, // Overwrite with product data
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        tags: product.tags || [],
        galleryImages: product.galleryImages || [],
        variants: product.variants || [],
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle Nested Dimensions
    if (name.startsWith('dim_')) {
        const dimKey = name.split('_')[1];
        setFormData(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions!, [dimKey]: Number(value) }
        }));
        return;
    }

    let val: any = value;
    if (type === 'number') val = Number(value);
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // Auto-generate Slug and SEO Title from Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormData(prev => ({
          ...prev,
          name: val,
          slug: prev.slug ? prev.slug : val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          seoTitle: prev.seoTitle ? prev.seoTitle : val
      }));
  };

  // Tags Logic
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          if (tagInput.trim()) {
              setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
              setTagInput('');
          }
      }
  };
  const removeTag = (index: number) => {
      setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== index) }));
  };

  // Gallery Logic
  const addGalleryImage = () => {
      if(galleryInput.trim()) {
          setFormData(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), galleryInput.trim()] }));
          setGalleryInput('');
      }
  };
  const removeGalleryImage = (index: number) => {
      setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages?.filter((_, i) => i !== index) }));
  };

  // Variant Logic
  const addVariant = () => {
      const newVariant: ProductVariant = {
          name: 'Size',
          options: [{ value: 'Standard', price: formData.price, stock: 10 }]
      };
      setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };
  
  const updateVariantName = (vIndex: number, val: string) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].name = val;
      setFormData({ ...formData, variants: updated });
  };

  const addVariantOption = (vIndex: number) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].options.push({ value: '', price: formData.price, stock: 0 });
      setFormData({ ...formData, variants: updated });
  };

  const updateVariantOption = (vIndex: number, oIndex: number, field: string, val: any) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].options[oIndex] = { ...updated[vIndex].options[oIndex], [field]: val };
      setFormData({ ...formData, variants: updated });
  };

  const removeVariant = (vIndex: number) => {
     const updated = (formData.variants || []).filter((_, i) => i !== vIndex);
     setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: product?.id });
  };

  const calculateDiscount = () => {
      if (formData.mrp && formData.price && formData.mrp > formData.price) {
          return Math.round(((formData.mrp - formData.price) / formData.mrp) * 100);
      }
      return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 min-h-screen pb-12">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
         <div>
             <h2 className="text-xl font-bold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
             <p className="text-xs text-gray-500">{product ? `ID: ${product.id}` : 'Create a new catalog item'}</p>
         </div>
         <div className="flex space-x-3">
             <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
             <button type="submit" className="px-6 py-2 text-sm font-bold text-white rounded-md shadow-sm hover:opacity-90" style={{backgroundColor: COLORS.accent}}>Save Product</button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* 1. Basic Details */}
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Basic Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleNameChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-orange-500 focus:border-orange-500" placeholder="e.g., Cosmic Turbo Kit v2"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="AutoCosmic"/>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="AC-TB-001"/>
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Short Description</label>
                        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Brief summary for cards..."/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Full Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border font-mono text-sm" placeholder="Detailed product info..."/>
                        <p className="text-xs text-gray-500 mt-1">Supports plain text. (Rich text planned).</p>
                    </div>
                </div>
             </div>

             {/* 2. Media */}
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Media</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Main Image URL <span className="text-red-500">*</span></label>
                        <div className="flex mt-1 gap-2">
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="https://..."/>
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="h-10 w-10 rounded object-cover border"/>}
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
                         <div className="flex mt-1 gap-2">
                            <input type="text" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Add image URL..."/>
                            <button type="button" onClick={addGalleryImage} className="px-4 py-2 bg-gray-100 border rounded-md hover:bg-gray-200">Add</button>
                         </div>
                         <div className="mt-3 flex flex-wrap gap-3">
                             {formData.galleryImages?.map((img, idx) => (
                                 <div key={idx} className="relative group">
                                     <img src={img} alt="" className="h-20 w-20 object-cover rounded-md border shadow-sm"/>
                                     <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                 </div>
                             ))}
                         </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
                        <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="YouTube/Vimeo link"/>
                    </div>
                </div>
             </div>

             {/* 3. Pricing & Inventory */}
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Pricing & Inventory</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border font-bold text-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">MRP ($)</label>
                        <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border text-gray-500"/>
                        {calculateDiscount() > 0 && <p className="text-xs text-green-600 mt-1">{calculateDiscount()}% Discount</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cost Price (Internal)</label>
                        <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                    </div>
                </div>
                
                <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Low Stock Alert</label>
                        <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"/>
                    </div>
                     <div className="flex items-center pt-6">
                         <input type="checkbox" id="backorder" name="allowBackorders" checked={formData.allowBackorders} onChange={handleChange} className="h-4 w-4 text-orange-600 border-gray-300 rounded"/>
                         <label htmlFor="backorder" className="ml-2 block text-sm text-gray-900">Allow Backorders</label>
                    </div>
                </div>
             </div>

             {/* 4. Variants */}
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Product Variants</h3>
                    <div className="flex items-center">
                        <input type="checkbox" id="hasVariants" name="hasVariants" checked={formData.hasVariants} onChange={handleChange} className="h-4 w-4 text-orange-600 border-gray-300 rounded"/>
                        <label htmlFor="hasVariants" className="ml-2 text-sm text-gray-700 mr-4">Enable Variants</label>
                        {formData.hasVariants && (
                            <button type="button" onClick={addVariant} className="text-sm text-blue-600 font-semibold">+ Add Option</button>
                        )}
                    </div>
                </div>

                {formData.hasVariants && (
                    <div className="space-y-6">
                        {formData.variants?.map((variant, vIndex) => (
                            <div key={vIndex} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <input 
                                        type="text" 
                                        value={variant.name} 
                                        onChange={(e) => updateVariantName(vIndex, e.target.value)} 
                                        className="font-semibold bg-transparent border-b border-gray-300 focus:outline-none"
                                        placeholder="Option Name (e.g. Size)"
                                    />
                                    <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-500 text-sm">Remove</button>
                                </div>
                                <div className="space-y-2">
                                    {variant.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="grid grid-cols-4 gap-2 items-center">
                                            <input type="text" value={opt.value} onChange={(e) => updateVariantOption(vIndex, oIndex, 'value', e.target.value)} className="border p-1 rounded text-sm" placeholder="Value (e.g. Red)"/>
                                            <input type="number" value={opt.price} onChange={(e) => updateVariantOption(vIndex, oIndex, 'price', Number(e.target.value))} className="border p-1 rounded text-sm" placeholder="Price"/>
                                            <input type="number" value={opt.stock} onChange={(e) => updateVariantOption(vIndex, oIndex, 'stock', Number(e.target.value))} className="border p-1 rounded text-sm" placeholder="Stock"/>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addVariantOption(vIndex)} className="text-xs text-gray-500 underline">+ Add Value</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
             
             {/* 5. Shipping & Delivery */}
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                 <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Shipping</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                         <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 w-full border p-2 rounded"/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Length (cm)</label>
                         <input type="number" name="dim_length" value={formData.dimensions?.length} onChange={handleChange} className="mt-1 w-full border p-2 rounded"/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
                         <input type="number" name="dim_width" value={formData.dimensions?.width} onChange={handleChange} className="mt-1 w-full border p-2 rounded"/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                         <input type="number" name="dim_height" value={formData.dimensions?.height} onChange={handleChange} className="mt-1 w-full border p-2 rounded"/>
                     </div>
                 </div>
             </div>

          </div>

          {/* Right Column - Organization & Settings */}
          <div className="space-y-8">
              
              {/* Status */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Product Status</h3>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                  </select>
                  <div className="mt-3 text-xs text-gray-500">
                      <p>Active: Visible to customers.</p>
                      <p>Draft: Hidden from store.</p>
                  </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Organization</h3>
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full border p-2 rounded">
                            <option>Performance</option>
                            <option>Exterior</option>
                            <option>Interior</option>
                            <option>Maintenance</option>
                            <option>Merchandise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
                        <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="mt-1 w-full border p-2 rounded" placeholder="e.g. Exhausts"/>
                      </div>
                  </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Tags</h3>
                  <input 
                    type="text" 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={handleTagKeyDown}
                    className="w-full border p-2 rounded text-sm" 
                    placeholder="Enter tags (press Enter)"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags?.map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center">
                              {tag}
                              <button type="button" onClick={() => removeTag(idx)} className="ml-1 text-gray-500 hover:text-red-500">×</button>
                          </span>
                      ))}
                  </div>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Search Engine Optimization</h3>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-medium text-gray-700">Page Title</label>
                          <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-sm"/>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-700">Meta Description</label>
                          <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="mt-1 w-full border p-2 rounded text-sm"></textarea>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-700">URL Slug</label>
                          <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-sm text-gray-500 bg-gray-50"/>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </form>
  );
};

export default ProductForm;
