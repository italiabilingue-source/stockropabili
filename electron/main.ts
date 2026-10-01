import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';
import { autoUpdater } from 'electron-updater';
import {
  initDatabase,
  getAllProducts,
  saveProduct,
  deleteProduct,
  batchUpdateStock,
  recordQuickSale,
  getMovements,
  seedInitialSchoolGarments,
  getDb
} from './db';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

// Directorio seguro de persistencia de datos (nunca se borra al actualizar la app)
const userDataPath = app.getPath('userData');
const dbPath = isDev ? path.join(__dirname, '../data/inventory.json') : path.join(userDataPath, 'inventory.json');
const imagesDir = path.join(userDataPath, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configuración de Auto-Updater desde GitHub Releases
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking');
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus('available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    sendUpdateStatus('not-available', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateStatus('downloading', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus('downloaded', info);
  });

  autoUpdater.on('error', (err) => {
    // Si no hay internet o falla GitHub, no interrumpir la app
    console.log('[AutoUpdater] Modo offline o sin conexión:', err?.message || err);
    sendUpdateStatus('offline-or-error', { message: err?.message });
  });

  // Chequeo inicial (solo si está empaquetado o configurado)
  if (!isDev) {
    try {
      autoUpdater.checkForUpdates();
    } catch (e) {
      console.log('Error al chequear actualizaciones:', e);
    }
  }
}

function sendUpdateStatus(type: string, info?: any) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', { type, info });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 650,
    title: 'Stock Indumentaria Escolar - Modo Mostrador',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#f8fafc',
  });

  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializar DB e IPC
app.whenReady().then(() => {
  // Protocolo seguro para mostrar imágenes locales
  protocol.handle('local-img', (request) => {
    const filePath = decodeURIComponent(request.url.slice('local-img://'.length));
    return net.fetch('file://' + filePath);
  });

  try {
    initDatabase(dbPath);
    console.log('[DB] Base de datos SQLite lista en:', dbPath);
  } catch (err) {
    console.error('[DB] Error inicializando SQLite:', err);
  }

  // Configurar IPC Handlers
  ipcMain.handle('get-products', async () => getAllProducts());
  ipcMain.handle('save-product', async (_, product) => saveProduct(product));
  ipcMain.handle('delete-product', async (_, id) => deleteProduct(id));
  ipcMain.handle('batch-update-stock', async (_, { productId, updates, reason }) => {
    return batchUpdateStock(productId, updates, reason);
  });
  ipcMain.handle('record-quick-sale', async (_, { productId, size, quantity, reason }) => {
    return recordQuickSale(productId, size, quantity, reason);
  });
  ipcMain.handle('get-movements', async (_, limit) => getMovements(limit));
  ipcMain.handle('get-app-version', async () => app.getVersion());

  // Diálogo para seleccionar imagen y copiar a la carpeta de datos de la app
  ipcMain.handle('select-and-save-image', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Seleccionar foto de la prenda',
      filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const sourcePath = result.filePaths[0];
    const ext = path.extname(sourcePath).toLowerCase();
    const fileName = `garment_${Date.now()}${ext}`;
    const destinationPath = path.join(imagesDir, fileName);

    fs.copyFileSync(sourcePath, destinationPath);
    return destinationPath;
  });

  ipcMain.handle('reset-database-samples', async () => {
    seedInitialSchoolGarments();
    return getAllProducts();
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!isDev) {
      return autoUpdater.checkForUpdates();
    }
  });

  ipcMain.handle('install-update', async () => {
    autoUpdater.quitAndInstall();
  });

  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
