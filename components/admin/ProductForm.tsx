
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, Category } from '../../types';
import { COLORS } from '../../constants';
import MediaPicker from './MediaPicker';

// Cloudinary Config (Should ideally be in env/constants, duplicated here for scope)
const CLOUDINARY_UPLOAD_PRESET = 'ladiesh';
const CLOUDINARY_CLOUD_NAME = 'djbv48acj';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

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

// --- Simple Rich Text Editor Component ---
interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentEditableRef.current && !isSourceMode && document.activeElement !== contentEditableRef.current) {
            if (contentEditableRef.current.innerHTML !== value) {
                contentEditableRef.current.innerHTML = value;
            }
        }
    }, [value, isSourceMode]);

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    const ToolbarButton = ({ cmd, arg, icon, label }: { cmd?: string, arg?: string, icon?: React.ReactNode, label?: string }) => (
        <button 
            type="button"
            onClick={() => cmd && execCmd(cmd, arg)}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title={label}
        >
            {icon}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm transition-all focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
            <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 p-2 flex-wrap">
                <div className="flex gap-1 mr-4 border-r border-gray-300 pr-4">
                    <button 
                        type="button" 
                        onClick={() => setIsSourceMode(!isSourceMode)}
                        className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${isSourceMode ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'}`}
                    >
                        {isSourceMode ? (
                            <><span>👁</span> Visual</>
                        ) : (
                            <><span>&lt;/&gt;</span> HTML</>
                        )}
                    </button>
                </div>

                {!isSourceMode && (
                    <>
                        <ToolbarButton cmd="bold" label="Bold" icon={<span className="font-bold serif">B</span>} />
                        <ToolbarButton cmd="italic" label="Italic" icon={<span className="italic serif">I</span>} />
                        <ToolbarButton cmd="underline" label="Underline" icon={<span className="underline serif">U</span>} />
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <ToolbarButton cmd="justifyLeft" label="Align Left" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/></svg>} />
                        <ToolbarButton cmd="justifyCenter" label="Align Center" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm3 7h12v2H6v-2zm-3 7h18v2H3v-2z"/></svg>} />
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <ToolbarButton cmd="insertUnorderedList" label="Bullet List" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zM8 6h12v2H8V6zm0 5h12v2H8v-2zm0 5h12v2H8v-2z"/></svg>} />
                        <ToolbarButton cmd="insertOrderedList" label="Numbered List" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zM8 6h12v2H8V6zm0 5h12v2H8v-2zm0 5h12v2H8v-2z"/></svg>} />
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <ToolbarButton cmd="formatBlock" arg="H2" label="Heading 2" icon={<span className="font-bold text-xs">H2</span>} />
                        <ToolbarButton cmd="formatBlock" arg="H3" label="Heading 3" icon={<span className="font-bold text-xs">H3</span>} />
                        <ToolbarButton cmd="removeFormat" label="Clear Format" icon={<span className="text-xs">Clear</span>} />
                    </>
                )}
            </div>

            <div className="relative min-h-[300px]">
                {isSourceMode ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-[300px] p-4 font-mono text-sm text-gray-800 bg-gray-900/5 outline-none resize-y"
                        placeholder="<!-- Paste HTML here -->"
                    />
                ) : (
                    <div
                        ref={contentEditableRef}
                        contentEditable
                        onInput={handleInput}
                        className="prose prose-sm max-w-none p-4 min-h-[300px] outline-none focus:outline-none overflow-y-auto"
                        style={{ maxHeight: '600px' }}
                    />
                )}
            </div>
            <div className="bg-gray-50 px-3 py-1 text-[10px] text-gray-400 border-t text-right">
                {isSourceMode ? 'HTML Mode' : 'Rich Text Mode'}
            </div>
        </div>
    );
};


const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  
  // Gallery State
  const [isUploading, setIsUploading] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Management State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

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

  // --- Gallery Management ---

  const handleGalleryUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsUploading(true);

      const uploads = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          try {
              const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData });
              const data = await res.json();
              return data.secure_url;
          } catch (error) {
              console.error("Upload failed for file", file.name, error);
              return null;
          }
      });

      const urls = (await Promise.all(uploads)).filter(url => url !== null) as string[];
      setFormData(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), ...urls] }));
      setIsUploading(false);
  };

  const removeGalleryImage = (index: number) => {
      setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages?.filter((_, i) => i !== index) }));
  };

  // Drag and Sort Handlers
  const handleSortStart = (index: number) => setDraggedImageIndex(index);
  
  const handleSortDrop = (targetIndex: number) => {
      if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;
      
      const updatedImages = [...(formData.galleryImages || [])];
      const [movedImage] = updatedImages.splice(draggedImageIndex, 1);
      updatedImages.splice(targetIndex, 0, movedImage);
      
      setFormData(prev => ({ ...prev, galleryImages: updatedImages }));
      setDraggedImageIndex(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleGalleryUpload(e.dataTransfer.files);
      }
  };

  // --- Variants Logic ---
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

  // --- Tags & SEO ---
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
              setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
          }
          setTagInput('');
      }
  };
  const removeTag = (index: number) => setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== index) }));

  const handleSeoKeywordKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          if (seoKeywordInput.trim() && !formData.seoKeywords?.includes(seoKeywordInput.trim())) {
              setFormData(prev => ({ ...prev, seoKeywords: [...(prev.seoKeywords || []), seoKeywordInput.trim()] }));
          }
          setSeoKeywordInput('');
      }
  };
  const removeSeoKeyword = (index: number) => setFormData(prev => ({ ...prev, seoKeywords: prev.seoKeywords?.filter((_, i) => i !== index) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: product?.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && !(e.target as HTMLElement).isContentEditable) {
      e.preventDefault();
    }
  };

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm text-sm" placeholder="Brief summary shown on cards..."/>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                            <RichTextEditor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} />
                        </div>
                    </div>
                 </div>

                 {/* Media Section with Enhanced Uploads */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Media</h3>
                    
                    {/* Main Image */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image <span className="text-red-500">*</span></label>
                        <MediaPicker value={formData.imageUrl} onChange={(url) => setFormData(prev => ({...prev, imageUrl: url}))} type="image" />
                    </div>

                    {/* Gallery Grid Sorter */}
                    <div className="mb-6">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Drag to sort)</label>
                         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                             {formData.galleryImages?.map((img, idx) => (
                                 <div 
                                    key={idx} 
                                    draggable
                                    onDragStart={() => handleSortStart(idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleSortDrop(idx)}
                                    className="relative group aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
                                 >
                                     <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover"/>
                                     {/* Remove Button */}
                                     <button 
                                        type="button" 
                                        onClick={() => removeGalleryImage(idx)} 
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        title="Remove Image"
                                     >
                                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                     {/* Index Badge */}
                                     <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded">{idx + 1}</div>
                                 </div>
                             ))}

                             {/* Upload Drop Zone */}
                             <div 
                                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-400 ${isUploading ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                             >
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={(e) => handleGalleryUpload(e.target.files)}
                                />
                                {isUploading ? (
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <span className="text-xs text-blue-600 font-medium">Uploading...</span>
                                    </div>
                                ) : (
                                    <div className="text-center p-2">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                        <span className="text-xs font-medium text-blue-600">Add Images</span>
                                        <p className="text-[10px] text-gray-400 mt-1 hidden sm:block">Drag & Drop</p>
                                    </div>
                                )}
                             </div>
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
