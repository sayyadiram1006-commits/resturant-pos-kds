import { PGlite } from '@electric-sql/pglite';
import type { MenuItem, Order, OrderItem, InventoryItem, RestaurantTable, BillingGroup } from './types';

const db = new PGlite('idb://restaurant-pos');

let initialized = false;

const SEED_MENU: Omit<MenuItem, 'id'>[] = [
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 220, description: 'Cottage cheese cubes in a rich creamy tomato gravy', image_url: 'https://images.pexels.com/photos/11188417/pexels-photo-11188417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 20 },
  { name: 'Chicken Biryani', category: 'Main Course', price: 260, description: 'Fragrant basmati rice cooked with spiced chicken', image_url: 'https://images.pexels.com/photos/36652961/pexels-photo-36652961.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 30 },
  { name: 'Butter Chicken', category: 'Main Course', price: 280, description: 'Tender chicken in a velvety butter tomato sauce', image_url: 'https://images.pexels.com/photos/37295815/pexels-photo-37295815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 25 },
  { name: 'Tandoori Roti', category: 'Breads', price: 15, description: 'Whole wheat flatbread baked in a clay tandoor', image_url: 'https://images.pexels.com/photos/28674556/pexels-photo-28674556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 5 },
  { name: 'Fried Rice', category: 'Main Course', price: 180, description: 'Wok-tossed rice with vegetables and soy sauce', image_url: 'https://images.pexels.com/photos/34683317/pexels-photo-34683317.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 15 },
  { name: 'Masala Dosa', category: 'South Indian', price: 120, description: 'Crispy rice crepe filled with spiced potato masala', image_url: 'https://images.pexels.com/photos/20422138/pexels-photo-20422138.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 15 },
  { name: 'Veg Manchurian', category: 'Indo-Chinese', price: 160, description: 'Fried vegetable balls tossed in a tangy soy-garlic sauce', image_url: 'https://images.pexels.com/photos/29631489/pexels-photo-29631489.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 20 },
  { name: 'Chole Bhature', category: 'Main Course', price: 140, description: 'Spiced chickpea curry served with fluffy fried bread', image_url: 'https://images.pexels.com/photos/11818239/pexels-photo-11818239.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 20 },
  { name: 'Samosa (2 pcs)', category: 'Starters', price: 40, description: 'Crispy pastry pockets stuffed with spiced potatoes and peas', image_url: 'https://images.pexels.com/photos/37153389/pexels-photo-37153389.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 10 },
  { name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 60, description: 'Deep-fried milk dumplings soaked in rose-scented sugar syrup', image_url: 'https://images.pexels.com/photos/9198596/pexels-photo-9198596.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 5 },
  { name: 'Water Bottle (1L)', category: 'Beverages', price: 20, description: 'Mineral water bottle, chilled', image_url: 'https://images.pexels.com/photos/7506460/pexels-photo-7506460.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 1 },
  { name: 'Cold Coffee', category: 'Beverages', price: 90, description: 'Creamy blended iced coffee topped with foam', image_url: 'https://images.pexels.com/photos/34541593/pexels-photo-34541593.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', is_available: true, prep_time_min: 5 },
];

const SEED_INVENTORY: Omit<InventoryItem, 'id'>[] = [
  { item_name: 'Water Bottle (1L)', stock: 50, unit: 'bottles', min_stock: 10, cost_per_unit: 10 },
  { item_name: 'Rice', stock: 25, unit: 'kg', min_stock: 5, cost_per_unit: 60 },
  { item_name: 'Chicken', stock: 15, unit: 'kg', min_stock: 5, cost_per_unit: 200 },
  { item_name: 'Cooking Oil', stock: 10, unit: 'litres', min_stock: 3, cost_per_unit: 150 },
  { item_name: 'Paneer', stock: 8, unit: 'kg', min_stock: 3, cost_per_unit: 300 },
  { item_name: 'Tomatoes', stock: 20, unit: 'kg', min_stock: 5, cost_per_unit: 40 },
  { item_name: 'Onions', stock: 30, unit: 'kg', min_stock: 5, cost_per_unit: 30 },
  { item_name: 'Wheat Flour', stock: 40, unit: 'kg', min_stock: 10, cost_per_unit: 45 },
];

const SEED_TABLES: Omit<RestaurantTable, 'id'>[] = [
  { name: 'Table 1', capacity: 4, status: 'Available' },
  { name: 'Table 2', capacity: 4, status: 'Available' },
  { name: 'Table 3', capacity: 2, status: 'Available' },
  { name: 'Table 4', capacity: 6, status: 'Available' },
  { name: 'Table 5', capacity: 8, status: 'Available' },
  { name: 'Table 6', capacity: 4, status: 'Available' },
];

export async function initDB(): Promise<void> {
  if (initialized) return;
  initialized = true;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      is_available BOOLEAN DEFAULT true,
      prep_time_min INTEGER DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      table_no TEXT NOT NULL,
      customer_name TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      is_paid BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER,
      item_name TEXT NOT NULL,
      item_image_url TEXT DEFAULT '',
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      item_name TEXT UNIQUE NOT NULL,
      stock REAL NOT NULL,
      unit TEXT NOT NULL,
      min_stock REAL DEFAULT 0,
      cost_per_unit REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      capacity INTEGER DEFAULT 4,
      status TEXT DEFAULT 'Available'
    );
  `);

  // Seed menu
  const menuCount = await db.query('SELECT COUNT(*) as cnt FROM menu_items');
  if (Number(menuCount.rows[0].cnt) === 0) {
    for (const item of SEED_MENU) {
      await db.query(
        'INSERT INTO menu_items (name, category, price, description, image_url, is_available, prep_time_min) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.name, item.category, item.price, item.description, item.image_url, item.is_available, item.prep_time_min]
      );
    }
  }

  // Seed inventory
  const invCount = await db.query('SELECT COUNT(*) as cnt FROM inventory');
  if (Number(invCount.rows[0].cnt) === 0) {
    for (const item of SEED_INVENTORY) {
      await db.query(
        'INSERT INTO inventory (item_name, stock, unit, min_stock, cost_per_unit) VALUES ($1, $2, $3, $4, $5)',
        [item.item_name, item.stock, item.unit, item.min_stock, item.cost_per_unit]
      );
    }
  }

  // Seed tables
  const tableCount = await db.query('SELECT COUNT(*) as cnt FROM restaurant_tables');
  if (Number(tableCount.rows[0].cnt) === 0) {
    for (const t of SEED_TABLES) {
      await db.query(
        'INSERT INTO restaurant_tables (name, capacity, status) VALUES ($1, $2, $3)',
        [t.name, t.capacity, t.status]
      );
    }
  }
}

// ---------- Menu Items ----------
export async function getMenuItems(): Promise<MenuItem[]> {
  const res = await db.query('SELECT * FROM menu_items ORDER BY category, name');
  return res.rows as unknown as MenuItem[];
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<void> {
  await db.query(
    'INSERT INTO menu_items (name, category, price, description, image_url, is_available, prep_time_min) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [item.name, item.category, item.price, item.description, item.image_url, item.is_available, item.prep_time_min]
  );
}

export async function updateMenuItem(id: number, item: Partial<MenuItem>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean)[] = [];
  const cols = ['name', 'category', 'price', 'description', 'image_url', 'is_available', 'prep_time_min'];
  for (const col of cols) {
    if (item[col as keyof MenuItem] !== undefined) {
      fields.push(`${col} = $${fields.length + 1}`);
      values.push(item[col as keyof MenuItem] as string | number | boolean);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
}

export async function deleteMenuItem(id: number): Promise<void> {
  await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
}

// ---------- Orders ----------
export async function createOrder(
  tableNo: string,
  customerName: string,
  customerPhone: string,
  items: { menu_item_id: number; item_name: string; item_image_url: string; quantity: number; price: number }[]
): Promise<number> {
  const orderRes = await db.query(
    'INSERT INTO orders (table_no, customer_name, customer_phone, status) VALUES ($1, $2, $3, $4) RETURNING id',
    [tableNo, customerName, customerPhone, 'Pending']
  );
  const orderId = (orderRes.rows[0] as unknown as { id: number }).id;
  for (const item of items) {
    await db.query(
      'INSERT INTO order_items (order_id, menu_item_id, item_name, item_image_url, quantity, price, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [orderId, item.menu_item_id, item.item_name, item.item_image_url, item.quantity, item.price, 'Pending']
    );
  }
  // Mark table as occupied
  await db.query("UPDATE restaurant_tables SET status = 'Occupied' WHERE name = $1", [tableNo]);
  return orderId;
}

export async function getActiveOrders(): Promise<Order[]> {
  const orderRes = await db.query(`
    SELECT o.*, COALESCE(SUM(oi.quantity * oi.price), 0) as total
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.is_paid = false
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  const orders = orderRes.rows as unknown as Order[];
  for (const order of orders) {
    const itemRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = itemRes.rows as unknown as OrderItem[];
  }
  return orders;
}

export async function updateOrderItemStatus(itemId: number, status: string): Promise<void> {
  await db.query('UPDATE order_items SET status = $1 WHERE id = $2', [status, itemId]);
  // Check if all items in the order are ready/served
  const res = await db.query(
    `SELECT oi.order_id, COUNT(*) FILTER (WHERE oi.status NOT IN ('Ready', 'Served')) as pending_count
     FROM order_items oi WHERE oi.order_id = (SELECT order_id FROM order_items WHERE id = $1) GROUP BY oi.order_id`,
    [itemId]
  );
  if (res.rows.length > 0) {
    const row = res.rows[0] as unknown as { order_id: number; pending_count: string };
    if (Number(row.pending_count) === 0) {
      await db.query("UPDATE orders SET status = 'Ready' WHERE id = $1", [row.order_id]);
    }
  }
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
}

export async function payOrder(orderId: number): Promise<void> {
  await db.query('UPDATE orders SET is_paid = true, status = $1 WHERE id = $2', ['Paid', orderId]);
  // Free up the table
  const res = await db.query('SELECT table_no FROM orders WHERE id = $1', [orderId]);
  if (res.rows.length > 0) {
    const tableNo = (res.rows[0] as unknown as { table_no: string }).table_no;
    await db.query("UPDATE restaurant_tables SET status = 'Available' WHERE name = $1", [tableNo]);
  }
}

export async function getBillingGroups(): Promise<BillingGroup[]> {
  const res = await db.query(`
    SELECT o.id as order_id, o.table_no, o.customer_name, o.customer_phone,
           oi.item_name, oi.quantity, oi.price, oi.item_image_url
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.is_paid = false
    ORDER BY o.table_no
  `);
  const rows = res.rows as unknown as {
    order_id: number; table_no: string; customer_name: string; customer_phone: string;
    item_name: string; quantity: number; price: number; item_image_url: string;
  }[];
  const groups: Record<string, BillingGroup> = {};
  for (const row of rows) {
    if (!groups[row.table_no]) {
      groups[row.table_no] = {
        table_no: row.table_no,
        items: [],
        total: 0,
        order_id: row.order_id,
        customer_name: row.customer_name,
        customer_phone: row.customer_phone,
      };
    }
    groups[row.table_no].items.push({
      name: row.item_name,
      qty: row.quantity,
      price: row.price * row.quantity,
      image_url: row.item_image_url,
    });
    groups[row.table_no].total += row.price * row.quantity;
  }
  return Object.values(groups);
}

// ---------- Inventory ----------
export async function getInventory(): Promise<InventoryItem[]> {
  const res = await db.query('SELECT * FROM inventory ORDER BY item_name');
  return res.rows as unknown as InventoryItem[];
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<void> {
  await db.query(
    'INSERT INTO inventory (item_name, stock, unit, min_stock, cost_per_unit) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (item_name) DO UPDATE SET stock = inventory.stock + $2',
    [item.item_name, item.stock, item.unit, item.min_stock, item.cost_per_unit]
  );
}

export async function updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  const cols = ['item_name', 'stock', 'unit', 'min_stock', 'cost_per_unit'];
  for (const col of cols) {
    if (item[col as keyof InventoryItem] !== undefined) {
      fields.push(`${col} = $${fields.length + 1}`);
      values.push(item[col as keyof InventoryItem] as string | number);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.query(`UPDATE inventory SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await db.query('DELETE FROM inventory WHERE id = $1', [id]);
}

export async function restockInventory(id: number, amount: number): Promise<void> {
  await db.query('UPDATE inventory SET stock = stock + $1 WHERE id = $2', [amount, id]);
}

// ---------- Tables ----------
export async function getTables(): Promise<RestaurantTable[]> {
  const res = await db.query('SELECT * FROM restaurant_tables ORDER BY name');
  return res.rows as unknown as RestaurantTable[];
}

export async function addTable(name: string, capacity: number): Promise<void> {
  await db.query('INSERT INTO restaurant_tables (name, capacity, status) VALUES ($1, $2, $3)', [name, capacity, 'Available']);
}

export async function updateTable(id: number, name: string, capacity: number): Promise<void> {
  await db.query('UPDATE restaurant_tables SET name = $1, capacity = $2 WHERE id = $3', [name, capacity, id]);
}

export async function deleteTable(id: number): Promise<void> {
  await db.query('DELETE FROM restaurant_tables WHERE id = $1', [id]);
}

// ---------- Stats ----------
export async function getStats(): Promise<{
  activeOrders: number;
  pendingKitchen: number;
  unpaidTotal: number;
  lowStockCount: number;
  todayRevenue: number;
  totalTables: number;
  occupiedTables: number;
}> {
  const [activeRes, kitchenRes, unpaidRes, lowStockRes, todayRes, tablesRes, occupiedRes] = await Promise.all([
    db.query('SELECT COUNT(*) as cnt FROM orders WHERE is_paid = false'),
    db.query("SELECT COUNT(*) as cnt FROM order_items WHERE status = 'Pending'"),
    db.query('SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.is_paid = false'),
    db.query('SELECT COUNT(*) as cnt FROM inventory WHERE stock <= min_stock'),
    db.query("SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.is_paid = true AND o.created_at::date = CURRENT_DATE"),
    db.query('SELECT COUNT(*) as cnt FROM restaurant_tables'),
    db.query("SELECT COUNT(*) as cnt FROM restaurant_tables WHERE status = 'Occupied'"),
  ]);
  return {
    activeOrders: Number((activeRes.rows[0] as unknown as { cnt: string }).cnt),
    pendingKitchen: Number((kitchenRes.rows[0] as unknown as { cnt: string }).cnt),
    unpaidTotal: Number((unpaidRes.rows[0] as unknown as { total: string }).total),
    lowStockCount: Number((lowStockRes.rows[0] as unknown as { cnt: string }).cnt),
    todayRevenue: Number((todayRes.rows[0] as unknown as { total: string }).total),
    totalTables: Number((tablesRes.rows[0] as unknown as { cnt: string }).cnt),
    occupiedTables: Number((occupiedRes.rows[0] as unknown as { cnt: string }).cnt),
  };
}
