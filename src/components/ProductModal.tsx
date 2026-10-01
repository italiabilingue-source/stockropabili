import { useState, useEffect } from 'react';
import type { Product, StockMap } from '../types/inventory';
import { api } from '../services/api';
import { X, Image as ImageIcon, Save, Loader2, Sparkles, Shirt } from 'lucide-react';

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
    name: 'Pollera MF (4 al 40)',
    sizes: ['4', '6', '8', '10', '12', '14', '16', '36', '38', '40'],
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

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  initialProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Primaria / Secundaria');
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [sizeOrder, setSizeOrder] = useState<string[]>(SIZE_PRESETS[0].sizes);
  const [stockMap, setStockMap] = useState<StockMap>({});
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
      setCategory('Primaria / Secundaria');
      setImagePath(undefined);
      const defaultSizes = SIZE_PRESETS[0].sizes;
      setSizeOrder(defaultSizes);
      const initialMap: StockMap = {};
      defaultSizes.forEach((s) => {
        initialMap[s] = { quantity: 0, minStock: 2 };
      });
      setStockMap(initialMap);
    }
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {initialProduct ? 'Editar Prenda' : 'Nueva Prenda de Indumentaria'}
            </h3>
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
                placeholder="Ej. Chomba Piqué Manga Corta"
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
                placeholder="Ej. Primaria / Secundaria / Deportes"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Selector de Foto Local */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto del Uniforme (Guardada localmente en tu PC)
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
                    Quitar
                  </button>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos JPG, PNG o WebP. Se guarda en la carpeta local de la aplicación.
                </p>
              </div>
            </div>
          </div>

          {/* Plantillas Rápidas de Talles Escolares */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Plantillas de Talles Escolares
              </label>
              <span className="text-[11px] text-slate-400">Click para cargar escala</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.sizes)}
                  className="px-2.5 py-1.5 text-left text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all"
                >
                  <div className="font-bold text-[11px]">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {preset.sizes.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Carga de Cantidades Iniciales y Mínimo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Stock Inicial y Alerta Mínima por Talle
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Talle</th>
                    <th className="py-2 px-3 text-center">Stock Inicial</th>
                    <th className="py-2 px-3 text-center">Alerta Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sizeOrder.map((size) => {
                    const item = stockMap[size] || { quantity: 0, minStock: 2 };
                    return (
                      <tr key={size} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          Talle {size}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) =>
                              handleStockChange(size, 'quantity', e.target.value)
                            }
                            className="w-16 h-7 text-center font-bold bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
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
                            className="w-16 h-7 text-center font-semibold bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Botones */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
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
              {initialProduct ? 'Guardar Cambios' : 'Crear Prenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
