import { Download, RefreshCw, X } from 'lucide-react';

interface UpdateBannerProps {
  updateStatus: { type: string; info?: any } | null;
  onInstall: () => void;
  onDismiss: () => void;
}

export const UpdateBanner = ({
  updateStatus,
  onInstall,
  onDismiss,
}: UpdateBannerProps) => {
  if (!updateStatus) return null;

  if (updateStatus.type === 'available') {
    return (
      <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 animate-bounce" />
          <span>
            Nueva versión encontrada en GitHub (v{updateStatus.info?.version}). Descargando en segundo plano...
          </span>
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-blue-700 rounded">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (updateStatus.type === 'downloading') {
    const percent = Math.round(updateStatus.info?.percent || 0);
    return (
      <div className="bg-blue-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Descargando actualización de GitHub: {percent}%</span>
        </div>
        <div className="w-24 bg-blue-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (updateStatus.type === 'downloaded') {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="font-semibold">
            ¡Nueva versión v{updateStatus.info?.version} descargada! Lista para instalar.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onInstall}
            className="px-3 py-1 bg-white text-emerald-800 font-bold rounded shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
          >
            Reiniciar y Aplicar
          </button>
          <button onClick={onDismiss} className="p-1 hover:bg-emerald-700 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
