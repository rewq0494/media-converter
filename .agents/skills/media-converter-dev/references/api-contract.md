# IPC API 合約

> 此文件是 renderer ↔ preload ↔ main 三層 API 的完整定義。
> 修改任一端點時，**必須同步更新其他兩層和本文件**。

## API 方法列表

### 檔案操作

| 方法 | preload.js | main.js channel | 參數 | 回傳值 |
|------|-----------|-----------------|------|--------|
| `getDownloadsPath()` | `ipcRenderer.invoke('get-downloads-path')` | `get-downloads-path` | 無 | `string` (路徑) |
| `getPathForFile(file)` | `webUtils.getPathForFile(file)` | N/A (同步) | `File` 物件 | `string` (路徑) |
| `detectFile(filePath)` | `ipcRenderer.invoke('detect-file', filePath)` | `detect-file` | `string` | `{ success, data/error }` |
| `selectFile()` | `ipcRenderer.invoke('select-file')` | `select-file` | 無 | `string \| null` |
| `selectOutputDir(defaultPath)` | `ipcRenderer.invoke('select-output-dir', defaultPath)` | `select-output-dir` | `string?` | `string \| null` |
| `openFolder(folderPath)` | `ipcRenderer.invoke('open-folder', folderPath)` | `open-folder` | `string` | `{ success }` |

### 格式查詢

| 方法 | preload.js | main.js channel | 參數 | 回傳值 |
|------|-----------|-----------------|------|--------|
| `getOutputFormats(inputType)` | `ipcRenderer.invoke('get-output-formats', inputType)` | `get-output-formats` | `string?` ('audio'/'video') | `Format[]` |
| `getPreset(ext)` | `ipcRenderer.invoke('get-preset', ext)` | `get-preset` | `string` (副檔名) | `Preset \| null` |

### 轉換控制

| 方法 | preload.js | main.js channel | 參數 | 回傳值 |
|------|-----------|-----------------|------|--------|
| `startConversion(params)` | `ipcRenderer.invoke('start-conversion', params)` | `start-conversion` | `ConversionParams` | `{ success, outputPath/error }` |
| `cancelConversion()` | `ipcRenderer.invoke('cancel-conversion')` | `cancel-conversion` | 無 | `{ success }` |

### 事件監聽

| 方法 | 說明 | 資料格式 |
|------|------|----------|
| `onProgress(callback)` | 轉換進度推送 | `{ pct: number }` (0-100) |
| `onLog(callback)` | FFmpeg stderr 日誌 | `string` |
| `removeAllListeners()` | 移除所有事件監聽 | N/A |

### 應用控制

| 方法 | preload.js | main.js channel |
|------|-----------|-----------------|
| `quitApp()` | `ipcRenderer.invoke('quit-app')` | `quit-app` |

## 資料結構定義

### ConversionParams

```javascript
{
  inputPath: string,    // 來源檔案完整路徑
  outputDir: string,    // 輸出目錄路徑
  outputExt: string,    // 輸出副檔名（如 'mp3', 'wav'）
  options: object,      // 進階選項（對應 formatPresets advanced keys）
  duration: number,     // 原始檔案時長（秒），用於計算進度
}
```

### DetectFile 回傳 data

```javascript
{
  type: 'video' | 'audio',
  format: string,       // 正規化後的格式名（如 'mp4', 'mp3'）
  duration: number,     // 秒
  size: number,         // bytes
  bitrate: number,      // bps
  video: {              // null if audio-only
    codec: string,
    width: number,
    height: number,
    fps: number,
  },
  audio: {              // null if video without audio
    codec: string,
    sampleRate: number,
    channels: number,
  },
}
```

### Format（格式定義）

```javascript
{
  ext: string,
  label: string,
  type: 'audio' | 'video',
  shortDesc: string,
  shortDescEn: string,
  description: string,
  descriptionEn: string,
  preset: Preset,
}
```

### Preset（預設參數）

```javascript
{
  // 音訊相關
  codec?: string,
  audioBitrate?: string,
  sampleRate?: number,
  audioQuality?: string,
  compressionLevel?: number,

  // 影片相關
  videoCodec?: string,
  audioCodec?: string,
  crf?: number,

  // GIF 專用
  fps?: number,
  scale?: number,

  // 描述
  description: string,
  descriptionEn: string,

  // 進階選項
  advanced: AdvancedOption[],
}
```

### AdvancedOption

```javascript
{
  key: string,          // 對應 options 物件的 key
  label: string,        // zh-TW 顯示名
  labelEn: string,      // EN 顯示名
  default: any,         // 預設值
  options: any[],       // 可選值列表
  hint: string,         // zh-TW 提示
  hintEn: string,       // EN 提示
}
```

## 合約驗證

`tests/apiContract.test.js` 會自動驗證：

1. renderer.js 中呼叫的所有 `window.api.X()` 都在 preload.js 中有定義
2. preload.js 中的所有 `ipcRenderer.invoke('channel')` 都在 main.js 中有 `ipcMain.handle('channel')`
3. 不使用已棄用的方法名（如 `getFormats`、`convertFile`、`quit`、`onConvertDone`）
4. 回傳結構使用 `success` 而非 `error` 做判斷
5. 進度格式使用 `pct` 而非 `percent`
