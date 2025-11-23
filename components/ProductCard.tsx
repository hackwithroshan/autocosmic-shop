
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

  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full"
      onClick={() => onProductClick && onProductClick(product.id)}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                {discount}% OFF
            </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-gray-800 line-clamp-2 mb-1">
          <span aria-hidden="true" className="absolute inset-0" />
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{product.category}</p>
        
        <div className="mt-auto">
            <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
                {product.mrp && product.mrp > product.price && (
                    <p className="text-sm text-gray-400 line-through">₹{product.mrp.toFixed(2)}</p>
                )}
            </div>
            
            <div className="flex justify-end mt-3">
              <button 
                onClick={handleAddToCart}
                className="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0" 
                style={{ backgroundColor: COLORS.accent }}
               >
                Add to Cart
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
