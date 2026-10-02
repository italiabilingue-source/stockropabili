import { contextBridge, ipcRenderer } from 'electron';
import { Product, SizeUpdateDelta, AppApi } from '../src/types/inventory';

const api: AppApi = {
  getProducts: () => ipcRenderer.invoke('get-products'),
  saveProduct: (product) => ipcRenderer.invoke('save-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  batchUpdateStock: (productId, updates, reason) =>
    ipcRenderer.invoke('batch-update-stock', { productId, updates, reason }),
  recordQuickSale: (productId, size, quantity, paymentMethod, notes) =>
    ipcRenderer.invoke('record-quick-sale', { productId, size, quantity, paymentMethod, notes }),
  getMovements: (limit) => ipcRenderer.invoke('get-movements', limit),
  selectAndSaveImage: () => ipcRenderer.invoke('select-and-save-image'),
  resetDatabaseWithSamples: () => ipcRenderer.invoke('reset-database-samples'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => {
    const listener = (_: any, status: any) => callback(status);
    ipcRenderer.on('update-status', listener);
    return () => {
      ipcRenderer.removeListener('update-status', listener);
    };
  },
};

contextBridge.exposeInMainWorld('electronApi', api);
