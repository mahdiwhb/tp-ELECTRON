const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noterAPI', {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (payload) => ipcRenderer.invoke('file:save', payload),
  setWindowTitle: (payload) => ipcRenderer.invoke('window:setTitle', payload),
  setDirty: (dirty) => ipcRenderer.invoke('editor:setDirty', dirty),
  getTheme: () => ipcRenderer.invoke('theme:get'),
  toggleTheme: () => ipcRenderer.invoke('theme:toggle'),
  onMenuNew: (callback) => ipcRenderer.on('menu:new', callback),
  onMenuOpen: (callback) => ipcRenderer.on('menu:open', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu:save', callback),
});
