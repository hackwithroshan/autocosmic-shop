
export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface Product {
  id: string;
  // Basic
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  
  // Organization
  category: string;
  subCategory?: string;
  tags?: string[];
  status: 'Active' | 'Draft' | 'Archived';
  
  // Pricing
  price: number; // Selling Price
  mrp?: number; // Market Retail Price
  costPrice?: number; // For profit calculation
  taxRate?: number; // Percentage
  
  // Inventory
  stock: number;
  lowStockThreshold?: number;
  allowBackorders?: boolean;
  
  // Media
  imageUrl: string; // Main Cover
  galleryImages?: string[]; // Additional images
  videoUrl?: string;
  
  // Shipping
  weight?: number; // kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Variants
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id?: string;
  name: string; // e.g., "Size" or "Color"
  options: {
    value: string; // e.g., "Red", "XL"
    price?: number; // Overrides base price
    stock?: number; // Specific stock
    image?: string; // Variant specific image
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
    productId: string | Product; // Can be ID or populated object
    quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: {
      address: string;
      city: string;
      postalCode: string;
      country: string;
  };
  trackingInfo?: {
      carrier: string;
      trackingNumber: string;
  };
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';
  items: OrderItem[];
}

export type UserRole = 'Super Admin' | 'Manager' | 'Editor' | 'Staff' | 'User';

export interface User {
  id:string;
  name: string;
  email: string;
  joinDate: string;
  totalOrders: number;
  avatarUrl: string;
  role: UserRole;
  segment?: 'VIP' | 'New' | 'Returning' | 'High-Value'; 
}

export interface HeaderLink {
  _id?: string;
  text: string;
  url: string;
}

export interface HeaderSettings {
  _id?: string;
  logoText: string;
  phoneNumber: string;
  topBarLinks: HeaderLink[];
  mainNavLinks: HeaderLink[];
}

export interface Slide {
  _id?: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp' | 'Push';
  status: 'Draft' | 'Scheduled' | 'Sent';
  sentCount: number;
  openRate: number;
  clickRate: number;
}

export interface Discount {
  id: string;
  code: string;
  type: 'Percentage' | 'Flat' | 'Free Shipping';
  value: number;
  usageCount: number;
  maxUsage: number;
  expiry: string;
}

export interface SiteSettings {
  currency: string;
  taxRate: number;
  shippingCharge: number;
  pixelId: string;
  facebookPixelId: string;
}
