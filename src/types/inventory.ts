export type StockItem = {
  quantity: number;
  minStock: number;
};

export type StockMap = Record<string, StockItem>;

export interface Product {
  id: string;
  name: string;
  category: string;
  imagePath?: string;
  sizeOrder: string[]; // e.g. ["2", "4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"]
  stock: StockMap;
  createdAt: number;
  updatedAt: number;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export type PaymentMethod = 
  | 'Efectivo' 
  | 'Mercado Pago' 
  | 'Tarjeta de Crédito' 
  | 'Tarjeta de Débito';

export interface Movement {
  id?: string;
  productId: string;
  productName: string;
  size: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  paymentMethod?: PaymentMethod | string;
  notes?: string;
  timestamp: number;
  userId?: string;
}

export interface SizeUpdateDelta {
  size: string;
  newQuantity: number;
  newMinStock?: number;
}

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface PriceRule {
  id: string;
  garment: string;
  sizeRange: string;
  price: number;
}

export interface AppApi {
  getProducts: () => Promise<Product[]>;
  saveProduct: (product: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  batchUpdateStock: (
    productId: string, 
    updates: SizeUpdateDelta[], 
    reason?: string
  ) => Promise<{ success: boolean; updatedStock: StockMap }>;
  recordQuickSale: (
    productId: string, 
    size: string, 
    quantity?: number, 
    paymentMethod?: string,
    notes?: string
  ) => Promise<{ success: boolean; newStock: number }>;
  getMovements: (limit?: number) => Promise<Movement[]>;
  selectAndSaveImage: () => Promise<string | null>;
  resetDatabaseWithSamples: () => Promise<Product[]>;
  getAppVersion: () => Promise<string>;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
  onUpdateStatus: (callback: (status: { type: string; info?: any }) => void) => () => void;
}

declare global {
  interface Window {
    electronApi?: AppApi;
  }
}
