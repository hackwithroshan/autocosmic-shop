
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
      className="group relative bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={() => onProductClick && onProductClick(product.id)}
    >
      <div className="aspect-[3/4] w-full overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-md">
                    {discount}% OFF
                </span>
            )}
            {product.stock > 0 && product.stock < 10 && (
                 <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-md">
                    Low Stock
                </span>
            )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 flex-grow">
          <span aria-hidden="true" className="absolute inset-0" />
          {product.name}
        </h3>
        
        <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
                <p className="text-lg font-extrabold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                {product.mrp && product.mrp > product.price && (
                    <p className="text-sm text-gray-400 line-through decoration-1">₹{product.mrp.toLocaleString('en-IN')}</p>
                )}
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-white rounded-md shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500" 
              style={{ backgroundColor: COLORS.accent }}
             >
              Add to Cart
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;