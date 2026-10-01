# Sistema de Control de Stock e Inventario - Indumentaria Escolar

Aplicación de escritorio nativa para Windows (`.exe`), diseñada para operar a máxima velocidad en mostrador de ventas, **100% offline** (sin requerir internet) y con **auto-actualizaciones automáticas conectadas a GitHub Releases**.

---

## 🚀 Características Principales

1. **Modo 100% Offline (SQLite Local)**:
   - Base de datos transaccional embebida (`better-sqlite3`).
   - Los datos persisten en la carpeta segura de la máquina (`AppData`) y **nunca se pierden al actualizar la aplicación**.
   - No depende de Firebase ni servidores externos.

2. **Carga y Edición Rápida por Talles**:
   - Grilla interactiva tipo matriz: edición directa de números por talle con teclado.
   - Resaltado visual en **ámbar** para cambios pendientes y botón de **guardado en lote** atómico.
   - Alerta visual en **rojo** para talles con stock igual o menor al mínimo.
   - Botón directo `-1` por talle para salidas inmediatas de mostrador.

3. **Venta Rápida de Mostrador (Atajo F2)**:
   - Modal optimizado para despachar prendas en segundos: selección de artículo, talle con stock disponible, cantidad y motivo.

4. **Auditoría e Historial de Movimientos**:
   - Registro inmutable de cada entrada, salida y ajuste con fecha, hora, cantidades anteriores y nuevas.
   - Botón para exportar historial completo a **Excel / CSV** sin conexión.

5. **Auto-actualización desde GitHub**:
   - La aplicación detecta en segundo plano si hay conexión a internet y consulta tu repositorio de GitHub.
   - Si creas una nueva versión en GitHub, se descarga sola y te avisa: *"Reiniciar y Aplicar"*.

---

## ⌨️ Atajos de Teclado en Mostrador

| Tecla | Acción |
| :--- | :--- |
| **`F2`** | Abre el modal de **Venta Rápida** de mostrador. |
| **`F3`** | Abre el modal para dar de alta una **Nueva Prenda**. |
| **`Tab` / Flechas** | Navegación rápida entre inputs numéricos de talles en la grilla. |

---

## 🛠️ Comandos de Desarrollo y Compilación

### 1. Iniciar en Modo Desarrollo (Hot Reload)
```bash
npm run dev
```
Inicia el servidor local de React y abre la ventana de Electron en tu pantalla.

### 2. Probar solo la Interfaz en Navegador Web
```bash
npm run dev:renderer
```
Abre la app en `http://localhost:5173/` con almacenamiento local simulado.

### 3. Generar el Instalador de Windows (`.exe`)
```bash
npm run dist
```
Genera los instaladores listos para usar en la carpeta `release/`:
* `Stock Indumentaria Escolar Setup 1.0.0.exe` (Instalador estándar).
* `Stock Indumentaria Escolar 1.0.0.exe` (Versión Portable que no requiere instalación).

---

## 🔄 Cómo Configurar la Auto-Actualización con GitHub

1. En el archivo `package.json`, busca la sección `"publish"` y reemplaza los valores por los de tu repositorio:
```json
"publish": {
  "provider": "github",
  "owner": "TU_USUARIO_GITHUB",
  "repo": "TU_REPOSITORIO"
}
```

2. Sube el código a tu repositorio de GitHub:
```bash
git init
git add .
git commit -m "feat: app de stock offline con sqlite y auto-updater"
git branch -M main
git remote add origin https://github.com/TU_USUARIO_GITHUB/TU_REPOSITORIO.git
git push -u origin main
```

3. Cada vez que quieras lanzar una actualización a todas las computadoras que tengan la app instalada:
   - Sube la versión en el `package.json` (ej: `"version": "1.0.1"`).
   - Crea un tag en git y empújalo:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
   - ¡Listo! El workflow automático de GitHub Actions compilará el nuevo `.exe` y lo publicará en los Releases. Las computadoras conectadas a internet descargarán la actualización automáticamente.
