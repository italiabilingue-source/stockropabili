import { useState } from 'react';
import type { Product } from '../types/inventory';
import { 
  Search, 
  Save, 
  ShoppingCart, 
  AlertTriangle, 
  Check, 
  RotateCcw, 
  Loader2, 
  Edit3, 
  Trash2,
  Shirt,
  Filter
} from 'lucide-react';

interface InventoryGridProps {
  products: Product[];
  onSaveRow: (product: Product, updates: { size: string; newQuantity: number }[]) => Promise<void>;
  onQuickDecrement: (product: Product, size: string) => Promise<void>;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  products,
  onSaveRow,
  onQuickDecrement,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Guardamos cambios locales por prenda: { [productId]: { [size]: number } }
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, number>>>({});
  const [loadingRow, setLoadingRow] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Extraer categorías únicas
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleQuantityChange = (productId: string, size: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setPendingChanges((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [size]: num,
      },
    }));
  };

  const handleSave = async (product: Product) => {
    const changes = pendingChanges[product.id];
    if (!changes || Object.keys(changes).length === 0) return;

    setLoadingRow(product.id);
    try {
      const updates = Object.entries(changes).map(([size, newQuantity]) => ({
        size,
        newQuantity,
      }));
      await onSaveRow(product, updates);

      // Limpiar cambios pendientes de esa prenda
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });

      setSavedSuccess(product.id);
      setTimeout(() => setSavedSuccess(null), 2000);
    } catch (err: any) {
      alert('Error guardando cambios: ' + err.message);
    } finally {
      setLoadingRow(null);
    }
  };

  const handleUndo = (productId: string) => {
    setPendingChanges((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    if (!matchesSearch || !matchesCategory) return false;

    if (onlyLowStock) {
      // Tiene al menos un talle con cantidad <= minStock
      return Object.values(p.stock).some((s) => s.quantity <= s.minStock);
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda Rápida */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar prenda o uniforme (ej. Chomba, Pollera, Buzo)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Todas las Categorías' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              Solo Stock Crítico
            </span>
          </label>
        </div>
      </div>

      {/* Tabla / Matriz de Stock */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4 w-72">Artículo / Prenda</th>
                <th className="py-3 px-4">Talles y Cantidades en Mostrador</th>
                <th className="py-3 px-4 text-center w-24">Total</th>
                <th className="py-3 px-4 text-right w-44">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Shirt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    No se encontraron prendas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const productChanges = pendingChanges[product.id];
                  const hasChanges = Boolean(
                    productChanges && Object.keys(productChanges).length > 0
                  );
                  const changedCount = hasChanges ? Object.keys(productChanges).length : 0;
                  const isLoading = loadingRow === product.id;

                  // Total de stock calculado en tiempo real
                  const totalStock = product.sizeOrder.reduce((acc, size) => {
                    const currentVal =
                      productChanges?.[size] !== undefined
                        ? productChanges[size]
                        : product.stock[size]?.quantity || 0;
                    return acc + currentVal;
                  }, 0);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      {/* Prenda, Categoría y Foto */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imagePath ? (
                              <img
                                src={`local-img://${product.imagePath}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback si la imagen no carga
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Shirt className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div 
                              onClick={() => onEditProduct(product)}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Click para editar nombre, categoría o talles de la prenda"
                            >
                              <span>{product.name}</span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="inline-block px-2 py-0.5 mt-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-md">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Celdas por Talle */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {product.sizeOrder.map((size) => {
                            const stockInfo = product.stock[size] || {
                              quantity: 0,
                              minStock: 2,
                            };
                            const isPending = productChanges?.[size] !== undefined;
                            const currentVal = isPending
                              ? productChanges[size]
                              : stockInfo.quantity;
                            const isCritical = currentVal <= stockInfo.minStock;

                            return (
                              <div
                                key={size}
                                className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                                  isPending
                                    ? 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-300'
                                    : isCritical
                                    ? 'bg-red-50/80 border-red-300 ring-1 ring-red-200'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                                  <span>Talle {size}</span>
                                  {isCritical && (
                                    <span title={`Stock crítico (Mín: ${stockInfo.minStock})`}>
                                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                    </span>
                                  )}
                                </div>

                                {/* Input Numérico Ágil */}
                                <input
                                  type="number"
                                  min="0"
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleQuantityChange(product.id, size, e.target.value)
                                  }
                                  className="w-14 h-8 text-center font-bold text-sm bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                                />

                                {/* Botón Salida Rápida (-1) */}
                                <button
                                  type="button"
                                  onClick={() => onQuickDecrement(product, size)}
                                  disabled={isLoading || currentVal <= 0}
                                  title={`Registrar venta de 1 unidad de talle ${size}`}
                                  className="mt-1.5 w-full inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:text-white hover:bg-emerald-600 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ShoppingCart className="w-2.5 h-2.5" />
                                  -1
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 text-center align-middle font-bold text-slate-800 text-sm">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          totalStock > 0 ? 'bg-slate-100 text-slate-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {totalStock} u.
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right align-middle">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => handleSave(product)}
                            disabled={!hasChanges || isLoading}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${
                              hasChanges
                                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : savedSuccess === product.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            {savedSuccess === product.id
                              ? 'Guardado'
                              : hasChanges
                              ? `Guardar (${changedCount})`
                              : 'Guardar'}
                          </button>

                          <div className="flex items-center gap-2">
                            {hasChanges && (
                              <button
                                onClick={() => handleUndo(product.id)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                                title="Deshacer cambios no guardados"
                              >
                                <RotateCcw className="w-3 h-3" /> Deshacer
                              </button>
                            )}

                            <button
                              onClick={() => onEditProduct(product)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-md border border-slate-200 hover:border-blue-200 transition-colors"
                              title="Editar nombre, categoría o talles de la prenda"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => onDeleteProduct(product)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar prenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
