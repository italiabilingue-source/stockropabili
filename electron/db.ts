import path from 'path';
import fs from 'fs';
import { Product, StockMap, Movement, SizeUpdateDelta } from '../src/types/inventory';

interface DatabaseSchema {
  products: Product[];
  movements: Movement[];
}

let dbFilePath: string = '';
let dbMemory: DatabaseSchema = {
  products: [],
  movements: [],
};

// Guardado atómico en disco (evita corrupción ante apagones o fallos)
function saveToDisk(): void {
  if (!dbFilePath) return;
  const tempPath = `${dbFilePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(dbMemory, null, 2), 'utf-8');
    fs.renameSync(tempPath, dbFilePath);
  } catch (err) {
    console.error('[DB] Error guardando base de datos:', err);
  }
}

export function initDatabase(requestedPath: string): DatabaseSchema {
  // Si la ruta solicitada terminaba en .db la adaptamos a .json
  const finalPath = requestedPath.endsWith('.db')
    ? requestedPath.replace(/\.db$/, '.json')
    : requestedPath.endsWith('.json')
    ? requestedPath
    : `${requestedPath}.json`;

  dbFilePath = finalPath;
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      dbMemory = JSON.parse(content);
      if (!Array.isArray(dbMemory.products)) dbMemory.products = [];
      if (!Array.isArray(dbMemory.movements)) dbMemory.movements = [];
    } catch (err) {
      console.error('[DB] Error leyendo base existente, inicializando nueva:', err);
      dbMemory = { products: [], movements: [] };
    }
  } else {
    dbMemory = { products: [], movements: [] };
  }

  // Si no hay productos, sembrar los 6 artículos escolares oficiales
  if (dbMemory.products.length === 0) {
    seedInitialSchoolGarments();
  }

  console.log('[DB] Base de datos local lista en:', dbFilePath);
  return dbMemory;
}

export function getDb(): DatabaseSchema {
  return dbMemory;
}

export function getAllProducts(): Product[] {
  return [...dbMemory.products];
}

export function saveProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Product {
  const now = Date.now();
  const existingIdx = dbMemory.products.findIndex((p) => p.id === product.id);

  let saved: Product;
  if (existingIdx >= 0) {
    saved = {
      ...dbMemory.products[existingIdx],
      ...product,
      updatedAt: now,
    };
    dbMemory.products[existingIdx] = saved;
  } else {
    saved = {
      ...product,
      createdAt: now,
      updatedAt: now,
    };
    dbMemory.products.push(saved);
  }

  saveToDisk();
  return saved;
}

export function deleteProduct(id: string): boolean {
  const prevCount = dbMemory.products.length;
  dbMemory.products = dbMemory.products.filter((p) => p.id !== id);
  const deleted = dbMemory.products.length < prevCount;
  if (deleted) {
    saveToDisk();
  }
  return deleted;
}

export function batchUpdateStock(
  productId: string,
  updates: SizeUpdateDelta[],
  reason: string = 'Ajuste de grilla masivo'
): { success: boolean; updatedStock: StockMap } {
  const prod = dbMemory.products.find((p) => p.id === productId);
  if (!prod) {
    throw new Error(`Producto ${productId} no encontrado`);
  }

  const now = Date.now();
  for (const u of updates) {
    const prevItem = prod.stock[u.size] || { quantity: 0, minStock: 2 };
    const prevQty = prevItem.quantity;
    const newQty = Math.max(0, u.newQuantity);
    const diff = newQty - prevQty;
    const minStock = u.newMinStock !== undefined ? u.newMinStock : prevItem.minStock;

    if (diff !== 0) {
      dbMemory.movements.unshift({
        id: String(Date.now() + Math.random()),
        productId: prod.id,
        productName: prod.name,
        size: u.size,
        type: diff > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(diff),
        previousStock: prevQty,
        newStock: newQty,
        reason,
        timestamp: now,
      });
    }

    prod.stock[u.size] = {
      quantity: newQty,
      minStock,
    };
  }

  prod.updatedAt = now;
  saveToDisk();

  return { success: true, updatedStock: { ...prod.stock } };
}

export function recordQuickSale(
  productId: string,
  size: string,
  quantitySold: number = 1,
  reason: string = 'Venta rápida de mostrador'
): { success: boolean; newStock: number } {
  const prod = dbMemory.products.find((p) => p.id === productId);
  if (!prod) throw new Error('Producto no encontrado');

  const item = prod.stock[size];
  if (!item) throw new Error(`El talle ${size} no existe para esta prenda`);

  if (item.quantity < quantitySold) {
    throw new Error(`Stock insuficiente en talle ${size} (Disponible: ${item.quantity})`);
  }

  const prevQty = item.quantity;
  const newStock = prevQty - quantitySold;
  const now = Date.now();

  item.quantity = newStock;
  prod.updatedAt = now;

  dbMemory.movements.unshift({
    id: String(Date.now() + Math.random()),
    productId: prod.id,
    productName: prod.name,
    size,
    type: 'OUT',
    quantity: quantitySold,
    previousStock: prevQty,
    newStock,
    reason,
    timestamp: now,
  });

  saveToDisk();
  return { success: true, newStock };
}

export function getMovements(limit: number = 100): Movement[] {
  return dbMemory.movements.slice(0, limit);
}

export function seedInitialSchoolGarments() {
  const now = Date.now();
  const initialProducts: Product[] = [
    {
      id: 'prod_chomba_cuello_rojo_mc',
      name: 'Chomba Cuello Rojo (Manga Corta)',
      category: 'Chombas',
      sizeOrder: ['4', '6', '8', '10', '12'],
      stock: {
        '4': { quantity: 10, minStock: 2 },
        '6': { quantity: 12, minStock: 2 },
        '8': { quantity: 15, minStock: 2 },
        '10': { quantity: 14, minStock: 2 },
        '12': { quantity: 8, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_chomba_cuello_rojo_ml',
      name: 'Chomba Cuello Rojo - Manga Larga (ML)',
      category: 'Chombas',
      sizeOrder: ['4', '6', '8', '10', '12'],
      stock: {
        '4': { quantity: 8, minStock: 2 },
        '6': { quantity: 10, minStock: 2 },
        '8': { quantity: 12, minStock: 2 },
        '10': { quantity: 10, minStock: 2 },
        '12': { quantity: 6, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_chomba_cuello_blanco',
      name: 'Chomba Cuello Blanco',
      category: 'Chombas',
      sizeOrder: ['4', '6', '8', '10', '12', '14', '16', 'M', 'L', 'XL'],
      stock: {
        '4': { quantity: 6, minStock: 2 },
        '6': { quantity: 8, minStock: 2 },
        '8': { quantity: 12, minStock: 2 },
        '10': { quantity: 15, minStock: 2 },
        '12': { quantity: 14, minStock: 2 },
        '14': { quantity: 10, minStock: 2 },
        '16': { quantity: 8, minStock: 2 },
        'M': { quantity: 6, minStock: 2 },
        'L': { quantity: 4, minStock: 2 },
        'XL': { quantity: 2, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_chomba_docente',
      name: 'Chomba Docente',
      category: 'Docentes',
      sizeOrder: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '5 AD'],
      stock: {
        'XS': { quantity: 4, minStock: 2 },
        'S': { quantity: 6, minStock: 2 },
        'M': { quantity: 8, minStock: 2 },
        'L': { quantity: 8, minStock: 2 },
        'XL': { quantity: 6, minStock: 2 },
        '2XL': { quantity: 4, minStock: 2 },
        '3XL': { quantity: 3, minStock: 2 },
        '5 AD': { quantity: 2, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_pollera_microfibra',
      name: 'Pollera Microfibra (MF)',
      category: 'Polleras',
      sizeOrder: ['4', '6', '8', '10', '12', '14', '16', '36', '38', '40'],
      stock: {
        '4': { quantity: 5, minStock: 2 },
        '6': { quantity: 8, minStock: 2 },
        '8': { quantity: 10, minStock: 2 },
        '10': { quantity: 12, minStock: 2 },
        '12': { quantity: 10, minStock: 2 },
        '14': { quantity: 8, minStock: 2 },
        '16': { quantity: 6, minStock: 2 },
        '36': { quantity: 5, minStock: 2 },
        '38': { quantity: 4, minStock: 2 },
        '40': { quantity: 3, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_short',
      name: 'Short',
      category: 'Deportivo',
      sizeOrder: ['4', '6', '8', '10', '12', '14', '16', '1 AD', '2 AD', '3 AD'],
      stock: {
        '4': { quantity: 8, minStock: 2 },
        '6': { quantity: 12, minStock: 2 },
        '8': { quantity: 15, minStock: 2 },
        '10': { quantity: 16, minStock: 2 },
        '12': { quantity: 14, minStock: 2 },
        '14': { quantity: 10, minStock: 2 },
        '16': { quantity: 8, minStock: 2 },
        '1 AD': { quantity: 6, minStock: 2 },
        '2 AD': { quantity: 5, minStock: 2 },
        '3 AD': { quantity: 3, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_pantalon',
      name: 'Pantalón',
      category: 'Pantalones',
      sizeOrder: ['4', '6', '8', '10', '12', '14', '16', '38', '40', '42', '44'],
      stock: {
        '4': { quantity: 8, minStock: 2 },
        '6': { quantity: 10, minStock: 2 },
        '8': { quantity: 14, minStock: 2 },
        '10': { quantity: 15, minStock: 2 },
        '12': { quantity: 12, minStock: 2 },
        '14': { quantity: 10, minStock: 2 },
        '16': { quantity: 8, minStock: 2 },
        '38': { quantity: 6, minStock: 2 },
        '40': { quantity: 6, minStock: 2 },
        '42': { quantity: 4, minStock: 2 },
        '44': { quantity: 3, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_campera',
      name: 'Campera',
      category: 'Camperas',
      sizeOrder: ['4', '6', '8', '10', '12', '14', '16', '38', '40', '42', '44'],
      stock: {
        '4': { quantity: 6, minStock: 2 },
        '6': { quantity: 8, minStock: 2 },
        '8': { quantity: 12, minStock: 2 },
        '10': { quantity: 14, minStock: 2 },
        '12': { quantity: 12, minStock: 2 },
        '14': { quantity: 8, minStock: 2 },
        '16': { quantity: 6, minStock: 2 },
        '38': { quantity: 5, minStock: 2 },
        '40': { quantity: 5, minStock: 2 },
        '42': { quantity: 4, minStock: 2 },
        '44': { quantity: 2, minStock: 2 },
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  dbMemory.products = initialProducts;
  dbMemory.movements = [];
  saveToDisk();
}
