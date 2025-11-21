
import React from 'react';
import { Product } from '../types';
import { COLORS } from '../constants';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onProductClick?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer"
      onClick={() => onProductClick && onProductClick(product.id)}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-800">
          <span aria-hidden="true" className="absolute inset-0" />
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <div className="flex justify-between items-center mt-4">
          <p className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
          <button 
            onClick={handleAddToCart}
            className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200 opacity-0" 
            style={{ backgroundColor: COLORS.accent }}
           >
            Add to Cart
          </button>
        </div>
      </div>
       <div className="absolute bottom-4 right-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
         <button 
            onClick={handleAddToCart}
            className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200" 
            style={{ backgroundColor: COLORS.accent }}
          >
            Add to Cart
          </button>
        </div>
    </div>
  );
};

export default ProductCard;
