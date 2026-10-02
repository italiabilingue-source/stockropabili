import { useState, useEffect, useCallback } from 'react';
import type { Product, Movement, PaymentMethod } from './types/inventory';
import { api } from './services/api';
import { Header } from './components/Header';
import { InventoryGrid } from './components/InventoryGrid';
import { QuickSaleModal } from './components/QuickSaleModal';
import { ProductModal } from './components/ProductModal';
import { MovementsModal } from './components/MovementsModal';
import { UpdateBanner } from './components/UpdateBanner';
import { PriceListSidebar } from './components/PriceListSidebar';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  TrendingDown, 
  Sparkles,
  Loader2
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState<{ type: string; info?: any } | null>(null);
  const [showPriceList, setShowPriceList] = useState(true);

  // Modals state
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Carga de datos
  const loadData = useCallback(async () => {
    try {
      const [prods, movs, ver] = await Promise.all([
        api.getProducts(),
        api.getMovements(200),
        api.getAppVersion(),
      ]);
      setProducts(prods);
      setMovements(movs);
      setVersion(ver);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Escuchar actualizaciones de electron-updater
    const unsubscribe = api.onUpdateStatus((status) => {
      console.log('[UpdateStatus]', status);
      setUpdateStatus(status);
    });

    // Atajos de teclado para velocidad en mostrador
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsQuickSaleOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setEditingProduct(null);
        setIsProductModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowPriceList((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadData]);

  // Guardar fila masiva de talles
  const handleSaveRow = async (
    product: Product,
    updates: { size: string; newQuantity: number }[]
  ) => {
    const res = await api.batchUpdateStock(product.id, updates, 'Ajuste de grilla manual');
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: res.updatedStock } : p))
      );
      // Recargar movimientos de auditoría
      const updatedMovs = await api.getMovements(200);
      setMovements(updatedMovs);
    }
  };

  // Salida rápida (-1) desde el botón directo en la grilla
  const handleQuickDecrement = async (product: Product, size: string) => {
    const res = await api.recordQuickSale(product.id, size, 1, 'Venta rápida de mostrador');
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== product.id) return p;
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: {
                ...p.stock[size],
                quantity: res.newStock,
              },
            },
          };
        })
      );
      const updatedMovs = await api.getMovements(200);
      setMovements(updatedMovs);
    }
  };

  // Confirmar venta desde el modal rápido
  const handleConfirmSale = async (
    productId: string,
    size: string,
    quantity: number,
    paymentMethod: PaymentMethod,
    notes: string
  ) => {
    const res = await api.recordQuickSale(productId, size, quantity, paymentMethod, notes);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: {
                ...p.stock[size],
                quantity: res.newStock,
              },
            },
          };
        })
      );
      const updatedMovs = await api.getMovements(200);
      setMovements(updatedMovs);
    }
  };

  // Guardar o crear prenda completa
  const handleSaveProduct = async (
    productData: Omit<Product, 'createdAt' | 'updatedAt'>
  ) => {
    const saved = await api.saveProduct(productData);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    const updatedMovs = await api.getMovements(200);
    setMovements(updatedMovs);
  };

  // Eliminar prenda
  const handleDeleteProduct = async (product: Product) => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar la prenda "${product.name}"? Se borrará todo su historial.`
      )
    ) {
      await api.deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  // Métricas para tarjetas de resumen
  const totalItemsCount = products.length;
  const totalUnits = products.reduce((acc, p) => {
    return acc + Object.values(p.stock).reduce((sAcc, s) => sAcc + s.quantity, 0);
  }, 0);

  const criticalGarmentsCount = products.filter((p) =>
    Object.values(p.stock).some((s) => s.quantity <= s.minStock)
  ).length;

  const today = new Date().setHours(0, 0, 0, 0);
  const salesTodayCount = movements
    .filter((m) => m.type === 'OUT' && m.timestamp >= today)
    .reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Banner de actualización de GitHub si aplica */}
      <UpdateBanner
        updateStatus={updateStatus}
        onInstall={() => api.installUpdate()}
        onDismiss={() => setUpdateStatus(null)}
      />

      {/* Header Fijo */}
      <Header
        version={version}
        updateStatus={updateStatus}
        showPriceList={showPriceList}
        onTogglePriceList={() => setShowPriceList((prev) => !prev)}
        onOpenQuickSale={() => setIsQuickSaleOpen(true)}
        onOpenNewProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onRefresh={loadData}
        onInstallUpdate={() => api.installUpdate()}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {totalItemsCount}
              </div>
              <div className="text-xs font-medium text-slate-500">
                Prendas en Catálogo
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {totalUnits}
              </div>
              <div className="text-xs font-medium text-slate-500">
                Total Unidades Físicas
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 tracking-tight">
                {criticalGarmentsCount}
              </div>
              <div className="text-xs font-medium text-slate-500">
                Prendas con Stock Crítico
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                {salesTodayCount} u.
              </div>
              <div className="text-xs font-medium text-slate-500">
                Ventas / Salidas Hoy
              </div>
            </div>
          </div>
        </div>

        {/* Grilla Principal + Lista de Precios Lateral */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              Cargando base de datos local...
            </p>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 w-full min-w-0">
              <InventoryGrid
                products={products}
                onSaveRow={handleSaveRow}
                onQuickDecrement={handleQuickDecrement}
                onEditProduct={(p) => {
                  setEditingProduct(p);
                  setIsProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>

            <PriceListSidebar
              isOpen={showPriceList}
              onClose={() => setShowPriceList(false)}
            />
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">F2</kbd> Venta Rápida</span>
          <span>•</span>
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">F3</kbd> Nueva Prenda</span>
          <span>•</span>
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">F4</kbd> Lista de Precios</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (window.confirm('¿Deseas recargar los datos de prueba escolares? Se restablecerán las prendas de demostración.')) {
                setIsLoading(true);
                const reset = await api.resetDatabaseWithSamples();
                setProducts(reset);
                setIsLoading(false);
              }
            }}
            className="text-slate-400 hover:text-slate-700 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Recargar Datos de Prueba Escolares
          </button>
        </div>
      </footer>

      {/* Modales */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        products={products}
        onClose={() => setIsQuickSaleOpen(false)}
        onConfirmSale={handleConfirmSale}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        initialProduct={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <MovementsModal
        isOpen={isHistoryOpen}
        movements={movements}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
