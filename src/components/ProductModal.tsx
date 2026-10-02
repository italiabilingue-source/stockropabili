import { useState, useEffect } from 'react';
import type { Product, StockMap } from '../types/inventory';
import { api } from '../services/api';
import { 
  X, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  Sparkles, 
  Shirt, 
  Plus, 
  Trash2, 
  Edit3 
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  initialProduct?: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const SIZE_PRESETS = [
  {
    name: 'Chomba Estándar (4 al 12)',
    sizes: ['4', '6', '8', '10', '12'],
  },
  {
    name: 'Chomba Ampliada (4 al XL)',
    sizes: ['4', '6', '8', '10', '12', '14', '16', 'M', 'L', 'XL'],
  },
  {
    name: 'Docente (XS a 5 AD)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '5 AD'],
  },
  {
    name: 'Pollera MF (4 al 42)',
    sizes: ['4', '6', '8', '10', '12', '14', '16', '36', '38', '40', '42'],
  },
  {
    name: 'Short / Deportivo (4 a 3 AD)',
    sizes: ['4', '6', '8', '10', '12', '14', '16', '1 AD', '2 AD', '3 AD'],
  },
  {
    name: 'Pantalón / Campera (4 al 44)',
    sizes: ['4', '6', '8', '10', '12', '14', '16', '38', '40', '42', '44'],
  },
];

export const ProductModal = ({
  isOpen,
  initialProduct,
  onClose,
  onSave,
}: ProductModalProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chombas');
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [sizeOrder, setSizeOrder] = useState<string[]>(SIZE_PRESETS[0].sizes);
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setImagePath(initialProduct.imagePath);
      setSizeOrder(initialProduct.sizeOrder);
      setStockMap({ ...initialProduct.stock });
    } else {
      setName('');
      setCategory('Chombas');
      setImagePath(undefined);
      const defaultSizes = SIZE_PRESETS[0].sizes;
      setSizeOrder(defaultSizes);
      const initialMap: StockMap = {};
      defaultSizes.forEach((s) => {
        initialMap[s] = { quantity: 0, minStock: 2 };
      });
      setStockMap(initialMap);
    }
    setCustomSizeInput('');
    setError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (sizes: string[]) => {
    setSizeOrder(sizes);
    const newMap: StockMap = { ...stockMap };
    sizes.forEach((s) => {
      if (!newMap[s]) {
        newMap[s] = { quantity: 0, minStock: 2 };
      }
    });
    setStockMap(newMap);
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (sizeOrder.includes(trimmed)) {
      setError(`El talle "${trimmed}" ya existe en esta prenda.`);
      return;
    }
    setError(null);
    setSizeOrder((prev) => [...prev, trimmed]);
    setStockMap((prev) => ({
      ...prev,
      [trimmed]: { quantity: 0, minStock: 2 },
    }));
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (sizeOrder.length <= 1) {
      setError('La prenda debe conservar al menos un talle.');
      return;
    }
    setError(null);
    setSizeOrder((prev) => prev.filter((s) => s !== sizeToRemove));
    setStockMap((prev) => {
      const copy = { ...prev };
      delete copy[sizeToRemove];
      return copy;
    });
  };

  const handleStockChange = (size: string, field: 'quantity' | 'minStock', value: string) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    setStockMap((prev) => ({
      ...prev,
      [size]: {
        ...(prev[size] || { quantity: 0, minStock: 2 }),
        [field]: val,
      },
    }));
  };

  const handleSelectImage = async () => {
    try {
      const savedPath = await api.selectAndSaveImage();
      if (savedPath) {
        setImagePath(savedPath);
      }
    } catch (err: any) {
      console.error('Error al seleccionar imagen:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la prenda es obligatorio.');
      return;
    }

    if (sizeOrder.length === 0) {
      setError('Debes configurar al menos un talle.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const id = initialProduct ? initialProduct.id : `prod_${Date.now()}`;
      await onSave({
        id,
        name: name.trim(),
        category: category.trim(),
        imagePath,
        sizeOrder,
        stock: stockMap,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la prenda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {initialProduct ? (
              <Edit3 className="w-5 h-5 text-amber-400" />
            ) : (
              <Shirt className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">
                  {initialProduct ? 'Editar Prenda' : 'Nueva Prenda de Indumentaria'}
                </h3>
                {initialProduct && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                    Modo Edición
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {initialProduct
                  ? 'Modifica el nombre, categoría, foto o agrega/quita talles'
                  : 'Carga una nueva prenda al sistema de mostrador'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Prenda *
              </label>
              <input
                type="text"
                placeholder="Ej. Pollera Microfibra (MF)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría / Nivel
              </label>
              <input
                type="text"
                placeholder="Ej. Polleras, Chombas, Deportivo..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Selector de Foto Local */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto de la Prenda
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {imagePath ? (
                  <img
                    src={`local-img://${imagePath}`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Shirt className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleSelectImage}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  {imagePath ? 'Cambiar Foto' : 'Elegir Foto del Disco...'}
                </button>
                {imagePath && (
                  <button
                    type="button"
                    onClick={() => setImagePath(undefined)}
                    className="ml-2 text-xs text-red-500 hover:underline"
                  >
                    Quitar Foto
                  </button>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Se guarda en la carpeta local de la aplicación.
                </p>
              </div>
            </div>
          </div>

          {/* Plantillas Rápidas de Talles Escolares */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Curvas de Talles Predefinidas
              </label>
              <span className="text-[10px] text-slate-400">Click para aplicar escala completa</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.sizes)}
                  className="px-2.5 py-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all"
                >
                  <div className="font-bold text-[11px] truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {preset.sizes.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Agregar Talle Individual / Personalizado */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Agregar Talle Individual (ej: 42, 5 AD, XS)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe el talle (ej. 42)..."
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Talle
              </button>
            </div>
          </div>

          {/* Tabla de Carga de Cantidades Iniciales, Mínimo y Quitar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Talles Configurados ({sizeOrder.length})
              </label>
              <span className="text-[10px] text-slate-400">
                Puedes ajustar stock o eliminar talles con el ícono rojo
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Talle</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-center">Alerta Mín.</th>
                    <th className="py-2 px-2 text-center w-12">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sizeOrder.map((size) => {
                    const item = stockMap[size] || { quantity: 0, minStock: 2 };
                    return (
                      <tr key={size} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono">
                            Talle {size}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) =>
                              handleStockChange(size, 'quantity', e.target.value)
                            }
                            className="w-16 h-7 text-center font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.minStock}
                            onChange={(e) =>
                              handleStockChange(size, 'minStock', e.target.value)
                            }
                            className="w-16 h-7 text-center font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={`Eliminar talle ${size}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Botones */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialProduct ? 'Guardar Cambios de la Prenda' : 'Crear Prenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
