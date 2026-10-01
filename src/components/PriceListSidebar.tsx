import { useState, useEffect } from 'react';
import type { PriceRule } from '../types/inventory';
import { 
  Tag, 
  Search, 
  Edit3, 
  Check, 
  RotateCcw, 
  X, 
  ChevronRight,
  Receipt
} from 'lucide-react';

export const INITIAL_PRICE_RULES: PriceRule[] = [
  // CHOMBA
  { id: 'chomba_4_8', garment: 'CHOMBA', sizeRange: '4 AL 8', price: 28670 },
  { id: 'chomba_10_14', garment: 'CHOMBA', sizeRange: '10 AL 14', price: 30200 },
  { id: 'chomba_s_xl', garment: 'CHOMBA', sizeRange: 'S AL XL', price: 33700 },
  { id: 'chomba_2xl_5ad', garment: 'CHOMBA', sizeRange: '2 XL AL 5AD', price: 40400 },

  // PANTALÓN
  { id: 'pantalon_4_8', garment: 'PANTALÓN', sizeRange: '4 AL 8', price: 44500 },
  { id: 'pantalon_10_16', garment: 'PANTALÓN', sizeRange: '10 AL 16', price: 49000 },
  { id: 'pantalon_38_46', garment: 'PANTALÓN', sizeRange: '38 AL 46', price: 55000 },

  // CAMPERA
  { id: 'campera_4_8', garment: 'CAMPERA', sizeRange: '4 AL 8', price: 51000 },
  { id: 'campera_10_16', garment: 'CAMPERA', sizeRange: '10 AL 16', price: 45000 },
  { id: 'campera_38_46', garment: 'CAMPERA', sizeRange: '38 AL 46', price: 55300 },

  // SHORT DEP
  { id: 'short_4_8', garment: 'SHORT DEP', sizeRange: '4 AL 8', price: 24600 },
  { id: 'short_10_16', garment: 'SHORT DEP', sizeRange: '10 AL 16', price: 30750 },
  { id: 'short_xs_s', garment: 'SHORT DEP', sizeRange: 'XS-S', price: 36900 },
  { id: 'short_m_l_xl', garment: 'SHORT DEP', sizeRange: 'M-L-XL', price: 39200 },

  // POLLERA MF
  { id: 'pollera_4_8', garment: 'POLLERA MF', sizeRange: '4 AL 8', price: 36000 },
  { id: 'pollera_10_16', garment: 'POLLERA MF', sizeRange: '10 AL 16', price: 38800 },
  { id: 'pollera_1_2', garment: 'POLLERA MF', sizeRange: '1 Y 2', price: 41700 },
  { id: 'pollera_3_4', garment: 'POLLERA MF', sizeRange: '3 Y 4', price: 43200 },

  // POLLERA KILT
  { id: 'pollera_kilt', garment: 'POLLERA KILT', sizeRange: 'TODOS', price: 49500 },
];

const LOCAL_STORAGE_KEY_PRICES = 'stock_ropa_prices_v1';

interface PriceListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceListSidebar = ({ isOpen, onClose }: PriceListSidebarProps) => {
  const [prices, setPrices] = useState<PriceRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRICES);
    if (saved) {
      try {
        setPrices(JSON.parse(saved));
      } catch {
        setPrices(INITIAL_PRICE_RULES);
      }
    } else {
      setPrices(INITIAL_PRICE_RULES);
    }
  }, []);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setEditedPrices((prev) => ({ ...prev, [id]: num }));
  };

  const handleSaveAll = () => {
    const updated = prices.map((p) => ({
      ...p,
      price: editedPrices[p.id] !== undefined ? editedPrices[p.id] : p.price,
    }));
    setPrices(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_PRICES, JSON.stringify(updated));
    setIsEditing(false);
    setEditedPrices({});
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Restablecer la lista a los precios originales del mostrador?')) {
      setPrices(INITIAL_PRICE_RULES);
      localStorage.setItem(LOCAL_STORAGE_KEY_PRICES, JSON.stringify(INITIAL_PRICE_RULES));
      setIsEditing(false);
      setEditedPrices({});
    }
  };

  // Agrupar por prenda
  const filtered = prices.filter(
    (p) =>
      p.garment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sizeRange.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const garmentGroups = Array.from(new Set(filtered.map((p) => p.garment)));

  return (
    <aside className="w-80 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-fit sticky top-20 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
              Precios Mostrador
            </h3>
            <p className="text-[10px] text-slate-400">Referencia rápida por talle</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveAll();
              } else {
                setIsEditing(true);
              }
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              isEditing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isEditing ? 'Guardar Precios' : 'Editar Valores'}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Ocultar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buscador Rápido */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar prenda (ej. Chomba, Short)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla Agrupada de Precios */}
      <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        {garmentGroups.map((garment) => {
          const items = filtered.filter((i) => i.garment === garment);

          return (
            <div key={garment} className="pt-2 first:pt-0">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100/75 rounded-md mb-1">
                <Tag className="w-3 h-3 text-blue-600" />
                <span>{garment}</span>
              </div>

              <div className="space-y-1">
                {items.map((item) => {
                  const currentPrice =
                    editedPrices[item.id] !== undefined ? editedPrices[item.id] : item.price;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-xs transition-colors"
                    >
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        Talle {item.sizeRange}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-20 px-1.5 py-0.5 text-right font-bold text-xs bg-amber-50 border border-amber-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                          ${currentPrice.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer del Sidebar */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span>{filtered.length} precios listados</span>
        {isEditing ? (
          <button
            onClick={handleSaveAll}
            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Guardar
          </button>
        ) : (
          <button
            onClick={handleResetToDefaults}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px]"
            title="Restablecer a valores iniciales"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Originales
          </button>
        )}
      </div>
    </aside>
  );
};
