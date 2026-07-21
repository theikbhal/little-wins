const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onDataUpdated: (callback) => {
    ipcRenderer.on('data-updated', (_, data) => callback(data))
  },
  onSystemThemeChanged: (callback) => {
    ipcRenderer.on('system-theme-changed', (_, isDark) => callback(isDark))
  },
})
