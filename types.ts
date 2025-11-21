
export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  variants?: { name: string; options: string[] }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';
  items: { productId: string; quantity: number }[];
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
