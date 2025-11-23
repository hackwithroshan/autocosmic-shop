
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Category } from '../../types';
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
  const [galleryInput, setGalleryInput] = useState('');
  
  // Category Management State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // Drag and Drop State
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/products/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        // Set default category if none selected and categories exist
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
        status: product.status || 'Active',
      });
    } else {
        setFormData(initialFormData);
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
          // Only auto-generate slug if it's new or wasn't manually edited
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

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const images = [...(formData.galleryImages || [])];
    if (direction === 'left' && index > 0) {
      [images[index], images[index - 1]] = [images[index - 1], images[index]];
    } else if (direction === 'right' && index < images.length - 1) {
      [images[index], images[index + 1]] = [images[index + 1], images[index]];
    }
    setFormData(prev => ({ ...prev, galleryImages: images }));
  };

  // Variant Logic
  const addVariant = () => {
      const newVariant: ProductVariant = {
          name: 'Size',
          options: [{ value: 'Standard', price: formData.price, stock: 10, image: '' }]
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
      updated[vIndex].options.push({ value: '', price: formData.price, stock: 0, image: '' });
      setFormData({ ...formData, variants: updated });
  };

  const updateVariantOption = (vIndex: number, oIndex: number, field: string, val: any) => {
      const updated = [...(formData.variants || [])];
      updated[vIndex].options[oIndex] = { ...updated[vIndex].options[oIndex], [field]: val };
      setFormData({ ...formData, variants: updated });
  };

  const removeVariantOption = (vIndex: number, oIndex: number) => {
    const updated = [...(formData.variants || [])];
    updated[vIndex].options = updated[vIndex].options.filter((_, i) => i !== oIndex);
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

  // Prevent Enter key from submitting the form accidentally
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // --- Category Management Handlers ---
  const handleAddCategory = async () => {
      if(!newCatName.trim()) return;
      const token = localStorage.getItem('token');
      try {
          const res = await fetch('/api/products/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: newCatName })
          });
          if (res.ok) {
              setNewCatName('');
              fetchCategories();
          } else {
              alert('Failed to add category. It might already exist.');
          }
      } catch(e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
      if(!window.confirm("Are you sure? This cannot be undone.")) return;
      const token = localStorage.getItem('token');
      try {
          await fetch(`/api/products/categories/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchCategories();
      } catch(e) { console.error(e); }
  };

  const handleStartEditCategory = (cat: Category) => {
      setEditingCatId(cat.id);
      setEditCatName(cat.name);
  };

  const handleSaveEditCategory = async () => {
      if(!editCatName.trim()) return;
      const token = localStorage.getItem('token');
      try {
          await fetch(`/api/products/categories/${editingCatId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: editCatName })
          });
          setEditingCatId(null);
          fetchCategories();
      } catch(e) { console.error(e); }
  };

  // --- Drag and Drop Handlers ---
  const handleDrag = (e: React.DragEvent, type: 'main' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if(type === 'main') setDragActiveMain(true);
      else setDragActiveGallery(true);
    } else if (e.type === "dragleave") {
      if(type === 'main') setDragActiveMain(false);
      else setDragActiveGallery(false);
    }
  };

  const processFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  const handleDrop = async (e: React.DragEvent, type: 'main' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    if(type === 'main') setDragActiveMain(false);
    else setDragActiveGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Convert files to base64
        const filesArray: File[] = Array.from(e.dataTransfer.files);
        
        // Filter images only
        const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) return;

        if (type === 'main') {
            // Take the first file for main image
            try {
                const base64 = await processFile(imageFiles[0]);
                setFormData(prev => ({ ...prev, imageUrl: base64 }));
            } catch (err) {
                console.error("Error reading file", err);
            }
        } else {
            // Process all for gallery
            try {
                const base64Promises = imageFiles.map(processFile);
                const base64Results = await Promise.all(base64Promises);
                setFormData(prev => ({ 
                    ...prev, 
                    galleryImages: [...(prev.galleryImages || []), ...base64Results] 
                }));
            } catch (err) {
                console.error("Error reading files", err);
            }
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col w-full h-full bg-gray-100 relative">
      
      {/* 1. STICKY HEADER - Actions always visible */}
      <div className="bg-black border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md z-40 sticky top-0">
         <div className="flex items-center space-x-4">
             <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <div>
                <h2 className="text-lg font-bold text-white">{product ? 'Edit Product' : 'Create Product'}</h2>
                {product && <p className="text-xs text-gray-400">Editing: {product.name}</p>}
             </div>
         </div>
         <div className="flex space-x-3">
             <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-md hover:bg-gray-800 transition-colors">Discard</button>
             <button type="submit" className="px-6 py-2 text-sm font-bold text-white rounded-md shadow-lg hover:opacity-90 transition-all transform active:scale-95" style={{backgroundColor: COLORS.accent}}>Save</button>
         </div>
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              
              {/* LEFT COLUMN - MAIN CONTENT (2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                 
                 {/* A. Basic Info Card */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Product Details</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input type="text" name="name" value={formData.name} onChange={handleNameChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="e.g. Cosmic Turbo Kit v2"/>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" placeholder="AutoCosmic"/>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" placeholder="AC-TB-001"/>
                                 </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Brief summary for listings..."/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                                <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex space-x-2 text-xs text-gray-500">
                                        <span>Bold</span> <span>Italic</span> <span>List</span>
                                    </div>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={8} className="block w-full p-3 border-none focus:ring-0 text-sm leading-relaxed" placeholder="Describe your product features..."/>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* B. Media Card (Enhanced) */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Media</h3>
                        
                        {/* Main Image Upload/Drag */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image <span className="text-red-500">*</span></label>
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1 w-full space-y-2">
                                    <div 
                                        className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActiveMain ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                                        onDragEnter={(e) => handleDrag(e, 'main')} 
                                        onDragLeave={(e) => handleDrag(e, 'main')} 
                                        onDragOver={(e) => handleDrag(e, 'main')} 
                                        onDrop={(e) => handleDrop(e, 'main')}
                                    >
                                        <div className="text-gray-400 text-center pointer-events-none">
                                            <p className="text-sm font-medium">Drag & Drop Main Image here</p>
                                            <p className="text-xs">or paste URL below</p>
                                        </div>
                                    </div>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border text-sm" placeholder="https://..."/>
                                </div>
                                <div className="w-40 h-40 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover"/>
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Gallery Images Upload/Sort */}
                        <div className="mb-6">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                             <div 
                                className={`p-6 bg-gray-50 rounded-lg border-2 border-dashed transition-colors mb-4 ${dragActiveGallery ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
                                onDragEnter={(e) => handleDrag(e, 'gallery')} 
                                onDragLeave={(e) => handleDrag(e, 'gallery')} 
                                onDragOver={(e) => handleDrag(e, 'gallery')} 
                                onDrop={(e) => handleDrop(e, 'gallery')}
                             >
                                 <div className="text-center mb-4 pointer-events-none">
                                     <p className="text-gray-500 font-medium">Drag & Drop multiple images here to add to gallery</p>
                                 </div>
                                 <div className="flex gap-2">
                                    <input type="text" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} className="flex-1 border-gray-300 rounded-lg shadow-sm p-2.5 border" placeholder="Or add image URL manually..."/>
                                    <button type="button" onClick={addGalleryImage} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-100 shadow-sm">Add</button>
                                 </div>
                             </div>
                             
                             {formData.galleryImages && formData.galleryImages.length > 0 && (
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                     {formData.galleryImages.map((img, idx) => (
                                         <div key={idx} className="relative group aspect-square bg-white rounded-lg border shadow-sm overflow-hidden">
                                             <img src={img} alt="" className="w-full h-full object-cover"/>
                                             {/* Sort Controls */}
                                             <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 flex justify-between px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button type="button" onClick={() => moveGalleryImage(idx, 'left')} className={`text-white hover:text-blue-300 ${idx === 0 ? 'invisible' : ''}`}>&lt;</button>
                                                 <span className="text-xs text-white">{idx + 1}</span>
                                                 <button type="button" onClick={() => moveGalleryImage(idx, 'right')} className={`text-white hover:text-blue-300 ${idx === formData.galleryImages!.length - 1 ? 'invisible' : ''}`}>&gt;</button>
                                             </div>
                                             {/* Delete Button */}
                                             <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                        
                        {/* Video URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                            <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border" placeholder="YouTube or Vimeo link"/>
                        </div>
                    </div>
                 </div>

                 {/* C. Pricing & Inventory Card */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 sm:text-sm">₹</span>
                                    </div>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 p-2.5 border-gray-300 rounded-lg border font-bold text-gray-900"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Compare at)</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 sm:text-sm">₹</span>
                                    </div>
                                    <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 p-2.5 border-gray-300 rounded-lg border"/>
                                </div>
                                {calculateDiscount() > 0 && <p className="text-xs text-green-600 mt-1 font-semibold">{calculateDiscount()}% Discount</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per item (₹)</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 sm:text-sm">₹</span>
                                    </div>
                                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 p-2.5 border-gray-300 rounded-lg border"/>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Customers won't see this</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                                </div>
                                <div className="flex items-end pb-3">
                                     <label className="flex items-center cursor-pointer">
                                         <input type="checkbox" name="allowBackorders" checked={formData.allowBackorders} onChange={handleChange} className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"/>
                                         <span className="ml-2 text-sm text-gray-900">Continue selling when out of stock</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* D. Variants Card */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Product Variants</h3>
                            <div className="flex items-center">
                                {formData.hasVariants ? (
                                    <button type="button" onClick={addVariant} className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">+ Add Variant Type</button>
                                ) : (
                                    <button type="button" onClick={() => setFormData({...formData, hasVariants: true, variants: []})} className="text-sm text-blue-600 font-semibold underline">Add variants like size or color</button>
                                )}
                            </div>
                        </div>

                        {formData.hasVariants && (
                            <div className="space-y-8">
                                {formData.variants?.length === 0 && (
                                    <p className="text-sm text-gray-500 italic border-l-4 border-blue-200 pl-3">Click "+ Add Variant Type" to create variants (e.g. Size, Color).</p>
                                )}
                                {formData.variants?.map((variant, vIndex) => (
                                    <div key={vIndex} className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex-1 max-w-xs">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Variant Name</label>
                                                <input 
                                                    type="text" 
                                                    value={variant.name} 
                                                    onChange={(e) => updateVariantName(vIndex, e.target.value)} 
                                                    className="block w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="e.g. Size, Color"
                                                />
                                            </div>
                                            <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-500 text-xs hover:text-red-700 bg-white border border-red-200 px-2 py-1 rounded">Remove Type</button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">
                                                <div className="col-span-3">Value</div>
                                                <div className="col-span-2">Price</div>
                                                <div className="col-span-2">Stock</div>
                                                <div className="col-span-4">Image URL</div>
                                                <div className="col-span-1"></div>
                                            </div>

                                            {variant.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="grid grid-cols-12 gap-3 items-center">
                                                    <div className="col-span-3">
                                                        <input type="text" value={opt.value} onChange={(e) => updateVariantOption(vIndex, oIndex, 'value', e.target.value)} className="w-full border-gray-300 p-2 rounded-md text-sm border shadow-sm" placeholder="e.g. Small"/>
                                                    </div>
                                                    <div className="col-span-2 relative">
                                                        <span className="absolute left-2 top-2 text-gray-400 text-xs">₹</span>
                                                        <input type="number" value={opt.price} onChange={(e) => updateVariantOption(vIndex, oIndex, 'price', Number(e.target.value))} className="w-full border-gray-300 p-2 pl-4 rounded-md text-sm border shadow-sm" placeholder="Price"/>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input type="number" value={opt.stock} onChange={(e) => updateVariantOption(vIndex, oIndex, 'stock', Number(e.target.value))} className="w-full border-gray-300 p-2 rounded-md text-sm border shadow-sm" placeholder="Qty"/>
                                                    </div>
                                                    <div className="col-span-4 flex gap-2 items-center">
                                                         <input type="text" value={opt.image || ''} onChange={(e) => updateVariantOption(vIndex, oIndex, 'image', e.target.value)} className="w-full border-gray-300 p-2 rounded-md text-sm border shadow-sm" placeholder="Image URL"/>
                                                         {opt.image && <img src={opt.image} alt="Preview" className="h-9 w-9 object-cover rounded border border-gray-300" />}
                                                    </div>
                                                    <div className="col-span-1 flex justify-end">
                                                        <button type="button" onClick={() => removeVariantOption(vIndex, oIndex)} className="text-gray-400 hover:text-red-500 p-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addVariantOption(vIndex)} className="text-sm text-blue-600 font-medium mt-3 flex items-center hover:bg-blue-50 px-2 py-1 rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Add Value
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {/* E. Shipping */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                 <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                                 <input type="number" name="dim_length" value={formData.dimensions?.length} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                                 <input type="number" name="dim_width" value={formData.dimensions?.width} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                 <input type="number" name="dim_height" value={formData.dimensions?.height} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"/>
                             </div>
                         </div>
                     </div>
                 </div>

              </div>

              {/* RIGHT COLUMN - SIDEBAR (1/3 width) */}
              <div className="space-y-8">
                  
                  {/* 1. Status */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Product Status</h3>
                          <select name="status" value={formData.status} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border bg-white focus:ring-blue-500 focus:border-blue-500">
                              <option value="Active">Active</option>
                              <option value="Draft">Draft</option>
                              <option value="Archived">Archived</option>
                          </select>
                          <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
                              {formData.status === 'Active' ? 'This product will be visible to customers immediately.' : 'This product is hidden from your store.'}
                          </div>
                      </div>
                  </div>

                  {/* 2. Organization (UPDATED with Category Management) */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Organization</h3>
                          <div className="space-y-5">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <button type="button" onClick={() => setIsManageCatsOpen(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">Manage Categories</button>
                                </div>
                                <select name="category" value={formData.category} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border">
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                    {/* Fallback hardcoded if needed, but API should handle it */}
                                    {categories.length === 0 && <option disabled>No categories found</option>}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border" placeholder="e.g. Exhausts"/>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Tags</label>
                                <input 
                                    type="text" 
                                    value={tagInput} 
                                    onChange={(e) => setTagInput(e.target.value)} 
                                    onKeyDown={handleTagKeyDown}
                                    className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border" 
                                    placeholder="Enter tag and hit Enter"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.tags?.map((tag, idx) => (
                                        <span key={idx} className="bg-gray-100 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-md text-sm flex items-center">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(idx)} className="ml-2 text-gray-400 hover:text-red-500 font-bold">×</button>
                                        </span>
                                    ))}
                                </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* 3. SEO */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Search Engine Listing</h3>
                             <span className="text-xs text-blue-600 cursor-pointer hover:underline">Edit SEO</span>
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Page Title</label>
                                  <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                                  <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="block w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"></textarea>
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">URL Slug</label>
                                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="block w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm text-gray-500 bg-gray-50"/>
                              </div>
                          </div>
                          {/* SEO Preview */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Preview on Google:</p>
                              <div className="font-sans">
                                  <div className="text-blue-800 text-lg leading-tight truncate cursor-pointer hover:underline">{formData.seoTitle || formData.name}</div>
                                  <div className="text-green-700 text-sm leading-tight truncate">https://autocosmic.com/product/{formData.slug}</div>
                                  <div className="text-gray-600 text-sm leading-snug line-clamp-2">
                                      {formData.seoDescription || formData.shortDescription || formData.description?.substring(0, 160)}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* Manage Categories Modal */}
      {isManageCatsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800">Manage Categories</h3>
                    <button onClick={() => setIsManageCatsOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-2">
                        {categories.map(cat => (
                            <li key={cat.id} className="flex items-center justify-between bg-white border p-2 rounded-md hover:bg-gray-50">
                                {editingCatId === cat.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={editCatName} 
                                            onChange={(e) => setEditCatName(e.target.value)} 
                                            className="flex-1 border p-1 rounded text-sm"
                                        />
                                        <button onClick={handleSaveEditCategory} className="text-green-600 text-xs font-bold">Save</button>
                                        <button onClick={() => setEditingCatId(null)} className="text-gray-500 text-xs">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleStartEditCategory(cat)} className="text-blue-600 hover:text-blue-800 p-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-800 p-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                        {categories.length === 0 && <li className="text-center text-sm text-gray-500 py-2">No categories yet.</li>}
                    </ul>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Add New Category</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCatName} 
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Category Name"
                        />
                        <button 
                            onClick={handleAddCategory} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </form>
  );
};

export default ProductForm;
