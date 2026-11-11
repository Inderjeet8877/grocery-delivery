export type Role = 'customer' | 'admin';

export interface Address {
  label: string;
  fullAddress: string;
  pincode: string;
  landmark?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: Address[];
  role: Role;
  expoPushToken?: string;
  notificationsEnabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  offer?: number;
  description: string;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: Address;
  paymentMethod: 'COD';
  status: OrderStatus;
  createdAt: number;
  reviewed?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: number;
}
