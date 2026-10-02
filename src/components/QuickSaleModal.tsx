import { useState, useEffect } from 'react';
import type { Product, PaymentMethod } from '../types/inventory';
import { Zap, X, ShoppingCart, Loader2, Banknote, Smartphone, CreditCard, MessageSquare } from 'lucide-react';

interface QuickSaleModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onConfirmSale: (
    productId: string, 
    size: string, 
    quantity: number, 
    paymentMethod: PaymentMethod,
    notes: string
  ) => Promise<void>;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any; color: string; activeBg: string }[] = [
  {
    id: 'Efectivo',
    label: 'Efectivo',
    icon: Banknote,
    color: 'text-emerald-600',
    activeBg: 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-900',
  },
  {
    id: 'Mercado Pago',
    label: 'Mercado Pago',
    icon: Smartphone,
    color: 'text-sky-600',
    activeBg: 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/30 text-sky-900',
  },
  {
    id: 'Tarjeta de Débito',
    label: 'Tarjeta Débito',
    icon: CreditCard,
    color: 'text-blue-600',
    activeBg: 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/30 text-blue-900',
  },
  {
    id: 'Tarjeta de Crédito',
    label: 'Tarjeta Crédito',
    icon: CreditCard,
    color: 'text-purple-600',
    activeBg: 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/30 text-purple-900',
  },
];

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  products,
  onClose,
  onConfirmSale,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar el producto inicial al abrir o si cambia la lista
  useEffect(() => {
    if (isOpen && products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [isOpen, products, selectedProductId]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    setSelectedSize('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !selectedSize) {
      setError('Por favor selecciona un talle para continuar.');
      return;
    }

    const available = currentProduct.stock[selectedSize]?.quantity || 0;
    if (quantity > available) {
      setError(`Stock insuficiente (disponible en talle ${selectedSize}: ${available})`);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onConfirmSale(currentProduct.id, selectedSize, quantity, paymentMethod, notes);
      // Resetear campos secundarios
      setNotes('');
      setQuantity(1);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la venta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/40 rounded-lg">
              <Zap className="w-5 h-5 fill-current text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Venta Rápida de Mostrador</h3>
              <p className="text-xs text-emerald-100">Registrar salida directa y forma de cobro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-700/80 rounded-lg transition-colors cursor-pointer text-emerald-100 hover:text-white"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Selector de Prenda */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Prenda / Artículo Escolar
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-2xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Talle */}
          {currentProduct && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Talle a entregar
                </label>
                {selectedSize && (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Seleccionado: Talle {selectedSize} ({currentProduct.stock[selectedSize]?.quantity || 0} en stock)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30 font-bold scale-[1.02]'
                          : isOutOfStock
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 font-medium'
                      }`}
                    >
                      <span className={`text-xs ${isSelected ? 'font-black' : 'font-bold'}`}>
                        Talle {size}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : isOutOfStock ? 'text-slate-400' : 'text-slate-500 font-normal'}`}>
                        {isOutOfStock ? 'Agotado' : `${stock} disp.`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cantidad de unidades
              </label>
              <p className="text-[11px] text-slate-500">Unidades a descontar del stock</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all text-sm flex items-center justify-center cursor-pointer shadow-2xs"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-14 text-center text-sm font-black bg-white border border-slate-300 rounded-lg py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all text-sm flex items-center justify-center cursor-pointer shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Selector de Forma de Pago */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Forma de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? pm.activeBg
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/80 shadow-2xs' : 'bg-slate-100'} ${pm.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold leading-tight">{pm.label}</span>
                      <span className="block text-[10px] text-slate-400">
                        {isSelected ? 'Seleccionado' : 'Click para elegir'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Observaciones (Opcional)
              </label>
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Nombre de alumno/a, grado, pago con seña, retiro en turno tarde..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedSize}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Confirmar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
