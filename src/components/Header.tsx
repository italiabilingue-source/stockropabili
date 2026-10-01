import { 
  Package, 
  Zap, 
  PlusCircle, 
  History, 
  RefreshCw, 
  HardDrive,
  Download
} from 'lucide-react';

interface HeaderProps {
  version: string;
  updateStatus: { type: string; info?: any } | null;
  onOpenQuickSale: () => void;
  onOpenNewProduct: () => void;
  onOpenHistory: () => void;
  onRefresh: () => void;
  onInstallUpdate: () => void;
}

export const Header = ({
  version,
  updateStatus,
  onOpenQuickSale,
  onOpenNewProduct,
  onOpenHistory,
  onRefresh,
  onInstallUpdate,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Control de Stock Escolar
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Offline Local
              </span>
              <span className="text-xs text-slate-400 font-mono">v{version}</span>
            </div>
            <p className="text-xs text-slate-500">
              Sistema de alta velocidad por talles para mostrador
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Update notice if downloaded */}
          {updateStatus?.type === 'downloaded' && (
            <button
              onClick={onInstallUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm animate-pulse transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Actualizar a v{updateStatus.info?.version}
            </button>
          )}

          <button
            onClick={onOpenQuickSale}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
            title="Registrar salida o venta rápida (F2)"
          >
            <Zap className="w-4 h-4 fill-current" />
            Venta Rápida
          </button>

          <button
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-600/20 active:scale-95 transition-all"
            title="Dar de alta una nueva prenda (F3)"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Prenda
          </button>

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
            title="Ver historial de auditoría de movimientos"
          >
            <History className="w-4 h-4 text-slate-500" />
            Historial
          </button>

          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
