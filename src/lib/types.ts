export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  is_available: boolean;
  prep_time_min: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  item_name: string;
  item_image_url: string;
  quantity: number;
  price: number;
  status: string;
}

export interface Order {
  id: number;
  table_no: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  is_paid: boolean;
  created_at: string;
  items: OrderItem[];
  total: number;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  stock: number;
  unit: string;
  min_stock: number;
  cost_per_unit: number;
}

export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  status: string;
}

export interface BillingGroup {
  table_no: string;
  items: { name: string; qty: number; price: number; image_url: string }[];
  total: number;
  order_id: number;
  customer_name: string;
  customer_phone: string;
}
