import { useState } from 'react';
import type { Movement } from '../types/inventory';
import { History, X, Download, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MovementsModalProps {
  isOpen: boolean;
  movements: Movement[];
  onClose: () => void;
}

export const MovementsModal: React.FC<MovementsModalProps> = ({
  isOpen,
  movements,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.type === filterType;
  });

  const handleExportCSV = () => {
    if (movements.length === 0) {
      alert('No hay movimientos para exportar.');
      return;
    }

    const headers = [
      'Fecha y Hora',
      'Articulo',
      'Talle',
      'Tipo',
      'Cantidad',
      'Stock Anterior',
      'Stock Resultante',
      'Motivo',
    ];

    const rows = movements.map((m) => [
      `"${new Date(m.timestamp).toLocaleString('es-AR')}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.size}"`,
      `"${m.type === 'IN' ? 'ENTRADA' : m.type === 'OUT' ? 'SALIDA' : 'AJUSTE'}"`,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${(m.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `movimientos_stock_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Historial y Auditoría de Movimientos</h3>
              <p className="text-[11px] text-slate-400">
                Registro inmutable de todas las salidas y ajustes de mostrador
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

        {/* Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filtrar:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({movements.length})
              </button>
              <button
                onClick={() => setFilterType('OUT')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filterType === 'OUT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Salidas / Ventas
              </button>
              <button
                onClick={() => setFilterType('IN')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filterType === 'IN'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entradas
              </button>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Exportar CSV / Excel
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredMovements.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
              No hay movimientos registrados para mostrar.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Artículo</th>
                  <th className="py-2.5 px-4 text-center">Talle</th>
                  <th className="py-2.5 px-4 text-center">Tipo</th>
                  <th className="py-2.5 px-4 text-center">Cantidad</th>
                  <th className="py-2.5 px-4 text-center">Stock Resultante</th>
                  <th className="py-2.5 px-4">Motivo / Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleDateString('es-AR')}{' '}
                      <span className="text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {m.productName}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 font-bold bg-slate-100 text-slate-700 rounded">
                        Talle {m.size}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {m.type === 'OUT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 font-bold text-[10px] bg-emerald-100 text-emerald-800 rounded-full">
                          <ArrowDownRight className="w-3 h-3" />
                          SALIDA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 font-bold text-[10px] bg-blue-100 text-blue-800 rounded-full">
                          <ArrowUpRight className="w-3 h-3" />
                          ENTRADA
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                      {m.type === 'OUT' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500">
                      <span className="text-slate-400">{m.previousStock}</span> →{' '}
                      <span className="font-bold text-slate-800">{m.newStock}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                      {m.reason || 'Sin motivo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
