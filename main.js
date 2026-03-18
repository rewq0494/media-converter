const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const { detectFile } = require('./src/fileDetector');
const { getPreset, getOutputFormats } = require('./src/formatPresets');
const { runFFmpeg } = require('./src/ffmpegRunner');

let mainWindow;
let currentProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 780,
    height: 620,
    minWidth: 640,
    minHeight: 520,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,  // 讓 renderer 的 File.path 能取得拖曳檔案的原生路徑
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#f5f5f5',
    show: false,
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    if (currentProcess) currentProcess.kill('SIGTERM');
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC Handlers ──────────────────────────────────────────────────────────

ipcMain.handle('get-downloads-path', () => {
  return app.getPath('downloads');
});

ipcMain.handle('detect-file', async (_e, filePath) => {
  if (!filePath) return { success: false, error: '無法取得檔案路徑，請改用「選擇檔案」按鈕' };
  try {
    return { success: true, data: await detectFile(filePath) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-output-formats', (_e, inputType) => {
  return getOutputFormats(inputType);
});

ipcMain.handle('get-preset', (_e, ext) => {
  return getPreset(ext);
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '選擇要轉換的檔案',
    properties: ['openFile'],
    filters: [
      { name: '媒體檔案', extensions: ['mp4','mov','mkv','avi','webm','mp3','wav','flac','aac','ogg','m4a','opus','wma'] },
      { name: '所有檔案', extensions: ['*'] },
    ]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('select-output-dir', async (_e, defaultPath) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '選擇輸出目錄',
    defaultPath: defaultPath || require('os').homedir() + '/Downloads',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('start-conversion', async (_e, { inputPath, outputDir, outputExt, options, duration }) => {
  const path = require('path');
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.${outputExt}`);

  try {
    await runFFmpeg({
      inputPath,
      outputPath,
      outputExt,
      options,
      duration,
      onProgress: (pct) => {
        if (mainWindow) mainWindow.webContents.send('conversion-progress', { pct });
      },
      onLog: (text) => {
        if (mainWindow) mainWindow.webContents.send('conversion-log', text);
      }
    });
    currentProcess = null;
    return { success: true, outputPath };
  } catch (err) {
    currentProcess = null;
    return { success: false, error: err.message };
  }
});

ipcMain.handle('cancel-conversion', () => {
  if (currentProcess) {
    currentProcess.kill('SIGTERM');
    currentProcess = null;
  }
  return { success: true };
});

ipcMain.handle('open-folder', (_e, folderPath) => {
  const dirPath = require('path').dirname(folderPath);
  shell.showItemInFolder(folderPath);
  return { success: true };
});

ipcMain.handle('quit-app', () => {
  if (currentProcess) currentProcess.kill('SIGTERM');
  app.quit();
});
