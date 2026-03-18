const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  getPathForFile: (file) => webUtils.getPathForFile(file),  // Electron v32+ 取代 file.path
  detectFile: (filePath) => ipcRenderer.invoke('detect-file', filePath),
  getOutputFormats: (inputType) => ipcRenderer.invoke('get-output-formats', inputType),
  getPreset: (ext) => ipcRenderer.invoke('get-preset', ext),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectOutputDir: (defaultPath) => ipcRenderer.invoke('select-output-dir', defaultPath),
  startConversion: (params) => ipcRenderer.invoke('start-conversion', params),
  cancelConversion: () => ipcRenderer.invoke('cancel-conversion'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onProgress: (callback) => {
    ipcRenderer.on('conversion-progress', (_e, data) => callback(data));
  },
  onLog: (callback) => {
    ipcRenderer.on('conversion-log', (_e, text) => callback(text));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('conversion-progress');
    ipcRenderer.removeAllListeners('conversion-log');
  }
});
