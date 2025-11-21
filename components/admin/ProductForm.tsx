
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { COLORS } from '../../constants';

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const initialFormData: Omit<Product, 'id'> = {
  name: '',
  description: '',
  category: 'Performance',
  price: 0,
  stock: 0,
  imageUrl: '',
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormData);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: product?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500">
            <option>Performance</option>
            <option>Exterior</option>
            <option>Interior</option>
            <option>Maintenance</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
        </div>
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
        <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
      </div>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md" style={{backgroundColor: COLORS.accent}}>Save Product</button>
      </div>
    </form>
  );
};

export default ProductForm;
