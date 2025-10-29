/**
 * Product types for eink display catalog
 */

export interface Product {
  id: string;
  name: string;
  size: string;
  resolution: string;
  price: number;
  description: string;
  features: string[];
  image?: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  items: CartItem[];
  total: number;
  email?: string;
}

