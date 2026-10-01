import { useState } from 'react';
import type { Product } from '../types/inventory';
import { Zap, X, ShoppingCart, Loader2 } from 'lucide-react';

interface QuickSaleModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onConfirmSale: (productId: string, size: string, quantity: number, reason: string) => Promise<void>;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  products,
  onClose,
  onConfirmSale,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Venta directa mostrador');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    setSelectedSize('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !selectedSize) {
      setError('Por favor selecciona un talle.');
      return;
    }

    const available = currentProduct.stock[selectedSize]?.quantity || 0;
    if (quantity > available) {
      setError(`Stock insuficiente (disponible: ${available})`);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onConfirmSale(currentProduct.id, selectedSize, quantity, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la salida');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-current" />
            <h3 className="font-bold text-base">Registrar Salida / Venta Rápida</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Selector de Prenda */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Artículo / Prenda
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Talle */}
          {currentProduct && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seleccionar Talle
              </label>
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.sizeOrder.map((size) => {
                  const stock = currentProduct.stock[size]?.quantity || 0;
                  const isSelected = selectedSize === size;
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 text-emerald-900 font-bold'
                          : isOutOfStock
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">Talle {size}</span>
                      <span className="text-[10px] text-slate-500">
                        {isOutOfStock ? 'Agotado' : `${stock} disp.`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cantidad y Motivo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-center text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo / Destino
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Venta directa mostrador">Venta directa mostrador</option>
                <option value="Entrega institucional">Entrega institucional</option>
                <option value="Cambio de talle">Cambio de talle</option>
                <option value="Muestra o prueba">Muestra o prueba</option>
                <option value="Retiro de taller">Retiro de taller</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedSize}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Confirmar Salida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
