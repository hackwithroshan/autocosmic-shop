
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product } from '../types';

interface MegaMenuProps {
  isOpen: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await fetch('/api/products/categories');
          const data = await res.json();
          setCategories(data);
        } catch (error) {
          console.error("Failed to fetch categories", error);
        }
      };
      
      const fetchFeaturedProduct = async () => {
        try {
            // A simple way to get one product to feature.
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.length > 0) {
              setFeaturedProduct(data[Math.floor(Math.random() * data.length)]); // Show a random product
            }
        } catch (error) {
            console.error("Failed to fetch featured product", error);
        }
      };

      fetchCategories();
      fetchFeaturedProduct();
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <div
      className="absolute left-0 mt-2 w-screen max-w-4xl z-50"
    >
      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-3">
          {categories.slice(0, 2).map((category) => ( // Show first 2 columns for categories
            <div key={category.id}>
              <h3 className="text-sm tracking-wide font-semibold uppercase text-blue-600">{category.name}</h3>
              <ul className="mt-4 space-y-2">
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link to="/" className="text-base font-medium text-gray-900 hover:text-gray-700 transition duration-150 ease-in-out">{sub.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {featuredProduct ? (
            <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col justify-between">
              <div>
                  <h3 className="text-sm tracking-wide font-semibold uppercase text-gray-500">Featured Product</h3>
                  <div className="mt-4">
                      <img src={featuredProduct.imageUrl} alt={featuredProduct.name} className="rounded-lg object-cover h-40 w-full" />
                      <h4 className="mt-4 text-base font-bold text-gray-900">{featuredProduct.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{featuredProduct.description}</p>
                  </div>
              </div>
               <Link to={`/product/${featuredProduct.id}`} className="mt-6 block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Shop Now</Link>
            </div>
          ) : (
             <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p>Loading feature...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
