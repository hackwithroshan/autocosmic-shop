
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Category } from '../../types';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';

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
  category: '',
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
  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  
  // Category Management State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/products/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (!formData.category && data.length > 0 && !product) {
           setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      }
    } catch (e) { console.error("Failed to fetch categories", e); }
  };

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        ...initialFormData,
        ...product,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        tags: product.tags || [],
        galleryImages: product.galleryImages || [],
        variants: product.variants || [],
        seoKeywords: product.seoKeywords || [],
        status: product.status || 'Active',
      });
    } else {
        setFormData(initialFormData);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
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

  // Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormData(prev => ({
          ...prev,
          name: val,
          slug: !product && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')) 
                ? val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') 
                : prev.slug,
          seoTitle: !prev.seoTitle ? val : prev.seoTitle
      }));
  };

  // Tags Logic
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          if (tagInput.trim()) {
              if (!formData.tags?.includes(tagInput.trim())) {
                  setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
              }
              setTagInput('');
          }
      }
  };
  const removeTag = (index: number) => {
      setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== index) }));
  };

  // SEO Keywords Logic
  const handleSeoKeywordKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          if (seoKeywordInput.trim()) {
              if (!formData.seoKeywords?.includes(seoKeywordInput.trim())) {
                  setFormData(prev => ({ ...prev, seoKeywords: [...(prev.seoKeywords || []), seoKeywordInput.trim()] }));
              }
              setSeoKeywordInput('');
          }
      }
  };
  const removeSeoKeyword = (index: number) => {
      setFormData(prev => ({ ...prev, seoKeywords: prev.seoKeywords?.filter((_, i) => i !== index) }));
  };

  const addGalleryImage = () => {
      setFormData(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), ''] }));
  };
  
  const updateGalleryImage = (index: number, url: string) => {
      const images = [...(formData.galleryImages || [])];
      images[index] = url;
      setFormData(prev => ({ ...prev, galleryImages: images }));
  };

  const removeGalleryImage = (index: number) => {
      setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages?.filter((_, i) => i !== index) }));
  };

  // Variant Logic
  const addVariant = () => {
      const newVariant: ProductVariant = { name: 'Size', options: [{ value: 'Standard', price: formData.price, stock: 10, image: '' }] };
      setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };
  
  const updateVariantName = (vIndex: number, val: string) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].name = val;
      setFormData({ ...formData, variants: updated });
  };

  const addVariantOption = (vIndex: number) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].options.push({ value: '', price: formData.price, stock: 0, image: '' });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // Category Management
  const handleAddCategory = async () => {
      if(!newCatName.trim()) return;
      const token = localStorage.getItem('token');
      try {
          const res = await fetch('/api/products/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: newCatName })
          });
          if (res.ok) { setNewCatName(''); fetchCategories(); } else { alert('Failed to add category.'); }
      } catch(e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
      if(!window.confirm("Are you sure?")) return;
      const token = localStorage.getItem('token');
      try {
          await fetch(`/api/products/categories/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchCategories();
      } catch(e) { console.error(e); }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col w-full h-full bg-gray-100 relative">
      {/* Sticky Header */}
      <div className="bg-black border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md z-40 sticky top-0">
         <div className="flex items-center space-x-4">
             <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
             <div>
                <h2 className="text-lg font-bold text-white">{product ? 'Edit Product' : 'Create Product'}</h2>
                {product && <p className="text-xs text-gray-400">Editing: {product.name}</p>}
             </div>
         </div>
         <div className="flex space-x-3">
             <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-md hover:bg-gray-800">Discard</button>
             <button type="submit" className="px-6 py-2 text-sm font-bold text-white rounded-md shadow-lg hover:opacity-90" style={{backgroundColor: COLORS.accent}}>Save</button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              {/* LEFT CONTENT */}
              <div className="lg:col-span-2 space-y-8">
                 
                 {/* Basic Info */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Product Details</h3>
                    <div className="space-y-5">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Title</label><input type="text" name="name" value={formData.name} onChange={handleNameChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-3 border"/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/></div>
                             <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input type="text" name="sku" value={formData.sku} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={8} className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm"/></div>
                    </div>
                 </div>

                 {/* Media (Replaced inputs with MediaPicker) */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Media</h3>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image <span className="text-red-500">*</span></label>
                        <MediaPicker value={formData.imageUrl} onChange={(url) => setFormData(prev => ({...prev, imageUrl: url}))} type="image" />
                    </div>
                    <div className="mb-6">
                         <div className="flex justify-between mb-2">
                             <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
                             <button type="button" onClick={addGalleryImage} className="text-sm text-blue-600 hover:underline">+ Add Image</button>
                         </div>
                         <div className="space-y-3">
                             {formData.galleryImages?.map((img, idx) => (
                                 <div key={idx} className="flex gap-2 items-center">
                                     <div className="flex-1">
                                        <MediaPicker value={img} onChange={(url) => updateGalleryImage(idx, url)} type="image" placeholder={`Gallery Image ${idx+1}`} />
                                     </div>
                                     <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-500 p-2">×</button>
                                 </div>
                             ))}
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                        <MediaPicker value={formData.videoUrl || ''} onChange={(url) => setFormData(prev => ({...prev, videoUrl: url}))} type="video" placeholder="Select or paste video URL" />
                    </div>
                 </div>

                 {/* Pricing */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pricing & Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border font-bold"/></div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">MRP</label><input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/></div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/></div>
                    </div>
                 </div>

                 {/* Variants */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Variants</h3>
                        <div className="flex items-center">
                            <input type="checkbox" id="hasVariants" checked={formData.hasVariants} onChange={handleChange} name="hasVariants" className="mr-2" />
                            <label htmlFor="hasVariants">Enable Variants</label>
                        </div>
                    </div>
                    {formData.hasVariants && (
                        <div className="space-y-6">
                            {formData.variants?.map((variant, vIndex) => (
                                <div key={vIndex} className="bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex justify-between mb-2"><input type="text" value={variant.name} onChange={(e) => updateVariantName(vIndex, e.target.value)} className="font-bold bg-transparent border-b mb-2" placeholder="Option Name"/><button type="button" onClick={() => removeVariant(vIndex)} className="text-red-500 text-xs">Remove</button></div>
                                    {variant.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="grid grid-cols-12 gap-2 items-center mb-2">
                                            <div className="col-span-3"><input type="text" value={opt.value} onChange={(e) => updateVariantOption(vIndex, oIndex, 'value', e.target.value)} className="w-full border p-1 rounded text-sm" placeholder="Value"/></div>
                                            <div className="col-span-2"><input type="number" value={opt.price} onChange={(e) => updateVariantOption(vIndex, oIndex, 'price', Number(e.target.value))} className="w-full border p-1 rounded text-sm" placeholder="Price"/></div>
                                            <div className="col-span-2"><input type="number" value={opt.stock} onChange={(e) => updateVariantOption(vIndex, oIndex, 'stock', Number(e.target.value))} className="w-full border p-1 rounded text-sm" placeholder="Stock"/></div>
                                            <div className="col-span-5"><MediaPicker value={opt.image || ''} onChange={(url) => updateVariantOption(vIndex, oIndex, 'image', url)} type="image" placeholder="Image" /></div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addVariantOption(vIndex)} className="text-sm text-blue-600">+ Add Option Value</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariant} className="bg-blue-50 text-blue-600 px-3 py-1 rounded">+ Add Variant Type</button>
                        </div>
                    )}
                 </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Status</h3>
                      <select name="status" value={formData.status} onChange={handleChange} className="block w-full border-gray-300 rounded-lg p-2 border"><option>Active</option><option>Draft</option><option>Archived</option></select>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Category</h3>
                      <div className="flex justify-between mb-2"><label>Select Category</label><button type="button" onClick={() => setIsManageCatsOpen(true)} className="text-xs text-blue-600 hover:underline">Manage</button></div>
                      <select name="category" value={formData.category} onChange={handleChange} className="block w-full border-gray-300 rounded-lg p-2 border">
                          <option value="" disabled>Select...</option>
                          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                  </div>
                  
                  {/* Tags */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Tags</h3>
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Search Engine Optimization</h3>
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
                              <label className="block text-xs font-medium text-gray-700">Keywords</label>
                              <input 
                                type="text" 
                                value={seoKeywordInput} 
                                onChange={(e) => setSeoKeywordInput(e.target.value)} 
                                onKeyDown={handleSeoKeywordKeyDown}
                                className="mt-1 w-full border p-2 rounded text-sm" 
                                placeholder="Comma separated keywords"
                              />
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {formData.seoKeywords?.map((keyword, idx) => (
                                      <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex items-center border border-blue-100">
                                          {keyword}
                                          <button type="button" onClick={() => removeSeoKeyword(idx)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
                                      </span>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-700">URL Slug</label>
                              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-sm text-gray-500 bg-gray-50"/>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Manage Categories Modal */}
      {isManageCatsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50"><h3 className="font-bold">Manage Categories</h3><button onClick={() => setIsManageCatsOpen(false)}>×</button></div>
                <div className="p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">{categories.map(cat => <li key={cat.id} className="flex justify-between border-b pb-1"><span>{cat.name}</span><button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500">Delete</button></li>)}</ul>
                </div>
                <div className="p-4 border-t flex gap-2"><input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 border p-2 rounded" placeholder="New Category"/><button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 rounded">Add</button></div>
            </div>
        </div>
      )}
    </form>
  );
};

export default ProductForm;
