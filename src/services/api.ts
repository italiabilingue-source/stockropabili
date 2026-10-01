import type { Product, Movement, AppApi } from '../types/inventory';

// Datos iniciales de prendas y curvas de talles del colegio
const MOCK_PRODUCTS: Product[] = [
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
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
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
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
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
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 7200000,
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
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 1800000,
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
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000,
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
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 14400000,
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
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 7200000,
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
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000,
  },
];

const LOCAL_STORAGE_KEY_PRODS = 'stock_ropa_products_v3';
const LOCAL_STORAGE_KEY_MOVS = 'stock_ropa_movements_v2';

function getLocalProducts(): Product[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_PRODS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODS, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
  return JSON.parse(data);
}

function saveLocalProducts(products: Product[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_PRODS, JSON.stringify(products));
}

function getLocalMovements(): Movement[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_MOVS);
  return data ? JSON.parse(data) : [];
}

function addLocalMovement(m: Movement) {
  const movs = getLocalMovements();
  movs.unshift(m);
  localStorage.setItem(LOCAL_STORAGE_KEY_MOVS, JSON.stringify(movs.slice(0, 200)));
}

// Implementación cliente universal (usa Electron IPC si está disponible, o localStorage si está en navegador)
export const api: AppApi = {
  getProducts: async () => {
    if (window.electronApi) {
      return window.electronApi.getProducts();
    }
    return getLocalProducts();
  },

  saveProduct: async (product) => {
    if (window.electronApi) {
      return window.electronApi.saveProduct(product);
    }
    const products = getLocalProducts();
    const existingIdx = products.findIndex((p) => p.id === product.id);
    const now = Date.now();
    let saved: Product;
    if (existingIdx >= 0) {
      saved = {
        ...products[existingIdx],
        ...product,
        updatedAt: now,
      };
      products[existingIdx] = saved;
    } else {
      saved = {
        ...product,
        createdAt: now,
        updatedAt: now,
      };
      products.push(saved);
    }
    saveLocalProducts(products);
    return saved;
  },

  deleteProduct: async (id) => {
    if (window.electronApi) {
      return window.electronApi.deleteProduct(id);
    }
    const products = getLocalProducts().filter((p) => p.id !== id);
    saveLocalProducts(products);
    return true;
  },

  batchUpdateStock: async (productId, updates, reason = 'Ajuste de grilla masivo') => {
    if (window.electronApi) {
      return window.electronApi.batchUpdateStock(productId, updates, reason);
    }
    const products = getLocalProducts();
    const prod = products.find((p) => p.id === productId);
    if (!prod) throw new Error('Producto no encontrado');

    const now = Date.now();
    for (const u of updates) {
      const prev = prod.stock[u.size] || { quantity: 0, minStock: 2 };
      const diff = u.newQuantity - prev.quantity;
      if (diff !== 0) {
        addLocalMovement({
          id: String(Date.now() + Math.random()),
          productId,
          productName: prod.name,
          size: u.size,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          previousStock: prev.quantity,
          newStock: u.newQuantity,
          reason,
          timestamp: now,
        });
      }
      prod.stock[u.size] = {
        quantity: u.newQuantity,
        minStock: u.newMinStock !== undefined ? u.newMinStock : prev.minStock,
      };
    }
    prod.updatedAt = now;
    saveLocalProducts(products);
    return { success: true, updatedStock: prod.stock };
  },

  recordQuickSale: async (productId, size, quantity = 1, reason = 'Venta rápida de mostrador') => {
    if (window.electronApi) {
      return window.electronApi.recordQuickSale(productId, size, quantity, reason);
    }
    const products = getLocalProducts();
    const prod = products.find((p) => p.id === productId);
    if (!prod) throw new Error('Producto no encontrado');
    const item = prod.stock[size];
    if (!item) throw new Error(`Talle ${size} inexistente`);
    if (item.quantity < quantity) {
      throw new Error(`Stock insuficiente en ${size}. Disponible: ${item.quantity}`);
    }

    const prevQty = item.quantity;
    const newStock = prevQty - quantity;
    item.quantity = newStock;
    prod.updatedAt = Date.now();

    addLocalMovement({
      id: String(Date.now() + Math.random()),
      productId,
      productName: prod.name,
      size,
      type: 'OUT',
      quantity,
      previousStock: prevQty,
      newStock,
      reason,
      timestamp: Date.now(),
    });

    saveLocalProducts(products);
    return { success: true, newStock };
  },

  getMovements: async (limit = 100) => {
    if (window.electronApi) {
      return window.electronApi.getMovements(limit);
    }
    return getLocalMovements().slice(0, limit);
  },

  selectAndSaveImage: async () => {
    if (window.electronApi) {
      return window.electronApi.selectAndSaveImage();
    }
    // Mock web: prompt or simulated
    return null;
  },

  resetDatabaseWithSamples: async () => {
    if (window.electronApi) {
      return window.electronApi.resetDatabaseWithSamples();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_PRODS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MOVS);
    return getLocalProducts();
  },

  getAppVersion: async () => {
    if (window.electronApi) {
      return window.electronApi.getAppVersion();
    }
    return '1.0.0-web';
  },

  checkForUpdates: async () => {
    if (window.electronApi) {
      return window.electronApi.checkForUpdates();
    }
  },

  installUpdate: async () => {
    if (window.electronApi) {
      return window.electronApi.installUpdate();
    }
  },

  onUpdateStatus: (callback) => {
    if (window.electronApi) {
      return window.electronApi.onUpdateStatus(callback);
    }
    return () => {};
  },
};
